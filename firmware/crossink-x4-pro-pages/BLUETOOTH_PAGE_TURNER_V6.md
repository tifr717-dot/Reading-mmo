# XTEINK X4 Pro — Bluetooth Page Turner v6 (diagnostic build)

**Target:** XTEINK X4 **Pro** only; based on the known-good DEV13 Reading Journal and v5 Bluetooth integration.

This version investigates a confirmed MK321BT symptom: the UI says **Remote connected**, but neither page turning nor "Learn Next" detects button presses.

## Changes from v5
- Adds **Settings → Controls → Bluetooth Page Turner → Button Input Tester**, showing the number of incoming HID notifications, last report length, GATT handle, up to 12 raw bytes in hexadecimal, and decoded keyboard usage/modifier (when available).
- Subscribes to HID Input Report (0x2A4D), Boot Keyboard Input (0x2A22), and Boot Mouse Input (0x2A33) when those notification characteristics are exposed.
- Records raw incoming reports before the old 8-byte keyboard-only parser rejects them. Unsupported consumer-control/mouse formats are **diagnosed**, not automatically treated as page turns.
- Learns modifier combinations for the existing Next and Previous bindings; default key mappings remain unmodified-only.
- Retains v5 BLE worker isolation, the watchdog safety cutoff, and the DEV13 Reading Journal features.

## Safe test procedure
1. Make sure you have your **working Reading Journal firmware backup** ready.
2. Flash the v6 **.bin** only to an X4 Pro using the normal SD Card Firmware Update procedure. Do not erase the entire flash or reformat book storage.
3. Enable Bluetooth Page Turner (requires one controlled restart, Bluetooth is OFF by default after startup), reopen the page-turner menu, and pair the **MK321BT** by name.
4. Open **Button Input Tester**. Press NEXT, then PREVIOUS. Photograph the screen, especially `HID reports since opening`, `Report length`, `Raw notification bytes`, and `Keyboard key`.
5. If keyboard key usage appears, leave tester, use **Learn Next Button** and **Learn Previous Button**, then test inside a book.
6. If the raw report count remains **0**, tell us; the BLE host subscribed but isn't receiving notifications (possible device mode or encrypted subscription). If count rises but key usage stays **0**, the remote uses an unsupported HID format; the raw bytes will tell us which parser to add next.
7. If the device freezes, crashes, or reboots during a test, stop, restore known-good Reading Journal and share the screen/crash report.

**Unverified hardware behavior:** This is a diagnostic v6. Build-time checks cannot prove the physical MK321BT works until tested.