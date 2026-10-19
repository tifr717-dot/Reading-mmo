# XTEINK X4 Pro daily reading log — DEV12

## Purpose
An **on-device** daily reading diary. It automatically records, separately for
each date and book, the qualifying forward XTE e-reader page turns, active
reading seconds, and last displayed reading progress in tenths of a percent.
No exports, network calls or Google Sheets integration.

## Access
1. Open the normal CrossInk Reading Stats screen.
2. Move from **Per Book** to **This Device**, then **Daily Reading Log** using
   Right/Down or a horizontal swipe.
3. On the diary screen, **Up** goes to the previous date and **Down** goes
   toward today. Left/Right move to adjacent statistics screens.
4. Back exits Reading Stats. The existing dashboard, charts, and monthly
   calendar are intentionally unchanged.

## Storage
- `/.crosspoint/reading_log/YYYYMMDD.drl`, one file per local date.
- Fixed record size, versioned header, checksum, and recoverable .tmp/.bak.
- Up to 32 different book identities per day (path-based identity).
- Never reads, changes, or resets `global_stats.bin`, per-book `stats_v5.bin`,
  or the existing 14-day dashboard cache `reading_daily.bin`.
- Starts from the first reading event **after DEV12 installation**. Does not
  invent earlier per-book history.

## Measurement
- Pages are counted only from the existing qualifying forward-page path, not
  from arbitrary bookmark or chapter jumps.
- Active time uses CrossInk's existing idle time cutoff. Unaccepted idle
  time is excluded.
- On an actual midnight transition, accepted time is split by local day;
  the page turn belongs to the date of the turn.
- Clock helper currently has minute precision. Splitting near midnight may
  have up to about 30 seconds of uncertainty.
- The display reports **XTE e-reader pages**, not physical edition page
  counts.
- New diary data is persisted on each accepted page/time event or pause;
  stale progress before the last event may be lost if device power is lost.
- Advanced multi-device Stats Sync intentionally excludes this local diary.

## Development safety checks
- Run only `x4-pro` (not x4 / x3) firmware build target.
- Confirm original `apply_pages_x4pro.py` succeeds first.
- Confirm `apply_daily_reading_log.py` succeeds against the pinned CrossInk.
- Confirm exact FreeInk SDK pin, original partitions, and hardware configs.
- Confirm `pio run -j1 -e x4-pro` succeeds and firmware fits OTA partition.
- Back up `/.crosspoint` from the SD card before flashing a development build.
- On hardware, read across midnight and reboot; verify yesterday remains,
  today increments, and multiple book entries stay separate. Test sleep, page
  advances, navigation skips, and modified e-reader font sizes.
- **Build success is not device-side hardware verification.**
