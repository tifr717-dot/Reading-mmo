#include "X4PageTurnerSettingsActivity.h"

#include <Arduino.h>
#include <GfxRenderer.h>
#include <algorithm>
#include <cstring>

#include "X4PageTurner.h"
#include "MappedInputManager.h"
#include "activities/ActivityManager.h"
#include "components/TouchHeaderBackButton.h"
#include "components/UITheme.h"
#include "fontIds.h"

#ifndef SIMULATOR
#include <BleKeyboardHost.h>
#endif

void X4PageTurnerSettingsActivity::onEnter() {
  Activity::onEnter();
  X4PageTurner::setPairingScreenOpen(true);
  const uint8_t lastStall = X4PageTurner::takeLastBluetoothTimeout();
  if (lastStall >= 0x40 && lastStall <= 0x45) {
    switch (lastStall - 0x40) {
      case 1: notice = "Pairing stalled: stopping scan (OFF)"; break;
      case 2: notice = "Pairing stalled: BLE link (OFF)"; break;
      case 3: notice = "Pairing stalled: HID discovery (OFF)"; break;
      case 4: notice = "Pairing stalled: HID reports (OFF)"; break;
      case 5: notice = "Pairing stalled after link setup (OFF)"; break;
      default: notice = "Pairing stalled before starting (OFF)"; break;
    }
  } else if (lastStall == 12)
    notice = "BLE controller did not sync (stage 2)";
  else if (lastStall >= 11 && lastStall <= 15)
    notice = "Bluetooth startup failed; recovered OFF";
  else if (lastStall)
    notice = "Bluetooth stalled; restarted safely (OFF)";
  requestUpdate();
}

void X4PageTurnerSettingsActivity::onExit() {
  X4PageTurner::setPairingScreenOpen(false);
  Activity::onExit();
}

void X4PageTurnerSettingsActivity::close() { finish(); }

void X4PageTurnerSettingsActivity::choose() {
  if (selection == 0) {
    const bool enabling = !X4PageTurner::enabled();
    X4PageTurner::setEnabled(enabling);
    notice = enabling
        ? (X4PageTurner::enableRestartPending() ? "Restarting once to start Bluetooth..."
                                                : "Could not schedule Bluetooth startup")
        : "Off: no Bluetooth power used";
  } else if (!X4PageTurner::enabled()) {
    notice = "Turn the page turner on first";
#ifndef SIMULATOR
  } else if (selection == 1) {
    if (X4PageTurner::requestScan(8000)) {
      view = View::Scan;
      scanSelection = 0;
      scanStartedMs = millis();
    } else notice = "Bluetooth starting. Try Scan again.";
  } else if (selection == 2) {
    view = View::LearnNext;
    notice = "Press the remote button for NEXT";
  } else if (selection == 3) {
    view = View::LearnPrevious;
    notice = "Press the remote button for PREVIOUS";
  } else if (selection == 4) {
    view = View::Tester;
    testerLastUsage = 0;
    testerLastModifiers = 0;
    freeink::KeyEvent ignored;
    while (BleHid.popKey(ignored)) {}
    freeink::HidReportSnapshot report{};
    BleHid.copyLastReport(report);
    testerStartReports = report.count;
    testerLastReports = report.count;
    testerLastProtocolStatus = 0xFF;
    testerLastProtocolMode = 0xFF;
    notice = "Tap NEXT/PREV; Confirm changes HID mode";
  } else if (selection == 5) {
    notice = X4PageTurner::requestForgetAll() ? "Removing saved pairings..."
                                                : "Bluetooth starting. Try again.";
#endif
  } else {
    notice = "Bluetooth is starting. Try again.";
  }
  requestUpdate();
}

void X4PageTurnerSettingsActivity::loop() {
#ifndef SIMULATOR
  const int liveState = static_cast<int>(X4PageTurner::bluetoothState());
  const int liveStage = static_cast<int>(BleHid.connectionStage());
  if (liveState != lastRuntimeState || liveStage != lastConnectionStage) {
    lastRuntimeState = liveState;
    lastConnectionStage = liveStage;
    requestUpdate();
  }
#endif
  if (TouchHeaderBackButton::wasTapped(mappedInput, renderer) ||
      mappedInput.wasPressed(MappedInputManager::Button::Back) ||
      mappedInput.wasReleased(MappedInputManager::Button::PageBack)) {
    if (view == View::Menu) close();
    else view = View::Menu;
    requestUpdate();
    return;
  }
#ifndef SIMULATOR
  if (X4PageTurner::enabled() && BleHid.isRunning()) {
    if (view == View::LearnNext || view == View::LearnPrevious) {
      freeink::KeyEvent ev;
      while (BleHid.popKey(ev)) {
        if (!ev.pressed || ev.keycode == 0) continue;
        if (view == View::LearnNext) X4PageTurner::bindNext(ev.keycode, ev.mods);
        else X4PageTurner::bindPrevious(ev.keycode, ev.mods);
        notice = "Button learned and saved";
        view = View::Menu;
        requestUpdate();
        break;
      }
    }
    if (view == View::Tester) {
      // The tester consumes decoded key events without injecting page turns.
      freeink::HidReportSnapshot report{};
      if (BleHid.copyLastReport(report) && report.count != testerLastReports) {
        testerLastReports = report.count;
        requestUpdate();
      }
      freeink::HidConnectionDiagnostics diag{};
      if (BleHid.copyConnectionDiagnostics(diag) &&
          (diag.protocolModeStatus != testerLastProtocolStatus ||
           diag.protocolMode != testerLastProtocolMode)) {
        testerLastProtocolStatus = diag.protocolModeStatus;
        testerLastProtocolMode = diag.protocolMode;
        requestUpdate();
      }
      freeink::KeyEvent ev;
      while (BleHid.popKey(ev)) {
        if (!ev.pressed) continue;
        testerLastUsage = ev.keycode;
        testerLastModifiers = ev.mods;
        requestUpdate();
      }
    }
    char connectionError[48];
    if (BleHid.takeConnectFailure(connectionError, sizeof(connectionError))) {
      view = View::Menu;
      if (std::strcmp(connectionError, "Remote unavailable") == 0)
        notice = "Remote unavailable: turn OFF then ON";
      else if (std::strcmp(connectionError, "No HID input report") == 0)
        notice = "No HID input: check remote keyboard mode";
      else if (std::strcmp(connectionError, "No HID CCCD descriptors") == 0 ||
               std::strcmp(connectionError, "HID subscription write failed") == 0 ||
               std::strcmp(connectionError, "No HID notify characteristics") == 0)
        notice = "Input setup failed; open Button Input Tester";
      else if (std::strcmp(connectionError, "Remote dropped during pairing") == 0)
        notice = "Remote dropped during security handshake";
      else
        notice = "Pairing failed: turn OFF then ON";
      requestUpdate();
    }
    if (view == View::Scan && BleHid.isConnected()) {
      view = View::Menu;
      notice = "Remote connected and saved";
      requestUpdate();
    }
    const int connectionState = BleHid.isConnected() ? 2 : BleHid.isConnecting() ? 1 : 0;
    const int runtimeState = static_cast<int>(X4PageTurner::bluetoothState());
    if (connectionState != lastConnectionState || runtimeState != lastRuntimeState) {
      lastConnectionState = connectionState;
      lastRuntimeState = runtimeState;
      requestUpdate();
    }
    if (view == View::Scan && millis() - scanStartedMs < 10000 && millis() % 2000 < 40) requestUpdate();
  }
#endif
  if (view == View::Tester) {
#ifndef SIMULATOR
    if (mappedInput.wasPressed(MappedInputManager::Button::Confirm)) {
      freeink::HidConnectionDiagnostics diag{};
      BleHid.copyConnectionDiagnostics(diag);
      if (!BleHid.isConnected()) notice = "Connect the remote first";
      else if (diag.protocolModeStatus == 0) notice = "No HID Protocol Mode characteristic";
      else if (diag.protocolModeStatus == 1)
        notice = "Mode needs response-write; skipped safely";
      else {
        const uint8_t newMode = diag.protocolMode == 1 ? 0 : 1;
        notice = X4PageTurner::requestProtocolMode(newMode)
            ? (newMode == 0 ? "Requesting Boot mode..." : "Requesting Report mode...")
            : "Mode switch queue unavailable";
      }
      requestUpdate();
    }
#endif
    return;
  }
  if (view == View::LearnNext || view == View::LearnPrevious) return;

  const int maxIndex =
#ifndef SIMULATOR
      view == View::Scan ? std::max(0, std::min(5, static_cast<int>(BleHid.deviceCount())) - 1) : 5;
#else
      5;
#endif
  if (mappedInput.wasPressed(MappedInputManager::Button::Up)) {
    if (view == View::Scan) scanSelection = std::max(0, scanSelection - 1);
    else selection = std::max(0, selection - 1);
    requestUpdate();
    return;
  }
  if (mappedInput.wasPressed(MappedInputManager::Button::Down)) {
    if (view == View::Scan) scanSelection = std::min(maxIndex, scanSelection + 1);
    else selection = std::min(maxIndex, selection + 1);
    requestUpdate();
    return;
  }
#if CROSSINK_APP_CAP_TOUCH
  int x = 0, y = 0;
  const int tapTop = view == View::Menu ? 108 : 115;
  const int tapRow = view == View::Menu ? 72 : 82;
  const int tapCount = view == View::Menu ? 6 : 5;
  if (mappedInput.wasScreenTapped(x, y) && y >= tapTop && y < tapTop + tapCount * tapRow) {
    if (view == View::Scan) scanSelection = std::clamp((y - tapTop) / tapRow, 0, maxIndex);
    else selection = std::clamp((y - tapTop) / tapRow, 0, maxIndex);
    if (view == View::Menu) choose();
#ifndef SIMULATOR
    else if (view == View::Scan && BleHid.deviceCount() > 0) {
      freeink::DiscoveredDevice selected{};
      if (!BleHid.copyDevice(static_cast<uint8_t>(scanSelection), selected) ||
          !X4PageTurner::requestConnect(selected.addr)) {
        notice = "Connection queue unavailable";
        view = View::Menu;
        requestUpdate();
      } else {
        notice = "Connecting in background...";
        requestUpdate();
      }
    }
#endif
    return;
  }
#endif
  if (mappedInput.wasPressed(MappedInputManager::Button::Confirm)) {
    if (view == View::Menu) choose();
#ifndef SIMULATOR
    else if (view == View::Scan && BleHid.deviceCount() > 0) {
      freeink::DiscoveredDevice selected{};
      if (!BleHid.copyDevice(static_cast<uint8_t>(scanSelection), selected) ||
          !X4PageTurner::requestConnect(selected.addr)) {
        notice = "Connection queue unavailable";
        view = View::Menu;
        requestUpdate();
      } else {
        notice = "Connecting in background...";
        requestUpdate();
      }
    }
#endif
  }
}

void X4PageTurnerSettingsActivity::render(RenderLock&&) {
  const auto& m = UITheme::getInstance().getMetrics();
  const int width = renderer.getScreenWidth();
  renderer.clearScreen();
  const Rect header{0, m.topPadding, width, TouchHeaderBackButton::height(m, mappedInput)};
  if (mappedInput.hasTouchHardware()) TouchHeaderBackButton::draw(renderer, header, "Bluetooth Page Turner", false);
  else GUI.drawHeader(renderer, header, "Bluetooth Page Turner");

  if (view == View::Menu) {
    const char* rows[] = {"", "Scan & Pair Remote", "Learn Next Button",
                          "Learn Previous Button", "Button Input Tester",
                          "Forget Paired Remotes"};
    char first[56];
    snprintf(first, sizeof(first), "Page Turner: %s", X4PageTurner::enabled() ? "ON" : "OFF");
    rows[0] = first;
    for (int i = 0; i < 6; ++i) {
      const int y = 120 + i * 72;
      renderer.drawText(UI_12_FONT_ID, 25, y, i == selection ? ">" : " ", true, EpdFontFamily::BOLD);
      renderer.drawText(UI_10_FONT_ID, 58, y, rows[i], true, i == selection ? EpdFontFamily::BOLD : EpdFontFamily::REGULAR);
      renderer.drawLine(26, y + 37, width - 26, y + 37, true);
    }
#ifndef SIMULATOR
    const auto state = X4PageTurner::bluetoothState();
    const char* status = X4PageTurner::enableRestartPending() ? "Restarting for early Bluetooth startup..." :
        state == X4PageTurner::BluetoothState::Failed ? "Bluetooth failed: restart device" :
        !X4PageTurner::enabled() ? "Radio off (pairings saved)" :
        state == X4PageTurner::BluetoothState::Stopping ? "Stopping Bluetooth..." :
        !BleHid.isRunning() ? "Starting Bluetooth in background..." :
        BleHid.isConnected() ? "Remote connected" :
        BleHid.isConnecting() ? "Connecting to saved remote..." :
        BleHid.pairedCount() ? "Saved remote: Scan to connect" : "No remote paired";
    renderer.drawCenteredText(SMALL_FONT_ID, 570, status);
    renderer.drawCenteredText(SMALL_FONT_ID, 600, "ON needs one restart; normal boots start OFF");
#endif
  } else if (view == View::Scan) {
#ifndef SIMULATOR
    renderer.drawCenteredText(UI_10_FONT_ID, 85, BleHid.isScanning() ? "Searching for Bluetooth remotes..." : "Select a device");
    const int count = std::min(5, static_cast<int>(BleHid.deviceCount()));
    for (int i = 0; i < count; ++i) {
      freeink::DiscoveredDevice item{};
      if (!BleHid.copyDevice(static_cast<uint8_t>(i), item)) continue;
      const int y = 128 + i * 82;
      renderer.drawText(UI_12_FONT_ID, 25, y, i == scanSelection ? ">" : " ", true, EpdFontFamily::BOLD);
      renderer.drawText(UI_10_FONT_ID, 58, y, item.name[0] ? item.name : item.addr, true,
                        i == scanSelection ? EpdFontFamily::BOLD : EpdFontFamily::REGULAR);
      renderer.drawLine(26, y + 37, width - 26, y + 37, true);
    }
    if (count == 0) renderer.drawCenteredText(UI_10_FONT_ID, 215, "Hold remote pairing button for 3 sec");
    if (BleHid.isConnecting()) {
      const char* stageLabel = "Starting connection...";
      switch (BleHid.connectionStage()) {
        case 1: stageLabel = "Stopping Bluetooth scan..."; break;
        case 2: stageLabel = "Connecting Bluetooth link..."; break;
        case 3: stageLabel = "Finding keyboard service..."; break;
        case 4: stageLabel = "Subscribing to button reports..."; break;
        case 5: stageLabel = "Finishing connection..."; break;
        default: break;
      }
      renderer.drawCenteredText(UI_10_FONT_ID, 570, stageLabel);
    }
#else
    renderer.drawCenteredText(UI_10_FONT_ID, 215, "Bluetooth unavailable in simulator");
#endif
  } else if (view == View::Tester) {
#ifndef SIMULATOR
    freeink::HidReportSnapshot report{};
    freeink::HidConnectionDiagnostics diag{};
    BleHid.copyLastReport(report);
    BleHid.copyConnectionDiagnostics(diag);
    const uint32_t sinceOpen = report.count - testerStartReports;
    char line[96];
    renderer.drawCenteredText(UI_12_FONT_ID, 102, "Button Input Tester v8", true, EpdFontFamily::BOLD);
    const char* security = "Not attempted";
    switch (diag.securityState) {
      case 1: security = "Pairing requested"; break;
      case 2: security = "Link encrypted"; break;
      case 3: security = "Pairing timed out"; break;
      case 4: security = "Pairing request failed"; break;
      default: break;
    }
    snprintf(line, sizeof(line), "Security: %s (code %d)", security, static_cast<int>(diag.securityResult));
    renderer.drawCenteredText(SMALL_FONT_ID, 145, line);
    snprintf(line, sizeof(line), "HID inputs %u   CCCD %u   subscribed %u",
             diag.inputChannels, diag.cccdChannels, diag.subscriptions);
    renderer.drawCenteredText(UI_10_FONT_ID, 184, line);
    snprintf(line, sizeof(line), "Channel reports: %lu / %lu / %lu",
             static_cast<unsigned long>(diag.channelReports[0]),
             static_cast<unsigned long>(diag.channelReports[1]),
             static_cast<unsigned long>(diag.channelReports[2]));
    renderer.drawCenteredText(UI_10_FONT_ID, 224, line);
    snprintf(line, sizeof(line), "Handles: %04X / %04X / %04X",
             diag.channelHandles[0], diag.channelHandles[1], diag.channelHandles[2]);
    renderer.drawCenteredText(SMALL_FONT_ID, 258, line);
    const char* mode = "Not exposed";
    switch (diag.protocolModeStatus) {
      case 1: mode = "Needs response write (skipped)"; break;
      case 2: mode = "Report requested"; break;
      case 3: mode = "Boot requested"; break;
      case 4: mode = "Write failed"; break;
      default: break;
    }
    snprintf(line, sizeof(line), "HID mode: %s", mode);
    renderer.drawCenteredText(UI_10_FONT_ID, 300, line);
    const char* wake = diag.exitSuspendStatus == 2 ? "sent" :
                       diag.exitSuspendStatus == 1 ? "write unsupported" :
                       diag.exitSuspendStatus == 3 ? "failed" : "not exposed";
    snprintf(line, sizeof(line), "Exit Suspend: %s", wake);
    renderer.drawCenteredText(SMALL_FONT_ID, 338, line);
    snprintf(line, sizeof(line), "Report map: %s   Ref descriptors: %u",
             diag.reportMapPresent ? "found" : "missing", diag.reportReferenceCount);
    renderer.drawCenteredText(SMALL_FONT_ID, 376, line);
    snprintf(line, sizeof(line), "Button reports after opening: %lu",
             static_cast<unsigned long>(sinceOpen));
    renderer.drawCenteredText(UI_10_FONT_ID, 414, line);
    if (sinceOpen > 0) {
      snprintf(line, sizeof(line), "Last: %u bytes at %04X",
               static_cast<unsigned int>(report.length), static_cast<unsigned int>(report.handle));
      renderer.drawCenteredText(SMALL_FONT_ID, 447, line);
      char hex[48] = {0};
      const size_t displayed = std::min(static_cast<size_t>(report.length), sizeof(report.bytes));
      size_t pos = 0;
      for (size_t i = 0; i < displayed && pos + 4 < sizeof(hex); ++i)
        pos += snprintf(hex + pos, sizeof(hex) - pos, "%02X ", report.bytes[i]);
      renderer.drawCenteredText(SMALL_FONT_ID, 477, hex);
    } else {
      renderer.drawCenteredText(SMALL_FONT_ID, 463, "No notifications yet");
    }
    if (testerLastUsage) {
      snprintf(line, sizeof(line), "Key: 0x%02X   Mods: 0x%02X",
               testerLastUsage, testerLastModifiers);
      renderer.drawCenteredText(SMALL_FONT_ID, 505, line);
    } else renderer.drawCenteredText(SMALL_FONT_ID, 505, "No key decoded");
    renderer.drawCenteredText(UI_10_FONT_ID, 540, "Confirm: switch Boot / Report");
    renderer.drawCenteredText(SMALL_FONT_ID, 579,
                              BleHid.isConnected() ? "Link: connected" : "Link: not connected");
#else
    renderer.drawCenteredText(UI_10_FONT_ID, 250, "Input tester needs real Bluetooth hardware");
#endif
  } else {
    renderer.drawCenteredText(UI_12_FONT_ID, 190, "Press a Bluetooth remote button", true, EpdFontFamily::BOLD);
    renderer.drawCenteredText(UI_10_FONT_ID, 245,
                              view == View::LearnNext ? "Assign NEXT page" : "Assign PREVIOUS page");
    renderer.drawCenteredText(UI_10_FONT_ID, 295, "Press X4 Back or Previous to cancel");
  }
  renderer.drawCenteredText(SMALL_FONT_ID, 630, notice);
  const auto hints = mappedInput.mapLabels(mappedInput.withBackArrow("Back"), "Select", "Up", "Down");
  GUI.drawButtonHints(renderer, hints.btn1, hints.btn2, hints.btn3, hints.btn4);
  renderer.displayBuffer(transition.modeFor(static_cast<uint8_t>(view)));
}
