# CrossInk X4 Pages custom firmware build

This folder is intentionally isolated from the Reading MMO app code. It contains only the reproducible build inputs for the custom CrossInk 1.5.0 X3/X4 firmware requested for the Xteink X4.

The build is pinned to:

- CrossInk `0de623ed24acd94ae2301e8e1f4a42e32613110b` (official v1.5.0 release commit)
- FreeInk SDK `1ff020263cd2202ea79ce3eb811f5ac8489b8cde`
- pioarduino PlatformIO Core `v6.1.19`
- PlatformIO environment `default` (`x3-x4`)

The patch changes the Reading Stats presentation only. It does not modify the partition table, PlatformIO board configuration, FreeInk SDK, display drivers, OTA/flash code, or bootloader/recovery paths.

Target stats layout on the X4:

- Current book: `Sessions | Reading Time | Progress` / `Pages | Time Left | Pages/Min`
- This device: `Sessions | Reading Time | Pages/Min` / `Avg Session | Pages | Books Read`

A successful GitHub Actions run uploads a `CrossInk-X4-Pages-1.5.0-pages1` artifact containing the flashable `.bin`, SHA-256 checksum, build information, and logs.

The user's untouched official `firmware-x3-x4-v1.5.0.bin` recovery image has SHA-256:

`b5debe8b6b3f26f1af53410f388a2eb8def78b19b0c04aa94e46e942684dce2f`
