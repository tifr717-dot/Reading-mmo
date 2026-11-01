#include "X4PageTurnerSettingsActivity.h"

#include <Arduino.h>
#include <GfxRenderer.h>
#include <algorithm>

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
  requestUpdate();
}

void X4PageTurnerSettingsActivity::onExit() {
  X4PageTurner::setPairingScreenOpen(false);
  Activity::onExit();
}

void X4PageTurnerSettingsActivity::close() { finish(); }

void X4PageTurnerSettingsActivity::choose() {
  if (selection == 0) {
    X4PageTurner::setEnabled(!X4PageTurner::enabled());
    notice = X4PageTurner::enabled() ? "Enabled: connect a remote" : "Off: no Bluetooth power used";
  } else if (!X4PageTurner::enabled()) {
    notice = "Turn the page turner on first";
#ifndef SIMULATOR
  } else if (selection == 1 && BleHid.isRunning()) {
    view = View::Scan;
    scanSelection = 0;
    scanStartedMs = millis();
    BleHid.startScan(8000);
  } else if (selection == 2) {
    view = View::LearnNext;
    notice = "Press the remote button for NEXT";
  } else if (selection == 3) {
    view = View::LearnPrevious;
    notice = "Press the remote button for PREVIOUS";
  } else if (selection == 4 && BleHid.isRunning()) {
    for (int i = static_cast<int>(BleHid.pairedCount()) - 1; i >= 0; --i) {
      const auto& device = BleHid.paired(static_cast<uint8_t>(i));
      char addr[18];
      snprintf(addr, sizeof(addr), "%s", device.addr);
      BleHid.forget(addr);
    }
    notice = "Saved pairings removed";
#endif
  } else {
    notice = "Bluetooth is starting. Try again.";
  }
  requestUpdate();
}

void X4PageTurnerSettingsActivity::loop() {
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
        if (!ev.pressed || ev.keycode == 0 || ev.mods) continue;
        if (view == View::LearnNext) X4PageTurner::bindNext(ev.keycode);
        else X4PageTurner::bindPrevious(ev.keycode);
        notice = "Button learned and saved";
        view = View::Menu;
        requestUpdate();
        break;
      }
    }
    if (view == View::Scan && BleHid.isConnected()) {
      view = View::Menu;
      notice = "Remote connected and saved";
      requestUpdate();
    }
    const int connectionState = BleHid.isConnected() ? 2 : BleHid.isConnecting() ? 1 : 0;
    if (connectionState != lastConnectionState) {
      lastConnectionState = connectionState;
      requestUpdate();
    }
    if (view == View::Scan && millis() - scanStartedMs < 10000 && millis() % 2000 < 40) requestUpdate();
  }
#endif
  if (view == View::LearnNext || view == View::LearnPrevious) return;

  const int maxIndex =
#ifndef SIMULATOR
      view == View::Scan ? std::max(0, std::min(5, static_cast<int>(BleHid.deviceCount())) - 1) : 4;
#else
      4;
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
  if (mappedInput.wasScreenTapped(x, y) && y >= 115 && y < 115 + 5 * 82) {
    if (view == View::Scan) scanSelection = std::clamp((y - 115) / 82, 0, maxIndex);
    else selection = std::clamp((y - 115) / 82, 0, maxIndex);
    if (view == View::Menu) choose();
#ifndef SIMULATOR
    else if (BleHid.deviceCount() > 0) {
      if (!BleHid.connect(BleHid.device(static_cast<uint8_t>(scanSelection)).addr)) {
        notice = "Connection failed: toggle OFF, then ON";
        view = View::Menu;
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
    else if (BleHid.deviceCount() > 0) {
      if (!BleHid.connect(BleHid.device(static_cast<uint8_t>(scanSelection)).addr)) {
        notice = "Connection failed: toggle OFF, then ON";
        view = View::Menu;
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
    const char* rows[] = {"", "Scan & Pair Remote", "Learn Next Button", "Learn Previous Button", "Forget Paired Remotes"};
    char first[56];
    snprintf(first, sizeof(first), "Page Turner: %s", X4PageTurner::enabled() ? "ON" : "OFF");
    rows[0] = first;
    for (int i = 0; i < 5; ++i) {
      const int y = 128 + i * 82;
      renderer.drawText(UI_12_FONT_ID, 25, y, i == selection ? ">" : " ", true, EpdFontFamily::BOLD);
      renderer.drawText(UI_10_FONT_ID, 58, y, rows[i], true, i == selection ? EpdFontFamily::BOLD : EpdFontFamily::REGULAR);
      renderer.drawLine(26, y + 37, width - 26, y + 37, true);
    }
#ifndef SIMULATOR
    const char* status = !X4PageTurner::enabled() ? "Radio off (pairings saved)" :
        !BleHid.isRunning() ? "Starting Bluetooth..." :
        BleHid.isConnected() ? "Remote connected" :
        BleHid.isConnecting() ? "Connecting to saved remote..." :
        BleHid.pairedCount() ? "Saved remote: OFF/ON to retry" : "No remote paired";
    renderer.drawCenteredText(SMALL_FONT_ID, 570, status);
    renderer.drawCenteredText(SMALL_FONT_ID, 600, "Starts OFF after every restart");
#endif
  } else if (view == View::Scan) {
#ifndef SIMULATOR
    renderer.drawCenteredText(UI_10_FONT_ID, 85, BleHid.isScanning() ? "Searching for Bluetooth remotes..." : "Select a device");
    const int count = std::min(5, static_cast<int>(BleHid.deviceCount()));
    for (int i = 0; i < count; ++i) {
      const auto& item = BleHid.device(static_cast<uint8_t>(i));
      const int y = 128 + i * 82;
      renderer.drawText(UI_12_FONT_ID, 25, y, i == scanSelection ? ">" : " ", true, EpdFontFamily::BOLD);
      renderer.drawText(UI_10_FONT_ID, 58, y, item.name[0] ? item.name : item.addr, true,
                        i == scanSelection ? EpdFontFamily::BOLD : EpdFontFamily::REGULAR);
      renderer.drawLine(26, y + 37, width - 26, y + 37, true);
    }
    if (count == 0) renderer.drawCenteredText(UI_10_FONT_ID, 215, "Hold remote pairing button for 3 sec");
    if (BleHid.isConnecting()) renderer.drawCenteredText(UI_10_FONT_ID, 570, "Pairing...");
#else
    renderer.drawCenteredText(UI_10_FONT_ID, 215, "Bluetooth unavailable in simulator");
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
