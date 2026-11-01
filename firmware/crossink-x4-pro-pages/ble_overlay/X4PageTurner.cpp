#include "X4PageTurner.h"

#include <Arduino.h>
#include "MappedInputManager.h"
#include "activities/Activity.h"
#include "activities/ActivityManager.h"

#ifndef SIMULATOR
#include <BleKeyboardHost.h>
#include <Preferences.h>
#endif

namespace X4PageTurner {
namespace {
bool pairingOpen = false;
// The radio defaults OFF at EVERY boot, even if the v1 NVS key was ON.
// A crash must never persist an active BLE host into the next reading session.
int cachedEnabled = 0;
int nextKey = -1;
int previousKey = -1;
uint32_t lastStartAttemptMs = 0;

#ifndef SIMULATOR
uint8_t readByte(const char* key, const uint8_t defaultValue = 0) {
  Preferences p;
  if (!p.begin("x4-turner", true)) return defaultValue;
  const auto value = p.getUChar(key, defaultValue);
  p.end();
  return value;
}
void writeByte(const char* key, const uint8_t value) {
  Preferences p;
  if (!p.begin("x4-turner", false)) return;
  p.putUChar(key, value);
  p.end();
}
#endif
}

bool enabled() { return cachedEnabled == 1; }
void setEnabled(const bool on) {
  // Persist the remote bond + learned keys, but intentionally NEVER persist ON.
  cachedEnabled = on ? 1 : 0;
  if (!on) lastStartAttemptMs = 0;
}
bool pairingScreenOpen() { return pairingOpen; }
void setPairingScreenOpen(const bool open) { pairingOpen = open; }

uint8_t nextUsage() {
  if (nextKey == -1) {
#ifdef SIMULATOR
    nextKey = 0;
#else
    nextKey = readByte("next", 0);
#endif
  }
  return static_cast<uint8_t>(nextKey);
}
uint8_t previousUsage() {
  if (previousKey == -1) {
#ifdef SIMULATOR
    previousKey = 0;
#else
    previousKey = readByte("prev", 0);
#endif
  }
  return static_cast<uint8_t>(previousKey);
}
void bindNext(const uint8_t usage) {
  nextKey = usage;
#ifndef SIMULATOR
  writeByte("next", usage);
#endif
}
void bindPrevious(const uint8_t usage) {
  previousKey = usage;
#ifndef SIMULATOR
  writeByte("prev", usage);
#endif
}

void service(const bool readerInFront, MappedInputManager& input) {
#ifndef SIMULATOR
  // OFF deinitialises Bluetooth. ON stays active across menu transitions,
  // avoiding connection teardown when pressing the reader's Back button.
  // Bluetooth starts OFF after every reboot; NVS retains only remote mappings.
  // Reading Journal runs as a separate minimal-network reboot, not concurrently.
  const bool desired = enabled();
  if (!desired) {
    if (BleHid.isRunning()) BleHid.end();
    return;
  }
  if (!BleHid.isRunning()) {
    if (lastStartAttemptMs && millis() - lastStartAttemptMs < 5000) return;
    lastStartAttemptMs = millis();
    if (!BleHid.begin("X4 Pro Page Turner")) return;
  }

  // BLE reconnect can block while a remote sleeps. Allow that ONLY inside
  // this settings screen, never in the EPUB/XTC reading input loop.
  BleHid.poll(pairingOpen);
  if (!readerInFront || pairingOpen) {
    if (!pairingOpen) {
      // Drop stale remote clicks outside books; settings Learn needs its queue.
      freeink::KeyEvent ignored;
      while (BleHid.popKey(ignored)) {}
    }
    return;
  }

  freeink::KeyEvent key;
  while (BleHid.popKey(key)) {
    if (!key.pressed || key.mods != 0) continue;
    const uint8_t usage = key.keycode;
    const uint8_t prev = previousUsage();
    const uint8_t next = nextUsage();
    bool back = prev != 0 ? usage == prev
                          : (key.special == freeink::SpecialKey::Left ||
                             key.special == freeink::SpecialKey::PageUp ||
                             key.special == freeink::SpecialKey::Up ||
                             key.special == freeink::SpecialKey::Backspace);
    bool forward = next != 0 ? usage == next
                             : (key.special == freeink::SpecialKey::Right ||
                                key.special == freeink::SpecialKey::PageDown ||
                                key.special == freeink::SpecialKey::Down ||
                                key.ch == ' ');
    if (back && forward) continue;
    if (back) {
      input.injectRemoteTap(MappedInputManager::Button::PageBack);
      activityManager.notifyUserInput();
    } else if (forward) {
      input.injectRemoteTap(MappedInputManager::Button::PageForward);
      activityManager.notifyUserInput();
    }
  }
#else
  (void)readerInFront;
  (void)input;
#endif
}
}
