#pragma once

#include <cstdint>

class MappedInputManager;

// BLE keyboard host is intentionally independent from Reading Journal's GATT
// server. It is only active while reading or in this feature's pairing screen.
namespace X4PageTurner {
// All BLE operations execute on a separate low-priority FreeRTOS task.
enum class BluetoothState : uint8_t { Off, Starting, Ready, Stopping, Failed };
BluetoothState bluetoothState();
uint8_t takeLastBluetoothTimeout();
bool requestScan(uint32_t durationMs = 8000);
bool requestConnect(const char* address);
bool requestForgetAll();
bool enabled();
void setEnabled(bool on);
bool pairingScreenOpen();
void setPairingScreenOpen(bool open);
void service(bool readerInFront, MappedInputManager& input);
uint8_t nextUsage();
uint8_t previousUsage();
void bindNext(uint8_t usage);
void bindPrevious(uint8_t usage);
}
