# X4 Pro Reading Stats Dashboard — Approved Spec

## Goal
Replace the stock X4 Pro per-book Reading Stats presentation with a dense, readable, one-screen dashboard while preserving all existing CrossInk stats and the user's migrated history.

The implementation is stats-first. Decorative bookish artwork is optional and must never reduce readability or compromise firmware headroom.

## Primary dashboard

### Current book
- Sessions
- Reading Time
- Progress %
- Whole-book Pages: current / total when available, current only as fallback
- Time Left
- Pages/Min
- Started date
- Estimated Finish date (or Finished date)

### Today
- Pages read today
- Reading time today
- Today's Pages/Min

### Streak
- Current reading streak
- Best reading streak

### This Device
- Total Sessions
- Total Reading Time
- Average Pages/Min
- Average Session
- Total Pages
- Books Read

### Charts
- Pages Read This Week — seven-day vertical bar chart
- Reading Pace — seven-day line chart
- Time of Day — Morning / Afternoon / Evening / Night distribution
- Day of Week — Mon-Sun distribution

## Persistence / compatibility
- Existing `/.crosspoint/global_stats.bin` format remains unchanged.
- Existing per-book `stats_v5.bin` remains unchanged.
- New daily analytics are stored separately in `/.crosspoint/reading_daily.bin`.
- Daily analytics maintain a 14-day rolling history of pages + reading seconds.
- Nearby Stats Sync remains compatible with the existing CrossInk global-stats format.
- Existing migrated lifetime totals are never reset or rewritten by the dashboard analytics model.

## Session recording
Daily history is committed once per reading session rather than once per page turn:
- EPUB: count qualifying forward pages in RAM; commit pages + active reading seconds on reader exit.
- XTC: same behavior.
- Sessions without a trustworthy RTC date do not create daily-history entries.
- Lifetime BookReadingStats and GlobalReadingStats continue using upstream behavior.

## X4 Pro scope
Dashboard renderer is gated to `FREEINK_DEVICE_X4PRO`.
Other CrossInk device layouts stay on their existing renderer.

## Visual phases
1. Stats-only renderer and charts.
2. Whole-book current / total page plumbing.
3. Live in-session Today preview.
4. Optional lightweight icons/dividers.
5. Optional tiny bookish accent artwork if flash/RAM headroom remains healthy.

## Safety gates before device flash
- Transformation script succeeds against pinned CrossInk 1.5.1.
- X4 Pro hardware config, partition table, FreeInk SDK, bootloader/display sources remain untouched.
- Full `x4-pro` PlatformIO compile succeeds.
- Firmware fits OTA app partition with safe headroom.
- Artifact SHA-256 recorded.
- First device flash is treated as a development test; existing SD-card `.crosspoint` backup is retained.
