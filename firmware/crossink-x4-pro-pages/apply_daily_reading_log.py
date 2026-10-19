from pathlib import Path

# Runs AFTER the existing apply_pages_x4pro.py build transform; this is a
# non-destructive layer on top of the approved stats dashboard.
ROOT = Path("crossink")
OVERLAY = Path("firmware/crossink-x4-pro-pages/dashboard_overlay")

def read(name):
    return (ROOT / name).read_text()

def write(name, value):
    (ROOT / name).write_text(value)

def replace_once(name, old, new):
    current=read(name)
    n=current.count(old)
    if n!=1:
        raise RuntimeError(f"{name}: daily-log anchor expected once, found {n}: {old[:90]!r}")
    write(name,current.replace(old,new,1))

for basename in ("DailyReadingLog.h","DailyReadingLog.cpp",
                 "DailyReadingLogDeviceAdapter.h","DailyReadingLogView.h",
                 "DailyReadingLogView.cpp"):
    write(f"src/activities/reader/{basename}",(OVERLAY/basename).read_text())

epub="src/activities/reader/EpubReaderActivity.cpp"
xtc="src/activities/reader/XtcReaderActivity.cpp"
header="src/activities/reader/BookStatsActivity.h"
activity="src/activities/reader/BookStatsActivity.cpp"

# Write active seconds on reader page turnover / pause / sleep / exit.
# The upstream idle timer decides which seconds qualify.
for file in (epub,xtc):
    replace_once(file,
                 '#include "ReadingDailyStats.h"\n',
                 '#include "ReadingDailyStats.h"\n#include "DailyReadingLogDeviceAdapter.h"\n')

time_old="""  if (currentPageReadingSecondsForStats(seconds, source)) {
    sessionReadingSeconds = sessionReadingSeconds > UINT32_MAX - seconds ? UINT32_MAX : sessionReadingSeconds + seconds;
  }
  pageShownAtMs = 0UL;
}"""
for file,book in ((epub,"epub"),(xtc,"xtc")):
    time_new="""  if (currentPageReadingSecondsForStats(seconds, source)) {
    sessionReadingSeconds = sessionReadingSeconds > UINT32_MAX - seconds ? UINT32_MAX : sessionReadingSeconds + seconds;
    if (BOOK && SETTINGS.shouldTrackReadingStats()) {
      const float pct = getCurrentBookProgressPercent();
      DailyReadingLog::recordAtCurrentTime(BOOK->getPath(), BOOK->getTitle(), seconds, 0, pct, pct);
    }
  }
  pageShownAtMs = 0UL;
}""".replace("BOOK",book)
    replace_once(file,time_old,time_new)

replace_once(epub,
"""void EpubReaderActivity::pageTurn(bool isForwardTurn, const char* source) {
  pageLoadRetryCount = 0;""",
"""void EpubReaderActivity::pageTurn(bool isForwardTurn, const char* source) {
  const float dailyBefore = getCurrentBookProgressPercent();
  pageLoadRetryCount = 0;""")
replace_once(epub,
"""      stats.totalPagesTurned++;
      globalStats.totalPagesTurned++;
      sessionForwardPages++;""",
"""      stats.totalPagesTurned++;
      globalStats.totalPagesTurned++;
      sessionForwardPages++;
      if (epub && SETTINGS.shouldTrackReadingStats()) {
        // During a spine boundary, section may be unloaded temporarily.
        const float after = getCurrentBookProgressPercent();
        const float ending = (after <= 0.0f && dailyBefore > 0.0f) ? dailyBefore : after;
        DailyReadingLog::recordAtCurrentTime(epub->getPath(), epub->getTitle(), 0, 1, dailyBefore, ending);
      }""")
replace_once(xtc,
"""  stats.totalPagesTurned++;
  globalStats.totalPagesTurned++;
  sessionForwardPages++;""",
"""  stats.totalPagesTurned++;
  globalStats.totalPagesTurned++;
  sessionForwardPages++;
  // Do not classify a 10-page navigation skip as a page read.
  if (recordPace && xtc && SETTINGS.shouldTrackReadingStats()) {
    const float pct = getCurrentBookProgressPercent();
    DailyReadingLog::recordAtCurrentTime(xtc->getPath(), xtc->getTitle(), 0, 1, pct, pct);
  }""")

# Add a separate day-detail page to the X4 Pro stats navigation.
# Global/all-device pages remain unchanged on other devices.
replace_once(header,
"enum class Page : uint8_t { PerBook, ThisDevice, AllDevices, EditDates };",
"enum class Page : uint8_t { PerBook, ThisDevice, DailyLog, AllDevices, EditDates };")
replace_once(header,
"  Page page = Page::PerBook;\n",
"  Page page = Page::PerBook;\n  ReadingStatsDate dailyLogDate{};\n")
replace_once(activity,
'#include "StatsDashboardView.h"\n',
'#include "StatsDashboardView.h"\n#include "DailyReadingLogView.h"\n')
replace_once(activity,
"""void BookStatsActivity::onEnter() {
  Activity::onEnter();""",
"""void BookStatsActivity::onEnter() {
  Activity::onEnter();
  ReadingStatsDateTime dailyNow{};
  if (getCurrentLocalReadingStatsDateTime(dailyNow)) dailyLogDate = dailyNow.date;""")
replace_once(activity,
"""  if (page == Page::ThisDevice && showAllDevicesStats) {
    page = Page::AllDevices;
    requestUpdate();
    return true;
  }""",
"""#if defined(FREEINK_DEVICE_X4PRO) && FREEINK_DEVICE_X4PRO
  if (page == Page::ThisDevice) {
    page = Page::DailyLog;
    requestUpdate();
    return true;
  }
  if (page == Page::DailyLog && showAllDevicesStats) {
    page = Page::AllDevices;
    requestUpdate();
    return true;
  }
#else
  if (page == Page::ThisDevice && showAllDevicesStats) {
    page = Page::AllDevices;
    requestUpdate();
    return true;
  }
#endif""")
replace_once(activity,
"""  if (page == Page::AllDevices) {
    page = Page::ThisDevice;
    requestUpdate();
    return true;
  }

  if (page == Page::ThisDevice) {""",
"""  if (page == Page::AllDevices) {
#if defined(FREEINK_DEVICE_X4PRO) && FREEINK_DEVICE_X4PRO
    page = Page::DailyLog;
#else
    page = Page::ThisDevice;
#endif
    requestUpdate();
    return true;
  }
#if defined(FREEINK_DEVICE_X4PRO) && FREEINK_DEVICE_X4PRO
  if (page == Page::DailyLog) {
    page = Page::ThisDevice;
    requestUpdate();
    return true;
  }
#endif

  if (page == Page::ThisDevice) {""")
replace_once(activity,
"""  const bool downOrRightPressed = mappedInput.wasPressed(MappedInputManager::Button::Down) ||
                                   mappedInput.wasPressed(MappedInputManager::Button::Right);

  if (page == Page::EditDates) {""",
"""  const bool downOrRightPressed = mappedInput.wasPressed(MappedInputManager::Button::Down) ||
                                   mappedInput.wasPressed(MappedInputManager::Button::Right);

#if defined(FREEINK_DEVICE_X4PRO) && FREEINK_DEVICE_X4PRO
  if (page == Page::DailyLog) {
    if (mappedInput.wasPressed(MappedInputManager::Button::Up) && dailyLogDate.isValid()) {
      addDaysToReadingStatsDate(dailyLogDate,-1);
      requestUpdate();
      return;
    }
    if (mappedInput.wasPressed(MappedInputManager::Button::Down) && dailyLogDate.isValid()) {
      ReadingStatsDateTime now{};
      ReadingStatsDate next=dailyLogDate;
      addDaysToReadingStatsDate(next,1);
      if (getCurrentLocalReadingStatsDateTime(now) &&
          compareReadingStatsDate(next,now.date)<=0) {
        dailyLogDate=next;
        requestUpdate();
      }
      return;
    }
    if (mappedInput.wasPressed(MappedInputManager::Button::Left)) {
      showPreviousStatsPage();
      return;
    }
    if (mappedInput.wasPressed(MappedInputManager::Button::Right)) {
      showNextStatsPage();
      return;
    }
  }
#endif

  if (page == Page::EditDates) {""")
replace_once(activity,
"""    case Page::AllDevices:
      renderGlobalStatsPage(renderer, &mappedInput, tr(STR_STATS_ALL_DEVICES_SCREEN), allDevicesStats, true, false);
      break;""",
"""    case Page::DailyLog:
#if defined(FREEINK_DEVICE_X4PRO) && FREEINK_DEVICE_X4PRO
      renderX4ProDailyReadingLog(renderer,dailyLogDate);
#endif
      break;
    case Page::AllDevices:
      renderGlobalStatsPage(renderer, &mappedInput, tr(STR_STATS_ALL_DEVICES_SCREEN), allDevicesStats, true, false);
      break;""")
replace_once(activity,
"""    drawPageIndicators(renderer, static_cast<int>(page), showAllDevicesStats ? 3 : 2);""",
"""#if defined(FREEINK_DEVICE_X4PRO) && FREEINK_DEVICE_X4PRO
    drawPageIndicators(renderer, static_cast<int>(page), showAllDevicesStats ? 4 : 3);
#else
    const int dotPage = page == Page::AllDevices ? 2 : static_cast<int>(page);
    drawPageIndicators(renderer, dotPage, showAllDevicesStats ? 3 : 2);
#endif""")

replace_once(activity,
    "  if (page == Page::ThisDevice && showAllDevicesStats && downOrRightPressed) {",
    "  if (page == Page::ThisDevice && downOrRightPressed) {")
print("X4 Pro per-book daily diary recorder + browseable Stats page applied")
