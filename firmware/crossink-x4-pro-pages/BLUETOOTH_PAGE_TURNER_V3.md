# X4 Pro Bluetooth Page Turner — v3 fail-safe test build

**Experimental firmware, NOT hardware-validated.** Reverts cleanly to the previous Reading Journal DEV13 firmware; do not full-erase the X4 Pro or SD card. The previous DEV13 firmware must stay available as a recovery path.

## Why v2 froze when ON was selected

In v2, the Arduino main input/UI loop called `BleHid.begin()` and `BleHid.poll()`. The Arduino-ESP32 NimBLE implementation has an unbounded `while (!m_synced)` wait in `BLEDevice::init()`, and synchronous remote connection/secure GATT discovery may also stall. With v1-era saved remote bonds, v2 attempted to reconnect immediately in the settings screen. Any indefinite BLE wait there blocks all X4 navigation.

This analysis identifies a credible freeze path from source. Hardware logs would be needed to prove which call actually stalled.

## What v3 changes

- **No synchronous BLE work on the main UI thread.** A separate, low-priority FreeRTOS task runs Bluetooth initialization, scanning, connection, cleanup and polling. The normal physical buttons, touch, and reading loop never wait for Bluetooth to return.
- **No background connection attempt when ON is selected.** Use **Scan & Pair Remote**, select the remote, then learn Next/Previous. A saved remote can be reconnected by rescanning and choosing it.
- **Stall recovery:** if any BLE work operation takes more than 20 seconds, the main input loop saves a small diagnostic marker and automatically restarts. Bluetooth always boots **OFF**. Opening Settings afterwards shows the recovered-stall message once.
- **Battery control:** while Bluetooth ON, the CPU stays at normal speed for Bluetooth stability. OFF queues BLE teardown and the normal CrossInk idle power-saving resumes.
- **Thread-safe scan copies:** the UI snapshots discovered remotes instead of holding references to objects being updated by a BLE callback.
- **Previous v2 double-free fix retained:** Arduino-ESP32 BLEDevice alone owns deletion of the BLEClient.
- Reading Journal selective sync, DEV13 daily logs, EPUB/XTC page input, partitions, and firmware layout unchanged.

## Deliberate limitation

The ESP32's underlying NimBLE call does not expose a complete user-cancellable timeout for all internal connection stages. The v3 fallback is a **controlled reboot** if a BLE operation remains blocked longer than 20 seconds, rather than leaving the device frozen forever. A reboot on Bluetooth ON means BLE remains unsupported in that memory/runtime configuration; it is **not** evidence that pairing is working.

If Bluetooth ON is selected and the screen remains responsive, that's only the first checkpoint. It does **not** prove that scan, connection, and button learning all work.

## On-device acceptance checklist

1. Keep a verified, reflashable DEV13 Reading Journal firmware and back up reading logs. Do not erase the full chip.
2. Flash **v3 on X4 Pro only**, normal application firmware flash method. Cold-boot: Bluetooth OFF. Test book physical Next, Previous, touch, and Settings Back **before** enabling Bluetooth.
3. Open Settings → Controls → Bluetooth Page Turner and toggle ON with the MK321BT **not connected**. The normal menu/back button must keep working immediately.
4. If startup is stuck, wait at most 25 seconds: the X4 should restart by itself and come back Bluetooth OFF; the settings page should show the saved stall warning. **Stop testing Bluetooth if this happens**, return to DEV13 and send a report.
5. If ON succeeds, press Back, open a book, verify manual/touch page turns still work. Return to Settings and choose Scan & Pair Remote.
6. Put the PCsensor MK321BT into pairing mode, select it when discovered, then teach Next/Previous. Test all controls, both with Bluetooth connected and with the remote turned off.
7. Toggle OFF and ensure the device remains responsive, then reboot and verify Bluetooth OFF and Reading Journal working. If OFF stalls, controlled reboot should restore OFF mode.

**Do not claim v3 stable or recommend flashing broadly until the physical tests pass.** Keep firmware ELF/MAP files in the build artifact for diagnosing future crashes.
