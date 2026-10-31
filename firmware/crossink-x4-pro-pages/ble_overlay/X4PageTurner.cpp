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
int cachedEnabled = -1;
int nextKey = -1;
int previousKey = -1;
int cachedBond = -1;
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
bool hasBond() {
  if (cachedBond != -1) return cachedBond == 1;
  Preferences p;
  if (!p.begin("freeink-hid", true)) return false;
  cachedBond = p.getUChar("n", 0) > 0 ? 1 : 0;
  p.end();
  return cachedBond == 1;
}
#endif
}

bool enabled() {
  if (cachedEnabled == -1) {
#ifdef SIMULATOR
    cachedEnabled = 0;
#else
    cachedEnabled = readByte("enabled", 0) ? 1 : 0;
#endif
  }
  return cachedEnabled == 1;
}
void setEnabled(const bool on) {
  cachedEnabled = on ? 1 : 0;
#ifndef SIMULATOR
  writeByte("enabled", static_cast<uint8_t>(on));
#endif
}
bool pairingScreenOpen() { return pairingOpen; }
void setPairingScreenOpen(const bool open) {
#ifndef SIMULATOR
  if (pairingOpen && !open) cachedBond = -1;
#endif
  pairingOpen = open;
}

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
  // Off means no scanning, no connection, and a fully deinitialised controller.
  // A saved bond is retained in NVS for next time. Network-mode Reading Journal
  // never opens this host, so its existing BLE server has exclusive radio use.
  const bool desired = enabled() && (pairingOpen || (readerInFront && hasBond()));
  if (!desired) {
    if (BleHid.isRunning()) BleHid.end();
    return;
  }
  if (!BleHid.isRunning()) {
    if (lastStartAttemptMs && millis() - lastStartAttemptMs < 5000) return;
    lastStartAttemptMs = millis();
    if (!BleHid.begin("X4 Pro Page Turner")) return;
  }

  BleHid.poll();
  if (!readerInFront || pairingOpen) return;

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
