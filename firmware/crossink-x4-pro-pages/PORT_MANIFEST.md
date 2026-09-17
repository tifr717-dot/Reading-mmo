# CrossInk X4 Pro Pages port manifest

This branch is the isolated XTEINK X4 Pro port of Tiff's custom CrossInk Pages firmware.

## Pinned X4 Pro base

- CrossInk commit: `7a092e8822c9c90e8beecacd317acc13d3e24dfb`
- FreeInk SDK commit: `9f4d3f9ca675e64cc9d616081f39a33cdefce57e`
- CrossInk version at pinned base: `1.5.1`
- PlatformIO environment: `x4-pro`
- Firmware device type: `x4-pro`
- MCU/board target: ESP32-S3R8 / `esp32-s3-devkitc1-n16r8`

## X4 Pro hardware supplied by upstream

The upstream `x4-pro` environment owns the hardware configuration. The custom Pages port must not replace or back-port the X3/X4 hardware layer.

The X4 Pro profile includes:

- ESP32-S3 target
- PSRAM-backed framebuffer
- GT911 touch support
- SDMMC storage
- capacitive Home key
- CW2017 battery gauge
- warm/cool PWM frontlight
- USB mass-storage/USB-drive support

## Porting rule

Keep the known-good X3/X4 branch `crossink-x4-pages-1.5.0` unchanged. Do not merge the BLE/Reading MMO feasibility experiment into the first X4 Pro firmware.

The temporary `crossink-x4-pro-validation-base` branch exists only so GitHub Actions can validate the Pro port without changing the known-good X3/X4 branch.

## Validation stages

1. Build the pinned, pristine `x4-pro` upstream target.
2. Rebase the Pages source changes onto the pinned X4 Pro source.
3. Build and statically validate the customized `x4-pro` target.
4. On physical hardware, validate boot, display, EPUB rendering, page-number behavior, sleep/wake, physical buttons, touch, Home key, frontlight, battery reporting, SD card, and USB drive.
5. Only after the baseline is stable, consider porting BLE/Reading MMO integration separately.
