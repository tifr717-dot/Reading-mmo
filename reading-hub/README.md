# Reading Hub mobile v1

This folder is the new mobile-first front end for The Reading Journal.

## Product structure
- Google Sheet remains the source of truth.
- App is the presentation + interaction layer.
- Main tabs: Home, Discover, Library, Wrapped.
- Discover is vertically scrollable and feeds user decisions (Want / Maybe / Skip) back into the Sheet.
- Existing Reading MMO / Journal code is intentionally untouched on this branch.

## Data integration plan
1. Read recommendation rows from Book Recommendation HQ.
2. Normalize to a small app JSON model.
3. Render current book, daily stats, library, and recommendation cards.
4. Write Discover feedback back to the corresponding Sheet row.
5. Add cache/offline support after the data contract is stable.

## First prototype
Open `reading-hub/index.html`.
