# Reading Journal — Mockup Recreation Blueprint

## Source of truth
The approved romantic botanical storybook mockup is the visual source of truth for the Reading Journal rebuild.

This is not an inspiration exercise. The goal is to translate the mockup into a functioning mobile app screen as faithfully as practical.

## Quality rule
Do not promote this branch to the live app until the Journal is visually coherent as a whole and the core interactions remain stable. Do not simplify decorative elements merely to finish faster.

---

## MUST MATCH AS CLOSELY AS POSSIBLE

### Overall composition
- Full illustrated parchment journal page, framed like a physical storybook/ledger page.
- Warm cream/parchment base with rich brown ink, muted olive, dusty purple, soft rose, and antique gold accents.
- Layered paper depth throughout rather than flat dashboard cards.
- Botanical and magical illustration integrated into the composition, not sprinkled on as generic icons.

### Header
- Small centered line: **The Archivist’s Reading Record**.
- Large elegant serif title: **Reading Journal**.
- Subtitle: **A living ledger of every page, every sitting, every story.**
- Decorative central flourish plus subtle celestial details.
- Top-left illustrated vignette with candle, stacked books, and botanicals.
- Top-right illustrated vignette with quill, ink bottle, and botanicals.
- Ornamental round controls at the upper corners.

### Current book selector
- Label: **Current Book**.
- Large parchment bookplate / plaque shape.
- Selected title displayed prominently.
- Botanical medallion / illustration integrated into the plaque.
- Decorative dropdown indicator.
- Must feel like part of the illustrated page, not a native-looking form field.

### Primary stats panel
- One cohesive layered parchment panel rather than four disconnected app cards.
- Four statistics: Sessions, Pages Read, Reading Time, Longest.
- Each statistic gets its own tasteful illustrated icon/medallion.
- Internal dividers should look drawn/printed into the paper.
- Deckled/torn/soft paper edges and subtle shadows.

### Secondary record panel
- Recorded Journey.
- Latest Sitting.
- First Record.
- Most Pages / Session.
- Must look like a second archival paper slip layered beneath the main stats.
- Include small botanical flourishes and the hanging bookmark/ribbon detail from the mockup.

### Reading Timeline heading
- Decorative parchment ribbon/banner reading **Reading Timeline**.
- Entry count below or integrated into the banner.
- Small stars/flourishes around the banner.

### Timeline
- Vertical illustrated timeline rail at the left.
- Date/day labels and times aligned to the rail.
- Reading sessions rendered as tactile layered paper slips, not rectangular UI cards.
- Paperclip/pin details.
- Gentle paper tint variation between entries.
- Book title prominent.
- Page movement, pages gained, and duration clearly readable.
- CrossInk source represented by a real wax-seal visual treatment.
- Botanical sketches / small magical accents integrated into entries.

### Lower-page decorative vignette
- Cozy illustrated composition using an open book, stacked books, botanicals, and a teacup.
- Should sit naturally below timeline content without blocking scroll or interaction.

### Overall illustration language
- Romantic botanical storybook.
- Hand-illustrated appearance.
- Refined, cozy, magical, mature — not childish.
- No pixel-art decorations in this Journal recreation.

---

## MAY ADAPT SLIGHTLY FOR A REAL MOBILE APP
- Exact spacing where needed for the real phone viewport.
- Paper/card height when dynamic text requires it.
- Illustration scale at very narrow widths.
- Dropdown mechanics and tap target size.
- Scroll behavior and safe-area spacing.
- Date/session count based on real data.
- All Books content labels where the single-book mockup does not directly map.

Any adaptation must preserve the visual composition and should not convert an illustrated element into generic app UI.

---

## DO NOT SIMPLIFY
- Do not replace the illustrated corner/prop compositions with emoji or tiny generic icons.
- Do not replace the selector plaque with a rounded HTML input look.
- Do not return to four plain statistic boxes.
- Do not turn the Reading Timeline banner back into plain text with horizontal rules.
- Do not replace wax seals with pill badges.
- Do not remove layered-paper depth to make the implementation faster.
- Do not use random pixel decorations.
- Do not make the Journal visually match the existing rest of the app; this Journal is intentionally establishing a new art direction.

---

## FUNCTIONAL BEHAVIOR TO PRESERVE
- Journal opens and closes reliably.
- Internal scrolling works on Android/PWA.
- Book selector works.
- Switching books resets to the intended top position.
- All Books and single-book modes remain available.
- Reading session data remains unchanged.
- CrossInk and Reading MMO source data remain distinguishable.
- Current app state/storage is not rewritten by the visual layer.

---

## BUILD ORDER
1. Illustrated shell/background/frame.
2. Header and upper-left/upper-right illustration compositions.
3. Current Book plaque/select control.
4. Primary stats parchment panel.
5. Secondary record parchment panel.
6. Reading Timeline ribbon.
7. Timeline rail and session-paper slips.
8. Wax seals and small decorative details.
9. Lower-page vignette.
10. All Books adaptation using the exact same visual language.
11. Mobile density/readability tuning.
12. Final side-by-side polish against the approved mockup before promotion.

## Exact-art integration note
The approved mockup itself may be used as a source for production-safe cropped art layers when doing so produces a more faithful result than redrawing the same composition. Interactive data must remain real DOM/UI layered over those art crops.

## Promotion rule
The rebuild stays on `journal-mockup-rebuild` until it is visually close enough to the approved mockup that the remaining differences are implementation necessities, not shortcuts.