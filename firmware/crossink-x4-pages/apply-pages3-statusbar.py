#!/usr/bin/env python3
from pathlib import Path
import sys

root = Path(sys.argv[1] if len(sys.argv) > 1 else "crossink")
status = root / "src/activities/settings/StatusBarSettingsActivity.cpp"
s = status.read_text()

old = '''  selectedIndex = 0;\n  visibleItemCount = stablePageNumbersAvailable ? ITEM_COUNT : ITEM_COUNT - 1;\n'''
new = '''  selectedIndex = 0;\n  // Pages3: whole-book page numbers have a custom fallback, so this option is always available.\n  visibleItemCount = ITEM_COUNT;\n'''
if old not in s:
    raise SystemExit("Pages3 status-bar visibility target not found")
s = s.replace(old, new, 1)

old = '''int StatusBarSettingsActivity::itemForVisibleIndex(const int visibleIndex) const {\n  return !stablePageNumbersAvailable && visibleIndex >= ITEM_STABLE_PAGE_NUMBERS ? visibleIndex + 1 : visibleIndex;\n}\n'''
new = '''int StatusBarSettingsActivity::itemForVisibleIndex(const int visibleIndex) const {\n  return visibleIndex;\n}\n'''
if old not in s:
    raise SystemExit("Pages3 status-bar index target not found")
s = s.replace(old, new, 1)

old = '''    item.label = I18N.get(menuNames[itemIndex]);\n'''
new = '''    item.label = itemIndex == ITEM_STABLE_PAGE_NUMBERS ? "Whole Book Page Count" : I18N.get(menuNames[itemIndex]);\n'''
if old not in s:
    raise SystemExit("Pages3 status-bar label target not found")
s = s.replace(old, new, 1)

status.write_text(s)
assert "visibleItemCount = ITEM_COUNT;" in s
assert '"Whole Book Page Count"' in s
assert "return visibleIndex;" in s
print("Applied Pages3 status-bar UI edit: expose selectable Whole Book Page Count")
