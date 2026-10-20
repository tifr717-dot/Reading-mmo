# DEV13 — daily diary enrichment (XTEINK X4 Pro)

Built **on top of verified on-device DEV12 diary**; approved stats/calendar remain untouched.

## New entries
- Starting and ending book progress, plus percentage-point change.
- Starting and ending **whole-book XTE page position**, with `--` when not reliable.
- One reading session per qualifying book opening per local calendar day.
- Daily total and book-specific time/pages preserved, with no export workflow.
- Better footer spacing, simplified pluralization, and a TODAY label.

## Preserving DEV12
- Reader accepts `DRL1` (96-byte per-book entries) and `DRL2` (112-byte entries).
- Writes `DRL2` to the same `/.crosspoint/reading_log/YYYYMMDD.drl` location via
  existing temp/backup/rename transactional storage.
- Historical DEV12 entries are **not erased or recalculated**.
- For pre-DEV13 diary activity, starting positions, starting progress, and
  session count were never recorded; those fields remain unknown (`--`).
- First/last XTE positions depend on EPUB's layout and may change if the
  font size changes. Do not interpret them as fixed publisher page numbers.

## Hardware acceptance tests
1. Back up `/.crosspoint` and keep the working DEV12 binary as rollback.
2. Flash DEV13 **only after** `x4-pro` build success, SHA check and size check.
3. Confirm October 19 DEV12 False Gods 3-page, ~1 minute, 8.6% entry remains.
4. Read 3 more pages of False Gods, exit/reopen reader, check correct two sessions.
5. Check starting/ending XTE positions are populated where available.
6. Read across midnight; confirm separate dates and retained history on restart.
7. Ensure moving between chapters and font changes do not fabricate pages.
8. Confirm the footer is legible on actual 480x800 X4 Pro screen.

No Google Sheets sync or export is introduced.
