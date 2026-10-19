#include "DailyReadingLogView.h"

#include <GfxRenderer.h>

#include <algorithm>
#include <cstdio>
#include <memory>
#include <new>

#include "DailyReadingLog.h"
#include "BookReadingStats.h"
#include "fontIds.h"

void renderX4ProDailyReadingLog(const GfxRenderer& renderer,
                                 const ReadingStatsDate& selectedDate) {
  renderer.clearScreen();
  const int width=renderer.getScreenWidth(), height=renderer.getScreenHeight();
  const int margin=16, contentW=width-2*margin;

  renderer.drawText(UI_12_FONT_ID,margin,16,"DAILY READING LOG",true,EpdFontFamily::BOLD);
  renderer.drawLine(margin,45,width-margin,45,true);
  char dateLine[48];
  snprintf(dateLine,sizeof(dateLine),"%02u / %02u / %04u",
           unsigned(selectedDate.month),unsigned(selectedDate.day),unsigned(selectedDate.year));
  renderer.drawText(UI_12_FONT_ID,margin,59,dateLine,true,EpdFontFamily::BOLD);

  std::unique_ptr<DailyReadingLog::Entry[]> entries(
      new(std::nothrow) DailyReadingLog::Entry[DailyReadingLog::MAX_BOOKS_PER_DAY]{});
  size_t count=0;
  const DailyReadingLog::LocalDateTime date{selectedDate.year,selectedDate.month,selectedDate.day,0,0,0};
  const bool loaded=entries && DailyReadingLog::readDay(date,entries.get(),
                                                          DailyReadingLog::MAX_BOOKS_PER_DAY,count);
  if (!loaded) {
    renderer.drawText(UI_12_FONT_ID,margin,110,"Reading log unavailable");
    renderer.drawText(SMALL_FONT_ID,margin,142,"Check the SD card and device clock.");
    return;
  }
  uint64_t pages=0, seconds=0;
  for (size_t i=0;i<count;i++) { pages+=entries[i].pages; seconds+=entries[i].seconds; }
  char totalLine[96], timeBuf[24];
  BookReadingStats::formatDuration(uint32_t(std::min<uint64_t>(seconds,UINT32_MAX)),
                                  timeBuf,sizeof(timeBuf));
  snprintf(totalLine,sizeof(totalLine),"%lu pages    %s    %u books",
           static_cast<unsigned long>(std::min<uint64_t>(pages,UINT32_MAX)),
           timeBuf,unsigned(count));
  renderer.drawText(UI_12_FONT_ID,margin,100,totalLine);
  renderer.drawLine(margin,134,width-margin,134,true);

  if (count==0) {
    renderer.drawText(UI_12_FONT_ID,margin,169,"No reading recorded for this date.");
  }
  const int rowStart=155,rowH=66;
  const int available=std::max(0,height-rowStart-72);
  const size_t visible=std::min(count,size_t(available/rowH));
  for (size_t i=0;i<visible;i++) {
    const auto& entry=entries[i];
    const int y=rowStart+int(i)*rowH;
    const std::string title=renderer.truncatedText(
        UI_12_FONT_ID,entry.title,contentW,EpdFontFamily::BOLD);
    renderer.drawText(UI_12_FONT_ID,margin,y,title.c_str(),true,EpdFontFamily::BOLD);
    char when[80], duration[24];
    BookReadingStats::formatDuration(entry.seconds,duration,sizeof(duration));
    snprintf(when,sizeof(when),"%lu XTE pages    %s    %u.%u%%",
             static_cast<unsigned long>(entry.pages),duration,
             unsigned(entry.endingPermille/10u),unsigned(entry.endingPermille%10u));
    renderer.drawText(UI_10_FONT_ID,margin,y+25,when);
    renderer.drawLine(margin,y+53,width-margin,y+53,true);
  }
  if (count>visible) {
    char omitted[48];
    snprintf(omitted,sizeof(omitted),"+ %u more books on this date",
             unsigned(count-visible));
    renderer.drawText(SMALL_FONT_ID,margin,height-70,omitted);
  }

  renderer.drawLine(margin,height-43,width-margin,height-43,true);
  renderer.drawText(SMALL_FONT_ID,margin,height-33,
                    "UP / DOWN: Date     LEFT / RIGHT: Page");
  renderer.drawText(SMALL_FONT_ID,margin,height-17,"BACK: Exit stats");
}
