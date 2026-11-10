# XTEINK X4 Pro Bluetooth Page Turner — v5 connection diagnostic build

**EXPERIMENTAL. Build success is not a successful real-device pairing test.**
Keep the known-good DEV13 Reading Journal firmware available; do not erase the SD card or flash the whole device.

## Evidence from v4 hardware test

- The PCsensor MK321BT is visible **by name** during Bluetooth scanning, so discovery is working.
- On choosing that named device, v4 remains at "Connecting" and deliberately restarts after roughly 20 seconds.
- v4's FreeRTOS worker watchdog triggers if a BLE call blocks longer than 20 seconds.
- The Arduino-ESP32 3.3.7 NimBLE BLEClient implementation uses `BLE_NPL_TIME_FOREVER` in both `secureConnection()` and GATT service discovery. Exactly which call is blocked has not been proved.

## v5 changes

1. **Remove the unconditional `activeClient->secureConnection()` call.** The Arduino core documents that a peripheral can initiate security when encrypted characteristics/descriptors are accessed. This avoids forcing an unbounded handshake before HID input subscription.
2. **Read the boolean from `BLERemoteCharacteristic::subscribe(true, notifyReport)`.** Unlike `registerForNotify`, this allows an immediate subscription failure to be reported rather than falsely claiming the remote is connected.
3. **Track connection stages (0–5):** 1 stopping scan, 2 BLE link, 3 HID service discovery, 4 HID input-report subscription, 5 connected. Show progress text while connecting.
4. If a BLE operation still hangs, preserve the stage in NVS before the existing **20-second safe restart to Bluetooth OFF**. The next visit to the Bluetooth Page Turner settings shows the failed stage: scan stop, BLE link, HID discovery, or HID reports.
5. On non-stalling failures, show a useful reason. A failed connection requires turning Bluetooth OFF and starting a new one-time ON boot before retrying.
6. Preserve v4 early-boot BLE initialization, one-time restart, radio OFF on ordinary reboot, Reading Journal stats, saved key mappings, and physical/touch page turning. No automatic reconnection.
7. No change to the X4 Pro partition table, bootloader, or FreeInk device HAL.

## Safety-first test procedure

1. Back up the working DEV13 firmware and important reading logs. Use **only on XTEINK X4 Pro** with the normal application-firmware update; **never full erase**.
2. On fresh v5 boot, check normal physical and touch page turns. Bluetooth should be OFF.
3. Choose **Settings → Controls → Bluetooth Page Turner → ON**. Expect a **single deliberate restart** after about 2 seconds. If it restarts again during initialization, stop.
4. After restart, confirm Bluetooth still reads ON; otherwise stop and report any message.
5. Only when ON and the reader is responsive, choose **Scan & Pair Remote**, put MK321BT in its keyboard-mode pairing state, choose it by name, and attempt pairing **once**. Turn off Bluetooth on nearby Kindle/Boox devices if they are connected to this remote.
6. If connected, learn NEXT/PREVIOUS and test the clicker alongside regular page turns.
7. If it fails immediately, note the exact bottom-of-screen error. If it restarts at ~20 seconds, do **not** retry: open the Bluetooth Page Turner settings once, photograph the exact `Pairing stalled: ... (OFF)` notice, and report it.
8. If normal page turning fails or any unexpected crash occurs, restore known-good DEV13 Reading Journal firmware.

## Known limitations

- The host still uses Arduino-ESP32 NimBLE GATT discovery and CCCD subscription, whose internal waits may block. Stage tracing identifies the remaining blocker rather than guaranteeing it is eliminated.
- Some peripherals require bonding/encryption before subscribing to input reports; removing the unconditional handshake may cause a clean subscription failure on such devices. Device-specific testing is essential.
- The 20-second reboot remains the last-resort escape from a blocked BLE library call. Bluetooth always returns OFF after it.
- This is a **software-compiled experimental test**, not a certified release.
