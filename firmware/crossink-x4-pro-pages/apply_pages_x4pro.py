from pathlib import Path

ROOT = Path("crossink")

def read(path):
    return (ROOT / path).read_text()

def write(path, text):
    (ROOT / path).write_text(text)

def replace_once(path, old, new):
    text = read(path)
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{path}: expected 1 match, found {count}: {old[:100]!r}")
    write(path, text.replace(old, new, 1))

# Label "Pages" consistently.
replace_once(
    "lib/I18n/translations/english.yaml",
    'STR_STATS_PAGES_LBL: "Pages Turned"',
    'STR_STATS_PAGES_LBL: "Pages"',
)

# Saved whole-book page loader used by Home and the sleep screen.
replace_once(
    "src/activities/home/RecentBookProgress.h",
    "#include <string>",
    "#include <cstdint>\n#include <string>",
)
replace_once(
    "src/activities/home/RecentBookProgress.h",
    "float loadPercent(const RecentBook& book);\n",
    "float loadPercent(const RecentBook& book);\n"
    "// Loads the saved whole-book page position when it can be determined.\n"
    "// Returns 0 when no reliable position is available.\n"
    "uint32_t loadPageNumber(const RecentBook& book);\n",
)

replace_once(
    "src/activities/home/RecentBookProgress.cpp",
    "#include <cstdint>\n#include <cstdio>",
    "#include <cstdint>\n#include <limits>\n#include <cstdio>",
)

page_helpers = r'''
uint32_t loadEpubPageNumber(const RecentBook& book) {
  Epub epub(book.path, "/.crosspoint");
  if (!epub.load(false, true)) {
    return 0;
  }

  EpubReaderUtils::Progress progress;
  if (!EpubReaderUtils::loadProgress(epub, progress, "RBPR") || !progress.hasPageCount || progress.pageCount <= 0 ||
      progress.spineIndex < 0 || progress.spineIndex >= epub.getSpineItemsCount()) {
    return 0;
  }

  const float sectionProgress =
      std::clamp(static_cast<float>(progress.pageNumber) / static_cast<float>(progress.pageCount), 0.0f, 1.0f);
  uint32_t referencePage = 0;
  uint32_t referencePageCount = 0;
  if (epub.resolveReferencePage(progress.spineIndex, sectionProgress, referencePage, referencePageCount) &&
      referencePage > 0) {
    return referencePage;
  }

  const size_t completedSpineBytes =
      progress.spineIndex > 0 ? epub.getCumulativeSpineItemSize(progress.spineIndex - 1) : 0;
  const size_t currentCumulativeBytes = epub.getCumulativeSpineItemSize(progress.spineIndex);
  const size_t currentSpineBytes =
      currentCumulativeBytes > completedSpineBytes ? currentCumulativeBytes - completedSpineBytes : 0;
  if (currentSpineBytes == 0) {
    return 0;
  }

  const uint64_t precedingPages =
      (static_cast<uint64_t>(completedSpineBytes) * static_cast<uint64_t>(progress.pageCount) +
       static_cast<uint64_t>(currentSpineBytes) / 2ULL) /
      static_cast<uint64_t>(currentSpineBytes);
  const uint64_t currentPage = precedingPages + static_cast<uint64_t>(std::max(progress.pageNumber, 0)) + 1ULL;
  return static_cast<uint32_t>(std::min<uint64_t>(currentPage, std::numeric_limits<uint32_t>::max()));
}

uint32_t loadXtcPageNumber(const RecentBook& book) {
  Xtc xtc(book.path, "/.crosspoint");
  if (!xtc.load()) {
    return 0;
  }

  FsFile file;
  if (!Storage.openFileForRead("RBPR", xtc.getCachePath() + "/progress.bin", file)) {
    return 0;
  }

  uint8_t data[4];
  const int bytesRead = file.read(data, sizeof(data));
  file.close();
  if (bytesRead != 4) {
    return 0;
  }

  const uint32_t currentPage = static_cast<uint32_t>(data[0]) | (static_cast<uint32_t>(data[1]) << 8) |
                               (static_cast<uint32_t>(data[2]) << 16) | (static_cast<uint32_t>(data[3]) << 24);
  const uint32_t pageCount = xtc.getPageCount();
  return pageCount > 0 ? std::min<uint32_t>(currentPage + 1U, pageCount) : currentPage + 1U;
}
'''

replace_once(
    "src/activities/home/RecentBookProgress.cpp",
    "\n}  // namespace\n\nfloat RecentBookProgress::loadPercent(const RecentBook& book) {",
    "\n" + page_helpers + "\n}  // namespace\n\nfloat RecentBookProgress::loadPercent(const RecentBook& book) {",
)

page_api = r'''
uint32_t RecentBookProgress::loadPageNumber(const RecentBook& book) {
  if (FsHelpers::hasEpubExtension(book.path)) {
    return loadEpubPageNumber(book);
  }
  if (FsHelpers::hasXtcExtension(book.path)) {
    return loadXtcPageNumber(book);
  }
  return 0;
}

'''
replace_once(
    "src/activities/home/RecentBookProgress.cpp",
    "float RecentBookProgress::loadCachedEpubPercent(const RecentBook& book) {",
    page_api + "float RecentBookProgress::loadCachedEpubPercent(const RecentBook& book) {",
)

# Pass the current whole-book page through BookStatsActivity.
replace_once(
    "src/activities/reader/BookStatsActivity.h",
    "  uint32_t estimatedTimeLeftSeconds = 0;\n",
    "  uint32_t estimatedTimeLeftSeconds = 0;\n  uint32_t currentBookPage = 0;\n",
)
replace_once(
    "src/activities/reader/BookStatsActivity.h",
    """                    bool hasEstimatedTimeLeft, uint32_t estimatedTimeLeftSeconds, const GlobalReadingStats& globalStats,
                    bool returnToHomeOnExit = false);""",
    """                    bool hasEstimatedTimeLeft, uint32_t estimatedTimeLeftSeconds, uint32_t currentBookPage,
                    const GlobalReadingStats& globalStats, bool returnToHomeOnExit = false);""",
)
replace_once(
    "src/activities/reader/BookStatsActivity.h",
    """                    bool hasEstimatedTimeLeft, uint32_t estimatedTimeLeftSeconds, const GlobalReadingStats& globalStats,
                    const GlobalReadingStats& allDevicesStats, bool returnToHomeOnExit = false);""",
    """                    bool hasEstimatedTimeLeft, uint32_t estimatedTimeLeftSeconds, uint32_t currentBookPage,
                    const GlobalReadingStats& globalStats, const GlobalReadingStats& allDevicesStats,
                    bool returnToHomeOnExit = false);""",
)

replace_once(
    "src/activities/reader/BookStatsActivity.cpp",
    """                                     const uint32_t estimatedTimeLeftSeconds, const GlobalReadingStats& globalStats,
                                     const bool returnToHomeOnExit)""",
    """                                     const uint32_t estimatedTimeLeftSeconds, const uint32_t currentBookPage,
                                     const GlobalReadingStats& globalStats, const bool returnToHomeOnExit)""",
)
text = read("src/activities/reader/BookStatsActivity.cpp")
old = """      hasEstimatedTimeLeft(hasEstimatedTimeLeft),
      estimatedTimeLeftSeconds(estimatedTimeLeftSeconds) {}"""
new = """      hasEstimatedTimeLeft(hasEstimatedTimeLeft),
      estimatedTimeLeftSeconds(estimatedTimeLeftSeconds),
      currentBookPage(currentBookPage) {}"""
if text.count(old) != 2:
    raise RuntimeError(f"BookStatsActivity.cpp: expected 2 constructor initializer tails, found {text.count(old)}")
write("src/activities/reader/BookStatsActivity.cpp", text.replace(old, new))
replace_once(
    "src/activities/reader/BookStatsActivity.cpp",
    """                                     const uint32_t estimatedTimeLeftSeconds, const GlobalReadingStats& globalStats,
                                     const GlobalReadingStats& allDevicesStats, const bool returnToHomeOnExit)""",
    """                                     const uint32_t estimatedTimeLeftSeconds, const uint32_t currentBookPage,
                                     const GlobalReadingStats& globalStats, const GlobalReadingStats& allDevicesStats,
                                     const bool returnToHomeOnExit)""",
)
replace_once(
    "src/activities/reader/BookStatsActivity.cpp",
    """    renderNoRtcCombinedStatsPage(renderer, &mappedInput, bookTitle, stats, progressPercent, hasEstimatedTimeLeft,
                                 estimatedTimeLeftSeconds, globalStats,""",
    """    renderNoRtcCombinedStatsPage(renderer, &mappedInput, bookTitle, stats, progressPercent, hasEstimatedTimeLeft,
                                 estimatedTimeLeftSeconds, currentBookPage, globalStats,""",
)
replace_once(
    "src/activities/reader/BookStatsActivity.cpp",
    """      renderPerBookStatsPage(renderer, &mappedInput, bookTitle, stats, progressPercent, hasEstimatedTimeLeft,
                             estimatedTimeLeftSeconds, true, hasEditableBook(), true);""",
    """      renderPerBookStatsPage(renderer, &mappedInput, bookTitle, stats, progressPercent, hasEstimatedTimeLeft,
                             estimatedTimeLeftSeconds, currentBookPage, true, hasEditableBook(), true);""",
)

# Stats view: keep the X4 Pro's RTC layout, but replace Avg Session with current Pages.
replace_once(
    "src/activities/reader/BookStatsView.h",
    """                            uint32_t estimatedTimeLeftSeconds, bool showButtonHints, bool showEditButton,
                            bool showMoreButton);""",
    """                            uint32_t estimatedTimeLeftSeconds, uint32_t currentBookPage, bool showButtonHints,
                            bool showEditButton, bool showMoreButton);""",
)
replace_once(
    "src/activities/reader/BookStatsView.h",
    """                                  float progressPercent, bool hasEstimatedTimeLeft, uint32_t estimatedTimeLeftSeconds,
                                  const GlobalReadingStats& deviceStats, const GlobalReadingStats* allDevicesStats,
                                  bool showButtonHints);""",
    """                                  float progressPercent, bool hasEstimatedTimeLeft, uint32_t estimatedTimeLeftSeconds,
                                  uint32_t currentBookPage, const GlobalReadingStats& deviceStats,
                                  const GlobalReadingStats* allDevicesStats, bool showButtonHints);""",
)

replace_once(
    "src/activities/reader/BookStatsView.cpp",
    """                          const bool hasEstimatedTimeLeft, const uint32_t estimatedTimeLeftSeconds,
                          const StatsLayout& layout) {""",
    """                          const bool hasEstimatedTimeLeft, const uint32_t estimatedTimeLeftSeconds,
                          const uint32_t currentBookPage, const StatsLayout& layout) {""",
)
replace_once(
    "src/activities/reader/BookStatsView.cpp",
    """  const uint32_t avgSecs = stats.sessionCount > 0 ? stats.totalReadingSeconds / stats.sessionCount : 0;
  BookReadingStats::formatDuration(avgSecs, buf, sizeof(buf));
  drawStatCell(renderer, x, thirdW, y + layout.topCardTitleH + rowH, rowH, buf, tr(STR_STATS_AVG_SESSION_LBL));
""",
    """  if (currentBookPage > 0) {
    snprintf(buf, sizeof(buf), "%lu", static_cast<unsigned long>(currentBookPage));
  } else {
    snprintf(buf, sizeof(buf), "-");
  }
  drawStatCell(renderer, x, thirdW, y + layout.topCardTitleH + rowH, rowH, buf, tr(STR_STATS_PAGES_LBL));
""",
)
# On the X4 Pro's RTC global page, use the middle bottom cell for total Pages.
replace_once(
    "src/activities/reader/BookStatsView.cpp",
    """  if (showRtcStats) {
    ReadingStatsDateTime today;
    const bool hasToday = getCurrentLocalReadingStatsDateTime(today);
    const uint16_t currentStreak = hasToday ? stats.currentReadingStreak(&today.date) : 0;
    if (currentStreak > 0) {
      snprintf(buf, sizeof(buf), "%u %s", static_cast<unsigned>(currentStreak), dayCountText(currentStreak));
    } else {
      snprintf(buf, sizeof(buf), "-");
    }
    drawStatCell(renderer, x + thirdW, thirdW, y + layout.topCardTitleH + rowH, rowH, buf,
                 tr(STR_STATS_READING_STREAK_LBL));
  }
""",
    """  if (showRtcStats) {
    snprintf(buf, sizeof(buf), "%lu", static_cast<unsigned long>(stats.totalPagesTurned));
    drawStatCell(renderer, x + thirdW, thirdW, y + layout.topCardTitleH + rowH, rowH, buf,
                 tr(STR_STATS_PAGES_LBL));
  }
""",
)
replace_once(
    "src/activities/reader/BookStatsView.cpp",
    """                            const BookReadingStats& stats, const float progressPercent, const bool hasEstimatedTimeLeft,
                            const uint32_t estimatedTimeLeftSeconds, const bool showButtonHints,
                            const bool showEditButton, const bool showMoreButton) {""",
    """                            const BookReadingStats& stats, const float progressPercent, const bool hasEstimatedTimeLeft,
                            const uint32_t estimatedTimeLeftSeconds, const uint32_t currentBookPage,
                            const bool showButtonHints, const bool showEditButton, const bool showMoreButton) {""",
)
# Two calls in renderPerBookStatsPage.
text = read("src/activities/reader/BookStatsView.cpp")
old = """    drawPerBookStatsCard(renderer, cardX, y, cardW, topCardH, bookTitle, stats, progressPercent, hasEstimatedTimeLeft,
                         estimatedTimeLeftSeconds, layout);"""
if text.count(old) != 2:
    raise RuntimeError(f"BookStatsView.cpp: expected 2 per-book draw calls, found {text.count(old)}")
text = text.replace(
    old,
    """    drawPerBookStatsCard(renderer, cardX, y, cardW, topCardH, bookTitle, stats, progressPercent, hasEstimatedTimeLeft,
                         estimatedTimeLeftSeconds, currentBookPage, layout);""",
)
write("src/activities/reader/BookStatsView.cpp", text)

replace_once(
    "src/activities/reader/BookStatsView.cpp",
    """                                  const float progressPercent, const bool hasEstimatedTimeLeft,
                                  const uint32_t estimatedTimeLeftSeconds, const GlobalReadingStats& deviceStats,
                                  const GlobalReadingStats* allDevicesStats, const bool showButtonHints) {""",
    """                                  const float progressPercent, const bool hasEstimatedTimeLeft,
                                  const uint32_t estimatedTimeLeftSeconds, const uint32_t currentBookPage,
                                  const GlobalReadingStats& deviceStats, const GlobalReadingStats* allDevicesStats,
                                  const bool showButtonHints) {""",
)
replace_once(
    "src/activities/reader/BookStatsView.cpp",
    """  drawPerBookStatsCard(renderer, cardX, y, cardW, perBookCardH, bookTitle, bookStats, progressPercent,
                       hasEstimatedTimeLeft, estimatedTimeLeftSeconds, layout);""",
    """  drawPerBookStatsCard(renderer, cardX, y, cardW, perBookCardH, bookTitle, bookStats, progressPercent,
                       hasEstimatedTimeLeft, estimatedTimeLeftSeconds, currentBookPage, layout);""",
)

# Sleep screen: load the saved page and pass it into the exact RTC screen visible on the X4 Pro.
replace_once(
    "src/activities/boot_sleep/SleepActivity.cpp",
    """  float progressPercent = -1.0f;

  const std::string& path""",
    """  float progressPercent = -1.0f;
  uint32_t currentBookPage = 0;

  const std::string& path""",
)
replace_once(
    "src/activities/boot_sleep/SleepActivity.cpp",
    """    bookStats = loadBookStatsForPath(path);
    progressPercent = RecentBookProgress::loadPercent(recentBookForPath(path));""",
    """    const RecentBook book = recentBookForPath(path);
    bookStats = loadBookStatsForPath(path);
    progressPercent = RecentBookProgress::loadPercent(book);
    currentBookPage = RecentBookProgress::loadPageNumber(book);""",
)
replace_once(
    "src/activities/boot_sleep/SleepActivity.cpp",
    """    renderNoRtcCombinedStatsPage(renderer, nullptr, bookTitle, bookStats, progressPercent, false, 0, deviceStats,
                                 hasSyncedStats ? &allDevicesStats : nullptr, false);""",
    """    renderNoRtcCombinedStatsPage(renderer, nullptr, bookTitle, bookStats, progressPercent, false, 0,
                                 currentBookPage, deviceStats, hasSyncedStats ? &allDevicesStats : nullptr, false);""",
)
replace_once(
    "src/activities/boot_sleep/SleepActivity.cpp",
    """    renderPerBookStatsPage(renderer, nullptr, bookTitle, bookStats, progressPercent, false, 0, false, false, false);""",
    """    renderPerBookStatsPage(renderer, nullptr, bookTitle, bookStats, progressPercent, false, 0, currentBookPage,
                           false, false, false);""",
)

# Home screen Reading Stats.
replace_once(
    "src/activities/home/HomeActivity.cpp",
    """  const std::string cachePath =
      FsHelpers::hasEpubExtension(bookPath) ? Epub::cachePathForFilePath(bookPath, "/.crosspoint") : std::string{};
  if (showAllDevicesStats) {""",
    """  const std::string cachePath =
      FsHelpers::hasEpubExtension(bookPath) ? Epub::cachePathForFilePath(bookPath, "/.crosspoint") : std::string{};
  const uint32_t currentBookPage =
      highlightedBookIdx >= 0 ? RecentBookProgress::loadPageNumber(recentBooks[highlightedBookIdx]) : 0;
  if (showAllDevicesStats) {""",
)
replace_once(
    "src/activities/home/HomeActivity.cpp",
    """                                                               currentBookStats, currentBookProgressPercent, false, 0,
                                                               globalStats, allDevicesGlobalStats, true),""",
    """                                                               currentBookStats, currentBookProgressPercent, false, 0,
                                                               currentBookPage, globalStats, allDevicesGlobalStats, true),""",
)
replace_once(
    "src/activities/home/HomeActivity.cpp",
    """        std::make_unique<BookStatsActivity>(renderer, mappedInput, bookTitle, cachePath, currentBookStats,
                                            currentBookProgressPercent, false, 0, globalStats, true),""",
    """        std::make_unique<BookStatsActivity>(renderer, mappedInput, bookTitle, cachePath, currentBookStats,
                                            currentBookProgressPercent, false, 0, currentBookPage, globalStats, true),""",
)

# EPUB reader: live whole-book page value for both the reader menu and frontlight stats entry.
replace_once(
    "src/activities/reader/EpubReaderActivity.h",
    "  float getCurrentBookProgressPercent() const;\n",
    "  float getCurrentBookProgressPercent() const;\n  uint32_t getCurrentBookPageForStats() const;\n",
)

epub_page_fn = r'''
uint32_t EpubReaderActivity::getCurrentBookPageForStats() const {
  const int sectionPageCount = section ? section->estimatedTotalPages() : 0;
  if (activeFootnotePreview || !epub || !section || sectionPageCount <= 0 || section->currentPage < 0 ||
      currentSpineIndex < 0 || currentSpineIndex >= epub->getSpineItemsCount()) {
    return 0;
  }

  const float sectionProgress =
      std::clamp(static_cast<float>(section->currentPage) / static_cast<float>(sectionPageCount), 0.0f, 1.0f);

  uint32_t referencePage = 0;
  uint32_t referencePageCount = 0;
  if (epub->resolveReferencePage(currentSpineIndex, sectionProgress, referencePage, referencePageCount) &&
      referencePage > 0) {
    return referencePage;
  }

  const size_t completedSpineBytes =
      currentSpineIndex > 0 ? epub->getCumulativeSpineItemSize(currentSpineIndex - 1) : 0;
  const size_t currentCumulativeBytes = epub->getCumulativeSpineItemSize(currentSpineIndex);
  const size_t currentSpineBytes =
      currentCumulativeBytes > completedSpineBytes ? currentCumulativeBytes - completedSpineBytes : 0;
  if (currentSpineBytes > 0) {
    const uint64_t precedingPages =
        (static_cast<uint64_t>(completedSpineBytes) * static_cast<uint64_t>(sectionPageCount) +
         static_cast<uint64_t>(currentSpineBytes) / 2ULL) /
        static_cast<uint64_t>(currentSpineBytes);
    const uint64_t estimatedCurrentPage = precedingPages + static_cast<uint64_t>(section->currentPage) + 1ULL;
    return static_cast<uint32_t>(
        std::min<uint64_t>(estimatedCurrentPage, std::numeric_limits<uint32_t>::max()));
  }

  return static_cast<uint32_t>(section->currentPage + 1);
}

'''
replace_once(
    "src/activities/reader/EpubReaderActivity.cpp",
    "void EpubReaderActivity::pauseReadingPaceTimer(const char* reason) {",
    epub_page_fn + "void EpubReaderActivity::pauseReadingPaceTimer(const char* reason) {",
)
# Reader-menu constructors.
replace_once(
    "src/activities/reader/EpubReaderActivity.cpp",
    """                                                displayStats, getCurrentBookProgressPercent(), hasEstimatedTimeLeft,
                                                estimatedTimeLeftSeconds, globalStats, displayAllDevicesStats),""",
    """                                                displayStats, getCurrentBookProgressPercent(), hasEstimatedTimeLeft,
                                                estimatedTimeLeftSeconds, getCurrentBookPageForStats(), globalStats,
                                                displayAllDevicesStats),""",
)
replace_once(
    "src/activities/reader/EpubReaderActivity.cpp",
    """                                                displayStats, getCurrentBookProgressPercent(), hasEstimatedTimeLeft,
                                                estimatedTimeLeftSeconds, globalStats),""",
    """                                                displayStats, getCurrentBookProgressPercent(), hasEstimatedTimeLeft,
                                                estimatedTimeLeftSeconds, getCurrentBookPageForStats(), globalStats),""",
)
# Frontlight stats constructors.
replace_once(
    "src/activities/reader/EpubReaderActivity.cpp",
    """        hasEstimatedTimeLeft, estimatedTimeLeftSeconds, globalStats, GlobalReadingStats::loadAggregated(globalStats));""",
    """        hasEstimatedTimeLeft, estimatedTimeLeftSeconds, getCurrentBookPageForStats(), globalStats,
        GlobalReadingStats::loadAggregated(globalStats));""",
)
replace_once(
    "src/activities/reader/EpubReaderActivity.cpp",
    """                                              displayStats, getCurrentBookProgressPercent(), hasEstimatedTimeLeft,
                                              estimatedTimeLeftSeconds, globalStats);""",
    """                                              displayStats, getCurrentBookProgressPercent(), hasEstimatedTimeLeft,
                                              estimatedTimeLeftSeconds, getCurrentBookPageForStats(), globalStats);""",
)

# ActivityManager frontlight fallback can also construct BookStatsActivity.
replace_once(
    "src/activities/ActivityManager.cpp",
    """  BookReadingStats bookStats;
  float progress = -1.0f;
  if (source == FrontlightBookSource::LastBook) {""",
    """  BookReadingStats bookStats;
  float progress = -1.0f;
  uint32_t currentBookPage = 0;
  if (source == FrontlightBookSource::LastBook) {""",
)
replace_once(
    "src/activities/ActivityManager.cpp",
    """    const RecentBook book{context.bookPath, context.bookTitle, {}, {}};
    progress = RecentBookProgress::loadCachedEpubPercent(book);""",
    """    const RecentBook book{context.bookPath, context.bookTitle, {}, {}};
    progress = RecentBookProgress::loadCachedEpubPercent(book);
    currentBookPage = RecentBookProgress::loadPageNumber(book);""",
)
replace_once(
    "src/activities/ActivityManager.cpp",
    """        makeUniqueNoThrow<BookStatsActivity>(renderer, mappedInput, statsTitle, cachePath, bookStats, progress, false,
                                             0, global, GlobalReadingStats::loadAggregated(global));""",
    """        makeUniqueNoThrow<BookStatsActivity>(renderer, mappedInput, statsTitle, cachePath, bookStats, progress, false,
                                             0, currentBookPage, global,
                                             GlobalReadingStats::loadAggregated(global));""",
)
replace_once(
    "src/activities/ActivityManager.cpp",
    """    context.readingStatsActivity = makeUniqueNoThrow<BookStatsActivity>(renderer, mappedInput, statsTitle, cachePath,
                                                                        bookStats, progress, false, 0, global);""",
    """    context.readingStatsActivity = makeUniqueNoThrow<BookStatsActivity>(renderer, mappedInput, statsTitle, cachePath,
                                                                        bookStats, progress, false, 0,
                                                                        currentBookPage, global);""",
)

# XTC: exact current page is already known.
replace_once(
    "src/activities/reader/XtcReaderActivity.cpp",
    """  const bool hasSyncedStats = GlobalReadingStats::hasSyncedStats();
  if (hasSyncedStats) {""",
    """  const uint32_t pageCount = xtc->getPageCount();
  const uint32_t currentBookPage =
      pageCount > 0 ? std::min<uint32_t>(currentPage + 1U, pageCount) : currentPage + 1U;
  const bool hasSyncedStats = GlobalReadingStats::hasSyncedStats();
  if (hasSyncedStats) {""",
)
replace_once(
    "src/activities/reader/XtcReaderActivity.cpp",
    """                                                displayStats, getCurrentBookProgressPercent(), false, 0, globalStats,
                                                GlobalReadingStats::loadAggregated(globalStats));""",
    """                                                displayStats, getCurrentBookProgressPercent(), false, 0,
                                                currentBookPage, globalStats,
                                                GlobalReadingStats::loadAggregated(globalStats));""",
)
replace_once(
    "src/activities/reader/XtcReaderActivity.cpp",
    """  return makeUniqueNoThrow<BookStatsActivity>(renderer, mappedInput, xtc->getTitle(), xtc->getCachePath(), displayStats,
                                              getCurrentBookProgressPercent(), false, 0, globalStats);""",
    """  return makeUniqueNoThrow<BookStatsActivity>(renderer, mappedInput, xtc->getTitle(), xtc->getCachePath(), displayStats,
                                              getCurrentBookProgressPercent(), false, 0, currentBookPage, globalStats);""",
)


# Dashboard analytics overlay files.
overlay_dir = Path("firmware/crossink-x4-pro-pages/dashboard_overlay")
write("src/activities/reader/ReadingDailyStats.h", (overlay_dir / "ReadingDailyStats.h").read_text())
write("src/activities/reader/ReadingDailyStats.cpp", (overlay_dir / "ReadingDailyStats.cpp").read_text())
write("src/activities/reader/StatsDashboardView.h", (overlay_dir / "StatsDashboardView.h").read_text())
write("src/activities/reader/StatsDashboardView.cpp", (overlay_dir / "StatsDashboardView.cpp").read_text())

# Record a small rolling daily history on session commit. Keep this separate
# from global_stats.bin so Nearby Stats Sync remains backward compatible.
replace_once(
    "src/activities/reader/EpubReaderActivity.h",
    "  uint32_t sessionReadingSeconds = 0;\n",
    "  uint32_t sessionReadingSeconds = 0;\n  uint32_t sessionForwardPages = 0;\n",
)
replace_once(
    "src/activities/reader/EpubReaderActivity.cpp",
    '#include "QuickActions.h"\n',
    '#include "QuickActions.h"\n#include "ReadingDailyStats.h"\n',
)
replace_once(
    "src/activities/reader/EpubReaderActivity.cpp",
    """      stats.totalPagesTurned++;
      globalStats.totalPagesTurned++;""",
    """      stats.totalPagesTurned++;
      globalStats.totalPagesTurned++;
      sessionForwardPages++;""",
)
replace_once(
    "src/activities/reader/EpubReaderActivity.cpp",
    """    if (epub) {
      recoverStoredPaceFromSession("reader_exit");""",
    """    if (hasSessionStartLocalDateTime && (sessionForwardPages > 0 || elapsedSecs >= 10)) {
      ReadingDailyStats dailyStats = ReadingDailyStats::load();
      dailyStats.record(sessionStartLocalDateTime.date, sessionForwardPages, elapsedSecs >= 10 ? elapsedSecs : 0);
      dailyStats.save();
    }
    if (epub) {
      recoverStoredPaceFromSession("reader_exit");""",
)

replace_once(
    "src/activities/reader/XtcReaderActivity.h",
    "  uint32_t sessionReadingSeconds = 0;\n",
    "  uint32_t sessionReadingSeconds = 0;\n  uint32_t sessionForwardPages = 0;\n",
)
replace_once(
    "src/activities/reader/XtcReaderActivity.cpp",
    '#include "QuickActions.h"\n',
    '#include "QuickActions.h"\n#include "ReadingDailyStats.h"\n',
)
replace_once(
    "src/activities/reader/XtcReaderActivity.cpp",
    """  stats.totalPagesTurned++;
  globalStats.totalPagesTurned++;""",
    """  stats.totalPagesTurned++;
  globalStats.totalPagesTurned++;
  sessionForwardPages++;""",
)
replace_once(
    "src/activities/reader/XtcReaderActivity.cpp",
    """  stats.save(xtc->getCachePath());
  globalStats.save();""",
    """  if (hasSessionStartLocalDateTime && (sessionForwardPages > 0 || elapsedSecs >= 10)) {
    ReadingDailyStats dailyStats = ReadingDailyStats::load();
    dailyStats.record(sessionStartLocalDateTime.date, sessionForwardPages, elapsedSecs >= 10 ? elapsedSecs : 0);
    dailyStats.save();
  }
  stats.save(xtc->getCachePath());
  globalStats.save();""",
)


# Use the dense dashboard renderer for the X4 Pro per-book page and Reading Stats sleep screen.
replace_once(
    "src/activities/reader/BookStatsActivity.cpp",
    '#include "MappedInputManager.h"\n',
    '#include "MappedInputManager.h"\n#include "StatsDashboardView.h"\n',
)
replace_once(
    "src/activities/reader/BookStatsActivity.cpp",
    """    case Page::PerBook:
      renderPerBookStatsPage(renderer, &mappedInput, bookTitle, stats, progressPercent, hasEstimatedTimeLeft,
                             estimatedTimeLeftSeconds, currentBookPage, true, hasEditableBook(), true);
      break;""",
    """    case Page::PerBook:
#if defined(FREEINK_DEVICE_X4PRO) && FREEINK_DEVICE_X4PRO
      renderX4ProStatsDashboard(renderer, &mappedInput, bookTitle, stats, progressPercent, hasEstimatedTimeLeft,
                                estimatedTimeLeftSeconds, currentBookPage, globalStats, true, hasEditableBook(), true);
#else
      renderPerBookStatsPage(renderer, &mappedInput, bookTitle, stats, progressPercent, hasEstimatedTimeLeft,
                             estimatedTimeLeftSeconds, currentBookPage, true, hasEditableBook(), true);
#endif
      break;""",
)
replace_once(
    "src/activities/boot_sleep/SleepActivity.cpp",
    '#include "../reader/EpubReaderUtils.h"\n',
    '#include "../reader/EpubReaderUtils.h"\n#include "../reader/StatsDashboardView.h"\n',
)
replace_once(
    "src/activities/boot_sleep/SleepActivity.cpp",
    """  if (!halClock.isAvailable()) {
    const GlobalReadingStats deviceStats = GlobalReadingStats::load();
    const bool hasSyncedStats = GlobalReadingStats::hasSyncedStats();
    const GlobalReadingStats allDevicesStats =
        hasSyncedStats ? GlobalReadingStats::loadAggregated(deviceStats) : GlobalReadingStats{};
    renderNoRtcCombinedStatsPage(renderer, nullptr, bookTitle, bookStats, progressPercent, false, 0,
                                 currentBookPage, deviceStats, hasSyncedStats ? &allDevicesStats : nullptr, false);
  } else {
    renderPerBookStatsPage(renderer, nullptr, bookTitle, bookStats, progressPercent, false, 0, currentBookPage,
                           false, false, false);
  }""",
    """#if defined(FREEINK_DEVICE_X4PRO) && FREEINK_DEVICE_X4PRO
  const GlobalReadingStats deviceStats = GlobalReadingStats::load();
  renderX4ProStatsDashboard(renderer, nullptr, bookTitle, bookStats, progressPercent, false, 0, currentBookPage,
                            deviceStats, false, false, false);
#else
  if (!halClock.isAvailable()) {
    const GlobalReadingStats deviceStats = GlobalReadingStats::load();
    const bool hasSyncedStats = GlobalReadingStats::hasSyncedStats();
    const GlobalReadingStats allDevicesStats =
        hasSyncedStats ? GlobalReadingStats::loadAggregated(deviceStats) : GlobalReadingStats{};
    renderNoRtcCombinedStatsPage(renderer, nullptr, bookTitle, bookStats, progressPercent, false, 0,
                                 currentBookPage, deviceStats, hasSyncedStats ? &allDevicesStats : nullptr, false);
  } else {
    renderPerBookStatsPage(renderer, nullptr, bookTitle, bookStats, progressPercent, false, 0, currentBookPage,
                           false, false, false);
  }
#endif""",
)

print("X4 Pro Pages + dashboard renderer transformations applied successfully")


