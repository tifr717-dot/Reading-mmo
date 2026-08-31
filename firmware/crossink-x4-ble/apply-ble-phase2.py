#!/usr/bin/env python3
from pathlib import Path
import sys

root = Path(sys.argv[1] if len(sys.argv) > 1 else "crossink")


def replace_once(path: Path, old: str, new: str, label: str) -> None:
    text = path.read_text()
    if old not in text:
        raise SystemExit(f"{label} anchor not found in {path}")
    path.write_text(text.replace(old, new, 1))


# Phase 2 deliberately reuses CrossInk's own reading-session accounting. The
# reader already filters idle time, maintains sessionReadingSeconds, counts
# qualifying forward page turns, and commits sessions of >= 60 seconds. We only
# persist a compact snapshot of that committed session for the isolated BLE boot.
reader_h = root / "src/activities/reader/EpubReaderActivity.h"
replace_once(
    reader_h,
    '''  uint32_t sessionReadingSeconds = 0;\n''',
    '''  uint32_t sessionReadingSeconds = 0;\n  mutable uint32_t readingMmoSessionStartPage = 0;\n  uint32_t readingMmoSessionStartPagesTurned = 0;\n''',
    "Reading MMO Phase 2 reader session fields",
)

reader_cpp = root / "src/activities/reader/EpubReaderActivity.cpp"
replace_once(
    reader_cpp,
    '''bool writeExact(FsFile& file, const void* data, const size_t size) { return file.write(data, size) == size; }\n''',
    '''bool writeExact(FsFile& file, const void* data, const size_t size) { return file.write(data, size) == size; }\n\nconstexpr char READING_MMO_PENDING_SESSION_PATH[] = "/.crosspoint/reading_mmo_pending.json";\n\nbool saveReadingMmoPendingSession(const uint32_t sessionId, const uint32_t startPage, const uint32_t endPage,\n                                  const uint32_t pagesRead, const uint32_t seconds) {\n  char payload[160];\n  const int len = snprintf(payload, sizeof(payload),\n                           "{\\\"p\\\":2,\\\"sid\\\":%lu,\\\"sp\\\":%lu,\\\"ep\\\":%lu,\\\"pg\\\":%lu,\\\"sec\\\":%lu}",\n                           static_cast<unsigned long>(sessionId), static_cast<unsigned long>(startPage),\n                           static_cast<unsigned long>(endPage), static_cast<unsigned long>(pagesRead),\n                           static_cast<unsigned long>(seconds));\n  if (len <= 0 || static_cast<size_t>(len) >= sizeof(payload)) {\n    LOG_ERR("RMMO", "Phase 2 session payload overflow");\n    return false;\n  }\n\n  FsFile file;\n  if (!Storage.openFileForWrite("RMMO", READING_MMO_PENDING_SESSION_PATH, file)) {\n    LOG_ERR("RMMO", "Could not open pending session file");\n    return false;\n  }\n  const bool ok = file.write(reinterpret_cast<const uint8_t*>(payload), static_cast<size_t>(len)) ==\n                  static_cast<size_t>(len);\n  file.close();\n  if (!ok) {\n    LOG_ERR("RMMO", "Could not write pending session payload");\n    return false;\n  }\n  LOG_INF("RMMO", "Saved Phase 2 session %lu (%lu pages, %lu seconds)", static_cast<unsigned long>(sessionId),\n          static_cast<unsigned long>(pagesRead), static_cast<unsigned long>(seconds));\n  return true;\n}\n''',
    "Reading MMO Phase 2 pending-session writer",
)

replace_once(
    reader_cpp,
    '''  armReadingPaceWarmup("reader_open");\n  sessionReadingSeconds = 0;\n  hasSessionStartLocalDateTime = getCurrentLocalReadingStatsDateTime(sessionStartLocalDateTime);\n\n  globalStats = GlobalReadingStats::load();\n''',
    '''  armReadingPaceWarmup("reader_open");\n  sessionReadingSeconds = 0;\n  hasSessionStartLocalDateTime = getCurrentLocalReadingStatsDateTime(sessionStartLocalDateTime);\n\n  globalStats = GlobalReadingStats::load();\n  readingMmoSessionStartPage = 0;\n  readingMmoSessionStartPagesTurned = stats.totalPagesTurned;\n''',
    "Reading MMO Phase 2 session baseline",
)

replace_once(
    reader_cpp,
    '''void EpubReaderActivity::renderStatusBar() const {\n  const int estimatedPageCount = section->estimatedTotalPages();\n''',
    '''void EpubReaderActivity::renderStatusBar() const {\n  if (readingMmoSessionStartPage == 0 && !activeFootnotePreview) {\n    const uint32_t currentBookPage = getCurrentBookPageForStats();\n    if (currentBookPage > 0) {\n      readingMmoSessionStartPage = currentBookPage;\n    }\n  }\n\n  const int estimatedPageCount = section->estimatedTotalPages();\n''',
    "Reading MMO Phase 2 first rendered page capture",
)

replace_once(
    reader_cpp,
    '''  if (SETTINGS.shouldTrackReadingStats()) {\n    recordCurrentPageReadingTime("reader_exit");\n\n    // Commit session stats based on active reading time. Page intervals longer\n''',
    '''  if (SETTINGS.shouldTrackReadingStats()) {\n    recordCurrentPageReadingTime("reader_exit");\n    const uint32_t readingMmoEndPage = getCurrentBookPageForStats();\n\n    // Commit session stats based on active reading time. Page intervals longer\n''',
    "Reading MMO Phase 2 end page capture",
)

replace_once(
    reader_cpp,
    '''    if (elapsedSecs >= 60) {\n      stats.sessionCount++;\n      globalStats.totalSessions++;\n    }\n''',
    '''    if (elapsedSecs >= 60) {\n      stats.sessionCount++;\n      globalStats.totalSessions++;\n\n      const uint32_t pagesRead =\n          stats.totalPagesTurned >= readingMmoSessionStartPagesTurned\n              ? stats.totalPagesTurned - readingMmoSessionStartPagesTurned\n              : 0;\n      uint32_t startPage = readingMmoSessionStartPage;\n      if (startPage == 0 && readingMmoEndPage > pagesRead) {\n        startPage = readingMmoEndPage - pagesRead;\n      }\n      saveReadingMmoPendingSession(globalStats.totalSessions, startPage, readingMmoEndPage, pagesRead, elapsedSecs);\n    }\n''',
    "Reading MMO Phase 2 committed-session snapshot",
)

# Convert the already-created isolated BLE activity from the fixed Phase 1 test
# payload to the latest real completed-session snapshot.
activity_cpp = root / "src/activities/network/ReadingMmoBleSyncActivity.cpp"
replace_once(
    activity_cpp,
    '''#include <GfxRenderer.h>\n#include <I18n.h>\n#include <Logging.h>\n''',
    '''#include <GfxRenderer.h>\n#include <HalStorage.h>\n#include <I18n.h>\n#include <Logging.h>\n''',
    "Reading MMO Phase 2 BLE storage include",
)
replace_once(
    activity_cpp,
    '''constexpr char READING_MMO_TEST_PAYLOAD[] = R"({\\"p\\":1,\\"sid\\":1})";\nconstexpr uint32_t SYNC_WINDOW_MS = 120000;\n}  // namespace\n''',
    '''constexpr char READING_MMO_PENDING_SESSION_PATH[] = "/.crosspoint/reading_mmo_pending.json";\nconstexpr char READING_MMO_EMPTY_PAYLOAD[] = R"({\\"p\\":2,\\"none\\":1})";\nconstexpr uint32_t SYNC_WINDOW_MS = 120000;\n\nbool loadReadingMmoSessionPayload(char* out, const size_t outSize) {\n  if (!out || outSize < 2) {\n    return false;\n  }\n  FsFile file;\n  if (!Storage.openFileForRead("RMMO", READING_MMO_PENDING_SESSION_PATH, file)) {\n    return false;\n  }\n  const int n = file.read(reinterpret_cast<uint8_t*>(out), outSize - 1);\n  file.close();\n  if (n <= 0) {\n    return false;\n  }\n  out[n] = '\\0';\n  return true;\n}\n}  // namespace\n''',
    "Reading MMO Phase 2 BLE payload loader",
)
replace_once(
    activity_cpp,
    '''  stats->setValue(READING_MMO_TEST_PAYLOAD);\n  service->start();\n''',
    '''  char payload[192] = {};\n  if (!loadReadingMmoSessionPayload(payload, sizeof(payload))) {\n    snprintf(payload, sizeof(payload), "%s", READING_MMO_EMPTY_PAYLOAD);\n  }\n  stats->setValue(payload);\n  service->start();\n''',
    "Reading MMO Phase 2 BLE characteristic value",
)
replace_once(
    activity_cpp,
    '''    renderer.drawCenteredText(UI_10_FONT_ID, centerY + 56, "Phase 1 payload: session 1", true,\n                              EpdFontFamily::REGULAR);\n''',
    '''    renderer.drawCenteredText(UI_10_FONT_ID, centerY + 56, "Phase 2: latest completed reading session", true,\n                              EpdFontFamily::REGULAR);\n''',
    "Reading MMO Phase 2 sync screen copy",
)

assert "readingMmoSessionStartPagesTurned" in reader_h.read_text()
assert "saveReadingMmoPendingSession" in reader_cpp.read_text()
assert '"p\\\":2' in reader_cpp.read_text()
assert "READING_MMO_PENDING_SESSION_PATH" in activity_cpp.read_text()
assert "READING_MMO_TEST_PAYLOAD" not in activity_cpp.read_text()
assert "BLEDevice::startAdvertising()" in activity_cpp.read_text()

print("Applied Reading MMO BLE Phase 2: real CrossInk session snapshot, isolated BLE preview payload")
