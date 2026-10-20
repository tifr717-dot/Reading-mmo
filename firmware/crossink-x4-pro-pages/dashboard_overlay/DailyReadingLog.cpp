#include "DailyReadingLog.h"

#include <HalStorage.h>
#include <Logging.h>

#include <algorithm>
#include <array>
#include <cstring>
#include <limits>
#include <memory>
#include <new>
#include <cstdio>

namespace DailyReadingLog {
namespace {
constexpr char DIR[] = "/.crosspoint/reading_log";
constexpr size_t HEADER_BYTES = 16;
constexpr size_t V1_RECORD_BYTES = 96;
constexpr size_t RECORD_BYTES = 112;
constexpr size_t FILE_MAX = HEADER_BYTES + MAX_BOOKS_PER_DAY * RECORD_BYTES;
using Buffer = std::array<uint8_t, FILE_MAX>;
struct DayData { Entry rows[MAX_BOOKS_PER_DAY]{}; size_t count = 0; };

uint32_t saturated(uint32_t a, uint32_t b) {
  return b > UINT32_MAX - a ? UINT32_MAX : a + b;
}
uint64_t hashPath(const std::string& path) {
  uint64_t hash = UINT64_C(14695981039346656037);
  for (unsigned char c : path) { hash ^= c; hash *= UINT64_C(1099511628211); }
  return hash;
}
void w16(uint8_t* p, uint16_t n) { p[0] = uint8_t(n); p[1] = uint8_t(n >> 8); }
void w32(uint8_t* p, uint32_t n) { for (int i=0;i<4;i++) p[i] = uint8_t(n >> (8*i)); }
void w64(uint8_t* p, uint64_t n) { for (int i=0;i<8;i++) p[i] = uint8_t(n >> (8*i)); }
uint16_t r16(const uint8_t* p) { return uint16_t(p[0]) | (uint16_t(p[1]) << 8); }
uint32_t r32(const uint8_t* p) {
  uint32_t n = 0; for (int i=0;i<4;i++) n |= uint32_t(p[i]) << (8*i); return n;
}
uint64_t r64(const uint8_t* p) {
  uint64_t n = 0; for (int i=0;i<8;i++) n |= uint64_t(p[i]) << (8*i); return n;
}
uint32_t checksum(const Buffer& b, size_t len) {
  uint32_t value = 2166136261u;
  for (size_t i=0;i<len;i++) {
    if (i>=12 && i<16) continue;
    value = (value ^ b[i]) * 16777619u;
  }
  return value;
}
bool leap(uint16_t y) { return (y%4==0 && y%100!=0) || y%400==0; }
uint8_t monthDays(uint16_t y, uint8_t m) {
  const uint8_t days[12] = {31,28,31,30,31,30,31,31,30,31,30,31};
  if (m < 1 || m > 12) return 0;
  return m==2 && leap(y) ? 29 : days[m-1];
}
bool validDate(const LocalDateTime& d) {
  return d.year>=2000 && d.year<=2099 && d.day>0 &&
         d.day<=monthDays(d.year,d.month);
}
uint32_t dateKey(const LocalDateTime& d) {
  return uint32_t(d.year)*10000u+uint32_t(d.month)*100u+d.day;
}
void previousDay(LocalDateTime& d) {
  if (d.day>1) { --d.day; return; }
  if (d.month>1) --d.month; else { d.month=12; --d.year; }
  d.day=monthDays(d.year,d.month);
}
void advanceDay(LocalDateTime& d) {
  if (d.day<monthDays(d.year,d.month)) { ++d.day; return; }
  d.day=1;
  if (d.month<12) ++d.month; else { d.month=1; ++d.year; }
}
void subtractSeconds(LocalDateTime& d, uint32_t seconds) {
  uint32_t s=uint32_t(d.hour)*3600u+uint32_t(d.minute)*60u+d.second;
  while (seconds>s) { seconds-=s+1; previousDay(d); s=86399; }
  s-=seconds;
  d.hour=uint8_t(s/3600); d.minute=uint8_t((s%3600)/60); d.second=uint8_t(s%60);
}
uint16_t progressTenths(float pct) {
  if (!(pct>=0)) return 0;
  if (pct>=100) return 1000;
  return uint16_t(pct*10.0f+0.5f);
}
std::string dayPath(const LocalDateTime& d) {
  char path[72];
  snprintf(path,sizeof(path),"%s/%04u%02u%02u.drl",DIR,
           unsigned(d.year),unsigned(d.month),unsigned(d.day));
  return path;
}
bool loadFile(const std::string& path,Buffer& buf,size_t& size) {
  FsFile file;
  if (!Storage.openFileForRead("DLOG",path,file)) return false;
  size=file.fileSize();
  const bool ok=size>=HEADER_BYTES && size<=FILE_MAX &&
                file.read(buf.data(),size)==size;
  file.close();
  return ok;
}
bool saveFile(const std::string& path,const Buffer& buf,size_t size) {
  FsFile file;
  if (!Storage.openFileForWrite("DLOG",path,file)) return false;
  const bool ok=file.write(buf.data(),size)==size && file.sync();
  const bool closed=file.close();
  return ok && closed;
}
bool decode(const Buffer& b,size_t len,uint32_t dayId,DayData& day) {
  if (len<HEADER_BYTES || r32(b.data()+4)!=dayId) return false;
  const bool legacy=memcmp(b.data(),"DRL1",4)==0;
  if (!legacy && memcmp(b.data(),"DRL2",4)!=0) return false;
  const size_t stride=legacy?V1_RECORD_BYTES:RECORD_BYTES;
  const uint16_t count=r16(b.data()+8);
  if (count>MAX_BOOKS_PER_DAY ||
      len!=HEADER_BYTES+size_t(count)*stride ||
      checksum(b,len)!=r32(b.data()+12)) return false;
  day=DayData{};
  day.count=count;
  for (size_t i=0;i<count;i++) {
    const uint8_t* p=b.data()+HEADER_BYTES+i*stride;
    Entry& e=day.rows[i];
    e.bookId=r64(p);
    e.pages=r32(p+8);
    e.seconds=r32(p+12);
    e.endingPermille=r16(p+16);
    if (!e.bookId || e.endingPermille>1000) return false;
    memcpy(e.title,p+18,MAX_TITLE_BYTES);
    e.title[MAX_TITLE_BYTES]=0;
    if (!legacy) {
      e.startingPermille=r16(p+94);
      e.startingXtePage=r32(p+96);
      e.endingXtePage=r32(p+100);
      e.sessionCount=r16(p+104);
      if (e.startingPermille!=UINT16_MAX && e.startingPermille>1000) return false;
    } else {
      // Previously recorded DEV12 totals survive. Unknown start/position and
      // session count are not invented for historical rows.
      e.startingPermille=UINT16_MAX;
      e.startingXtePage=0;
      e.endingXtePage=0;
      e.sessionCount=UINT16_MAX; // Historical session count is unknown.
    }
  }
  return true;
}
void encode(uint32_t dayId,const DayData& day,Buffer& b,size_t& size) {
  b.fill(0);
  memcpy(b.data(),"DRL2",4);
  w32(b.data()+4,dayId);
  w16(b.data()+8,uint16_t(day.count));
  for (size_t i=0;i<day.count;i++) {
    const Entry& e=day.rows[i];
    uint8_t* p=b.data()+HEADER_BYTES+i*RECORD_BYTES;
    w64(p,e.bookId);
    w32(p+8,e.pages);
    w32(p+12,e.seconds);
    w16(p+16,e.endingPermille);
    memcpy(p+18,e.title,MAX_TITLE_BYTES);
    w16(p+94,e.startingPermille);
    w32(p+96,e.startingXtePage);
    w32(p+100,e.endingXtePage);
    w16(p+104,e.sessionCount);
  }
  size=HEADER_BYTES+day.count*RECORD_BYTES;
  w32(b.data()+12,checksum(b,size));
}
bool load(const LocalDateTime& d,DayData& day) {
  if (!validDate(d)) return false;
  const std::string base=dayPath(d);
  const bool any=Storage.exists(base.c_str()) ||
                 Storage.exists((base+".tmp").c_str()) ||
                 Storage.exists((base+".bak").c_str());
  if (!any) { day=DayData{}; return true; }
  std::unique_ptr<Buffer> data(new(std::nothrow) Buffer{});
  if (!data) return false;
  size_t size=0;
  for (const std::string& path : {base,base+".tmp",base+".bak"}) {
    if (loadFile(path,*data,size) && decode(*data,size,dateKey(d),day)) return true;
  }
  return false; // Never clobber a corrupt day with a new empty file.
}
bool save(const LocalDateTime& d,const DayData& day) {
  if (!Storage.ensureDirectoryExists("/.crosspoint") ||
      !Storage.ensureDirectoryExists(DIR)) return false;
  std::unique_ptr<Buffer> data(new(std::nothrow) Buffer{});
  if (!data) return false;
  size_t size=0;
  encode(dateKey(d),day,*data,size);
  const std::string base=dayPath(d),temp=base+".tmp",backup=base+".bak";
  if (Storage.exists(temp.c_str()) && !Storage.remove(temp.c_str())) return false;
  if (!saveFile(temp,*data,size)) { Storage.remove(temp.c_str()); return false; }
  const bool hadPrevious=Storage.exists(base.c_str());
  if (hadPrevious) {
    if (Storage.exists(backup.c_str()) && !Storage.remove(backup.c_str())) {
      Storage.remove(temp.c_str()); return false;
    }
    if (!Storage.rename(base.c_str(),backup.c_str())) {
      Storage.remove(temp.c_str()); return false;
    }
  }
  if (!Storage.rename(temp.c_str(),base.c_str())) {
    if (hadPrevious && !Storage.exists(base.c_str())) Storage.rename(backup.c_str(),base.c_str());
    return false;
  }
  if (hadPrevious && Storage.exists(backup.c_str())) Storage.remove(backup.c_str());
  return true;
}
bool update(const LocalDateTime& d,uint64_t bookId,const std::string& title,
            uint32_t seconds,uint16_t pages,uint16_t firstPct,uint16_t endingPct,
            uint32_t firstPage,uint32_t endingPage,bool newSession) {
  std::unique_ptr<DayData> day(new(std::nothrow) DayData{});
  if (!day || !load(d,*day)) return false;
  size_t i=0;
  while (i<day->count && day->rows[i].bookId!=bookId) ++i;
  if (i==day->count) {
    if (day->count==MAX_BOOKS_PER_DAY) return false;
    ++day->count;
    day->rows[i]=Entry{};
    day->rows[i].bookId=bookId;
  }
  Entry& e=day->rows[i];
  // Start is latched at the first qualified event of the day, not recomputed
  // from a later navigation jump. Old DRL1 rows keep their unknown start.
  if (e.pages==0 && e.seconds==0 && e.sessionCount==0 &&
      e.startingPermille==UINT16_MAX) {
    e.startingPermille=firstPct;
    e.startingXtePage=firstPage;
  }
  e.pages=saturated(e.pages,pages);
  e.seconds=saturated(e.seconds,seconds);
  e.endingPermille=endingPct;
  if (endingPage>0) e.endingXtePage=endingPage;
  if (newSession && e.sessionCount<UINT16_MAX) ++e.sessionCount;
  size_t n=std::min(title.size(),MAX_TITLE_BYTES);
  while (n>0 && n<title.size() &&
         (uint8_t(title[n]) & 0xC0)==0x80) --n;
  memcpy(e.title,title.data(),n);
  e.title[n]=0;
  return save(d,*day);
}
} // namespace

bool isValid(const LocalDateTime& dt) {
  return validDate(dt) && dt.hour<24 && dt.minute<60 && dt.second<60;
}
bool recordEvent(const std::string& path,const std::string& title,
                 const LocalDateTime& finishedAt,uint32_t elapsedSeconds,
                 uint16_t forwardPages,float startPercent,float endPercent,
                 uint32_t startPage,uint32_t endPage,bool newSession) {
  if (!isValid(finishedAt) || path.empty() ||
      (elapsedSeconds==0 && forwardPages==0)) return false;
  const uint64_t id=hashPath(path);
  LocalDateTime start=finishedAt;
  subtractSeconds(start,elapsedSeconds);
  if (dateKey(start)==dateKey(finishedAt)) {
    return update(finishedAt,id,title,elapsedSeconds,forwardPages,
                  progressTenths(startPercent),progressTenths(endPercent),
                  startPage,endPage,newSession);
  }
  LocalDateTime cursor=start;
  uint32_t remaining=elapsedSeconds;
  bool success=true;
  while (remaining>0 && dateKey(cursor)<dateKey(finishedAt)) {
    const uint32_t sinceMidnight=uint32_t(cursor.hour)*3600u+
        uint32_t(cursor.minute)*60u+cursor.second;
    const uint32_t chunk=std::min(86400u-sinceMidnight,remaining);
    if (chunk) success=update(cursor,id,title,chunk,0,
                              progressTenths(startPercent),progressTenths(startPercent),
                              startPage,startPage,false) && success;
    remaining-=chunk;
    cursor.hour=cursor.minute=cursor.second=0;
    advanceDay(cursor);
  }
  if (!remaining && !forwardPages) return success;
  return update(finishedAt,id,title,remaining,forwardPages,
                progressTenths(startPercent),progressTenths(endPercent),
                startPage,endPage,newSession) && success;
}
bool readDay(const LocalDateTime& date,Entry* entries,size_t capacity,size_t& count) {
  count=0;
  if (!entries || !validDate(date)) return false;
  std::unique_ptr<DayData> data(new(std::nothrow) DayData{});
  if (!data || !load(date,*data) || data->count>capacity) return false;
  for (size_t i=0;i<data->count;i++) entries[i]=data->rows[i];
  count=data->count;
  return true;
}
} // namespace DailyReadingLog
