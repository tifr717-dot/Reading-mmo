# X4 Pro Bluetooth Page Turner — v4 early-boot test build

**EXPERIMENTAL. This is not yet hardware-verified and must not replace the known-good DEV13 Reading Journal firmware backup.**

## v3 hardware result and root-cause hypothesis

The X4 Pro rebooted after a pause when the user selected Bluetooth ON in v3. v3 intentionally restarts after 20 seconds when a BLE worker operation is blocked. The only lengthy operation newly launched by choosing ON is `BleHid.begin()`, which invokes Arduino-ESP32's `BLEDevice::init()`. That code waits indefinitely for a NimBLE host sync callback if startup never finishes. It is therefore highly likely BLE startup stalls in the normal reading boot, **not** a spontaneous immediate crash. The exact cause (heap pressure, address sync or controller state) is not yet proved.

The working Reading Journal BLE server uses CrossInk's separate lightweight network reboot, which avoids loading most reader resources. v4 tests the narrower hypothesis that BLE must claim internal memory **before** reader and font allocations.

## What changes in v4

- Selecting Page Turner ON shows a message and performs **one intentional software restart** after ~1.8 seconds.
- A one-shot NVS `boot-on` request is consumed **before** the firmware starts Bluetooth on the fresh boot. An unrelated restart or startup failure returns to normal Bluetooth-OFF mode, so it cannot enter an infinite BLE boot loop.
- On that opt-in boot, the Bluetooth worker starts immediately after CrossInk's initial boot classification and **before** SD storage, fonts, and reader workspaces initialize.
- Startup must finish within 12 seconds. Otherwise a one-time diagnostic is recorded and the X4 restarts with Bluetooth OFF. If the controller failed to sync, Bluetooth settings displays `BLE controller did not sync (stage 2)` on the next visit.
- BLE scan, pairing, disconnect, and HID input remain on the background worker as in v3. Physical buttons and touch input are not repurposed.
- No automatic reconnection to saved remotes when the page-turner radio turns ON. Use Settings → Scan & Pair Remote each time until hardware testing succeeds.
- Once Bluetooth is OFF, the worker sleeps without periodic wakeups; CrossInk's normal power saving resumes.
- The proven DEV13 Reading Journal, daily reading logs, physical button input, and X4 Pro firmware partition table are unchanged.

## Safety-first hardware test

1. Keep the proven DEV13 Reading Journal .bin and reading logs backed up. **Never full erase.**
2. Flash this v4 **only on XTEINK X4 Pro** as normal application firmware. Confirm Bluetooth is OFF on cold boot and manual/touch pages work.
3. In Settings → Bluetooth Page Turner, choose ON. A **single deliberate restart** should follow within about 2 seconds. This restart is expected; it is **not** evidence of a hang.
4. Allow up to 12 seconds for early Bluetooth initialization during that restart. Once the X4 has booted, revisit Bluetooth settings. If it says ON, verify physical and touch page turning first. If it says OFF and reports the controller did not sync, **stop; do not try ON repeatedly.**
5. Only if the X4 stays responsive and Bluetooth is ON, choose Scan & Pair, put the PCsensor MK321BT into pairing mode and select it. Learn Next/Previous and test remote and manual page turning.
6. Switch OFF and test Reading Journal. On an ordinary later reboot, Bluetooth must be OFF again.
7. Any unexpected crash or inability to turn physical pages: rollback immediately to DEV13 and share the crash report if present.

## Known limits

- Arduino-ESP32's integrated BLE library still has an unbounded internal sync wait. v4 wraps this with a 12-second early-boot failsafe and 20-second runtime failsafe, but hardware validation is required.
- Initializing early may increase memory pressure for large books. If EPUB/XTC page rendering degrades or fails, turn Bluetooth OFF and roll back.
- Compile success verifies buildability **only**, not Bluetooth functionality or reliability.
