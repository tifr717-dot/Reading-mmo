#pragma once

#include <array>
#include <cstddef>
#include <cstdint>

#include "ReadingStatsUtils.h"

// Small, independent rolling history used only by the richer X4 Pro dashboard.
// It deliberately lives outside global_stats.bin so Nearby Stats Sync keeps its
// existing wire/file format and older CrossInk builds remain compatible.
struct ReadingDailyEntry {
  uint32_t dayIndex = 0;
  uint32_t pages = 0;
  uint32_t readingSeconds = 0;
};

struct ReadingDailyStats {
  static constexpr uint8_t CURRENT_FILE_VERSION = 1;
  static constexpr size_t HISTORY_DAYS = 14;
  static constexpr size_t DISPLAY_DAYS = 7;

  std::array<ReadingDailyEntry, HISTORY_DAYS> entries{};

  static ReadingDailyStats load();
  bool save() const;

  void record(const ReadingStatsDate& date, uint32_t pages, uint32_t readingSeconds);
  ReadingDailyEntry forDate(const ReadingStatsDate& date) const;
  std::array<ReadingDailyEntry, DISPLAY_DAYS> recentSevenDays(const ReadingStatsDate& today) const;
};
