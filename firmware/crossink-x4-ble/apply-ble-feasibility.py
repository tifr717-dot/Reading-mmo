#!/usr/bin/env python3
from pathlib import Path
import re
import sys

root = Path(sys.argv[1] if len(sys.argv) > 1 else "crossink")


def replace_once(path: Path, old: str, new: str, label: str) -> None:
    text = path.read_text()
    if old not in text:
        raise SystemExit(f"{label} anchor not found in {path}")
    path.write_text(text.replace(old, new, 1))


platformio = root / "platformio.ini"
s = platformio.read_text()
ble_ignore = re.compile(r"(?m)^[ \t]+BLE[ \t]*\r?\n")
if not ble_ignore.search(s):
    raise SystemExit("BLE lib_ignore entry not found")
s = ble_ignore.sub("", s, count=1)

serial_log_line = re.compile(
    r"(?m)^[ \t]*-D[ \t]*ENABLE_SERIAL_LOG(?:=[^\s#;]+)?[ \t]*(?:\r?\n|$)"
)
s, serial_log_line_count = serial_log_line.subn("", s)
serial_log_inline = re.compile(
    r"(?<!\S)-D[ \t]*ENABLE_SERIAL_LOG(?:=[^\s#;]+)?(?=\s|$)"
)
s, serial_log_inline_count = serial_log_inline.subn("", s)
platformio.write_text(s)

active_serial_log = re.compile(
    r"(?<!\S)-D[ \t]*ENABLE_SERIAL_LOG(?:=[^\s#;]+)?(?=\s|$)"
)
if active_serial_log.search(platformio.read_text()):
    raise SystemExit("ENABLE_SERIAL_LOG build flag remained after trim")
if serial_log_line_count + serial_log_inline_count:
    print("Disabled ENABLE_SERIAL_LOG for BLE sync build")
else:
    print("ENABLE_SERIAL_LOG already absent in reconstructed source; continuing")

activity_h = root / "src/activities/network/ReadingMmoBleSyncActivity.h"
activity_h.write_text(r'''#pragma once

#include <cstdint>
#include <string>

#include "activities/Activity.h"
#include "activities/ScreenTransitionRefresh.h"

class ReadingMmoBleSyncActivity final : public Activity {
 public:
  enum class State : uint8_t { STARTING, READY, ERROR };

  explicit ReadingMmoBleSyncActivity(GfxRenderer& renderer, MappedInputManager& mappedInput);
  ~ReadingMmoBleSyncActivity() override;

  void onEnter() override;
  void onExit() override;
  void loop() override;
  void render(RenderLock&&) override;
  bool preventAutoSleep() override { return true; }

 private:
  State state_ = State::STARTING;
  ScreenTransitionRefresh screenTransitionRefresh_;
  uint32_t syncStartedMs_ = 0;
  std::string errorMessage_;

  bool beginBle();
  void returnHome();
  void setState(State state);
  void setError(const std::string& error);
};
''')

activity_cpp = root / "src/activities/network/ReadingMmoBleSyncActivity.cpp"
activity_cpp.write_text(r'''#include "ReadingMmoBleSyncActivity.h"

#include <Arduino.h>
#include <GfxRenderer.h>
#include <I18n.h>
#include <Logging.h>

#include "MappedInputManager.h"
#include "SilentRestart.h"
#include "components/TouchHeaderBackButton.h"
#include "components/UITheme.h"
#include "fontIds.h"

#ifndef SIMULATOR
#include <BLEDevice.h>
#include <BLEServer.h>
#endif

namespace {
constexpr char READING_MMO_BLE_NAME[] = "Reading MMO Reader";
constexpr char READING_MMO_SERVICE_UUID[] = "7d2ea28a-f7bd-485a-bd9d-92ad6ecfe93e";
constexpr char READING_MMO_STATS_UUID[] = "7d2ea28b-f7bd-485a-bd9d-92ad6ecfe93e";
constexpr char READING_MMO_TEST_PAYLOAD[] = R"({"p":1,"sid":1})";
constexpr uint32_t SYNC_WINDOW_MS = 120000;
}  // namespace

ReadingMmoBleSyncActivity::ReadingMmoBleSyncActivity(GfxRenderer& renderer, MappedInputManager& mappedInput)
    : Activity("ReadingMmoBleSync", renderer, mappedInput) {}

ReadingMmoBleSyncActivity::~ReadingMmoBleSyncActivity() = default;

void ReadingMmoBleSyncActivity::onEnter() {
  Activity::onEnter();
  syncStartedMs_ = millis();
  setState(State::STARTING);

#ifdef SIMULATOR
  setError("Bluetooth sync is unavailable in simulator");
#else
  if (!beginBle()) {
    setError("Could not start Reading MMO Bluetooth");
    return;
  }
  setState(State::READY);
#endif
}

void ReadingMmoBleSyncActivity::onExit() { Activity::onExit(); }

void ReadingMmoBleSyncActivity::loop() {
  if (TouchHeaderBackButton::wasTapped(mappedInput, renderer) ||
      mappedInput.wasPressed(MappedInputManager::Button::Back)) {
    returnHome();
    return;
  }

  if (millis() - syncStartedMs_ >= SYNC_WINDOW_MS) {
    returnHome();
  }
}

bool ReadingMmoBleSyncActivity::beginBle() {
#ifndef SIMULATOR
  BLEDevice::init(READING_MMO_BLE_NAME);
  BLEServer* server = BLEDevice::createServer();
  if (!server) {
    LOG_ERR("BLE", "Reading MMO: failed to create server");
    return false;
  }

  BLEService* service = server->createService(READING_MMO_SERVICE_UUID);
  if (!service) {
    LOG_ERR("BLE", "Reading MMO: failed to create service");
    return false;
  }

  BLECharacteristic* stats =
      service->createCharacteristic(READING_MMO_STATS_UUID, BLECharacteristic::PROPERTY_READ);
  if (!stats) {
    LOG_ERR("BLE", "Reading MMO: failed to create stats characteristic");
    return false;
  }

  stats->setValue(READING_MMO_TEST_PAYLOAD);
  service->start();

  BLEAdvertising* advertising = BLEDevice::getAdvertising();
  advertising->addServiceUUID(READING_MMO_SERVICE_UUID);
  advertising->setScanResponse(true);
  BLEDevice::startAdvertising();
  LOG_INF("BLE", "Reading MMO on-demand sync advertising");
  return true;
#else
  return false;
#endif
}

void ReadingMmoBleSyncActivity::returnHome() {
  silentRestart();
}

void ReadingMmoBleSyncActivity::setState(const State state) {
  state_ = state;
  requestUpdate();
}

void ReadingMmoBleSyncActivity::setError(const std::string& error) {
  errorMessage_ = error;
  setState(State::ERROR);
}

void ReadingMmoBleSyncActivity::render(RenderLock&&) {
  const auto& metrics = UITheme::getInstance().getMetrics();
  const auto pageWidth = renderer.getScreenWidth();
  const auto pageHeight = renderer.getScreenHeight();

  renderer.clearScreen();
  const Rect header{0, metrics.topPadding, pageWidth, TouchHeaderBackButton::height(metrics, mappedInput)};
  if (mappedInput.hasTouchHardware()) {
    TouchHeaderBackButton::draw(renderer, header, "Reading MMO Sync", false);
  } else {
    GUI.drawHeader(renderer, header, "Reading MMO Sync");
  }

  const int centerY = pageHeight / 2 - 30;
  if (state_ == State::READY) {
    renderer.drawCenteredText(UI_10_FONT_ID, centerY, "Bluetooth is ready", true, EpdFontFamily::BOLD);
    renderer.drawCenteredText(UI_10_FONT_ID, centerY + 28, "Open Reading MMO and scan for this reader", true,
                              EpdFontFamily::REGULAR);
    renderer.drawCenteredText(UI_10_FONT_ID, centerY + 56, "Phase 1 payload: session 1", true,
                              EpdFontFamily::REGULAR);
    renderer.drawCenteredText(UI_10_FONT_ID, centerY + 84, "Bluetooth closes automatically after 2 minutes", true,
                              EpdFontFamily::REGULAR);
  } else if (state_ == State::ERROR) {
    renderer.drawCenteredText(UI_10_FONT_ID, centerY, "Bluetooth sync could not start", true,
                              EpdFontFamily::BOLD);
    renderer.drawCenteredText(UI_10_FONT_ID, centerY + 32, errorMessage_.c_str(), true,
                              EpdFontFamily::REGULAR);
  } else {
    renderer.drawCenteredText(UI_10_FONT_ID, centerY, "Starting Bluetooth...", true, EpdFontFamily::BOLD);
  }

  const auto labels = mappedInput.mapLabels(tr(STR_BACK), "", "", "");
  GUI.drawButtonHints(renderer, labels.btn1, labels.btn2, labels.btn3, labels.btn4);
  renderer.displayBuffer(screenTransitionRefresh_.modeFor(static_cast<uint8_t>(state_)));
}
''')

silent = root / "src/SilentRestart.h"
replace_once(
    silent,
    '''  FILE_TRANSFER = 6,
  MANAGE_FONTS = 7,
};
''',
    '''  FILE_TRANSFER = 6,
  MANAGE_FONTS = 7,
  READING_MMO_SYNC = 8,
};
''',
    "Reading MMO network boot enum",
)
replace_once(
    silent,
    '''    case NetworkBootTarget::FILE_TRANSFER:
    case NetworkBootTarget::MANAGE_FONTS:
      return true;
''',
    '''    case NetworkBootTarget::FILE_TRANSFER:
    case NetworkBootTarget::MANAGE_FONTS:
    case NetworkBootTarget::READING_MMO_SYNC:
      return true;
''',
    "Reading MMO network target validation",
)
replace_once(
    silent,
    '''                  isNetworkBootTargetValue(static_cast<uint32_t>(NetworkBootTarget::FILE_TRANSFER)) &&
                  isNetworkBootTargetValue(static_cast<uint32_t>(NetworkBootTarget::MANAGE_FONTS)),
''',
    '''                  isNetworkBootTargetValue(static_cast<uint32_t>(NetworkBootTarget::FILE_TRANSFER)) &&
                  isNetworkBootTargetValue(static_cast<uint32_t>(NetworkBootTarget::MANAGE_FONTS)) &&
                  isNetworkBootTargetValue(static_cast<uint32_t>(NetworkBootTarget::READING_MMO_SYNC)),
''',
    "Reading MMO network target static assert",
)

manager_h = root / "src/activities/ActivityManager.h"
replace_once(
    manager_h,
    '''  void goToNearbyStatsSync();
  void goToNearbyBookSend(std::string path, bool returnToReader);
''',
    '''  void goToNearbyStatsSync();
  bool goToReadingMmoBleSync(bool networkBootReady = false);
  void goToNearbyBookSend(std::string path, bool returnToReader);
''',
    "ActivityManager Reading MMO declaration",
)

manager_cpp = root / "src/activities/ActivityManager.cpp"
replace_once(
    manager_cpp,
    '''#include "network/NearbyStatsSyncActivity.h"
#include "reader/ReaderActivity.h"
''',
    '''#include "network/NearbyStatsSyncActivity.h"
#include "network/ReadingMmoBleSyncActivity.h"
#include "reader/ReaderActivity.h"
''',
    "ActivityManager Reading MMO include",
)
replace_once(
    manager_cpp,
    '''void ActivityManager::goToNearbyStatsSync() {
  replaceActivity(std::make_unique<NearbyStatsSyncActivity>(renderer, mappedInput));
}

void ActivityManager::goToSettings(const bool dismissOnUpSwipe) {
''',
    '''void ActivityManager::goToNearbyStatsSync() {
  replaceActivity(std::make_unique<NearbyStatsSyncActivity>(renderer, mappedInput));
}

bool ActivityManager::goToReadingMmoBleSync(const bool networkBootReady) {
#ifndef SIMULATOR
  if (!networkBootReady) {
    silentRestartToNetwork(NetworkBootTarget::READING_MMO_SYNC);
    return true;
  }
#else
  (void)networkBootReady;
#endif

  auto activity = makeUniqueNoThrow<ReadingMmoBleSyncActivity>(renderer, mappedInput);
  if (!activity) {
    LOG_ERR("ACT", "OOM: Reading MMO BLE sync activity");
    return false;
  }
  replaceActivity(std::move(activity));
  return true;
}

void ActivityManager::goToSettings(const bool dismissOnUpSwipe) {
''',
    "ActivityManager Reading MMO launcher",
)

main = root / "src/main.cpp"
replace_once(
    main,
    '''      case NetworkBootTarget::FILE_TRANSFER:
        launched = activityManager.resumeFileTransferFromNetworkBoot(snapshotPayload);
        break;
      case NetworkBootTarget::MANAGE_FONTS: {
''',
    '''      case NetworkBootTarget::FILE_TRANSFER:
        launched = activityManager.resumeFileTransferFromNetworkBoot(snapshotPayload);
        break;
      case NetworkBootTarget::READING_MMO_SYNC:
        launched = activityManager.goToReadingMmoBleSync(true);
        break;
      case NetworkBootTarget::MANAGE_FONTS: {
''',
    "main Reading MMO minimal-boot route",
)

home_h = root / "src/activities/home/HomeActivity.h"
replace_once(
    home_h,
    '''  void onFileTransferOpen();
  void onOpdsBrowserOpen();
''',
    '''  void onFileTransferOpen();
  void onReadingMmoSyncOpen();
  void onOpdsBrowserOpen();
''',
    "Home Reading MMO handler declaration",
)

home = root / "src/activities/home/HomeActivity.cpp"
replace_once(
    home,
    '''  FileTransfer,
  Settings,
};
''',
    '''  FileTransfer,
  ReadingMmoSync,
  Settings,
};
''',
    "Home Reading MMO action enum",
)
replace_once(
    home,
    '''  static constexpr int kCapacity = 8;
''',
    '''  static constexpr int kCapacity = 9;
''',
    "Home menu capacity",
)
replace_once(
    home,
    '''  items.push({tr(STR_FILE_TRANSFER), Transfer, HomeMenuAction::FileTransfer});
  items.push({tr(STR_SETTINGS_TITLE), Settings, HomeMenuAction::Settings});
''',
    '''  items.push({tr(STR_FILE_TRANSFER), Transfer, HomeMenuAction::FileTransfer});
  items.push({"Reading MMO Sync", Transfer, HomeMenuAction::ReadingMmoSync});
  items.push({tr(STR_SETTINGS_TITLE), Settings, HomeMenuAction::Settings});
''',
    "Home menu Reading MMO item",
)
replace_once(
    home,
    '''  items.push({tr(STR_FILE_TRANSFER), Transfer, HomeMenuAction::FileTransfer});
  return items;
}

HomeMenuEntries buildSelectableHomeMenuItems''',
    '''  items.push({tr(STR_FILE_TRANSFER), Transfer, HomeMenuAction::FileTransfer});
  items.push({"Reading MMO Sync", Transfer, HomeMenuAction::ReadingMmoSync});
  return items;
}

HomeMenuEntries buildSelectableHomeMenuItems''',
    "Minimal Home Reading MMO item",
)
replace_once(
    home,
    '''          case HomeMenuAction::FileTransfer:
            onFileTransferOpen();
            break;
          case HomeMenuAction::ContinueReading:
''',
    '''          case HomeMenuAction::FileTransfer:
            onFileTransferOpen();
            break;
          case HomeMenuAction::ReadingMmoSync:
            onReadingMmoSyncOpen();
            break;
          case HomeMenuAction::ContinueReading:
''',
    "Home menu first Reading MMO action switch",
)
replace_once(
    home,
    '''      case HomeMenuAction::FileTransfer:
        onFileTransferOpen();
        break;
      case HomeMenuAction::Settings:
''',
    '''      case HomeMenuAction::FileTransfer:
        onFileTransferOpen();
        break;
      case HomeMenuAction::ReadingMmoSync:
        onReadingMmoSyncOpen();
        break;
      case HomeMenuAction::Settings:
''',
    "Home menu second Reading MMO action switch",
)
replace_once(
    home,
    '''void HomeActivity::onFileTransferOpen() { activityManager.goToFileTransfer(); }

void HomeActivity::onOpdsBrowserOpen() { activityManager.goToBrowser(); }
''',
    '''void HomeActivity::onFileTransferOpen() { activityManager.goToFileTransfer(); }

void HomeActivity::onReadingMmoSyncOpen() { activityManager.goToReadingMmoBleSync(); }

void HomeActivity::onOpdsBrowserOpen() { activityManager.goToBrowser(); }
''',
    "Home Reading MMO action handler",
)

assert "BLEDevice::startAdvertising()" in activity_cpp.read_text()
assert "READING_MMO_TEST_PAYLOAD" in activity_cpp.read_text()
assert "NetworkBootTarget::READING_MMO_SYNC" in main.read_text()
assert "Reading MMO Sync" in home.read_text()
assert "BLEDevice::" not in main.read_text()
assert not any(line.strip() == "BLE" for line in platformio.read_text().splitlines())
assert not active_serial_log.search(platformio.read_text())

print("Applied Reading MMO BLE Phase 1: on-demand minimal-boot sync with fixed test session payload")
