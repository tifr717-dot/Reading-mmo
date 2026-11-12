#pragma once

#include <cstdint>

class MappedInputManager;

// BLE keyboard host is intentionally independent from Reading Journal's GATT
// server. It is only active while reading or in this feature's pairing screen.
namespace X4PageTurner {
// All BLE operations execute on a separate low-priority FreeRTOS task.
enum class BluetoothState : uint8_t { Off, Starting, Ready, Stopping, Failed };
BluetoothState bluetoothState();
// A user ON command requests a one-shot clean reboot for early BLE startup.
void earlyStartIfRequested(bool safeBoot);
bool enableRestartPending();
uint8_t takeLastBluetoothTimeout();
bool requestScan(uint32_t durationMs = 8000);
bool requestConnect(const char* address);
bool requestForgetAll();
// Switch HID Report (1) / Boot (0) mode without reflashing; queues BLE work.
bool requestProtocolMode(uint8_t mode);
bool enabled();
void setEnabled(bool on);
bool pairingScreenOpen();
void setPairingScreenOpen(bool open);
void service(bool readerInFront, MappedInputManager& input);
uint8_t nextUsage();
uint8_t previousUsage();
uint8_t nextModifiers();
uint8_t previousModifiers();
void bindNext(uint8_t usage, uint8_t modifiers = 0);
void bindPrevious(uint8_t usage, uint8_t modifiers = 0);
// Diagnostic counters: button presses routed into the book reader since boot.
uint32_t forwardedNextCount();
uint32_t forwardedPreviousCount();
}
