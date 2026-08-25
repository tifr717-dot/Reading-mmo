#!/usr/bin/env python3
from pathlib import Path
import sys

root = Path(sys.argv[1] if len(sys.argv) > 1 else "crossink")

stats = root / "src/activities/reader/BookStatsView.cpp"
s = stats.read_text()
old = '''  if (showRtcStats) {\n    const uint32_t avgSecs = stats.sessionCount > 0 ? stats.totalReadingSeconds / stats.sessionCount : 0;\n    BookReadingStats::formatDuration(avgSecs, buf, sizeof(buf));\n    drawStatCell(renderer, x, thirdW, y + layout.topCardTitleH + rowH, rowH, buf, tr(STR_STATS_AVG_SESSION_LBL));\n  } else {\n    if (currentBookPage > 0) {\n      snprintf(buf, sizeof(buf), "%lu", static_cast<unsigned long>(currentBookPage));\n    } else {\n      snprintf(buf, sizeof(buf), "-");\n    }\n    drawStatCell(renderer, x, thirdW, y + layout.topCardTitleH + rowH, rowH, buf, tr(STR_STATS_PAGES_LBL));\n  }\n'''
new = '''  if (currentBookPage > 0) {\n    snprintf(buf, sizeof(buf), "%lu", static_cast<unsigned long>(currentBookPage));\n  } else {\n    snprintf(buf, sizeof(buf), "-");\n  }\n  drawStatCell(renderer, x, thirdW, y + layout.topCardTitleH + rowH, rowH, buf, tr(STR_STATS_PAGES_LBL));\n'''
if old not in s:
    raise SystemExit("Pages3 stats target not found in BookStatsView.cpp")
stats.write_text(s.replace(old, new, 1))

sleep = root / "src/activities/boot_sleep/SleepActivity.cpp"
s = sleep.read_text()
old = '''void SleepActivity::renderReadingStatsSleepScreen() const {\n  BookReadingStats bookStats;\n  std::string bookTitle = tr(STR_READING_STATS);\n  float progressPercent = -1.0f;\n\n  const std::string& path = currentBookPath.empty() ? APP_STATE.openEpubPath : currentBookPath;\n  if (!path.empty()) {\n    const std::string recentTitle = recentTitleForPath(path);\n    bookTitle = recentTitle.empty() ? filenameFromPath(path) : recentTitle;\n\n    bookStats = loadBookStatsForPath(path);\n    progressPercent = RecentBookProgress::loadPercent(recentBookForPath(path));\n  }\n\n  if (!halClock.isAvailable()) {\n    const GlobalReadingStats deviceStats = GlobalReadingStats::load();\n    const bool hasSyncedStats = GlobalReadingStats::hasSyncedStats();\n    const GlobalReadingStats allDevicesStats =\n        hasSyncedStats ? GlobalReadingStats::loadAggregated(deviceStats) : GlobalReadingStats{};\n    renderNoRtcCombinedStatsPage(renderer, nullptr, bookTitle, bookStats, progressPercent, false, 0, 0, deviceStats,\n                                 hasSyncedStats ? &allDevicesStats : nullptr, false);\n  } else {\n    renderPerBookStatsPage(renderer, nullptr, bookTitle, bookStats, progressPercent, false, 0, 0, false, false, false);\n  }\n'''
new = '''void SleepActivity::renderReadingStatsSleepScreen() const {\n  BookReadingStats bookStats;\n  std::string bookTitle = tr(STR_READING_STATS);\n  float progressPercent = -1.0f;\n  uint32_t currentBookPage = 0;\n\n  const std::string& path = currentBookPath.empty() ? APP_STATE.openEpubPath : currentBookPath;\n  if (!path.empty()) {\n    const std::string recentTitle = recentTitleForPath(path);\n    bookTitle = recentTitle.empty() ? filenameFromPath(path) : recentTitle;\n\n    const RecentBook recentBook = recentBookForPath(path);\n    bookStats = loadBookStatsForPath(path);\n    progressPercent = RecentBookProgress::loadPercent(recentBook);\n    currentBookPage = RecentBookProgress::loadPageNumber(recentBook);\n  }\n\n  if (!halClock.isAvailable()) {\n    const GlobalReadingStats deviceStats = GlobalReadingStats::load();\n    const bool hasSyncedStats = GlobalReadingStats::hasSyncedStats();\n    const GlobalReadingStats allDevicesStats =\n        hasSyncedStats ? GlobalReadingStats::loadAggregated(deviceStats) : GlobalReadingStats{};\n    renderNoRtcCombinedStatsPage(renderer, nullptr, bookTitle, bookStats, progressPercent, false, 0, currentBookPage,\n                                 deviceStats, hasSyncedStats ? &allDevicesStats : nullptr, false);\n  } else {\n    renderPerBookStatsPage(renderer, nullptr, bookTitle, bookStats, progressPercent, false, 0, currentBookPage, false,\n                           false, false);\n  }\n'''
if old not in s:
    raise SystemExit("Pages3 sleep stats target not found in SleepActivity.cpp")
sleep.write_text(s.replace(old, new, 1))

reader_h = root / "src/activities/reader/EpubReaderActivity.h"
s = reader_h.read_text()
old = '''  uint32_t getCurrentBookPageForStats() const;\n'''
new = old + '''  uint32_t getCurrentBookPageCountForStats() const;\n'''
if old not in s:
    raise SystemExit("Pages3 reader header target not found")
reader_h.write_text(s.replace(old, new, 1))

reader_cpp = root / "src/activities/reader/EpubReaderActivity.cpp"
s = reader_cpp.read_text()
marker = '''\nvoid EpubReaderActivity::pauseReadingPaceTimer(const char* reason) {\n'''
helper = '''\nuint32_t EpubReaderActivity::getCurrentBookPageCountForStats() const {\n  const int sectionPageCount = section ? section->estimatedTotalPages() : 0;\n  if (activeFootnotePreview || !epub || !section || sectionPageCount <= 0 || section->currentPage < 0 ||\n      currentSpineIndex < 0 || currentSpineIndex >= epub->getSpineItemsCount()) {\n    return 0;\n  }\n\n  const float sectionProgress =\n      static_cast<float>(section->currentPage) / static_cast<float>(sectionPageCount);\n\n  uint32_t referencePage = 0;\n  uint32_t referencePageCount = 0;\n  if (epub->resolveReferencePage(currentSpineIndex, sectionProgress, referencePage, referencePageCount) &&\n      referencePageCount > 0) {\n    return referencePageCount;\n  }\n\n  const size_t completedSpineBytes =\n      currentSpineIndex > 0 ? epub->getCumulativeSpineItemSize(currentSpineIndex - 1) : 0;\n  const size_t currentCumulativeBytes = epub->getCumulativeSpineItemSize(currentSpineIndex);\n  const size_t currentSpineBytes =\n      currentCumulativeBytes > completedSpineBytes ? currentCumulativeBytes - completedSpineBytes : 0;\n  const size_t bookBytes = epub->getBookSize();\n  if (currentSpineBytes == 0 || bookBytes == 0) {\n    return 0;\n  }\n\n  uint64_t estimatedPageCount =\n      (static_cast<uint64_t>(bookBytes) * static_cast<uint64_t>(sectionPageCount) +\n       static_cast<uint64_t>(currentSpineBytes) / 2ULL) /\n      static_cast<uint64_t>(currentSpineBytes);\n  estimatedPageCount = std::max<uint64_t>(estimatedPageCount, getCurrentBookPageForStats());\n  return static_cast<uint32_t>(\n      std::min<uint64_t>(estimatedPageCount, std::numeric_limits<uint32_t>::max()));\n}\n'''
if marker not in s:
    raise SystemExit("Pages3 whole-book page-count insertion target not found")
s = s.replace(marker, helper + marker, 1)
old = '''  if (activeFootnotePreview || !SETTINGS.stablePageNumbers ||\n      !epub->resolveReferencePage(currentSpineIndex, sectionProgress, referencePage, referencePageCount)) {\n    referencePage = 0;\n    referencePageCount = 0;\n  }\n'''
new = old + '''  if (!activeFootnotePreview && SETTINGS.stablePageNumbers && (referencePage == 0 || referencePageCount == 0)) {\n    referencePage = getCurrentBookPageForStats();\n    referencePageCount = getCurrentBookPageCountForStats();\n    if (referencePage == 0 || referencePageCount == 0) {\n      referencePage = 0;\n      referencePageCount = 0;\n    }\n  }\n'''
if old not in s:
    raise SystemExit("Pages3 stable-page fallback target not found")
reader_cpp.write_text(s.replace(old, new, 1))

home = root / "src/activities/home/HomeActivity.cpp"
s = home.read_text()
anchor = '''bool hasAnyGlobalStats(const GlobalReadingStats& stats) {\n  return stats.totalSessions > 0 || stats.totalReadingSeconds > 0 || stats.totalPagesTurned > 0 ||\n         stats.completedBooks > 0 || stats.displayLongestReadingStreak() > 0;\n}\n'''
helper = anchor + '''\nvoid drawCurrentBookPageBadge(GfxRenderer& renderer, const Rect& bounds, const uint32_t pageNumber) {\n  if (pageNumber == 0 || bounds.width <= 0 || bounds.height <= 0) {\n    return;\n  }\n\n  char label[24];\n  snprintf(label, sizeof(label), "Page %lu", static_cast<unsigned long>(pageNumber));\n  constexpr int horizontalPadding = 8;\n  constexpr int verticalPadding = 4;\n  constexpr int outerPadding = 8;\n  const int lineHeight = renderer.getLineHeight(SMALL_FONT_ID);\n  const int textWidth = renderer.getTextWidth(SMALL_FONT_ID, label);\n  const int badgeWidth = textWidth + horizontalPadding * 2;\n  const int badgeHeight = lineHeight + verticalPadding * 2;\n  const int x = bounds.x + std::max(0, bounds.width - badgeWidth - outerPadding);\n  const int y = bounds.y + outerPadding;\n\n  renderer.fillRectDither(x, y, badgeWidth, badgeHeight, Color::White);\n  renderer.drawRect(x, y, badgeWidth, badgeHeight, true);\n  renderer.drawText(SMALL_FONT_ID, x + horizontalPadding, y + verticalPadding, label, true);\n}\n'''
if anchor not in s:
    raise SystemExit("Pages3 home helper anchor not found")
s = s.replace(anchor, helper, 1)

render_pos = s.find("void HomeActivity::render(RenderLock&&)")
if render_pos < 0:
    raise SystemExit("HomeActivity::render not found")
prefix, render = s[:render_pos], s[render_pos:]
render_anchor = '''  const auto pageWidth = renderer.getScreenWidth();\n  const auto pageHeight = renderer.getScreenHeight();\n'''
render_replacement = render_anchor + '''  const int highlightedBookIndex = getHighlightedBookIndex();\n  const uint32_t currentBookPage = highlightedBookIndex >= 0\n                                       ? RecentBookProgress::loadPageNumber(recentBooks[highlightedBookIndex])\n                                       : 0;\n'''
if render_anchor not in render:
    raise SystemExit("Home render geometry anchor not found")
render = render.replace(render_anchor, render_replacement, 1)
s = prefix + render

minimal = '''    GUI.drawRecentBookCover(renderer, Rect{0, metrics.homeTopPadding, pageWidth, metrics.homeCoverTileHeight},\n                            recentBooks, selectorIndex, coverRendered, coverBufferStored, bufferRestored,\n                            std::bind(&HomeActivity::storeCoverBuffer, this),\n                            hasAnyBookStats(currentBookStats) ? &currentBookStats : nullptr, currentBookProgressPercent,\n                            &globalStats, currentBookChapterTitle.c_str());\n'''
if minimal not in s:
    raise SystemExit("Minimal home cover draw target not found")
s = s.replace(minimal, minimal + '''    drawCurrentBookPageBadge(renderer, Rect{0, metrics.homeTopPadding, pageWidth, metrics.homeCoverTileHeight},\n                             currentBookPage);\n''', 1)

standard = '''  GUI.drawRecentBookCover(renderer, Rect{0, metrics.homeTopPadding, pageWidth, homeCoverTileHeight}, recentBooks,\n                          selectorIndex, coverRendered, coverBufferStored, bufferRestored,\n                          std::bind(&HomeActivity::storeCoverBuffer, this),\n                          hasAnyBookStats(currentBookStats) ? &currentBookStats : nullptr, currentBookProgressPercent);\n'''
if standard not in s:
    raise SystemExit("Standard home cover draw target not found")
s = s.replace(standard, standard + '''  drawCurrentBookPageBadge(renderer, Rect{0, metrics.homeTopPadding, pageWidth, homeCoverTileHeight}, currentBookPage);\n''', 1)

carousel_anchor = '''  LyraCarouselTheme::setPreRenderIndex(bookIdx);\n  renderer.clearScreen();\n'''
if carousel_anchor not in s:
    raise SystemExit("Carousel render anchor not found")
s = s.replace(carousel_anchor, '''  const uint32_t framePageNumber =\n      bookIdx >= 0 && bookIdx < bookCount ? RecentBookProgress::loadPageNumber(recentBooks[bookIdx]) : 0;\n\n''' + carousel_anchor, 1)

carousel_draw = '''  GUI.drawRecentBookCover(\n      renderer, Rect{0, metrics.homeTopPadding, pageWidth, metrics.homeCoverTileHeight}, recentBooks, bookCount, dummy1,\n      dummy2, dummy3, []() { return true; }, frameStatsPtr, frameProgressPercent);\n'''
if carousel_draw not in s:
    raise SystemExit("Carousel cover draw target not found")
s = s.replace(carousel_draw, carousel_draw + '''  drawCurrentBookPageBadge(renderer, Rect{0, metrics.homeTopPadding, pageWidth, metrics.homeCoverTileHeight},\n                           framePageNumber);\n''', 1)
home.write_text(s)

assert "drawCurrentBookPageBadge" in home.read_text()
assert "RecentBookProgress::loadPageNumber(recentBooks[highlightedBookIndex])" in home.read_text()
assert "tr(STR_STATS_PAGES_LBL)" in stats.read_text()
assert "currentBookPage = RecentBookProgress::loadPageNumber(recentBook)" in sleep.read_text()
assert "getCurrentBookPageCountForStats" in reader_h.read_text()
assert "referencePageCount = getCurrentBookPageCountForStats()" in reader_cpp.read_text()
print("Applied direct Pages3 source edits: stats + Home + sleep Pages + selectable whole-book footer page count")
