// X4 Pro BLE HID keyboard central using Arduino-ESP32's integrated BLE stack.
// Unlike a separate NimBLE-Arduino port, this shares the core's ESP32-S3 NimBLE
// implementation with the existing BLE Reading Journal server (never concurrently).
#include "BleKeyboardHost.h"
#include "HidKeymap.h"

#ifndef SIMULATOR
#include <BLEAddress.h>
#include <BLEAdvertisedDevice.h>
#include <BLEClient.h>
#include <BLEDevice.h>
#include <BLERemoteCharacteristic.h>
#include <BLERemoteService.h>
#include <BLEScan.h>
#include <BLESecurity.h>
#include <Preferences.h>
#include <cstdio>
#include <cstring>
#include <algorithm>

namespace {
BLEClient* activeClient = nullptr;
uint32_t lastReconnectMs = 0;
portMUX_TYPE keyMux = portMUX_INITIALIZER_UNLOCKED;

class HidScanCallbacks : public BLEAdvertisedDeviceCallbacks {
 public:
  void onResult(BLEAdvertisedDevice device) override {
    // BLE keyboards usually advertise service 1812, but some only supply a name.
    const bool hid = device.isAdvertisingService(BLEUUID(uint16_t(0x1812)));
    if (!hid && !device.haveName()) return;
    const String addr = device.getAddress().toString();
    const String name = device.haveName() ? device.getName() : String();
    BleHid.onScanResultIngest(addr.c_str(), name.c_str(), device.getRSSI(),
                              device.getAddressType(), hid, device.isConnectable());
  }
};
HidScanCallbacks scanCallbacks;

class HidConnectionCallbacks : public BLEClientCallbacks {
 public:
  void onDisconnect(BLEClient*) override { BleHid.onLinkDown(); }
};
HidConnectionCallbacks connectionCallbacks;

void scanComplete(BLEScanResults) {
  // The main loop checks BLEScan::isScanning() and clears the UI flag.
}

void notifyReport(BLERemoteCharacteristic*, uint8_t* value, size_t len, bool) {
  BleHid.onReportIngest(value, len);
}
}

namespace freeink {
BleKeyboardHost& BleKeyboardHost::getInstance() {
  static BleKeyboardHost host;
  return host;
}

bool BleKeyboardHost::begin(const char* hostName) {
  if (begun_) return true;
  loadBonds();
  if (!BLEDevice::init(hostName)) return false;
  BLESecurity::setAuthenticationMode(true, false, true);  // Just Works bonding.
  BLEScan* scan = BLEDevice::getScan();
  if (!scan) {
    BLEDevice::deinit(false);
    return false;
  }
  scan->setActiveScan(true);
  scan->setInterval(96);
  scan->setWindow(64);
  scan->setAdvertisedDeviceCallbacks(&scanCallbacks);
  begun_ = true;
  return true;
}

void BleKeyboardHost::end() {
  if (!begun_) return;
  // Do not keep a BLE radio or host task alive when the setting is OFF.
  if (scanning_) stopScan();
  const bool wasConnected = activeClient && activeClient->isConnected();
  disconnect();
  if (wasConnected) {
    // Let the host task process its disconnect event before destroying its
    // services. This is run only on an explicit OFF, never in book navigation.
    const uint32_t limit = millis() + 250;
    while (activeClient->isConnected() && static_cast<int32_t>(millis() - limit) < 0) delay(5);
  }
  // Arduino-ESP32 BLEDevice owns the client returned by createClient().
  // Its deinit() deletes that client: deleting it here would double-free the
  // same allocation and cause multi_heap_free(head != NULL) on menu exit.
  BLEDevice::deinit(false);
  activeClient = nullptr;
  begun_ = false;
  scanning_ = false;
  connecting_ = false;
  deviceCount_ = 0;
  ringHead_ = ringTail_ = 0;
  heldUsage_ = 0;
  lastReconnectMs = 0;
}

void BleKeyboardHost::poll(bool allowReconnect) {
  if (!begun_) return;
  if (scanning_ && !BLEDevice::getScan()->isScanning()) scanning_ = false;
  if (connected_ && activeClient && !activeClient->isConnected()) onLinkDown();
  // Never run a synchronous BLE connection attempt inside the book reader:
  // a sleeping/unavailable remote must not freeze physical buttons or touch.
  if (!allowReconnect || scanning_ || connected_ || connecting_ || bondCount_ == 0) return;
  if (lastReconnectMs && millis() - lastReconnectMs < 12000) return;
  lastReconnectMs = millis();
  connect(bonds_[0].addr);
}

void BleKeyboardHost::startScan(uint32_t ms) {
  if (!begun_ || connecting_) return;
  BLEScan* scan = BLEDevice::getScan();
  if (!scan) return;
  if (scanning_) scan->stop();
  deviceCount_ = 0;
  scan->clearResults();
  scanning_ = scan->start(std::max(uint32_t(1), (ms + 999) / 1000), scanComplete);
}
void BleKeyboardHost::stopScan() {
  if (begun_ && scanning_) BLEDevice::getScan()->stop();
  scanning_ = false;
}
void BleKeyboardHost::releaseScanResults() {
  if (!begun_) return;
  if (scanning_) stopScan();
  BLEDevice::getScan()->clearResults();
  deviceCount_ = 0;
}
const DiscoveredDevice& BleKeyboardHost::device(uint8_t i) const {
  static const DiscoveredDevice empty;
  return i < deviceCount_ ? devices_[i] : empty;
}

bool BleKeyboardHost::connect(const char* addr) {
  if (!begun_ || connecting_ || !addr || !*addr) return false;
  uint8_t addressType = 0;
  char name[32] = {0};
  for (uint8_t i = 0; i < deviceCount_; ++i) {
    if (strcmp(devices_[i].addr, addr) == 0) {
      addressType = devices_[i].addrType;
      snprintf(name, sizeof(name), "%s", devices_[i].name);
      break;
    }
  }
  if (!name[0]) {
    for (uint8_t i = 0; i < bondCount_; ++i) {
      if (strcmp(bonds_[i].addr, addr) == 0) {
        addressType = bonds_[i].addrType;
        snprintf(name, sizeof(name), "%s", bonds_[i].name);
        break;
      }
    }
  }
  if (scanning_) stopScan();
  connecting_ = true;
  connectFailed_ = false;
  // Create one core-owned client per explicit ON session.
  // BLEDevice::deinit() is its sole destructor.
  if (activeClient) {
    // The core retains client-owned service maps across a disconnect and
    // does not expose a safe reset API. Do not reuse stale GATT objects:
    // require an explicit OFF/ON cycle so BLEDevice::deinit() frees them.
    onConnectFailed("Turn OFF then ON to retry");
    return false;
  }
  activeClient = BLEDevice::createClient();
  if (!activeClient) {
    onConnectFailed("No BLE client memory");
    return false;
  }
  activeClient->setClientCallbacks(&connectionCallbacks);
  // Time-bounded connect; the user can continue reading if a remote is absent.
  const BLEAddress peer(String(addr), addressType);
  if (!activeClient->connect(peer, addressType, 3000)) {
    onConnectFailed("Remote unavailable");
    return false;
  }
  BLERemoteService* hid = activeClient->getService(BLEUUID(uint16_t(0x1812)));
  if (!hid) {
    activeClient->disconnect();
    onConnectFailed("Device is not a BLE keyboard");
    return false;
  }
  // Just Works BLE HID pairing: a peripheral may require encryption to notify.
  activeClient->secureConnection();
  bool subscribed = false;
  auto* characteristics = hid->getCharacteristics();
  if (characteristics) {
    for (const auto& item : *characteristics) {
      BLERemoteCharacteristic* chr = item.second;
      if (chr && chr->getUUID().equals(BLEUUID(uint16_t(0x2A4D))) && chr->canNotify()) {
        chr->registerForNotify(notifyReport);
        subscribed = true;
      }
    }
  }
  if (!subscribed) {
    activeClient->disconnect();
    onConnectFailed("No HID input report");
    return false;
  }
  onLinkUp(addr, name[0] ? name : addr, addressType);
  releaseScanResults();
  return true;
}

void BleKeyboardHost::disconnect() {
  connected_ = false;
  connecting_ = false;
  if (activeClient && activeClient->isConnected()) activeClient->disconnect();
  heldUsage_ = 0;
  memset(prevKeys_, 0, sizeof(prevKeys_));
}
void BleKeyboardHost::onLinkUp(const char* addr, const char* name, uint8_t type) {
  connected_ = true;
  connecting_ = false;
  snprintf(connName_, sizeof(connName_), "%s", name);
  for (uint8_t i = 0; i < bondCount_; ++i) {
    if (strcmp(bonds_[i].addr, addr) == 0) return;
  }
  if (bondCount_ >= kMaxBonds) return;
  auto& saved = bonds_[bondCount_++];
  snprintf(saved.addr, sizeof(saved.addr), "%s", addr);
  snprintf(saved.name, sizeof(saved.name), "%s", name);
  saved.addrType = type;
  persistBonds();
}
void BleKeyboardHost::onLinkDown() {
  connected_ = false;
  connecting_ = false;
  heldUsage_ = 0;
  memset(prevKeys_, 0, sizeof(prevKeys_));
}
void BleKeyboardHost::onConnectFailed(const char* reason) {
  snprintf(connectFailure_, sizeof(connectFailure_), "%s", reason);
  connectFailed_ = true;
  connecting_ = false;
}
bool BleKeyboardHost::takeConnectFailure(char* out, size_t len) {
  if (!connectFailed_ || !out || len == 0) return false;
  snprintf(out, len, "%s", connectFailure_);
  connectFailed_ = false;
  return true;
}
bool BleKeyboardHost::takePairingPasskey(uint32_t&) { return false; }
void BleKeyboardHost::onPairingPasskey(uint32_t) {}

void BleKeyboardHost::onScanResultIngest(const char* addr, const char* name, int rssi,
                                        uint8_t type, bool hid, bool connectable) {
  if (!scanning_ || !connectable || !addr) return;
  for (uint8_t i = 0; i < deviceCount_; ++i) {
    if (strcmp(devices_[i].addr, addr) == 0) return;
  }
  if (deviceCount_ >= kMaxDiscovered) return;
  auto& found = devices_[deviceCount_++];
  snprintf(found.addr, sizeof(found.addr), "%s", addr);
  snprintf(found.name, sizeof(found.name), "%s", name && *name ? name : addr);
  found.rssi = rssi;
  found.addrType = type;
  found.hasName = name && *name;
  found.hid = hid;
  found.connectable = connectable;
}
void BleKeyboardHost::loadBonds() {
  bondCount_ = 0;
  Preferences p;
  if (!p.begin("freeink-hid", true)) return;
  const size_t count = std::min(size_t(kMaxBonds), size_t(p.getUChar("n", 0)));
  if (count && p.getBytesLength("b") >= count * sizeof(PairedHidDevice)) {
    p.getBytes("b", bonds_, count * sizeof(PairedHidDevice));
    bondCount_ = static_cast<uint8_t>(count);
  }
  p.end();
}
void BleKeyboardHost::persistBonds() {
  Preferences p;
  if (!p.begin("freeink-hid", false)) return;
  p.putUChar("n", bondCount_);
  if (bondCount_) p.putBytes("b", bonds_, bondCount_ * sizeof(PairedHidDevice));
  else p.remove("b");
  p.end();
}
const PairedHidDevice& BleKeyboardHost::paired(uint8_t i) const {
  static const PairedHidDevice empty;
  return i < bondCount_ ? bonds_[i] : empty;
}
void BleKeyboardHost::forget(const char* addr) {
  if (!addr) return;
  for (uint8_t i = 0; i < bondCount_; ++i) {
    if (strcmp(bonds_[i].addr, addr) != 0) continue;
    if (connected_) disconnect();
    for (uint8_t j = i; j + 1 < bondCount_; ++j) bonds_[j] = bonds_[j + 1];
    --bondCount_;
    persistBonds();
    return;
  }
}

void BleKeyboardHost::enqueue(const KeyEvent& ev) {
  portENTER_CRITICAL(&keyMux);
  const uint8_t next = (ringHead_ + 1) % kKeyQueueLen;
  if (next != ringTail_) {
    ring_[ringHead_] = ev;
    ringHead_ = next;
  }
  portEXIT_CRITICAL(&keyMux);
}
bool BleKeyboardHost::popKey(KeyEvent& out) {
  portENTER_CRITICAL(&keyMux);
  if (ringTail_ == ringHead_) {
    portEXIT_CRITICAL(&keyMux);
    return false;
  }
  out = ring_[ringTail_];
  ringTail_ = (ringTail_ + 1) % kKeyQueueLen;
  portEXIT_CRITICAL(&keyMux);
  return true;
}
void BleKeyboardHost::emitUsage(uint8_t usage, uint8_t mods) {
  KeyEvent ev;
  ev.keycode = usage;
  ev.mods = mods;
  ev.pressed = true;
  hidTranslate(usage, mods, ev.ch, ev.special);
  enqueue(ev);
}
void BleKeyboardHost::onReportIngest(const uint8_t* data, size_t len) {
  if (!connected_ || !data || len < 8) return;
  // Standard keyboard input: modifiers, reserved, six usages. A report ID
  // can precede the 8-byte report on composite HID keyboard peripherals.
  const size_t offset = len > 8 ? len - 8 : 0;
  const uint8_t mods = data[offset];
  const uint8_t* usages = data + offset + 2;
  for (size_t i = 0; i < 6; ++i) {
    const uint8_t usage = usages[i];
    if (!usage || usage >= 0xE0) continue;
    bool seen = false;
    for (uint8_t prev : prevKeys_) if (prev == usage) seen = true;
    if (!seen) emitUsage(usage, mods);
  }
  memcpy(prevKeys_, usages, 6);
}
}  // namespace freeink
#else
namespace freeink {
BleKeyboardHost& BleKeyboardHost::getInstance() { static BleKeyboardHost host; return host; }
bool BleKeyboardHost::begin(const char*) { return false; }
void BleKeyboardHost::end() {}
void BleKeyboardHost::poll(bool) {}
void BleKeyboardHost::startScan(uint32_t) {}
void BleKeyboardHost::stopScan() {}
void BleKeyboardHost::releaseScanResults() {}
const DiscoveredDevice& BleKeyboardHost::device(uint8_t) const { static DiscoveredDevice e; return e; }
bool BleKeyboardHost::connect(const char*) { return false; }
void BleKeyboardHost::disconnect() {}
const PairedHidDevice& BleKeyboardHost::paired(uint8_t) const { static PairedHidDevice e; return e; }
void BleKeyboardHost::forget(const char*) {}
bool BleKeyboardHost::popKey(KeyEvent&) { return false; }
bool BleKeyboardHost::takeConnectFailure(char*, size_t) { return false; }
bool BleKeyboardHost::takePairingPasskey(uint32_t&) { return false; }
void BleKeyboardHost::onScanResultIngest(const char*, const char*, int, uint8_t, bool, bool) {}
void BleKeyboardHost::onReportIngest(const uint8_t*, size_t) {}
void BleKeyboardHost::onLinkUp(const char*, const char*, uint8_t) {}
void BleKeyboardHost::onLinkDown() {}
void BleKeyboardHost::onConnectFailed(const char*) {}
void BleKeyboardHost::onPairingPasskey(uint32_t) {}
void BleKeyboardHost::enqueue(const KeyEvent&) {}
void BleKeyboardHost::emitUsage(uint8_t, uint8_t) {}
void BleKeyboardHost::persistBonds() {}
void BleKeyboardHost::loadBonds() {}
}
#endif
