#!/usr/bin/env python3
from pathlib import Path
import re
import shutil
import sys

root = Path(sys.argv[1] if len(sys.argv) > 1 else "crossink")
overlay = Path(__file__).resolve().parent / "dashboard_overlay"


def replace_once(path: Path, old: str, new: str, label: str) -> None:
    text = path.read_text()
    if old not in text:
        raise SystemExit(f"{label} anchor not found in {path}")
    path.write_text(text.replace(old, new, 1))


# Re-enable Arduino BLE only for this isolated build. BLE is still started only
# after Home -> Reading MMO Sync -> a date/range selection -> minimal reboot.
platformio = root / "platformio.ini"
s = platformio.read_text()
ble_ignore = re.compile(r"(?m)^[ \t]+BLE[ \t]*\r?\n")
if not ble_ignore.search(s):
    raise SystemExit("BLE lib_ignore entry not found")
platformio.write_text(ble_ignore.sub("", s, count=1))

network_dir = root / "src/activities/network"
shutil.copyfile(overlay / "ReadingMmoBleSyncActivity.h", network_dir / "ReadingMmoBleSyncActivity.h")
shutil.copyfile(overlay / "ReadingMmoBleSyncActivity.cpp", network_dir / "ReadingMmoBleSyncActivity.cpp")

silent = root / "src/SilentRestart.h"
replace_once(
    silent,
    """  FILE_TRANSFER = 6,
  MANAGE_FONTS = 7,
};
""",
    """  FILE_TRANSFER = 6,
  MANAGE_FONTS = 7,
  READING_MMO_SYNC = 8,
};
""",
    "Reading MMO network boot enum",
)
replace_once(
    silent,
    """    case NetworkBootTarget::FILE_TRANSFER:
    case NetworkBootTarget::MANAGE_FONTS:
      return true;
""",
    """    case NetworkBootTarget::FILE_TRANSFER:
    case NetworkBootTarget::MANAGE_FONTS:
    case NetworkBootTarget::READING_MMO_SYNC:
      return true;
""",
    "Reading MMO target validation",
)
replace_once(
    silent,
    """                  isNetworkBootTargetValue(static_cast<uint32_t>(NetworkBootTarget::FILE_TRANSFER)) &&
                  isNetworkBootTargetValue(static_cast<uint32_t>(NetworkBootTarget::MANAGE_FONTS)),
""",
    """                  isNetworkBootTargetValue(static_cast<uint32_t>(NetworkBootTarget::FILE_TRANSFER)) &&
                  isNetworkBootTargetValue(static_cast<uint32_t>(NetworkBootTarget::MANAGE_FONTS)) &&
                  isNetworkBootTargetValue(static_cast<uint32_t>(NetworkBootTarget::READING_MMO_SYNC)),
""",
    "Reading MMO static target validation",
)

manager_h = root / "src/activities/ActivityManager.h"
replace_once(
    manager_h,
    """  void goToNearbyStatsSync();
  bool goToNearbyBookSend(std::string path, bool returnToReader);
""",
    """  void goToNearbyStatsSync();
  bool goToReadingMmoBleSync(bool networkBootReady = false, uint32_t selectionPayload = 0);
  bool goToNearbyBookSend(std::string path, bool returnToReader);
""",
    "ActivityManager Reading MMO declaration",
)

manager_cpp = root / "src/activities/ActivityManager.cpp"
replace_once(
    manager_cpp,
    """#include "network/NearbyStatsSyncActivity.h"
#include "network/UsbDriveActivity.h"
""",
    """#include "network/NearbyStatsSyncActivity.h"
#include "network/ReadingMmoBleSyncActivity.h"
#include "network/UsbDriveActivity.h"
""",
    "ActivityManager Reading MMO include",
)
replace_once(
    manager_cpp,
    """void ActivityManager::goToNearbyStatsSync() {
  replaceActivity(std::make_unique<NearbyStatsSyncActivity>(renderer, mappedInput));
}

void ActivityManager::goToSettings(const bool dismissOnUpSwipe) {
""",
    """void ActivityManager::goToNearbyStatsSync() {
  replaceActivity(std::make_unique<NearbyStatsSyncActivity>(renderer, mappedInput));
}

bool ActivityManager::goToReadingMmoBleSync(const bool networkBootReady, const uint32_t selectionPayload) {
  auto activity = makeUniqueNoThrow<ReadingMmoBleSyncActivity>(renderer, mappedInput, networkBootReady, selectionPayload);
  if (!activity) {
    LOG_ERR("ACT", "OOM: Reading MMO BLE sync activity");
    return false;
  }
  replaceActivity(std::move(activity));
  return true;
}

void ActivityManager::goToSettings(const bool dismissOnUpSwipe) {
""",
    "ActivityManager Reading MMO launcher",
)

main = root / "src/main.cpp"
replace_once(
    main,
    """                          snapshotTarget == static_cast<uint32_t>(NetworkBootTarget::OPDS) ||
                          snapshotTarget == static_cast<uint32_t>(NetworkBootTarget::FILE_TRANSFER)));
""",
    """                          snapshotTarget == static_cast<uint32_t>(NetworkBootTarget::OPDS) ||
                          snapshotTarget == static_cast<uint32_t>(NetworkBootTarget::FILE_TRANSFER) ||
                          snapshotTarget == static_cast<uint32_t>(NetworkBootTarget::READING_MMO_SYNC)));
""",
    "Reading MMO network render stack",
)
replace_once(
    main,
    """      case NetworkBootTarget::FILE_TRANSFER:
        launched = activityManager.resumeFileTransferFromNetworkBoot(snapshotPayload);
        break;
      case NetworkBootTarget::MANAGE_FONTS: {
""",
    """      case NetworkBootTarget::FILE_TRANSFER:
        launched = activityManager.resumeFileTransferFromNetworkBoot(snapshotPayload);
        break;
      case NetworkBootTarget::READING_MMO_SYNC:
        launched = activityManager.goToReadingMmoBleSync(true, snapshotPayload);
        break;
      case NetworkBootTarget::MANAGE_FONTS: {
""",
    "main Reading MMO minimal-boot route",
)

home_h = root / "src/activities/home/HomeActivity.h"
replace_once(
    home_h,
    """  void onSettingsOpen();
  void onFileTransferOpen();
  void onOpdsBrowserOpen();
""",
    """  void onSettingsOpen();
  void onFileTransferOpen();
  void onReadingMmoSyncOpen();
  void onOpdsBrowserOpen();
""",
    "Home Reading MMO handler declaration",
)

home = root / "src/activities/home/HomeActivity.cpp"
replace_once(
    home,
    """  Bookmarks,
  FileTransfer,
  Settings,
};
""",
    """  Bookmarks,
  FileTransfer,
  ReadingMmoSync,
  Settings,
};
""",
    "Home Reading MMO action enum",
)
replace_once(
    home,
    """  static constexpr int kCapacity = 8;
""",
    """  static constexpr int kCapacity = 9;
""",
    "Home menu capacity",
)
replace_once(
    home,
    """  items.push({tr(STR_FILE_TRANSFER), Transfer, HomeMenuAction::FileTransfer});
  items.push({tr(STR_SETTINGS_TITLE), Settings, HomeMenuAction::Settings});
""",
    """  items.push({tr(STR_FILE_TRANSFER), Transfer, HomeMenuAction::FileTransfer});
  items.push({"Reading MMO Sync", Transfer, HomeMenuAction::ReadingMmoSync});
  items.push({tr(STR_SETTINGS_TITLE), Settings, HomeMenuAction::Settings});
""",
    "Home full menu Reading MMO item",
)
replace_once(
    home,
    """  items.push({tr(STR_FILE_TRANSFER), Transfer, HomeMenuAction::FileTransfer});
  return items;
}

HomeMenuEntries buildSelectableHomeMenuItems""",
    """  items.push({tr(STR_FILE_TRANSFER), Transfer, HomeMenuAction::FileTransfer});
  items.push({"Reading MMO Sync", Transfer, HomeMenuAction::ReadingMmoSync});
  return items;
}

HomeMenuEntries buildSelectableHomeMenuItems""",
    "Home minimal menu Reading MMO item",
)
replace_once(
    home,
    """  int count = 4;  // File Browser, Recents, File transfer, Settings
""",
    """  int count = 5;  // File Browser, Recents, File transfer, Reading MMO Sync, Settings
""",
    "Home fixed item count",
)

# There are two menu action switches (minimal and standard).
switch_old = """          case HomeMenuAction::FileTransfer:
            onFileTransferOpen();
            break;
          case HomeMenuAction::ContinueReading:
"""
switch_new = """          case HomeMenuAction::FileTransfer:
            onFileTransferOpen();
            break;
          case HomeMenuAction::ReadingMmoSync:
            onReadingMmoSyncOpen();
            break;
          case HomeMenuAction::ContinueReading:
"""
replace_once(home, switch_old, switch_new, "Home minimal Reading MMO action")

replace_once(
    home,
    """      case HomeMenuAction::FileTransfer:
        onFileTransferOpen();
        break;
      case HomeMenuAction::Settings:
""",
    """      case HomeMenuAction::FileTransfer:
        onFileTransferOpen();
        break;
      case HomeMenuAction::ReadingMmoSync:
        onReadingMmoSyncOpen();
        break;
      case HomeMenuAction::Settings:
""",
    "Home standard Reading MMO action",
)
replace_once(
    home,
    """void HomeActivity::onFileTransferOpen() { activityManager.goToFileTransfer(); }

void HomeActivity::onOpdsBrowserOpen() { activityManager.goToBrowser(); }
""",
    """void HomeActivity::onFileTransferOpen() { activityManager.goToFileTransfer(); }

void HomeActivity::onReadingMmoSyncOpen() { activityManager.goToReadingMmoBleSync(); }

void HomeActivity::onOpdsBrowserOpen() { activityManager.goToBrowser(); }
""",
    "Home Reading MMO handler",
)

assert "NetworkBootTarget::READING_MMO_SYNC" in main.read_text()
assert "Reading MMO Sync" in home.read_text()
assert "goToReadingMmoBleSync" in manager_cpp.read_text()
assert "BLEDevice::startAdvertising()" in (network_dir / "ReadingMmoBleSyncActivity.cpp").read_text()
assert not any(line.strip() == "BLE" for line in platformio.read_text().splitlines())

print("Applied Reading MMO selective BLE sync: Today, Yesterday, Pick a Day, Pick a Range")
