#include "ReadingMmoBleSyncActivity.h"

#include <Arduino.h>
#include <GfxRenderer.h>
#include <Logging.h>

#include <algorithm>
#include <array>
#include <cstdio>
#include <string>

#include "MappedInputManager.h"
#include "activities/ActivityManager.h"
#include "SilentRestart.h"
#include "components/TouchHeaderBackButton.h"
#include "components/UITheme.h"
#include "fontIds.h"
#include "../reader/DailyReadingLog.h"
#include "../reader/ReadingStatsUtils.h"

#ifndef SIMULATOR
#include <BLEDevice.h>
#include <BLEServer.h>
#endif

namespace {
constexpr char READING_MMO_BLE_NAME[] = "Reading Journal Reader";
constexpr char READING_MMO_SERVICE_UUID[] = "7d2ea28a-f7bd-485a-bd9d-92ad6ecfe93e";
constexpr char READING_MMO_STATS_UUID[] = "7d2ea28b-f7bd-485a-bd9d-92ad6ecfe93e";
constexpr uint32_t SYNC_WINDOW_MS = 120000;
constexpr uint32_t SELECT_MAGIC = 0xA5000000U;
constexpr uint32_t SELECT_MAGIC_MASK = 0xFF000000U;
constexpr uint16_t MAX_DAYS_AGO = 730;
constexpr uint16_t MAX_RANGE_DAYS = 14;
constexpr size_t MAX_PAYLOAD_BYTES = 500;
constexpr size_t MAX_SYNC_BOOKS = 16;
constexpr size_t MAX_SYNC_ENTRIES = 64;

struct PackedEntry {
  ReadingStatsDate date{};
  uint8_t bookIndex = 0;
  uint32_t pages = 0;
  uint32_t seconds = 0;
  uint16_t sessions = 0;
  int16_t startPermille = -1;
  uint16_t endPermille = 0;
  uint32_t startXte = 0;
  uint32_t endXte = 0;
};

uint32_t encodeSelection(const uint16_t fromDaysAgo, const uint16_t toDaysAgo) {
  return SELECT_MAGIC | (uint32_t(fromDaysAgo) & 0x3FFU) | ((uint32_t(toDaysAgo) & 0x3FFU) << 10U);
}

bool decodeSelection(const uint32_t value, uint16_t& fromDaysAgo, uint16_t& toDaysAgo) {
  if ((value & SELECT_MAGIC_MASK) != SELECT_MAGIC) return false;
  fromDaysAgo = static_cast<uint16_t>(value & 0x3FFU);
  toDaysAgo = static_cast<uint16_t>((value >> 10U) & 0x3FFU);
  return fromDaysAgo <= MAX_DAYS_AGO && toDaysAgo <= fromDaysAgo &&
         (fromDaysAgo - toDaysAgo + 1U) <= MAX_RANGE_DAYS;
}

void dateText(const uint16_t daysAgo, char* out, const size_t outSize) {
  ReadingStatsDateTime now{};
  if (!getCurrentLocalReadingStatsDateTime(now) || !now.date.isValid()) {
    snprintf(out, outSize, "Date unavailable");
    return;
  }
  ReadingStatsDate date = now.date;
  addDaysToReadingStatsDate(date, -static_cast<int>(daysAgo));
  snprintf(out, outSize, "%02u / %02u / %04u", unsigned(date.month), unsigned(date.day), unsigned(date.year));
}

void dateCompact(const ReadingStatsDate& date, char* out, const size_t outSize) {
  snprintf(out, outSize, "%04u%02u%02u", unsigned(date.year), unsigned(date.month), unsigned(date.day));
}

DailyReadingLog::LocalDateTime dailyDate(const ReadingStatsDate& date) {
  return DailyReadingLog::LocalDateTime{date.year, date.month, date.day, 0, 0, 0};
}

void appendJsonString(std::string& out, const char* value, const size_t maxUtf8Bytes = 40) {
  out.push_back('"');
  size_t used = 0;
  for (size_t i = 0; value && value[i] && used < maxUtf8Bytes;) {
    const uint8_t c = static_cast<uint8_t>(value[i]);
    size_t cp = 1;
    if ((c & 0xE0U) == 0xC0U) cp = 2;
    else if ((c & 0xF0U) == 0xE0U) cp = 3;
    else if ((c & 0xF8U) == 0xF0U) cp = 4;
    if (used + cp > maxUtf8Bytes) break;
    if (cp == 1 && (c == '"' || c == '\\')) {
      out.push_back('\\');
      out.push_back(static_cast<char>(c));
    } else if (cp == 1 && c < 0x20U) {
      out.push_back(' ');
    } else {
      for (size_t j = 0; j < cp && value[i + j]; ++j) out.push_back(value[i + j]);
    }
    i += cp;
    used += cp;
  }
  out.push_back('"');
}

void appendUnsigned(std::string& out, const uint32_t value) {
  char buf[16];
  snprintf(buf, sizeof(buf), "%lu", static_cast<unsigned long>(value));
  out += buf;
}

void appendSigned(std::string& out, const int value) {
  char buf[16];
  snprintf(buf, sizeof(buf), "%d", value);
  out += buf;
}

}  // namespace

ReadingMmoBleSyncActivity::ReadingMmoBleSyncActivity(GfxRenderer& renderer, MappedInputManager& mappedInput,
                                                     const bool networkBootReady, const uint32_t selectionPayload)
    : Activity("ReadingMmoBleSync", renderer, mappedInput),
      networkBootReady_(networkBootReady),
      selectionPayload_(selectionPayload) {}

ReadingMmoBleSyncActivity::~ReadingMmoBleSyncActivity() = default;

void ReadingMmoBleSyncActivity::onEnter() {
  Activity::onEnter();
  syncStartedMs_ = millis();

  if (!networkBootReady_) {
    setState(State::MENU);
    return;
  }

#ifdef SIMULATOR
  setError("Bluetooth sync is unavailable in simulator");
#else
  setState(State::STARTING_BLE);
  if (!buildSelectedPayload(selectionPayload_)) return;
  if (!beginBle()) {
    setError("Could not start Reading MMO Bluetooth");
    return;
  }
  setState(State::READY);
#endif
}

void ReadingMmoBleSyncActivity::onExit() { Activity::onExit(); }

void ReadingMmoBleSyncActivity::setState(const State state) {
  state_ = state;
  requestUpdate();
}

void ReadingMmoBleSyncActivity::setError(const std::string& error) {
  errorMessage_ = error;
  setState(State::ERROR);
}

void ReadingMmoBleSyncActivity::returnHome() {
  if (networkBootReady_) silentRestart();
  else activityManager.goHome();
}

void ReadingMmoBleSyncActivity::beginSelectionSync(const uint16_t fromDaysAgo, const uint16_t toDaysAgo) {
  if (fromDaysAgo < toDaysAgo || fromDaysAgo > MAX_DAYS_AGO ||
      fromDaysAgo - toDaysAgo + 1U > MAX_RANGE_DAYS) {
    setError("Invalid date range");
    return;
  }
#ifndef SIMULATOR
  silentRestartToNetwork(NetworkBootTarget::READING_MMO_SYNC, encodeSelection(fromDaysAgo, toDaysAgo));
#else
  selectionPayload_ = encodeSelection(fromDaysAgo, toDaysAgo);
  networkBootReady_ = true;
  setError("Bluetooth sync is unavailable in simulator");
#endif
}

void ReadingMmoBleSyncActivity::chooseMenuItem() {
  switch (menuIndex_) {
    case 0:
      beginSelectionSync(0, 0);
      break;
    case 1:
      beginSelectionSync(1, 1);
      break;
    case 2:
      dayOffset_ = 0;
      setState(State::PICK_DAY);
      break;
    case 3:
      rangeFromOffset_ = 6;
      rangeToOffset_ = 0;
      setState(State::PICK_RANGE_FROM);
      break;
    default:
      break;
  }
}

void ReadingMmoBleSyncActivity::adjustCurrentDate(const int delta) {
  if (state_ == State::PICK_DAY) {
    dayOffset_ = static_cast<uint16_t>(std::clamp<int>(int(dayOffset_) + delta, 0, MAX_DAYS_AGO));
  } else if (state_ == State::PICK_RANGE_FROM) {
    rangeFromOffset_ =
        static_cast<uint16_t>(std::clamp<int>(int(rangeFromOffset_) + delta, int(rangeToOffset_), MAX_DAYS_AGO));
    if (rangeFromOffset_ - rangeToOffset_ + 1U > MAX_RANGE_DAYS) {
      rangeFromOffset_ = static_cast<uint16_t>(rangeToOffset_ + MAX_RANGE_DAYS - 1U);
    }
  } else if (state_ == State::PICK_RANGE_TO) {
    rangeToOffset_ =
        static_cast<uint16_t>(std::clamp<int>(int(rangeToOffset_) + delta, 0, int(rangeFromOffset_)));
    if (rangeFromOffset_ - rangeToOffset_ + 1U > MAX_RANGE_DAYS) {
      rangeToOffset_ = static_cast<uint16_t>(rangeFromOffset_ - MAX_RANGE_DAYS + 1U);
    }
  }
  requestUpdate();
}

void ReadingMmoBleSyncActivity::loop() {
  if (TouchHeaderBackButton::wasTapped(mappedInput, renderer) ||
      mappedInput.wasPressed(MappedInputManager::Button::Back)) {
    if (state_ == State::MENU || networkBootReady_) {
      returnHome();
    } else {
      setState(State::MENU);
    }
    return;
  }

  if (networkBootReady_) {
    if (millis() - syncStartedMs_ >= SYNC_WINDOW_MS) returnHome();
    return;
  }

  if (state_ == State::MENU) {
    if (mappedInput.wasPressed(MappedInputManager::Button::Up)) {
      menuIndex_ = (menuIndex_ + 3) % 4;
      requestUpdate();
      return;
    }
    if (mappedInput.wasPressed(MappedInputManager::Button::Down)) {
      menuIndex_ = (menuIndex_ + 1) % 4;
      requestUpdate();
      return;
    }
    if (mappedInput.wasPressed(MappedInputManager::Button::Confirm)) {
      chooseMenuItem();
      return;
    }
#if CROSSINK_APP_CAP_TOUCH
    int x = 0, y = 0;
    if (mappedInput.wasScreenTapped(x, y) && y >= 120 && y < 120 + 4 * 78) {
      menuIndex_ = std::clamp((y - 120) / 78, 0, 3);
      chooseMenuItem();
      return;
    }
#endif
    return;
  }

  if (state_ == State::PICK_DAY || state_ == State::PICK_RANGE_FROM || state_ == State::PICK_RANGE_TO) {
    if (mappedInput.wasPressed(MappedInputManager::Button::Up) ||
        mappedInput.wasPressed(MappedInputManager::Button::Left)) {
      adjustCurrentDate(1);
      return;
    }
    if (mappedInput.wasPressed(MappedInputManager::Button::Down) ||
        mappedInput.wasPressed(MappedInputManager::Button::Right)) {
      adjustCurrentDate(-1);
      return;
    }
    if (mappedInput.wasPressed(MappedInputManager::Button::Confirm)) {
      if (state_ == State::PICK_DAY) {
        beginSelectionSync(dayOffset_, dayOffset_);
      } else if (state_ == State::PICK_RANGE_FROM) {
        if (rangeToOffset_ > rangeFromOffset_) rangeToOffset_ = rangeFromOffset_;
        setState(State::PICK_RANGE_TO);
      } else {
        beginSelectionSync(rangeFromOffset_, rangeToOffset_);
      }
      return;
    }
#if CROSSINK_APP_CAP_TOUCH
    int x = 0, y = 0;
    if (mappedInput.wasScreenTapped(x, y)) {
      if (y >= 220 && y < 300) adjustCurrentDate(1);
      else if (y >= 300 && y < 380) adjustCurrentDate(-1);
      else if (y >= 410) {
        if (state_ == State::PICK_DAY) beginSelectionSync(dayOffset_, dayOffset_);
        else if (state_ == State::PICK_RANGE_FROM) setState(State::PICK_RANGE_TO);
        else beginSelectionSync(rangeFromOffset_, rangeToOffset_);
      }
    }
#endif
  }
}

bool ReadingMmoBleSyncActivity::buildSelectedPayload(const uint32_t packedSelection) {
  uint16_t fromDaysAgo = 0, toDaysAgo = 0;
  if (!decodeSelection(packedSelection, fromDaysAgo, toDaysAgo)) {
    setError("Sync selection was not valid");
    return false;
  }

  ReadingStatsDateTime now{};
  if (!getCurrentLocalReadingStatsDateTime(now) || !now.date.isValid()) {
    setError("Set the reader date and time first");
    return false;
  }

  ReadingStatsDate from = now.date;
  ReadingStatsDate to = now.date;
  addDaysToReadingStatsDate(from, -static_cast<int>(fromDaysAgo));
  addDaysToReadingStatsDate(to, -static_cast<int>(toDaysAgo));

  std::array<std::string, MAX_SYNC_BOOKS> books{};
  size_t bookCount = 0;
  std::array<PackedEntry, MAX_SYNC_ENTRIES> packed{};
  size_t packedCount = 0;

  ReadingStatsDate cursor = from;
  while (compareReadingStatsDate(cursor, to) <= 0) {
    std::array<DailyReadingLog::Entry, DailyReadingLog::MAX_BOOKS_PER_DAY> dayRows{};
    size_t dayCount = 0;
    if (!DailyReadingLog::readDay(dailyDate(cursor), dayRows.data(), dayRows.size(), dayCount)) {
      setError("Could not read one selected diary day");
      return false;
    }

    for (size_t i = 0; i < dayCount; ++i) {
      if (packedCount >= packed.size()) {
        setError("Too many diary entries; choose a shorter range");
        return false;
      }

      const std::string title = dayRows[i].title[0] ? std::string(dayRows[i].title) : std::string("Unknown book");
      size_t bookIndex = 0;
      while (bookIndex < bookCount && books[bookIndex] != title) ++bookIndex;
      if (bookIndex == bookCount) {
        if (bookCount >= books.size()) {
          setError("Too many books; choose a shorter range");
          return false;
        }
        books[bookCount++] = title;
      }

      PackedEntry& p = packed[packedCount++];
      p.date = cursor;
      p.bookIndex = static_cast<uint8_t>(bookIndex);
      p.pages = dayRows[i].pages;
      p.seconds = dayRows[i].seconds;
      p.sessions = dayRows[i].sessionCount == UINT16_MAX ? 0 : dayRows[i].sessionCount;
      p.startPermille = dayRows[i].startingPermille == UINT16_MAX ? -1 : static_cast<int16_t>(dayRows[i].startingPermille);
      p.endPermille = dayRows[i].endingPermille;
      p.startXte = dayRows[i].startingXtePage;
      p.endXte = dayRows[i].endingXtePage;
    }
    addDaysToReadingStatsDate(cursor, 1);
  }

  if (packedCount == 0) {
    payload_ = "{\"p\":5,\"none\":1}";
    statusLine_ = "No reading stored for that selection";
    return true;
  }

  char fromKey[9], toKey[9];
  dateCompact(from, fromKey, sizeof(fromKey));
  dateCompact(to, toKey, sizeof(toKey));

  std::string json;
  json.reserve(MAX_PAYLOAD_BYTES);
  json = "{\"p\":5,\"id\":\"";
  json += fromKey;
  json += "-";
  json += toKey;
  json += "\",\"b\":[";
  for (size_t i = 0; i < bookCount; ++i) {
    if (i) json += ",";
    appendJsonString(json, books[i].c_str());
  }
  json += "],\"e\":[";
  for (size_t i = 0; i < packedCount; ++i) {
    if (i) json += ",";
    char key[9];
    dateCompact(packed[i].date, key, sizeof(key));
    json += "[\"";
    json += key;
    json += "\",";
    appendUnsigned(json, packed[i].bookIndex);
    json += ",";
    appendUnsigned(json, packed[i].pages);
    json += ",";
    appendUnsigned(json, packed[i].seconds);
    json += ",";
    appendUnsigned(json, packed[i].sessions);
    json += ",";
    appendSigned(json, packed[i].startPermille);
    json += ",";
    appendUnsigned(json, packed[i].endPermille);
    json += ",";
    appendUnsigned(json, packed[i].startXte);
    json += ",";
    appendUnsigned(json, packed[i].endXte);
    json += "]";
  }
  json += "]}";

  if (json.size() > MAX_PAYLOAD_BYTES) {
    setError("Selected range is too large; choose fewer days");
    return false;
  }

  payload_ = std::move(json);
  char status[72];
  snprintf(status, sizeof(status), "%u reading-day %s ready",
           unsigned(packedCount), packedCount == 1 ? "entry" : "entries");
  statusLine_ = status;
  return true;
}

bool ReadingMmoBleSyncActivity::beginBle() {
#ifndef SIMULATOR
  BLEDevice::init(READING_MMO_BLE_NAME);
  BLEServer* server = BLEDevice::createServer();
  if (!server) return false;
  BLEService* service = server->createService(READING_MMO_SERVICE_UUID);
  if (!service) return false;
  BLECharacteristic* stats =
      service->createCharacteristic(READING_MMO_STATS_UUID, BLECharacteristic::PROPERTY_READ);
  if (!stats) return false;
  stats->setValue(payload_.c_str());
  service->start();

  BLEAdvertising* advertising = BLEDevice::getAdvertising();
  advertising->addServiceUUID(READING_MMO_SERVICE_UUID);
  advertising->setScanResponse(true);
  BLEDevice::startAdvertising();
  LOG_INF("BLE", "Reading Journal selective sync advertising (%u bytes)", unsigned(payload_.size()));
  return true;
#else
  return false;
#endif
}

void ReadingMmoBleSyncActivity::render(RenderLock&&) {
  const auto& metrics = UITheme::getInstance().getMetrics();
  const int width = renderer.getScreenWidth();
  const int height = renderer.getScreenHeight();
  renderer.clearScreen();

  const Rect header{0, metrics.topPadding, width, TouchHeaderBackButton::height(metrics, mappedInput)};
  if (mappedInput.hasTouchHardware()) TouchHeaderBackButton::draw(renderer, header, "Reading Journal", false);
  else GUI.drawHeader(renderer, header, "Reading Journal");

  if (state_ == State::MENU) {
    renderer.drawText(UI_10_FONT_ID, 22, 84, "Choose what to send to your phone", true, EpdFontFamily::BOLD);
    static const char* labels[] = {"Today", "Yesterday", "Pick a Day", "Pick a Range"};
    for (int i = 0; i < 4; ++i) {
      const int y = 132 + i * 78;
      renderer.drawText(UI_12_FONT_ID, 34, y, i == menuIndex_ ? ">" : " ", true, EpdFontFamily::BOLD);
      renderer.drawText(UI_12_FONT_ID, 64, y, labels[i], true, i == menuIndex_ ? EpdFontFamily::BOLD : EpdFontFamily::REGULAR);
      renderer.drawLine(30, y + 37, width - 30, y + 37, true);
    }
  } else if (state_ == State::PICK_DAY || state_ == State::PICK_RANGE_FROM || state_ == State::PICK_RANGE_TO) {
    uint16_t offset = dayOffset_;
    const char* title = "Pick a Day";
    const char* action = "SYNC THIS DAY";
    if (state_ == State::PICK_RANGE_FROM) {
      offset = rangeFromOffset_;
      title = "Pick range start";
      action = "NEXT: RANGE END";
    } else if (state_ == State::PICK_RANGE_TO) {
      offset = rangeToOffset_;
      title = "Pick range end";
      action = "SYNC THIS RANGE";
    }
    char date[40];
    dateText(offset, date, sizeof(date));
    renderer.drawCenteredText(UI_12_FONT_ID, 120, title, true, EpdFontFamily::BOLD);
    renderer.drawCenteredText(UI_12_FONT_ID, 175, date, true, EpdFontFamily::BOLD);
    renderer.drawCenteredText(UI_10_FONT_ID, 245, "OLDER  ^", true, EpdFontFamily::BOLD);
    renderer.drawCenteredText(UI_10_FONT_ID, 325, "NEWER  v", true, EpdFontFamily::BOLD);
    renderer.drawLine(34, 392, width - 34, 392, true);
    renderer.drawCenteredText(UI_10_FONT_ID, 425, action, true, EpdFontFamily::BOLD);
    if (state_ == State::PICK_RANGE_FROM || state_ == State::PICK_RANGE_TO) {
      char note[64];
      snprintf(note, sizeof(note), "Range limit: %u days", unsigned(MAX_RANGE_DAYS));
      renderer.drawCenteredText(SMALL_FONT_ID, 474, note);
    }
  } else if (state_ == State::READY) {
    renderer.drawCenteredText(UI_12_FONT_ID, height / 2 - 75, "Bluetooth is ready", true, EpdFontFamily::BOLD);
    renderer.drawCenteredText(UI_10_FONT_ID, height / 2 - 35, statusLine_.c_str());
    renderer.drawCenteredText(UI_10_FONT_ID, height / 2 + 5, "Open Reading Journal > Calendar");
    renderer.drawCenteredText(UI_10_FONT_ID, height / 2 + 40, "Tap Sync X4 Pro on your phone");
    renderer.drawCenteredText(SMALL_FONT_ID, height / 2 + 78, "Bluetooth closes automatically after 2 minutes");
  } else if (state_ == State::ERROR) {
    renderer.drawCenteredText(UI_12_FONT_ID, height / 2 - 40, "Sync could not start", true, EpdFontFamily::BOLD);
    renderer.drawCenteredText(UI_10_FONT_ID, height / 2 + 5, errorMessage_.c_str());
    renderer.drawCenteredText(SMALL_FONT_ID, height / 2 + 46, "Back returns to Home");
  } else {
    renderer.drawCenteredText(UI_12_FONT_ID, height / 2 - 20, "Preparing selected reading days...", true,
                              EpdFontFamily::BOLD);
  }

  const auto labels = mappedInput.mapLabels(mappedInput.withBackArrow("Back"), "Select", "Up", "Down");
  GUI.drawButtonHints(renderer, labels.btn1, labels.btn2, labels.btn3, labels.btn4);
  renderer.displayBuffer(screenTransitionRefresh_.modeFor(static_cast<uint8_t>(state_)));
}
