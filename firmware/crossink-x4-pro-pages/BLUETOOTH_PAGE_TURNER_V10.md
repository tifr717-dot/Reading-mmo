# X4 Pro Bluetooth Page Turner v10: HID handle discovery

## Why this build exists
The MK321BT in v9 pairs and encrypts correctly, but produces no input notifications. Readback showed only one CCCD 0001 among three exposed channels, with report references 02/03/02; the HID Report Map begins with the keyboard Report ID 01. The underlying Arduino-ESP32 BLE library stores characteristics in both a UUID-keyed map and a handle-keyed map, but v9 iterated the UUID-keyed map, which collapses repeated HID Report (0x2A4D) UUIDs.

## v10 changes
- Enumerate every HID characteristic from `getCharacteristicsByHandle()`, so duplicate UUIDs are not lost.
- Subscribe to each discovered HID Report/Boot Keyboard/Boot Mouse input by its distinct handle.
- Keep up to six per-handle counters, CCCD readbacks, Report IDs, and Report Types; report the total number of discovered inputs.
- Expand the time-bounded asynchronous descriptor probe queue to 16, sufficient for six inputs (two descriptors each) plus protocol and map.
- Preserve the touch-controlled Boot/Report mode switch, previous stable BLE startup/off safeguards, Reading Journal and page navigation.

## Test steps
1. Back up reading data and keep the known-good Reading Journal firmware for rollback.
2. Flash the v10 `.bin` via the existing SD-card update method. Check the firmware version ends in `bt-v10`.
3. Open a book before enabling Bluetooth; verify physical/touch page-turning is normal.
4. Enable Bluetooth and complete the intentional restart. Scan and connect the MK321BT without changing the remote preset.
5. Open Button Input Tester v10 in **Report** mode. Wait for diagnostic reads to complete, press Next/Previous several times, and photograph the screen.
6. Observe HID count, CCCD 1–6, Report IDs and Reports 1–6; look for a Report ID 01 channel and rising report count.
7. If still no reports, switch to Boot mode by tapping the touch target; press both buttons and photograph that screen.
8. If the reader freezes, restarts unexpectedly, or normal controls stop working, stop testing and restore the known-good firmware without formatting the SD card.

**Note:** A successful compilation does not guarantee the BLE HID clicker works on-device. This is an experimental diagnostic build, not a production release.
