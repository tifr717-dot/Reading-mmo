#!/usr/bin/env python3
from pathlib import Path
import sys

root = Path(sys.argv[1] if len(sys.argv) > 1 else "crossink")


def replace_once(path: Path, old: str, new: str, label: str) -> None:
    text = path.read_text()
    if old not in text:
        raise SystemExit(f"{label} anchor not found in {path}")
    path.write_text(text.replace(old, new, 1))


reader_cpp = root / "src/activities/reader/EpubReaderActivity.cpp"

old_writer = r'''bool saveReadingMmoPendingSession(const uint32_t sessionId, const uint32_t startPage, const uint32_t endPage,
                                  const uint32_t pagesRead, const uint32_t seconds) {
  char payload[160];
  const int len = snprintf(payload, sizeof(payload),
                           "{\"p\":2,\"sid\":%lu,\"sp\":%lu,\"ep\":%lu,\"pg\":%lu,\"sec\":%lu}",
                           static_cast<unsigned long>(sessionId), static_cast<unsigned long>(startPage),
                           static_cast<unsigned long>(endPage), static_cast<unsigned long>(pagesRead),
                           static_cast<unsigned long>(seconds));
  if (len <= 0 || static_cast<size_t>(len) >= sizeof(payload)) {
    LOG_ERR("RMMO", "Phase 2 session payload overflow");
    return false;
  }

  FsFile file;
  if (!Storage.openFileForWrite("RMMO", READING_MMO_PENDING_SESSION_PATH, file)) {
    LOG_ERR("RMMO", "Could not open pending session file");
    return false;
  }
  const bool ok = file.write(reinterpret_cast<const uint8_t*>(payload), static_cast<size_t>(len)) ==
                  static_cast<size_t>(len);
  file.close();
  if (!ok) {
    LOG_ERR("RMMO", "Could not write pending session payload");
    return false;
  }
  LOG_INF("RMMO", "Saved Phase 2 session %lu (%lu pages, %lu seconds)", static_cast<unsigned long>(sessionId),
          static_cast<unsigned long>(pagesRead), static_cast<unsigned long>(seconds));
  return true;
}
'''

new_writer = r'''size_t appendReadingMmoJsonString(char* out, const size_t outSize, size_t pos, const std::string& value,
                                  const size_t reserveBytes) {
  static constexpr char HEX[] = "0123456789abcdef";
  for (size_t i = 0; i < value.size();) {
    const auto c = static_cast<uint8_t>(value[i]);
    size_t cpBytes = 1;
    if ((c & 0x80U) == 0) {
      cpBytes = 1;
    } else if ((c & 0xE0U) == 0xC0U) {
      cpBytes = 2;
    } else if ((c & 0xF0U) == 0xE0U) {
      cpBytes = 3;
    } else if ((c & 0xF8U) == 0xF0U) {
      cpBytes = 4;
    }
    if (i + cpBytes > value.size()) break;

    size_t needed = cpBytes;
    if (cpBytes == 1 && (c == '"' || c == '\\')) needed = 2;
    if (cpBytes == 1 && c < 0x20U) needed = 6;
    if (pos + needed + reserveBytes >= outSize) break;

    if (cpBytes == 1 && (c == '"' || c == '\\')) {
      out[pos++] = '\\';
      out[pos++] = static_cast<char>(c);
    } else if (cpBytes == 1 && c < 0x20U) {
      out[pos++] = '\\';
      out[pos++] = 'u';
      out[pos++] = '0';
      out[pos++] = '0';
      out[pos++] = HEX[(c >> 4U) & 0x0FU];
      out[pos++] = HEX[c & 0x0FU];
    } else {
      for (size_t n = 0; n < cpBytes; ++n) out[pos++] = value[i + n];
    }
    i += cpBytes;
  }
  return pos;
}

bool saveReadingMmoPendingSession(const uint32_t sessionId, const uint32_t startPage, const uint32_t endPage,
                                  const uint32_t pagesRead, const uint32_t seconds, const std::string& bookTitle) {
  // BLE attribute values are kept comfortably below the standard 512-byte GATT value ceiling.
  // The title is UTF-8 preserving and JSON-escaped; unusually long titles are truncated on a
  // complete UTF-8 code-point boundary rather than risking an invalid payload.
  char payload[500];
  const int prefixLen = snprintf(payload, sizeof(payload),
                                 "{\"p\":3,\"sid\":%lu,\"sp\":%lu,\"ep\":%lu,\"pg\":%lu,\"sec\":%lu,\"title\":\"",
                                 static_cast<unsigned long>(sessionId), static_cast<unsigned long>(startPage),
                                 static_cast<unsigned long>(endPage), static_cast<unsigned long>(pagesRead),
                                 static_cast<unsigned long>(seconds));
  if (prefixLen <= 0 || static_cast<size_t>(prefixLen) >= sizeof(payload)) {
    LOG_ERR("RMMO", "Phase 3 session payload prefix overflow");
    return false;
  }

  size_t pos = static_cast<size_t>(prefixLen);
  pos = appendReadingMmoJsonString(payload, sizeof(payload), pos, bookTitle, 3);
  if (pos + 3 >= sizeof(payload)) {
    LOG_ERR("RMMO", "Phase 3 session payload overflow");
    return false;
  }
  payload[pos++] = '"';
  payload[pos++] = '}';
  payload[pos] = '\0';

  FsFile file;
  if (!Storage.openFileForWrite("RMMO", READING_MMO_PENDING_SESSION_PATH, file)) {
    LOG_ERR("RMMO", "Could not open pending session file");
    return false;
  }
  const bool ok = file.write(reinterpret_cast<const uint8_t*>(payload), pos) == pos;
  file.close();
  if (!ok) {
    LOG_ERR("RMMO", "Could not write pending session payload");
    return false;
  }
  LOG_INF("RMMO", "Saved Phase 3 session %lu (%lu pages, %lu seconds, titled=%d)",
          static_cast<unsigned long>(sessionId), static_cast<unsigned long>(pagesRead),
          static_cast<unsigned long>(seconds), bookTitle.empty() ? 0 : 1);
  return true;
}
'''
replace_once(reader_cpp, old_writer, new_writer, "Reading MMO Phase 3 titled pending-session writer")

replace_once(
    reader_cpp,
    '''    recordCurrentPageReadingTime("reader_exit");\n    const uint32_t readingMmoEndPage = getCurrentBookPageForStats();\n''',
    '''    recordCurrentPageReadingTime("reader_exit");\n    const uint32_t readingMmoEndPage = getCurrentBookPageForStats();\n    const std::string readingMmoBookTitle = epub ? epub->getTitle() : std::string();\n''',
    "Reading MMO Phase 3 EPUB metadata capture",
)

replace_once(
    reader_cpp,
    '''      saveReadingMmoPendingSession(globalStats.totalSessions, startPage, readingMmoEndPage, pagesRead, elapsedSecs);\n''',
    '''      saveReadingMmoPendingSession(globalStats.totalSessions, startPage, readingMmoEndPage, pagesRead, elapsedSecs,\n                                   readingMmoBookTitle);\n''',
    "Reading MMO Phase 3 titled snapshot call",
)

activity_cpp = root / "src/activities/network/ReadingMmoBleSyncActivity.cpp"
replace_once(
    activity_cpp,
    '''constexpr char READING_MMO_EMPTY_PAYLOAD[] = R"({"p":2,"none":1})";\n''',
    '''constexpr char READING_MMO_EMPTY_PAYLOAD[] = R"({"p":3,"none":1})";\n''',
    "Reading MMO Phase 3 empty payload",
)
replace_once(
    activity_cpp,
    '''  char payload[192] = {};\n''',
    '''  char payload[500] = {};\n''',
    "Reading MMO Phase 3 BLE characteristic buffer",
)
replace_once(
    activity_cpp,
    '''    renderer.drawCenteredText(UI_10_FONT_ID, centerY + 56, "Phase 2: latest completed reading session", true,\n                              EpdFontFamily::REGULAR);\n''',
    '''    renderer.drawCenteredText(UI_10_FONT_ID, centerY + 56, "Phase 3: session + book title", true,\n                              EpdFontFamily::REGULAR);\n''',
    "Reading MMO Phase 3 sync-screen copy",
)

reader_text = reader_cpp.read_text()
activity_text = activity_cpp.read_text()
assert '"p\\\":3' in reader_text
assert "epub ? epub->getTitle()" in reader_text
assert "appendReadingMmoJsonString" in reader_text
assert "readingMmoBookTitle" in reader_text
assert 'R"({"p":3,"none":1})"' in activity_text
assert "char payload[500]" in activity_text

print("Applied Reading MMO BLE Phase 3: real EPUB title is persisted and transmitted with each completed session")
