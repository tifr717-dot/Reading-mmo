# CrossInk X4 Pages custom build manifest

This kit is for a reproducible custom build based on the official CrossInk 1.5.0 source supplied for this project.

## Pinned base

- CrossInk commit: `0de623ed24acd94ae2301e8e1f4a42e32613110b`
- FreeInk SDK commit: `1ff020263cd2202ea79ce3eb811f5ac8489b8cde`
- PlatformIO Core: `pioarduino/platformio-core v6.1.19`
- PlatformIO environment: `default`
- Firmware device type: `x3-x4`
- Custom build label: `1.5.0-pages1`

## Protected parts

The patch intentionally does **not** change:

- `platformio.ini`
- `partitions.csv`
- the FreeInk SDK / display drivers
- bootloader or partition layout
- OTA/flash code
- board selection or X3/X4 hardware detection

The workflow hashes and re-checks the protected build inputs before compiling.

## Intended X4 stats layout

Current book:

`Sessions | Reading Time | Progress`

`Pages | Time Left | Pages/Min`

Device totals:

`Sessions | Reading Time | Pages/Min`

`Avg Session | Pages | Books Read`

For EPUBs, the custom top Pages value prefers CrossInk stable/reference page metadata when present. If a normal EPUB lacks that metadata, it estimates a whole-book page position from the saved/rendered section position rather than using the reading-stat page-turn counter. XTC books use their exact saved page index. Device Pages uses the existing `totalPagesTurned` statistic.

## Original recovery firmware supplied by the user

SHA-256 of `firmware-x3-x4-v1.5.0.bin`:

`b5debe8b6b3f26f1af53410f388a2eb8def78b19b0c04aa94e46e942684dce2f`

Keep that original firmware available as the recovery image while testing the custom build.
