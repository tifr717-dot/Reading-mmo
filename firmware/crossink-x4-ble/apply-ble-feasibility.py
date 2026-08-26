#!/usr/bin/env python3
from pathlib import Path
import sys

root = Path(sys.argv[1] if len(sys.argv) > 1 else "crossink")

platformio = root / "platformio.ini"
s = platformio.read_text()
old = """lib_ignore =\n  BLE\n  HalClockSim\n"""
new = """lib_ignore =\n  HalClockSim\n"""
if old not in s:
    raise SystemExit("BLE lib_ignore target not found")
platformio.write_text(s.replace(old, new, 1))

main = root / "src/main.cpp"
s = main.read_text()
include_anchor = '#include <Arduino.h>\n'
include_block = '''#include <Arduino.h>\n#ifndef SIMULATOR\n#include <BLE2902.h>\n#include <BLEDevice.h>\n#include <BLEServer.h>\n#include <BLEUtils.h>\n#endif\n'''
if include_anchor not in s:
    raise SystemExit("main include anchor not found")
s = s.replace(include_anchor, include_block, 1)

namespace_anchor = '''namespace {\nconstexpr unsigned long X4PRO_POWER_DOUBLE_CLICK_MS = 500;\nconstexpr unsigned long X4PRO_POWER_CLICK_MAX_HOLD_MS = 400;\n}  // namespace\n'''
namespace_replacement = '''namespace {\nconstexpr unsigned long X4PRO_POWER_DOUBLE_CLICK_MS = 500;\nconstexpr unsigned long X4PRO_POWER_CLICK_MAX_HOLD_MS = 400;\n#ifndef SIMULATOR\nconstexpr char READING_MMO_BLE_NAME[] = "Reading MMO";\nconstexpr char READING_MMO_SERVICE_UUID[] = "7d2ea28a-f7bd-485a-bd9d-92ad6ecfe93e";\nconstexpr char READING_MMO_STATS_UUID[] = "7d2ea28b-f7bd-485a-bd9d-92ad6ecfe93e";\nBLEServer* readingMmoBleServer = nullptr;\nBLECharacteristic* readingMmoStatsCharacteristic = nullptr;\n\nvoid startReadingMmoBleFeasibilityService() {\n  LOG_INF("BLE", "Starting Reading MMO BLE feasibility service");\n  BLEDevice::init(READING_MMO_BLE_NAME);\n  readingMmoBleServer = BLEDevice::createServer();\n  if (!readingMmoBleServer) {\n    LOG_ERR("BLE", "Failed to create BLE server");\n    return;\n  }\n\n  BLEService* service = readingMmoBleServer->createService(READING_MMO_SERVICE_UUID);\n  if (!service) {\n    LOG_ERR("BLE", "Failed to create Reading MMO BLE service");\n    return;\n  }\n\n  readingMmoStatsCharacteristic = service->createCharacteristic(\n      READING_MMO_STATS_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);\n  if (!readingMmoStatsCharacteristic) {\n    LOG_ERR("BLE", "Failed to create Reading MMO stats characteristic");\n    return;\n  }\n  readingMmoStatsCharacteristic->addDescriptor(new BLE2902());\n  readingMmoStatsCharacteristic->setValue("{\\"protocol\\":1,\\"status\\":\\"ble-feasibility\\"}");\n  service->start();\n\n  BLEAdvertising* advertising = BLEDevice::getAdvertising();\n  advertising->addServiceUUID(READING_MMO_SERVICE_UUID);\n  advertising->setScanResponse(true);\n  BLEDevice::startAdvertising();\n  LOG_INF("BLE", "Reading MMO BLE advertising active");\n}\n#endif\n}  // namespace\n'''
if namespace_anchor not in s:
    raise SystemExit("main namespace anchor not found")
s = s.replace(namespace_anchor, namespace_replacement, 1)

route_anchor = '''  if (resume == BootResume::Silent || resume == BootResume::Network) {\n'''
route_replacement = '''#ifndef SIMULATOR\n  startReadingMmoBleFeasibilityService();\n  logBootHeap("BLE advertising ready");\n#endif\n\n''' + route_anchor
if route_anchor not in s:
    raise SystemExit("setup route tail anchor not found")
s = s.replace(route_anchor, route_replacement, 1)
main.write_text(s)

assert "BLEDevice::startAdvertising()" in main.read_text()
assert 'READING_MMO_BLE_NAME[] = "Reading MMO"' in main.read_text()
assert "  BLE\n" not in platformio.read_text()
print("Applied BLE feasibility edits: enabled BLE library and Reading MMO advertising test service")
