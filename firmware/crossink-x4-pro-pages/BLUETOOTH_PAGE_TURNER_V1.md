# X4 Pro Bluetooth Page Turner — development build

Base: existing CrossInk 1.5.1 X4 Pro DEV13 + selective Reading Journal BLE sync.

This change is isolated on the feature branch and has not been tested with the physical PCsensor MK321BT. Do not treat a successful CI compile as proof of pairing, stability, or battery savings.

## Behaviour
- Settings > Controls > Bluetooth Page Turner.
- OFF on first installation, persisted in NVS namespace x4-turner.
- OFF releases the BLE host/controller, without deleting its NVS bonds.
- ON in the reader reconnects a saved BLE HID keyboard, if available.
- Settings includes Scan & Pair, Learn Next, Learn Previous, and Forget.
- Short remote key events inject the same input tap as the physical page buttons.
- EPUB and XTC use their existing page-turn and reading-statistics paths.
- Page turner host stays off outside readers and the pairing screen.
- Reading Journal Bluetooth sync keeps its minimal-network reboot and GATT protocol 5.

## Hardware acceptance (before release)
1. Back up /.crosspoint and preserve the last confirmed working binary.
2. Check firmware binary target, size and SHA-256 from GitHub Actions.
3. Verify original diary records, Home, touch, frontlight, USB and EPUB/XTC paging.
4. Confirm page-turner OFF causes no BLE advertising/scanning/reconnect activity.
5. Turn ON, scan and pair PCsensor MK321BT (Bluetooth mode; hold Connect 3 sec).
6. Try the existing Kindle/Palma key preset. If necessary use Learn Next/Previous.
7. Confirm one click is exactly one page, forward and backward, in EPUB and XTC.
8. Confirm normal page/reading statistics are incremented once per page turn.
9. Confirm auto reconnect after reader exit/re-entry and device wake.
10. Turn OFF, confirm BLE disconnect, settings retained, and power use is lower than ON.
11. Run Reading Journal selective sync; confirm protocol 5 unchanged.
12. Repeat with a large EPUB and several chapter transitions to watch for OOM.

If any check fails, return to the previous confirmed DEV13/selective-sync firmware.
