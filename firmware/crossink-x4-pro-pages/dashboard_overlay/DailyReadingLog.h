#pragma once

#include <cstddef>
#include <cstdint>
#include <string>

// Detailed per-book records are independent of the existing global stats and
// 14-day dashboard history. DEV12 files remain readable and are upgraded safely on the next write.
namespace DailyReadingLog {
constexpr size_t MAX_BOOKS_PER_DAY = 32;
constexpr size_t MAX_TITLE_BYTES = 76;

struct LocalDateTime {
  uint16_t year = 0;
  uint8_t month = 0;
  uint8_t day = 0;
  uint8_t hour = 0;
  uint8_t minute = 0;
  uint8_t second = 0;
};
struct Entry {
  uint64_t bookId = 0; // FNV-1a hash of full SD-card path
  uint32_t pages = 0;   // qualifying forward e-reader page turns
  uint32_t seconds = 0; // active time accepted by the existing idle detector
  uint16_t endingPermille = 0; // book progress 0..1000
  uint16_t startingPermille = UINT16_MAX; // unknown for imported DEV12 history
  uint32_t startingXtePage = 0; // 0 = unavailable (EPUB positions may reflow)
  uint32_t endingXtePage = 0;   // last reliable whole-book XTE page
  uint16_t sessionCount = 0;    // qualifying book opens on this calendar date
  char title[MAX_TITLE_BYTES + 1]{};
};
bool isValid(const LocalDateTime& dt);
bool recordEvent(const std::string& bookPath, const std::string& title,
                 const LocalDateTime& finishedAt, uint32_t acceptedReadingSeconds,
                 uint16_t qualifyingForwardPages, float startProgressPercent,
                 float endProgressPercent, uint32_t startingXtePage,
                 uint32_t endingXtePage, bool newSession);
bool readDay(const LocalDateTime& date, Entry* entries, size_t capacity, size_t& count);
} // namespace DailyReadingLog
