#!/usr/bin/env python3
from pathlib import Path
import re


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f"{label} anchor not found")
    return text.replace(old, new, 1)


src = Path('reading-ble-v51030.js').read_text()

normalizer_pattern = re.compile(r"  function normalizePhase2\(parsed,raw\)\{.*?\n  \}\n\n  function formatDuration", re.S)
normalizer_replacement = """  function normalizeReaderPayload(parsed,raw){
    const protocol=Number(parsed?.p);
    if(protocol!==2&&protocol!==3) throw new Error(`Unexpected reader protocol. Expected Phase 2 or 3, received: ${raw}`);
    if(Number(parsed?.none)===1) return {none:true,p:protocol};
    for(const key of ['sid','sp','ep','pg','sec']){
      if(!finiteNonNegative(parsed?.[key])) throw new Error(`Reader payload is missing ${key}: ${raw}`);
    }
    const payload={
      p:protocol,
      sid:Number(parsed.sid),
      sp:Number(parsed.sp),
      ep:Number(parsed.ep),
      pg:Number(parsed.pg),
      sec:Number(parsed.sec),
      title:protocol>=3?String(parsed?.title||'').trim():''
    };
    if(payload.sid<1) throw new Error(`Invalid reader session id: ${raw}`);
    return payload;
  }

  function normalizeBookName(value){
    return String(value||'').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\\s+/g,' ');
  }

  function formatDuration"""
src, count = normalizer_pattern.subn(normalizer_replacement, src, count=1)
if count != 1:
    raise SystemExit('failed to replace Phase 2 payload normalizer')

src = replace_once(src, 'const payload=normalizePhase2(parsed,raw);', 'const payload=normalizeReaderPayload(parsed,raw);', 'payload parser')

src = replace_once(
    src,
    """    const r=s.reading;
    const snapshot={
""",
    """    const r=s.reading;
    const readerBookTitle=String(payload.title||'').trim();
    const currentBookTitle=String(r.bookName||$('readBookName')?.value||'').trim();
    const appHadCurrentBook=Boolean(currentBookTitle);
    const readerMatchesCurrent=!readerBookTitle||normalizeBookName(readerBookTitle)===normalizeBookName(currentBookTitle);
    const applyReaderPosition=readerMatchesCurrent||!appHadCurrentBook;
    if(readerBookTitle&&!appHadCurrentBook){
      r.bookName=readerBookTitle;
      if($('readBookName')) $('readBookName').value=readerBookTitle;
    }

    const snapshot={
""",
    'reader state setup',
)

src = replace_once(
    src,
    """      r.sessionLoggedPages=pages;
      if(endPage>0) r.currentPage=endPage;
      r.sessionStartPage=endPage>0?endPage:Math.max(0,Number(r.currentPage)||0);

      if(r.bookTotal>0&&r.currentPage>=0){
        r.percent=Number(Math.min(100,Math.max(0,r.currentPage/r.bookTotal*100)).toFixed(1));
      }

      if($('readCurrentPage')) $('readCurrentPage').value=r.currentPage||'';
      if($('readSessionCurrentPage')) $('readSessionCurrentPage').value=r.currentPage||'';
      if($('readSessionStartPage')) $('readSessionStartPage').value=r.sessionStartPage||'';
      if($('readPercent')&&r.bookTotal>0) $('readPercent').value=r.percent;
""",
    """      r.sessionLoggedPages=pages;
      if(applyReaderPosition&&endPage>0) r.currentPage=endPage;
      r.sessionStartPage=Math.max(0,Number(r.currentPage)||0);

      if(applyReaderPosition&&r.bookTotal>0&&r.currentPage>=0){
        r.percent=Number(Math.min(100,Math.max(0,r.currentPage/r.bookTotal*100)).toFixed(1));
      }

      if(applyReaderPosition){
        if($('readCurrentPage')) $('readCurrentPage').value=r.currentPage||'';
        if($('readSessionCurrentPage')) $('readSessionCurrentPage').value=r.currentPage||'';
        if($('readPercent')&&r.bookTotal>0) $('readPercent').value=r.percent;
      }
      if($('readSessionStartPage')) $('readSessionStartPage').value=r.sessionStartPage||'';
""",
    'reader position safety',
)

src = replace_once(
    src,
    "        bookTitle:String(r.bookName||'')\n",
    "        bookTitle:readerBookTitle||String(r.bookName||'')\n",
    'history book title handoff',
)

src = replace_once(
    src,
    """      Object.assign(after,{
        source:'crossink',
        readerSessionId:payload.sid,
        readerStartPage:payload.sp,
        readerEndPage:payload.ep
      });
""",
    """      Object.assign(after,{
        source:'crossink',
        readerSessionId:payload.sid,
        readerStartPage:payload.sp,
        readerEndPage:payload.ep,
        readerBookTitle:readerBookTitle||String(r.bookName||'')
      });
""",
    'last session book metadata',
)

src = replace_once(
    src,
    """      setPayload(
        `IMPORTED FROM CROSSINK\\n`+
        `Page range: ${payload.sp} → ${payload.ep}\\n`+
        `Pages read: ${payload.pg}\\n`+
        `Reading time: ${formatDuration(payload.sec)}\\n\\n`+
        `Pages and reading time were applied to your Reading MMO totals/active quests.`
      );
""",
    """      const filedBook=readerBookTitle||String(r.bookName||'your Reading MMO book');
      const positionNote=applyReaderPosition
        ? `Book progress was updated to reader page ${payload.ep}.`
        : `The session was filed under ${filedBook}; your current Reading MMO book progress was left unchanged.`;
      setPayload(
        `IMPORTED FROM CROSSINK\\n`+
        `Book: ${filedBook}\\n`+
        `Page range: ${payload.sp} → ${payload.ep}\\n`+
        `Pages read: ${payload.pg}\\n`+
        `Reading time: ${formatDuration(payload.sec)}\\n\\n`+
        `Pages and reading time were applied to your Reading MMO totals/active quests.\\n${positionNote}`
      );
""",
    'import summary',
)

src = replace_once(
    src,
    """        setPayload(
          `CROSSINK SESSION ${payload.sid}\\n`+
          `Page range: ${payload.sp} → ${payload.ep}\\n`+
          `Pages read: ${payload.pg}\\n`+
          `Reading time: ${formatDuration(payload.sec)}`
        );
""",
    """        setPayload(
          `CROSSINK SESSION ${payload.sid}\\n`+
          `${payload.title?`Book: ${payload.title}\\n`:''}`+
          `Page range: ${payload.sp} → ${payload.ep}\\n`+
          `Pages read: ${payload.pg}\\n`+
          `Reading time: ${formatDuration(payload.sec)}`
        );
""",
    'duplicate preview',
)

src = replace_once(
    src,
    """      const book=appState()?.reading?.bookName||$('readBookName')?.value?.trim()||'your current Reading MMO book';
      setState(`✓ Reader connected — Session ${payload.sid} is ready to import.`,'ok');
      setPayload(
        `CROSSINK SESSION ${payload.sid}\\n`+
        `Target: ${book}\\n`+
        `Page range: ${payload.sp} → ${payload.ep}\\n`+
        `Pages read: ${payload.pg}\\n`+
        `Reading time: ${formatDuration(payload.sec)}\\n\\n`+
        `Tap IMPORT SESSION to apply it to Reading MMO.`
      );
""",
    """      const book=appState()?.reading?.bookName||$('readBookName')?.value?.trim()||'';
      const readerBook=payload.title||book||'your current Reading MMO book';
      const differentBook=Boolean(payload.title&&book&&normalizeBookName(payload.title)!==normalizeBookName(book));
      setState(`✓ Reader connected — Session ${payload.sid} is ready to import${payload.title?` for ${payload.title}`:''}.`,'ok');
      setPayload(
        `CROSSINK SESSION ${payload.sid}\\n`+
        `Book: ${readerBook}\\n`+
        `Page range: ${payload.sp} → ${payload.ep}\\n`+
        `Pages read: ${payload.pg}\\n`+
        `Reading time: ${formatDuration(payload.sec)}\\n\\n`+
        `${differentBook?`Reader book differs from Current Book (${book}). This session will be filed under ${readerBook} without changing ${book}'s page progress.\\n\\n`:''}`+
        `Tap IMPORT SESSION to apply it to Reading MMO.`
      );
""",
    'new session preview',
)

Path('reading-ble-v51033.js').write_text(src)

# Let supporting runtimes inherit the app's owner version rather than stamping an older one.
for name, fallback in [('reading-history-v51031.js','v5.10.31'),('reading-journal-v51032.js','v5.10.32')]:
    p = Path(name)
    text = p.read_text()
    text = text.replace(f"const BUILD='{fallback}';", f"const BUILD=window.__readingMmoVersionOwner||'{fallback}';")
    p.write_text(text)

# Wire the fresh app/cache generation.
idx = Path('index.html')
text = idx.read_text()
text = text.replace("window.__readingMmoVersionOwner='v5.10.32';", "window.__readingMmoVersionOwner='v5.10.33';")
text = text.replace('v5.10.32</span>', 'v5.10.33</span>')
text = text.replace('?v=51032', '?v=51033')
text = text.replace("u.searchParams.set('appv','51032')", "u.searchParams.set('appv','51033')")
text = text.replace('reading-ble-v51030.js?v=51033', 'reading-ble-v51033.js?v=51033')
text = text.replace('service-worker-v51032.js?v=51033', 'service-worker-v51033.js?v=51033')
idx.write_text(text)

sw = Path('service-worker-v51032.js').read_text()
sw = sw.replace('reading-mmo-v5.10.32-standalone-reading-journal', 'reading-mmo-v5.10.33-book-aware-reader-sync')
sw = sw.replace("const FORCE_VERSION = '51032';", "const FORCE_VERSION = '51033';")
sw = sw.replace("'./reading-ble-v51030.js',", "'./reading-ble-v51033.js',")
Path('service-worker-v51033.js').write_text(sw)

Path('BUILD-NOTES-v5.10.33.txt').write_text("""Reading MMO v5.10.33 — Book-Aware CrossInk Sync

- Accepts both existing Phase 2 reader packets and new Phase 3 titled packets.
- Phase 3 uses the real EPUB metadata title sent by CrossInk.
- Titled sessions are filed automatically under the X4 book in Reading Journal.
- If the reader title matches Current Book, page progress updates normally.
- If the reader title differs from Current Book, session totals/quests/journal still update but Current Book page progress is left unchanged.
- If no Current Book is set, a titled reader session can establish it automatically.
- Duplicate protection remains based on session id/page/time fingerprint, so old sessions cannot be counted twice merely because a title becomes available later.
- The standalone Reading Journal remains available from the Reading Desk and Library.
- Uses fresh cache generation 51033.
""")

# Fail before commit if any required wiring is absent.
idx_text = idx.read_text()
ble = Path('reading-ble-v51033.js').read_text()
sw_text = Path('service-worker-v51033.js').read_text()
checks = [
    (idx_text, "window.__readingMmoVersionOwner='v5.10.33'"),
    (idx_text, 'reading-ble-v51033.js?v=51033'),
    (idx_text, 'reading-history-v51031.js?v=51033'),
    (idx_text, 'reading-journal-v51032.js?v=51033'),
    (idx_text, 'service-worker-v51033.js?v=51033'),
    (ble, 'function normalizeReaderPayload'),
    (ble, 'protocol!==2&&protocol!==3'),
    (ble, "title:protocol>=3?String(parsed?.title||'').trim():''"),
    (ble, 'readerMatchesCurrent'),
    (ble, 'applyReaderPosition'),
    (ble, 'bookTitle:readerBookTitle'),
    (ble, 'Reader book differs from Current Book'),
    (sw_text, 'reading-mmo-v5.10.33-book-aware-reader-sync'),
    (sw_text, "FORCE_VERSION = '51033'"),
    (sw_text, "'./reading-ble-v51033.js'"),
]
for haystack, needle in checks:
    if needle not in haystack:
        raise SystemExit(f'missing v5.10.33 wiring: {needle}')

print('Applied Reading MMO v5.10.33 book-aware reader sync')
