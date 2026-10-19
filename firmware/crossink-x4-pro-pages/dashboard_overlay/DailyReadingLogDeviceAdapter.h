#pragma once
#include <string>
#include "DailyReadingLog.h"
#include "ReadingStatsUtils.h"

namespace DailyReadingLog {
// CrossInk RTC + configured local time offset. The upstream clock interface
// supplies whole minutes, so a 30-second midpoint limits midnight split
// uncertainty; pages always belong to the actual local RTC date of the turn.
inline bool recordAtCurrentTime(const std::string& bookPath,
                                const std::string& title,
                                uint32_t acceptedSeconds, uint16_t qualifyingForwardPages,
                                float startProgress, float endProgress) {
  ReadingStatsDateTime now{};
  if (!getCurrentLocalReadingStatsDateTime(now) || !now.isValid()) return false;
  const LocalDateTime local{now.date.year,now.date.month,now.date.day,
                            now.hour,now.minute,30};
  return recordEvent(bookPath,title,local,acceptedSeconds,
                     qualifyingForwardPages,startProgress,endProgress);
}
} // namespace DailyReadingLog
