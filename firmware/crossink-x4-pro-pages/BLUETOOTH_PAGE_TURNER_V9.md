# X4 Pro Bluetooth Page Turner — v9 HID Readback Tester

This is an experimental diagnostic build of the XTEINK X4 Pro firmware for the PCsensor MK321BT Bluetooth remote.

## Reason for v9

v8 and v8.1 successfully bonded with an encrypted BLE HID connection and subscribed to 3 input characteristics, but neither Boot nor Report mode received button notifications (channel report counts remained 0/0/0). v8.1 also placed a divider over "No key decoded". v9 investigates the report setup without changing the known-good DEV13 Reading Journal.

## New diagnostic readback

After connection, a bounded, one-at-a-time sequence of asynchronous NimBLE GATT reads inspects:

- CCCD (0x2902) values for up to three subscribed HID input characteristics: `0001` means notifications enabled; `0000` means disabled; `FFFF` means unread.
- HID Report Reference descriptors (0x2908) to retrieve report IDs and type (`01` means input).
- Protocol Mode characteristic (0x2A4E): `00` Boot or `01` Report.
- Prefix of HID Report Map (0x2A4B) to confirm readable descriptor data.

Read result counters and last GATT status appear on the tester. Each request is initiated asynchronously on the existing Bluetooth worker, with a 2.5-second timeout. A timeout stops subsequent diagnostic reads to avoid stressing a potentially stalled connection. No synchronous Arduino `readValue()` is used.

## How to test

1. Keep your previous working DEV13 firmware in case you need to roll back.
2. Flash the v9 firmware through the same process as v8.1.
3. Turn Bluetooth ON (follow the firmware's single restart prompt), then Scan/Pair your PCsensor remote.
4. Open Bluetooth Page Turner → Button Input Tester v9. Wait a few seconds for "Reads" to finish or show a timeout.
5. Press NEXT and PREVIOUS on the clicker while in Report mode. Take a screenshot of the tester.
6. Tap the visible "Tap to switch Boot / Report" area, press both buttons, and take another screenshot after readback.
7. Send both screenshots, especially CCCD readback, IDs/types, map prefix, and last GATT status.

This build does not yet claim that page turning works. It is designed to distinguish a successful subscription from an actual notification stream. Bluetooth remains opt-in, with the existing safe startup and recovery mechanisms. Reading Journal, daily logs, app storage, and existing physical buttons are unchanged.
