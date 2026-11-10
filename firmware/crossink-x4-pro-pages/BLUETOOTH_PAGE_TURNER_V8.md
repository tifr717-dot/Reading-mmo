# X4 Pro Bluetooth Page Turner — v8 diagnostic build

Status: experimental **test build**, not confirmed compatible with the PCsensor MK321BT. Built on the known-good DEV13 Reading Journal and v7 encrypted BLE HID connection.

## Why v8 exists

In v7 the clicker displayed encrypted link (code 0), three input characteristics, three CCCD descriptors and three successful notification subscriptions, but zero button reports. The same keyboard-layer layout works on Kindle and Boox Palma. This points to an input-transport/protocol issue rather than the learned next/previous mapping.

## v8 changes

- Keeps v7 pairing security initiation and timeout, dedicated low-priority BLE worker, Bluetooth-off-by-default policy, reboot recovery and existing Reading Journal features.
- Detects HID Protocol Mode (0x2A4E), Control Point (0x2A4C), Report Map (0x2A4B), and Report Reference descriptors (0x2908).
- Requests HID **Report Mode** and **Exit Suspend** only when the remote exposes **write without response**. Never uses a synchronous characteristic read or acknowledged write; Arduino-ESP32's library may wait indefinitely on either.
- Counts actual notifications separately for the first three HID input channels (0x2A4D report, 0x2A22 boot keyboard, 0x2A33 boot mouse).
- Tester **Confirm** switches between Report and Boot protocol modes on the BLE worker, if the characteristic allows safe no-response writes. Each mode can be tested without reflashing.

## How to test

1. Keep the known-good original DEV13 firmware bin saved for recovery and keep phone/Kindle/Palma Bluetooth disconnected from this remote.
2. Flash v8 using the established X4 Pro flashing method. Switching Bluetooth ON still restarts the device once, deliberately.
3. Open Settings → Bluetooth Page Turner → Scan & Pair Remote.
4. Open **Button Input Tester v8**, press the remote NEXT and PREVIOUS buttons in its usual working keyboard preset; photograph the numbers and labels.
5. Press the X4 **Confirm** button once. If the screen says **Boot requested**, press the clicker again and photograph the screen. If switching is unsupported, the tester shows the reason and does not attempt a blocking write.
6. Send both photos (and any restarts/freezes) so the next firmware change can be based on actual input evidence.

Status fields are observations, not proof of delivered HID events. "Report requested", "Boot requested", and "Exit Suspend: sent" mean the BLE stack accepted a no-response write, **not** that the remote acknowledged it.

## Remaining limitation

The Report Map and 0x2908 descriptor presence is inspected without reading their values, because v7's reliability takes priority over introducing indefinite GATT read waits. A remote that requires acknowledged writes cannot be forced between modes in v8. Bluetooth Classic-only clickers are not supported by the ESP32-S3 BLE radio.
