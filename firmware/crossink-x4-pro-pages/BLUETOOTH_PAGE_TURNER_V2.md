# X4 Pro Bluetooth Page Turner — v2 test build

Built on the previous X4 Pro DEV13 Reading Journal firmware; includes Pages, daily reading logs, and selective Reading Journal Bluetooth sync. Does not change the SD reading log formats or hardware partition table.

## What v2 fixes

- Eliminates the crash-causing double deletion of the Arduino-ESP32 BLE client. BLEDevice owns and frees its client in deinit().
- Power fail-safe: Page Turner **always starts OFF after every reboot**, regardless of any old v1 NVS setting. Saved remotes and learned keys remain in NVS.
- The Bluetooth host stays alive while explicitly ON, including when navigating out of settings. It is only torn down when switched OFF.
- Reconnect attempts, which can block for a sleeping remote, happen only while the Bluetooth settings screen is open. They are not run inside EPUB/XTC reader input loops. Existing connections still deliver key events in books.
- The reader's own page buttons and touchscreen continue using their original input paths. Remote input is additive and is never injected into the settings or home menus.
- The X4 Pro physical PageBack button can cancel Learn Next/Previous and leave the Bluetooth settings menu.
- The GitHub Actions build uploads the X4 Pro ELF and optional map for symbolication if another crash occurs.

## Safety-first acceptance sequence (physical device required)

**Keep the working DEV13 Reading Journal firmware and SD reading logs backed up. Never choose a full-chip erase.**

1. Cold boot the v2 test firmware. Verify Bluetooth Page Turner says OFF and both physical page buttons and touch page turns work in an EPUB and an XTC book. Verify Home and Stats still work.
2. With Bluetooth still OFF, open and exit Settings → Controls → Bluetooth Page Turner several times. The reader controls must continue working.
3. Toggle Bluetooth ON with no remote connected. Exit settings using the X4 Pro's Back or PageBack button. Open a book and verify physical/touch page turning remains responsive. If anything fails, stop and roll back.
4. Return to Bluetooth settings and Scan & Pair the PCsensor MK321BT keyboard. If already paired in v1, try the saved connection. Use Learn Next and Learn Previous with the **remote** clicker; use the X4 device Back or Previous to cancel. Exit and re-enter settings with no crash.
5. In the book, test remote Next/Previous, physical Next/Previous, and touchscreen independently. Disconnect the remote while in the reader: physical and touch pages must still work without freezes.
6. Toggle Bluetooth OFF. Verify radio is shut down and regular page controls still work. Reboot: Bluetooth must return to OFF, with saved pairing and key mappings intact.
7. Test Reading Journal selective sync independently and confirm your daily reading data remains intact.

A successful compiler run is **not** evidence the Bluetooth hardware and deinitialization cycle work physically. Mark this as an experimental test build until the on-device sequence passes.

## Crash collection

If a new crash occurs, return to the working firmware without erasing SD. Attach `crash_report.txt`; the artifact includes a matching `.elf` and may include a `.map` so raw Xtensa addresses can be symbolicated.
