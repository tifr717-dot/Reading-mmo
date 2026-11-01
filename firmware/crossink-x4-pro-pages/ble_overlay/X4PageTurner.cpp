#include "X4PageTurner.h"

#include <Arduino.h>
#include <atomic>
#include "MappedInputManager.h"
#include "activities/Activity.h"
#include "activities/ActivityManager.h"

#ifndef SIMULATOR
#include <BleKeyboardHost.h>
#include <Preferences.h>
#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
#include <freertos/task.h>
#include <cstdio>
#include <cstring>
#endif

namespace X4PageTurner {
namespace {
// Never persist Bluetooth ON: a stalled BLE stack must not break the next boot.
std::atomic<bool> cachedEnabled{false};
std::atomic<bool> pairingOpen{false};
int nextKey = -1;
int previousKey = -1;

#ifndef SIMULATOR
enum class WorkKind : uint8_t { None = 0, Start, Stop, Scan, Connect, ForgetAll, Poll };
struct WorkItem {
  WorkKind kind = WorkKind::None;
  uint32_t durationMs = 0;
  char address[18] = {};
};
std::atomic<BluetoothState> currentState{BluetoothState::Off};
std::atomic<WorkKind> currentWork{WorkKind::None};
std::atomic<uint32_t> workStartedAt{0};
QueueHandle_t workQueue = nullptr;
TaskHandle_t workTask = nullptr;
bool requestedOn = false;  // accessed only from the Arduino main input loop

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
void workStart(WorkKind kind) {
  workStartedAt.store(millis());
  currentWork.store(kind);
}
void workStop() { currentWork.store(WorkKind::None); }

// All potentially blocking Arduino-ESP32 BLE calls run on this dedicated task.
// BLEDevice::init() in Arduino-ESP32 3.3.7 waits without a timeout for NimBLE
// sync; doing that in loop() permanently froze ALL e-reader buttons and menus.
void bluetoothWorker(void*) {
  WorkItem item;
  for (;;) {
    // With Bluetooth OFF, sleep until an explicit command. Do not wake the
    // processor every 60 ms and waste the battery merely because ON was tried.
    const TickType_t wait = BleHid.isRunning() ? pdMS_TO_TICKS(60) : portMAX_DELAY;
    if (xQueueReceive(workQueue, &item, wait) == pdTRUE) {
      workStart(item.kind);
      switch (item.kind) {
        case WorkKind::Start:
          currentState.store(BluetoothState::Starting);
          if (!BleHid.isRunning()) {
            const bool ok = BleHid.begin("X4 Pro Page Turner");
            currentState.store(ok ? BluetoothState::Ready : BluetoothState::Failed);
          } else {
            currentState.store(BluetoothState::Ready);
          }
          break;
        case WorkKind::Stop:
          currentState.store(BluetoothState::Stopping);
          if (BleHid.isRunning()) BleHid.end();
          currentState.store(BluetoothState::Off);
          break;
        case WorkKind::Scan:
          if (BleHid.isRunning()) BleHid.startScan(item.durationMs);
          break;
        case WorkKind::Connect:
          if (BleHid.isRunning()) BleHid.connect(item.address);
          break;
        case WorkKind::ForgetAll:
          if (BleHid.isRunning()) {
            while (BleHid.pairedCount()) {
              char addr[18];
              snprintf(addr, sizeof(addr), "%s", BleHid.paired(0).addr);
              BleHid.forget(addr);
            }
          }
          break;
        case WorkKind::None:
        case WorkKind::Poll:
          break;
      }
      workStop();
    }

    if (BleHid.isRunning()) {
      workStart(WorkKind::Poll);
      // No automatic reconnect: a remembered sleeping remote must never
      // silently trigger an unbounded GATT connect. Use Scan & Pair explicitly.
      BleHid.poll(false);
      workStop();
    }
  }
}

bool ensureWorker() {
  if (workQueue && workTask) return true;
  if (!workQueue) workQueue = xQueueCreate(8, sizeof(WorkItem));
  if (!workQueue) return false;
  if (!workTask &&
      xTaskCreate(bluetoothWorker, "x4-ble-worker", 8192, nullptr, 1, &workTask) != pdPASS) {
    currentState.store(BluetoothState::Failed);
    return false;
  }
  return true;
}
bool queueWork(const WorkItem& item) {
  return workQueue && xQueueSend(workQueue, &item, 0) == pdTRUE;
}
bool queueSimple(WorkKind kind) {
  WorkItem item{};
  item.kind = kind;
  return queueWork(item);
}
#endif
}

bool enabled() { return cachedEnabled.load(); }
void setEnabled(bool on) { cachedEnabled.store(on); }
bool pairingScreenOpen() { return pairingOpen.load(); }
void setPairingScreenOpen(bool open) { pairingOpen.store(open); }

BluetoothState bluetoothState() {
#ifndef SIMULATOR
  return currentState.load();
#else
  return BluetoothState::Off;
#endif
}
uint8_t takeLastBluetoothTimeout() {
#ifndef SIMULATOR
  const uint8_t code = readByte("ble-stall", 0);
  if (code) {
    Preferences p;
    if (p.begin("x4-turner", false)) {
      p.remove("ble-stall");
      p.end();
    }
  }
  return code;
#else
  return 0;
#endif
}
bool requestScan(uint32_t durationMs) {
#ifndef SIMULATOR
  if (!enabled()) return false;
  WorkItem item{};
  item.kind = WorkKind::Scan;
  item.durationMs = durationMs;
  return queueWork(item);
#else
  (void)durationMs;
  return false;
#endif
}
bool requestConnect(const char* address) {
#ifndef SIMULATOR
  if (!enabled() || !address || !*address) return false;
  WorkItem item{};
  item.kind = WorkKind::Connect;
  snprintf(item.address, sizeof(item.address), "%s", address);
  return queueWork(item);
#else
  (void)address;
  return false;
#endif
}
bool requestForgetAll() {
#ifndef SIMULATOR
  return enabled() && queueSimple(WorkKind::ForgetAll);
#else
  return false;
#endif
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
void bindNext(uint8_t usage) {
  nextKey = usage;
#ifndef SIMULATOR
  writeByte("next", usage);
#endif
}
void bindPrevious(uint8_t usage) {
  previousKey = usage;
#ifndef SIMULATOR
  writeByte("prev", usage);
#endif
}

void service(bool readerInFront, MappedInputManager& input) {
#ifndef SIMULATOR
  // An Arduino BLE call taking too long is never allowed to lock the UI.
  // A controlled reboot also frees a possibly wedged BLE controller/task.
  const auto operation = currentWork.load();
  const uint32_t opSince = workStartedAt.load();
  if (operation != WorkKind::None && millis() - opSince > 20000) {
    writeByte("ble-stall", static_cast<uint8_t>(operation));
    cachedEnabled.store(false);
    delay(50);
    ESP.restart();  // Bluetooth always comes back OFF after any restart.
    return;
  }

  const bool want = enabled();
  if (want && !requestedOn) {
    if (bluetoothState() == BluetoothState::Failed || !ensureWorker() ||
        !queueSimple(WorkKind::Start)) {
      cachedEnabled.store(false);
      return;
    }
    requestedOn = true;
  } else if (!want && requestedOn) {
    if (queueSimple(WorkKind::Stop)) requestedOn = false;
  }

  if (!want || !BleHid.isConnected()) return;
  if (!readerInFront || pairingScreenOpen()) {
    if (!pairingScreenOpen()) {
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
}  // namespace X4PageTurner
