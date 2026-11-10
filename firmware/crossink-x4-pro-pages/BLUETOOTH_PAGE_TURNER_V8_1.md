# X4 Pro Bluetooth page-turner v8.1 (touch fix)

A small, source-compatible correction to v8 built on the same DEV13 Reading Journal base.

**Problem:** X4 Pro users select menu actions by touching the e-ink screen, but v8's HID tester changed Report/Boot mode only with a physical Confirm key.

**Fix:** In Button Input Tester v8.1, the horizontal action between y=518 and y=571 says **Tap to switch Boot / Report**. Its touch target spans screen x=30..width-30 and y=510..575, so a normal finger tap works. A physical Confirm key remains optional for builds that have one. The mode switch still queues a non-blocking write on the BLE worker and preserves v8 safeguards.

## Testing

1. Keep the previous working firmware available in case of a problem.
2. Flash v8.1, enable Bluetooth in Settings, and let the reader restart.
3. Scan & Pair the PCsensor MK321BT in its working Kindle/Palma keyboard layout.
4. Open Button Input Tester v8.1. Press Next/Previous, note the 3 channel counts and the **Report requested** status.
5. Tap **Tap to switch Boot / Report** on the e-ink screen. Wait until **Boot requested** appears.
6. Press Next/Previous again, note the 3 channel counts, and send photos from both modes.

The test does not promise remote compatibility; it isolates why v7/v8 connects and subscribes but receives zero notifications.
