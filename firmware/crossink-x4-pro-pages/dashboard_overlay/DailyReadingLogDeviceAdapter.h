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
                                float startProgress, float endProgress,
                                uint32_t startingXtePage,uint32_t endingXtePage,
                                uint32_t& sessionRecordedDay) {
  ReadingStatsDateTime now{};
  if (!getCurrentLocalReadingStatsDateTime(now) || !now.isValid()) return false;
  const LocalDateTime local{now.date.year,now.date.month,now.date.day,
                            now.hour,now.minute,30};
  const uint32_t day=readingStatsDayIndex(now.date);
  const bool newSession=sessionRecordedDay!=day;
  const bool saved=recordEvent(bookPath,title,local,acceptedSeconds,
                               qualifyingForwardPages,startProgress,endProgress,
                               startingXtePage,endingXtePage,newSession);
  if (saved) sessionRecordedDay=day; // Do not lose the session on a failed SD write.
  return saved;
}
} // namespace DailyReadingLog
