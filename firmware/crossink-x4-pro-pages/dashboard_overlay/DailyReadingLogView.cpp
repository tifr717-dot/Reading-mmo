#include "DailyReadingLogView.h"

#include <GfxRenderer.h>

#include <algorithm>
#include <cstdio>
#include <memory>
#include <new>

#include "BookReadingStats.h"
#include "DailyReadingLog.h"
#include "fontIds.h"

namespace {
void drawPercent(char* out,size_t n,uint16_t p) {
  if (p==UINT16_MAX) {
    snprintf(out,n,"--");
  } else {
    snprintf(out,n,"%u.%u%%",unsigned(p/10),unsigned(p%10));
  }
}
void drawPos(char* out,size_t n,uint32_t page) {
  if (page==0) snprintf(out,n,"--");
  else snprintf(out,n,"%lu",static_cast<unsigned long>(page));
}
} // namespace

void renderX4ProDailyReadingLog(const GfxRenderer& renderer,
                               const ReadingStatsDate& selectedDate) {
  renderer.clearScreen();
  const int width=renderer.getScreenWidth();
  const int height=renderer.getScreenHeight();
  constexpr int margin=16;
  const int contentW=std::max(30,width-2*margin);

  renderer.drawText(UI_12_FONT_ID,margin,16,"DAILY READING LOG",true,EpdFontFamily::BOLD);
  renderer.drawLine(margin,44,width-margin,44,true);
  char dateLine[40];
  snprintf(dateLine,sizeof(dateLine),"%02u / %02u / %04u",
           unsigned(selectedDate.month),unsigned(selectedDate.day),unsigned(selectedDate.year));
  renderer.drawText(UI_12_FONT_ID,margin,57,dateLine,true,EpdFontFamily::BOLD);
  ReadingStatsDateTime now{};
  if (getCurrentLocalReadingStatsDateTime(now) &&
      compareReadingStatsDate(selectedDate,now.date)==0) {
    renderer.drawText(SMALL_FONT_ID,width-margin-48,62,"TODAY",
                      true,EpdFontFamily::BOLD);
  }

  std::unique_ptr<DailyReadingLog::Entry[]> entries(
      new(std::nothrow) DailyReadingLog::Entry[DailyReadingLog::MAX_BOOKS_PER_DAY]{});
  size_t count=0;
  const DailyReadingLog::LocalDateTime date{
      selectedDate.year,selectedDate.month,selectedDate.day,0,0,0};
  const bool loaded=entries &&
      DailyReadingLog::readDay(date,entries.get(),DailyReadingLog::MAX_BOOKS_PER_DAY,count);
  if (!loaded) {
    renderer.drawText(UI_12_FONT_ID,margin,111,"Reading log unavailable");
    renderer.drawText(SMALL_FONT_ID,margin,140,"Check the SD card and clock.");
    return;
  }

  uint64_t pages=0,seconds=0;
  for (size_t i=0;i<count;i++) {
    pages+=entries[i].pages;
    seconds+=entries[i].seconds;
  }
  char totalLine[104],duration[24];
  BookReadingStats::formatDuration(
      uint32_t(std::min<uint64_t>(seconds,UINT32_MAX)),duration,sizeof(duration));
  snprintf(totalLine,sizeof(totalLine),"%lu pages   %s   %u %s",
           static_cast<unsigned long>(std::min<uint64_t>(pages,UINT32_MAX)),
           duration,unsigned(count),count==1?"book":"books");
  renderer.drawText(UI_12_FONT_ID,margin,102,totalLine);
  renderer.drawLine(margin,135,width-margin,135,true);

  if (count==0) {
    renderer.drawText(UI_12_FONT_ID,margin,172,"No reading recorded for this date.");
  }
  // Reserve a bottom navigation strip; older DEV12 footer overlapped it.
  const int footerStart=height-80;
  const int rowStart=151;
  constexpr int rowH=114;
  const size_t visible=std::min(count,
      size_t(std::max(0,footerStart-rowStart)/rowH));

  for (size_t i=0;i<visible;i++) {
    const DailyReadingLog::Entry& e=entries[i];
    const int y=rowStart+int(i)*rowH;
    const std::string title=renderer.truncatedText(
        UI_12_FONT_ID,e.title,contentW,EpdFontFamily::BOLD);
    renderer.drawText(UI_12_FONT_ID,margin,y,title.c_str(),true,EpdFontFamily::BOLD);

    char timeBuf[24],sessionBuf[20],line[104];
    BookReadingStats::formatDuration(e.seconds,timeBuf,sizeof(timeBuf));
    if (e.sessionCount>0 && e.sessionCount!=UINT16_MAX) {
      snprintf(sessionBuf,sizeof(sessionBuf),"%u %s",
               unsigned(e.sessionCount),e.sessionCount==1?"session":"sessions");
    } else {
      snprintf(sessionBuf,sizeof(sessionBuf),"sessions --");
    }
    snprintf(line,sizeof(line),"%lu XTE pages   %s   %s",
             static_cast<unsigned long>(e.pages),timeBuf,sessionBuf);
    renderer.drawText(UI_10_FONT_ID,margin,y+27,line);

    char startPct[16],endPct[16];
    drawPercent(startPct,sizeof(startPct),e.startingPermille);
    drawPercent(endPct,sizeof(endPct),e.endingPermille);
    if (e.startingPermille!=UINT16_MAX) {
      const int delta=int(e.endingPermille)-int(e.startingPermille);
      const unsigned mag=unsigned(delta<0?-delta:delta);
      snprintf(line,sizeof(line),"Progress: %s > %s (%c%u.%u%%)",
               startPct,endPct,delta<0?'-':'+',mag/10,mag%10);
    } else {
      snprintf(line,sizeof(line),"Progress: -- > %s",endPct);
    }
    renderer.drawText(UI_10_FONT_ID,margin,y+53,line);

    char firstPos[16],lastPos[16];
    drawPos(firstPos,sizeof(firstPos),e.startingXtePage);
    drawPos(lastPos,sizeof(lastPos),e.endingXtePage);
    snprintf(line,sizeof(line),"XTE position: %s > %s",firstPos,lastPos);
    renderer.drawText(UI_10_FONT_ID,margin,y+77,line);
    renderer.drawLine(margin,y+104,width-margin,y+104,true);
  }
  if (count>visible) {
    char more[48];
    snprintf(more,sizeof(more),"+ %u more books on this date",
             unsigned(count-visible));
    renderer.drawText(SMALL_FONT_ID,margin,footerStart-21,more);
  }
  renderer.drawLine(margin,footerStart,width-margin,footerStart,true);
  renderer.drawText(SMALL_FONT_ID,margin,footerStart+9,"UP / DOWN: DATE");
  renderer.drawText(SMALL_FONT_ID,margin+210,footerStart+9,"LEFT / RIGHT: STATS");
  renderer.drawText(SMALL_FONT_ID,margin,footerStart+31,"BACK: EXIT");
  renderer.drawText(SMALL_FONT_ID,margin,footerStart+49,
                    "EPUB page positions may change with font size");
}
