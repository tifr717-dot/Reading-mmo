#!/usr/bin/env python3
"""Apply isolated X4 Pro BLE HID page-turner support after selective BLE sync.

The Reading Journal server keeps its existing minimal network boot. The remote
uses a separate BLE central host only while reading or in the pairing screen.
"""
from pathlib import Path
import shutil
import sys

root = Path(sys.argv[1] if len(sys.argv) > 1 else "crossink")
here = Path(__file__).resolve().parent
overlay = here / "ble_overlay"

def replace_once(path: Path, old: str, new: str, label: str):
    original = path.read_text()
    if original.count(old) != 1:
        raise SystemExit(f"{label}: expected 1 anchor in {path}; found {original.count(old)}")
    path.write_text(original.replace(old, new, 1))

for name in ("X4PageTurner.h", "X4PageTurner.cpp"):
    shutil.copyfile(overlay / name, root / "src" / name)
for name in ("X4PageTurnerSettingsActivity.h", "X4PageTurnerSettingsActivity.cpp"):
    shutil.copyfile(overlay / name, root / "src/activities/settings" / name)

vendor = overlay / "BleKeyboardHost"
dst = root / "lib/BleKeyboardHost"
shutil.copytree(vendor, dst, dirs_exist_ok=True)

pio = root / "platformio.ini"
replace_once(
    pio,
    "  SecureNet=symlink://freeink-sdk/libs/network/SecureNet\n"
    "  NearbyTransfer=symlink://freeink-sdk/libs/network/NearbyTransfer\n",
    "  SecureNet=symlink://freeink-sdk/libs/network/SecureNet\n"
    "  NearbyTransfer=symlink://freeink-sdk/libs/network/NearbyTransfer\n"
    "  BleKeyboardHost=symlink://lib/BleKeyboardHost\n",
    "BLE HID dependencies",
)
replace_once(
    pio,
    "  -DARDUINO_USB_CDC_ON_BOOT=1\n",
    "  -DARDUINO_USB_CDC_ON_BOOT=1\n"
    "  -DFREEINK_CAP_BLE_HID_HOST=1\n"
    "  -DFREEINK_BLE_HID_SHOW_UNNAMED_DEVICES=0\n",
    "BLE HID build flags",
)

keyboard_h = root / "src/MappedInputManager.h"
replace_once(
    keyboard_h,
    "  void injectRelease(Button button) const { injectedReleases[static_cast<size_t>(button)] = true; }\n",
    "  void injectRelease(Button button) const { injectedReleases[static_cast<size_t>(button)] = true; }\n"
    "  void injectRemoteTap(Button button) const {\n"
    "    remotePressed[static_cast<size_t>(button)] = true;\n"
    "    remoteReleased[static_cast<size_t>(button)] = true;\n"
    "  }\n"
    "  void clearRemoteTaps() const { remotePressed.fill(false); remoteReleased.fill(false); }\n",
    "synthetic remote input declaration",
)
replace_once(
    keyboard_h,
    "  mutable std::array<bool, BUTTON_COUNT> injectedReleases{};\n",
    "  mutable std::array<bool, BUTTON_COUNT> injectedReleases{};\n"
    "  mutable std::array<bool, BUTTON_COUNT> remotePressed{};\n"
    "  mutable std::array<bool, BUTTON_COUNT> remoteReleased{};\n",
    "synthetic remote input state",
)
keyboard_cpp = root / "src/MappedInputManager.cpp"
replace_once(
    keyboard_cpp,
    "bool MappedInputManager::wasPressed(const Button button) const {\n",
    "bool MappedInputManager::wasPressed(const Button button) const {\n"
    "  if (remotePressed[static_cast<size_t>(button)]) return true;\n",
    "remote press routing",
)
replace_once(
    keyboard_cpp,
    "bool MappedInputManager::wasReleased(const Button button) const {\n",
    "bool MappedInputManager::wasReleased(const Button button) const {\n"
    "  if (remoteReleased[static_cast<size_t>(button)]) return true;\n",
    "remote release routing",
)

settings_h = root / "src/activities/settings/SettingsActivity.h"
replace_once(
    settings_h,
    "  ControlsSideButtons,\n  ControlsTapsGestures,\n",
    "  ControlsSideButtons,\n  BluetoothPageTurner,\n  ControlsTapsGestures,\n",
    "settings action enum",
)
settings_cpp = root / "src/activities/settings/SettingsActivity.cpp"
replace_once(
    settings_cpp,
    '#include "ButtonRemapActivity.h"\n',
    '#include "ButtonRemapActivity.h"\n#include "X4PageTurnerSettingsActivity.h"\n',
    "settings activity include",
)
replace_once(
    settings_cpp,
    "constexpr size_t controlsParentBaseCount = 4;",
    "constexpr size_t controlsParentBaseCount = 5;",
    "controls parent count",
)
replace_once(
    settings_cpp,
    "      case SettingAction::Network:\n",
    "      case SettingAction::BluetoothPageTurner:\n"
    "        startActivityForResult(std::make_unique<X4PageTurnerSettingsActivity>(renderer, mappedInput), resultHandler);\n"
    "        break;\n"
    "      case SettingAction::Network:\n",
    "settings activity launcher",
)
settings_list = root / "src/SettingsList.h"
replace_once(
    settings_list,
    "  settings.reserve(3 + (hasHomeKey ? 1u : 0u) + (hasFrontButtons ? 1u : 0u) +",
    "  settings.reserve(4 + (hasHomeKey ? 1u : 0u) + (hasFrontButtons ? 1u : 0u) +",
    "controls menu capacity",
)
replace_once(
    settings_list,
    "  settings.push_back(SettingInfo::Action(StrId::STR_QUICK_ACTIONS, SettingAction::QuickActions));\n",
    "  settings.push_back(SettingInfo::Action(StrId::STR_QUICK_ACTIONS, SettingAction::QuickActions));\n"
    "  settings.push_back(SettingInfo::Action(StrId::STR_BLUETOOTH_PAGE_TURNER, SettingAction::BluetoothPageTurner));\n",
    "controls menu entry",
)
english = root / "lib/I18n/translations/english.yaml"
with english.open("a") as f:
    f.write('\nSTR_BLUETOOTH_PAGE_TURNER: "Bluetooth Page Turner"\n')

main = root / "src/main.cpp"
replace_once(
    main,
    '#include "MappedInputManager.h"\n',
    '#include "MappedInputManager.h"\n#include "X4PageTurner.h"\n',
    "main remote include",
)
replace_once(
    main,
    "  mappedInputManager.update();\n#ifdef SIMULATOR\n",
    "  mappedInputManager.update();\n"
    "  mappedInputManager.clearRemoteTaps();\n"
    "  X4PageTurner::service(activityManager.isReaderActivity() &&\n"
    "                            !buttonShortcutController.isQuickLocked(), mappedInputManager);\n"
    "#ifdef SIMULATOR\n",
    "main remote input service",
)
replace_once(
    main,
    "  if (!isSilentReboot || snapshotTarget != SILENT_REBOOT_TARGET_READER) {\n"
    "    clearSilentRestartReaderPageBuild();\n"
    "  }\n\n"
    "  gpio.begin();",
    "  if (!isSilentReboot || snapshotTarget != SILENT_REBOOT_TARGET_READER) {\n"
    "    clearSilentRestartReaderPageBuild();\n"
    "  }\n\n"
    "  X4PageTurner::earlyStartIfRequested(!isNetworkResume && !rebootedFromPanic);\n"
    "  gpio.begin();",
    "early BLE startup before normal reader heap allocations",
)
replace_once(
    main,
    "  if (userInputReceived || activityManager.preventAutoSleep()) {",
    "  if (userInputReceived || activityManager.preventAutoSleep() || X4PageTurner::enabled()) {",
    "keep BLE at normal CPU frequency only while explicitly ON",
)

assert (dst / "src/BleKeyboardHost.cpp").exists()
assert "BleKeyboardHost" in pio.read_text()
assert "BluetoothPageTurner" in settings_cpp.read_text()
print("Applied X4 Pro BLE keyboard page-turner host, controls menu, and NVS on/off")
