#include "ReadingDailyStats.h"

#include <HalStorage.h>
#include <Logging.h>

#include <algorithm>
#include <array>
#include <cstring>
#include <limits>
#include <string>

namespace {
constexpr char LOG_TAG[] = "DSTATS";
constexpr char DAILY_STATS_PATH[] = "/.crosspoint/reading_daily.bin";
constexpr char DAILY_STATS_BAK_PATH[] = "/.crosspoint/reading_daily.bin.bak";
constexpr size_t ENTRY_SIZE = 12;
constexpr size_t FILE_SIZE = 1 + ReadingDailyStats::HISTORY_DAYS * ENTRY_SIZE;

uint32_t readLe32(const uint8_t* data, const size_t offset) {
  return static_cast<uint32_t>(data[offset]) | (static_cast<uint32_t>(data[offset + 1]) << 8) |
         (static_cast<uint32_t>(data[offset + 2]) << 16) | (static_cast<uint32_t>(data[offset + 3]) << 24);
}

void writeLe32(uint8_t* data, const size_t offset, const uint32_t value) {
  data[offset] = static_cast<uint8_t>(value & 0xFFU);
  data[offset + 1] = static_cast<uint8_t>((value >> 8) & 0xFFU);
  data[offset + 2] = static_cast<uint8_t>((value >> 16) & 0xFFU);
  data[offset + 3] = static_cast<uint8_t>((value >> 24) & 0xFFU);
}

uint32_t addSaturated(const uint32_t a, const uint32_t b) {
  return std::numeric_limits<uint32_t>::max() - a < b ? std::numeric_limits<uint32_t>::max() : a + b;
}

bool loadPath(const char* path, ReadingDailyStats& out) {
  FsFile file;
  if (!Storage.openFileForRead(LOG_TAG, path, file)) return false;
  if (file.fileSize() != FILE_SIZE) {
    file.close();
    return false;
  }

  std::array<uint8_t, FILE_SIZE> data{};
  const int read = file.read(data.data(), data.size());
  file.close();
  if (read != static_cast<int>(data.size()) || data[0] != ReadingDailyStats::CURRENT_FILE_VERSION) return false;

  for (size_t i = 0; i < out.entries.size(); ++i) {
    const size_t offset = 1 + i * ENTRY_SIZE;
    out.entries[i].dayIndex = readLe32(data.data(), offset);
    out.entries[i].pages = readLe32(data.data(), offset + 4);
    out.entries[i].readingSeconds = readLe32(data.data(), offset + 8);
  }
  return true;
}

bool writePath(const char* path, const ReadingDailyStats& stats) {
  std::array<uint8_t, FILE_SIZE> data{};
  data[0] = ReadingDailyStats::CURRENT_FILE_VERSION;
  for (size_t i = 0; i < stats.entries.size(); ++i) {
    const size_t offset = 1 + i * ENTRY_SIZE;
    writeLe32(data.data(), offset, stats.entries[i].dayIndex);
    writeLe32(data.data(), offset + 4, stats.entries[i].pages);
    writeLe32(data.data(), offset + 8, stats.entries[i].readingSeconds);
  }

  FsFile file;
  if (!Storage.openFileForWrite(LOG_TAG, path, file)) return false;
  const size_t written = file.write(data.data(), data.size());
  file.flush();
  const bool ok = written == data.size() && file.sync();
  file.close();
  return ok;
}
}  // namespace

ReadingDailyStats ReadingDailyStats::load() {
  ReadingDailyStats stats;
  if (loadPath(DAILY_STATS_PATH, stats)) return stats;

  ReadingDailyStats backup;
  if (loadPath(DAILY_STATS_BAK_PATH, backup)) {
    LOG_DBG(LOG_TAG, "Recovered daily reading stats from backup");
    return backup;
  }
  return stats;
}

bool ReadingDailyStats::save() const {
  if (!Storage.ensureDirectoryExists("/.crosspoint")) return false;

  const std::string tmpPath = std::string(DAILY_STATS_PATH) + ".tmp";
  if (Storage.exists(tmpPath.c_str())) Storage.remove(tmpPath.c_str());
  if (!writePath(tmpPath.c_str(), *this)) {
    Storage.remove(tmpPath.c_str());
    return false;
  }

  if (Storage.exists(DAILY_STATS_BAK_PATH)) Storage.remove(DAILY_STATS_BAK_PATH);
  if (Storage.exists(DAILY_STATS_PATH) && !Storage.rename(DAILY_STATS_PATH, DAILY_STATS_BAK_PATH)) {
    Storage.remove(tmpPath.c_str());
    return false;
  }
  if (!Storage.rename(tmpPath.c_str(), DAILY_STATS_PATH)) {
    if (Storage.exists(DAILY_STATS_BAK_PATH) && !Storage.exists(DAILY_STATS_PATH)) {
      Storage.rename(DAILY_STATS_BAK_PATH, DAILY_STATS_PATH);
    }
    Storage.remove(tmpPath.c_str());
    return false;
  }
  return true;
}

void ReadingDailyStats::record(const ReadingStatsDate& date, const uint32_t pages, const uint32_t readingSeconds) {
  if (!date.isValid() || (pages == 0 && readingSeconds == 0)) return;
  const uint32_t dayIndex = readingStatsDayIndex(date);
  ReadingDailyEntry& entry = entries[dayIndex % entries.size()];
  if (entry.dayIndex != dayIndex) {
    entry = {};
    entry.dayIndex = dayIndex;
  }
  entry.pages = addSaturated(entry.pages, pages);
  entry.readingSeconds = addSaturated(entry.readingSeconds, readingSeconds);
}

ReadingDailyEntry ReadingDailyStats::forDate(const ReadingStatsDate& date) const {
  if (!date.isValid()) return {};
  const uint32_t dayIndex = readingStatsDayIndex(date);
  const ReadingDailyEntry& entry = entries[dayIndex % entries.size()];
  return entry.dayIndex == dayIndex ? entry : ReadingDailyEntry{dayIndex, 0, 0};
}

std::array<ReadingDailyEntry, ReadingDailyStats::DISPLAY_DAYS> ReadingDailyStats::recentSevenDays(
    const ReadingStatsDate& today) const {
  std::array<ReadingDailyEntry, DISPLAY_DAYS> result{};
  if (!today.isValid()) return result;

  for (size_t i = 0; i < result.size(); ++i) {
    ReadingStatsDate date = today;
    addDaysToReadingStatsDate(date, -static_cast<int>(result.size() - 1 - i));
    result[i] = forDate(date);
  }
  return result;
}
