# XTEINK X4 Pro — Bluetooth Page Turner v7 (encrypted pairing and HID subscription diagnostics)

**Target hardware:** XTEINK X4 Pro only. This developer test firmware extends v6 / DEV13 Reading Journal; it is not for X4 non-Pro.

## Why v7 exists

On v6 the PCsensor MK321BT could be paired by name and the status showed **Remote connected**. However, pressing Next and Previous produced **0** HID reports in Button Input Tester, even with Bluetooth disabled on the user's Kindle, Boox Palma, and phone. This points to the notification/encryption layer, not to the Next/Previous keymap.

The ESP32 Arduino BLE implementation in use has a surprise: `BLERemoteCharacteristic::subscribe()` can return true when the characteristic's 0x2902 CCCD is missing. That is not proof that notifications are enabled.

## v7 additions

- Initiates Bluetooth LE security/bonding asynchronously using `BLESecurity::startSecurity()` **not** the unbounded `BLEClient::secureConnection()`.
- Waits no longer than **2.5 seconds** for encryption, on the dedicated Bluetooth worker task. If encryption doesn't complete, the firmware continues diagnostics without blocking the UI.
- Inspects each HID input notification characteristic for a *real* Client Characteristic Configuration Descriptor (0x2902); only counts `subscribe()` success if CCCD exists and the descriptor write succeeds.
- Shows **Security**, **HID inputs**, **CCCD found**, **Enabled**, **No CCCD**, and **Write failures** on the existing Button Input Tester screen, plus raw reports and translated keyboard keys.
- Keeps the radio-off startup, connection watchdog, previous feature toggle, persistent key mappings (including modifier combinations), and DEV13 Reading Journal.

## First test

1. Make sure the known-good Reading Journal firmware is available for rollback.
2. Flash v7 `.bin` to X4 Pro through the existing SD firmware update menu. Never erase the whole flash or books partition.
3. Enable Bluetooth Page Turner. It schedules one intentional restart so the BLE stack starts early; Bluetooth remains OFF by default on unrelated reboots.
4. Reopen **Settings → Controls → Bluetooth Page Turner**, put MK321BT into pairing mode, tap **Scan & Pair Remote**, and explicitly select the remote **by name**.
5. Open **Button Input Tester** whether or not the main menu says connected.
6. Press Next and Previous, then photograph the full tester screen. Especially note **Security**, **HID inputs**, **CCCD found**, **Enabled**, and **Button reports after opening**.
7. If reports rise and a keyboard key appears, use **Learn Next Button** and **Learn Previous Button**, then test page turns inside a book.
8. If the remote disconnects, freezes, or restarts the X4 Pro, stop testing, restore your working Reading Journal firmware, and share the error.

## Interpreting the diagnostic

- **Security: Link encrypted; CCCD found > 0; Enabled > 0; reports > 0**: BLE notifications are now working; map the buttons.
- **Encrypted and Enabled > 0, reports = 0**: likely remote HID mode, missing protocol setup, or unreported notification transport problem.
- **HID inputs > 0, CCCD found = 0**: previously false-success subscription; needs alternate HID characteristic/protocol.
- **CCCD found > 0, Enabled = 0**: CCCD write rejected; may be insufficient security/permissions.
- **Security timed out**: security negotiation did not finish within our deliberately short limit; we must investigate further.
- **No HID inputs**: the peer exposes HID service but no known input notification characteristics.

This is a diagnostic firmware build; compilation does **not** establish physical MK321BT compatibility without hardware testing.
