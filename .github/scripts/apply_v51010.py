from pathlib import Path

p = Path('index.html')
text = p.read_text()

# Dedicated illustrated spine overlay SVGs.
common_top = '<path d="M18 28 C31 13 40 22 50 8 C60 22 69 13 82 28"/><path d="M24 35 C36 27 42 31 50 22 C58 31 64 27 76 35"/>'
common_bottom = '<path d="M18 252 C31 267 40 258 50 274 C60 258 69 267 82 252"/><path d="M24 245 C36 253 42 249 50 258 C58 249 64 253 76 245"/>'
motifs = {
    '6': '<path d="M50 47 l6 12 13 2-10 9 3 13-12-7-12 7 3-13-10-9 13-2z"/><path d="M50 212 v24 M38 224 h24 M43 217 l14 14 M57 217 l-14 14"/>',
    '5': '<path d="M34 58 C38 47 52 46 57 56 C70 54 74 70 64 75 H37 C26 74 25 61 34 58z"/><path d="M43 80 l-5 13 M53 80 l-5 13 M63 80 l-5 13"/><path d="M35 219 C40 209 54 209 59 218 C70 216 75 229 65 234 H38 C28 232 27 221 35 219z"/>',
    '4': '<path d="M35 49 l30 37 M65 49 L35 86 M39 47 l-7-7 M61 47 l7-7 M39 88 l-7 7 M61 88 l7 7"/><path d="M50 209 v32 M39 225 h22 M44 214 l6-7 6 7"/>',
    '3': '<path d="M50 44 C35 58 36 72 50 84 C64 72 65 58 50 44z"/><path d="M50 84 v18 M50 89 C40 86 34 91 30 98 M50 94 C61 90 67 95 71 103"/><path d="M50 207 v33 M50 221 C38 213 33 218 29 228 M50 226 C62 216 68 221 72 232"/>',
    '2': '<path d="M50 49 C43 38 28 44 30 57 C32 69 50 79 50 79 C50 79 68 69 70 57 C72 44 57 38 50 49z"/><path d="M50 212 C44 201 31 204 32 216 C33 228 50 239 50 239 C50 239 67 228 68 216 C69 204 56 201 50 212z"/>',
    '1': '<path d="M50 43 l7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z"/><path d="M50 207 C41 220 38 226 38 233 C38 242 43 248 50 248 C57 248 62 242 62 233 C62 226 59 220 50 207z"/>',
    'standalone': '<path d="M50 45 l12 14-12 14-12-14z"/><path d="M32 80 C42 71 58 71 68 80 M35 86 C43 79 57 79 65 86"/><path d="M50 211 l14 12-14 12-14-12z"/><path d="M33 242 C42 234 58 234 67 242"/>'
}
for key, motif in motifs.items():
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 300" fill="none" stroke="#e5bf6b" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
<path opacity=".9" d="M12 12 H88 Q94 12 94 20 V280 Q94 288 86 288 H14 Q6 288 6 280 V20 Q6 12 12 12z"/>
<path opacity=".45" d="M16 18 H84 M16 282 H84"/>
<g opacity=".92">{common_top}</g>
<g opacity=".95">{motif}</g>
<g opacity=".82">{common_bottom}</g>
<circle cx="50" cy="31" r="2.4" fill="#e5bf6b" stroke="none"/>
</svg>'''
    Path(f'archive-spine-{key}.svg').write_text(svg)

# Replace the old detail markup with a new component namespace so legacy CSS cannot affect it.
detail_start = text.index('    <div id="libraryDetailView"')
detail_end = text.index('  </div>\n</section>\n\n<section id="quests"', detail_start)
detail_html = '''    <div id="libraryDetailView" class="v51010-detail-view" hidden>
      <div class="v51010-record-book">
        <img class="v51010-record-bg" src="./v53-open-book.png" alt="Open archive record book">
        <section class="v51010-left-page" aria-label="Book cover">
          <div class="v51010-cover-frame">
            <img id="libraryDetailCoverImg" alt="" hidden>
            <div id="libraryDetailCoverPlaceholder" class="v51010-cover-placeholder"><span>📖</span><b id="libraryDetailCoverTitle">Archived Volume</b></div>
          </div>
          <input id="libraryCoverInput" type="file" accept="image/*" hidden onchange="handleLibraryCoverUpload(event)">
          <div class="v51010-cover-actions">
            <button class="v51010-cover-main" onclick="document.getElementById('libraryCoverInput').click()">🖼 ADD / CHANGE COVER</button>
            <button id="libraryRemoveCoverBtn" class="v51010-remove-cover" onclick="removeLibraryCover()" hidden>REMOVE COVER 🗑</button>
          </div>
        </section>
        <section class="v51010-right-page" aria-label="Archive record">
          <div id="libraryDetailEntry" class="v51010-entry-ribbon">LIBRARY ENTRY #001</div>
          <div id="libraryDetailTitle" class="v51010-record-title">Archived Volume</div>
          <div id="libraryDetailAuthor" class="v51010-record-author">Unknown author</div>
          <div class="v51010-rating-row"><span id="libraryDetailRating" class="v51010-rating">Unrated</span><span id="libraryDetailFavorite" class="v51010-favorite" hidden>★ FAVORITE</span></div>
          <div class="v51010-ledger">
            <div><span>SERIES</span><b id="libraryDetailSeries">Standalone</b></div>
            <div><span>PAGES</span><b id="libraryDetailPages">—</b></div>
            <div><span>STARTED</span><b id="libraryDetailStarted">—</b></div>
            <div><span>FINISHED</span><b id="libraryDetailFinished">—</b></div>
          </div>
          <div id="libraryDetailNotes" class="v51010-notes" hidden><b>ARCHIVIST'S NOTES</b><span id="libraryDetailNotesText"></span></div>
          <div class="v51010-record-actions">
            <button class="v51010-shelf-btn" onclick="closeLibraryDetail()">📚 SHELF VIEW</button>
            <button class="v51010-edit-btn" onclick="editCurrentLibraryRecord()">✒ EDIT RECORD</button>
          </div>
        </section>
      </div>
    </div>
'''
text = text[:detail_start] + detail_html + text[detail_end:]

# Rebuild the shelf renderer with new class names.
fn_start = text.index('function libraryBookCardMarkup(b,volumeNo){')
fn_end = text.index('function renderLibrary(){', fn_start)
functions = '''function libraryBookCardMarkup(b,volumeNo){
 const n=Number(volumeNo||1), h=(n-1)%5+1;
 const selected=String(libraryDetailId||'')===String(b.id)?' selected':'';
 const series=librarySeriesShort(b.series);
 const key=series==='#6'?'6':series==='#5'?'5':series==='#4'?'4':series==='#3'?'3':series==='#2'?'2':series==='#1'?'1':series==='STANDALONE'?'standalone':'standalone';
 const palettes={'6':['#a77a2f','#503715'],'5':['#77735d','#343127'],'4':['#397a9c','#17394a'],'3':['#39775f','#173c31'],'2':['#684493','#2f1e47'],'1':['#8a493c','#44231d'],'standalone':['#82516e','#402436']};
 const pal=palettes[key];
 return `<button class="v51010-spine k${key} h${h}${selected}" style="--s1:${pal[0]};--s2:${pal[1]}" onclick="openLibraryRecord('${esc(b.id)}')" aria-label="Open library record for ${esc(b.title)} by ${esc(b.author||'Unknown author')}">
   <img class="v51010-spine-art" src="./archive-spine-${key}.svg" alt="" aria-hidden="true">
   ${b.favorite?'<span class="v51010-spine-fav">★</span>':''}
   <span class="v51010-spine-bookmark" aria-hidden="true"></span>
   <span class="v51010-spine-title">${esc(b.title)}</span>
   <span class="v51010-spine-series">${esc(series)}</span>
  </button>`;
}
function libraryShelfRowsMarkup(rows,volumeNo){
 const chunks=[];for(let i=0;i<rows.length;i+=7)chunks.push(rows.slice(i,i+7));
 return chunks.map(chunk=>`<div class="v51010-shelf-row">
   <img class="v51010-shelf-candle" src="./v53-candle.png" alt="" aria-hidden="true">
   <img class="v51010-shelf-books" src="./v53-books.png" alt="" aria-hidden="true">
   <img class="v51010-shelf-ivy left" src="./asset-ivy.png" alt="" aria-hidden="true">
   <img class="v51010-shelf-ivy right" src="./asset-ivy.png" alt="" aria-hidden="true">
   <div class="v51010-books">${chunk.map(b=>libraryBookCardMarkup(b,volumeNo.get(String(b.id))||1)).join('')}</div>
   <div class="v51010-shelf-plank" aria-hidden="true"></div>
  </div>`).join('');
}
'''
text = text[:fn_start] + functions + text[fn_end:]

css = r'''
<style id="v51010-concept-faithful-archive">
#library .v51010-shelf-row{position:relative;height:356px;margin:10px 0 14px;overflow:hidden;border-radius:13px;background:radial-gradient(ellipse at 50% 43%,rgba(133,80,43,.24),transparent 48%),linear-gradient(180deg,rgba(25,10,6,.06),rgba(7,3,2,.28)),url('./v53-wood-tile.png') center/175px auto repeat;border:2px solid #744824;box-shadow:0 10px 18px rgba(0,0,0,.29),inset 0 0 0 4px #2b140d,inset 0 0 0 7px #9a6231,inset 0 0 0 9px rgba(233,184,91,.14)}
#library .v51010-shelf-row:before{content:"";position:absolute;left:18px;right:18px;top:16px;height:18px;border-radius:9px;background:linear-gradient(180deg,#b77a3a 0 12%,#76451f 12% 54%,#3b1e12 54% 100%);border:1px solid #c58a49;box-shadow:0 4px 0 rgba(14,6,4,.35),inset 0 1px rgba(255,226,151,.14)}
#library .v51010-shelf-row:after{content:"";position:absolute;left:24px;right:24px;bottom:15px;height:23px;z-index:2;background:linear-gradient(180deg,#ce9148 0 13%,#825024 13% 47%,#482417 47% 79%,#1f0e09 79% 100%);border:1px solid #845229;border-top-color:#e0a559;box-shadow:0 7px 0 rgba(11,5,3,.48),inset 0 1px rgba(255,224,150,.13)}
#library .v51010-books{position:absolute;left:8%;right:8%;top:39px;bottom:37px;z-index:3;display:flex;align-items:flex-end;justify-content:center;gap:5px}
#library .v51010-spine{--s1:#6f4d8f;--s2:#34213f;position:relative;flex:1 1 0;min-width:0;max-width:72px;height:92%;padding:0;border:1px solid #170906;border-radius:12px 12px 4px 4px / 9px 9px 4px 4px;overflow:visible;color:#f6e3b1;text-align:center;background:radial-gradient(circle at 28% 17%,rgba(255,255,255,.15),transparent 24%),repeating-linear-gradient(96deg,rgba(255,255,255,.025) 0 2px,rgba(0,0,0,.025) 2px 4px),linear-gradient(90deg,rgba(255,245,210,.15),transparent 11%,transparent 86%,rgba(0,0,0,.29)),linear-gradient(180deg,var(--s1),var(--s2));box-shadow:3px 6px 0 #110704,0 10px 13px rgba(0,0,0,.35),inset 0 0 13px rgba(0,0,0,.12);transform-origin:50% 100%;transition:transform .17s ease,filter .17s ease}
#library .v51010-spine:nth-child(1){flex-grow:1.15;height:98%}#library .v51010-spine:nth-child(2){flex-grow:.94;height:89%;transform:rotate(-.35deg)}#library .v51010-spine:nth-child(3){flex-grow:1.03;height:94%;transform:rotate(.2deg)}#library .v51010-spine:nth-child(4){flex-grow:1.08;height:100%;transform:rotate(-.15deg)}#library .v51010-spine:nth-child(5){flex-grow:.92;height:91%;transform:rotate(.25deg)}#library .v51010-spine:nth-child(6){flex-grow:1.08;height:97%;transform:rotate(-.22deg)}#library .v51010-spine:nth-child(7){flex-grow:.98;height:92%;transform:rotate(.18deg)}
#library .v51010-spine:hover,#library .v51010-spine:focus-visible{filter:brightness(1.08);transform:translateY(-5px)}
#library .v51010-spine-art{position:absolute;inset:5px;width:calc(100% - 10px);height:calc(100% - 10px);z-index:2;pointer-events:none;filter:drop-shadow(0 1px 0 rgba(40,15,7,.7))}
#library .v51010-spine-title{position:absolute;z-index:4;left:50%;top:48px;bottom:73px;transform:translateX(-50%) rotate(180deg);writing-mode:vertical-rl;text-orientation:mixed;display:block;white-space:nowrap;overflow:hidden;color:#f8e6b8;font:900 clamp(8px,1.48vw,11.4px)/1 Georgia,'Times New Roman',serif;letter-spacing:.08px;text-shadow:0 1px 1px #190a06,0 0 5px rgba(0,0,0,.24)}
#library .v51010-spine-series{position:absolute;z-index:4;left:9px;right:9px;bottom:12px;height:17px;display:grid;place-items:center;color:#f0d18b;background:linear-gradient(180deg,rgba(29,11,6,.16),rgba(8,3,2,.46));border-top:1px solid rgba(241,200,105,.52);border-bottom:1px solid rgba(8,3,2,.30);font:900 clamp(4.2px,.85vw,6px)/1 ui-monospace,monospace}
#library .v51010-spine-fav{position:absolute;right:9px;top:11px;z-index:5;color:#ffe58e;font-size:9px;text-shadow:0 1px 1px #1a0905}
#library .v51010-spine-bookmark{display:none;position:absolute;right:8px;top:-4px;width:10px;height:37px;z-index:6;background:linear-gradient(180deg,#aa5136,#722b22);border-left:1px solid #e2b05e;border-right:1px solid #e2b05e;clip-path:polygon(0 0,100% 0,100% 77%,50% 100%,0 77%);box-shadow:0 3px 5px rgba(0,0,0,.35)}
#library .v51010-spine.selected{transform:translateY(-8px)!important;filter:brightness(1.09);box-shadow:0 0 0 1px #f3d283,0 0 22px rgba(255,196,69,.38),3px 11px 0 #110704,0 14px 18px rgba(0,0,0,.36)}#library .v51010-spine.selected .v51010-spine-bookmark{display:block}
#library .v51010-shelf-candle{position:absolute;left:21px;bottom:39px;width:28px;z-index:4;transform:scale(1.95);transform-origin:bottom left;filter:drop-shadow(0 3px 4px rgba(0,0,0,.36))}#library .v51010-shelf-books{position:absolute;right:19px;bottom:39px;width:34px;z-index:4;transform:scale(1.45);transform-origin:bottom right;filter:drop-shadow(0 3px 4px rgba(0,0,0,.35))}#library .v51010-shelf-ivy{position:absolute;top:7px;width:39px;z-index:4;opacity:.92}#library .v51010-shelf-ivy.left{left:5px;transform:rotate(-13deg)}#library .v51010-shelf-ivy.right{right:5px;transform:rotate(13deg) scaleX(-1)}#library .v51010-shelf-plank{position:absolute;left:25px;right:25px;bottom:15px;height:23px;z-index:5;pointer-events:none}
#library .v51010-detail-view{margin-top:12px;padding:0 0 8px}#library .v51010-detail-view[hidden]{display:none!important}#library .v51010-record-book{position:relative;width:100%;height:372px;overflow:visible}#library .v51010-record-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none;filter:drop-shadow(0 7px 8px rgba(0,0,0,.20))}
#library .v51010-left-page{position:absolute;left:5.2%;top:8.8%;width:39.2%;bottom:8.2%;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:8px}#library .v51010-cover-frame{width:70%;max-width:166px;aspect-ratio:2/3;display:grid;place-items:center;overflow:hidden;background:linear-gradient(160deg,#72518e,#3c274b);border:2px solid #261109;outline:1px solid #b78243;outline-offset:-5px;border-radius:4px;box-shadow:4px 7px 0 rgba(43,20,11,.60),0 10px 14px rgba(0,0,0,.20)}#library .v51010-cover-frame img{width:100%;height:100%;object-fit:cover;display:block;color:transparent;font-size:0}#library .v51010-cover-placeholder{width:100%;height:100%;display:grid;place-items:center;align-content:center;padding:12px;text-align:center;color:#f3d99d;background:radial-gradient(circle at 50% 18%,rgba(255,255,255,.13),transparent 35%),linear-gradient(180deg,#765693,#3f2851)}#library .v51010-cover-placeholder span{font-size:27px}#library .v51010-cover-placeholder b{margin-top:7px;font:900 8px/1.15 Georgia,serif;overflow-wrap:anywhere}#library .v51010-cover-actions{width:78%;display:grid;gap:4px}#library .v51010-cover-main{min-height:32px;margin:0;padding:5px 7px;border:2px solid #8d6131;border-radius:8px;background:linear-gradient(#745093,#54356d);color:#f5dfae;box-shadow:0 4px 0 rgba(54,25,13,.35);font:900 5px/1 ui-monospace,monospace}#library .v51010-remove-cover{min-height:18px;margin:0;padding:2px 4px;border:0;background:transparent;color:#76523a;box-shadow:none;text-decoration:underline;text-underline-offset:2px;font:800 4px/1 ui-monospace,monospace}
#library .v51010-right-page{position:absolute;left:50.3%;right:6.2%;top:9.6%;bottom:8.6%;display:flex;flex-direction:column;min-width:0;color:#4d301d}#library .v51010-entry-ribbon{align-self:flex-start;padding:5px 13px;margin-bottom:7px;border-radius:3px 3px 8px 8px;background:linear-gradient(#a06a4d,#7a4330);border:1px solid #6d3b2b;color:#f6dfb3;box-shadow:0 2px 0 rgba(74,35,20,.18);font:900 4.2px/1 ui-monospace,monospace;letter-spacing:.32px}#library .v51010-record-title{max-width:100%;margin:0;color:#432716;font:900 20px/1.02 Georgia,'Times New Roman',serif;white-space:normal;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-shadow:0 1px rgba(255,248,226,.35)}#library .v51010-record-author{margin-top:4px;color:#78543a;font:800 7px/1.15 ui-monospace,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#library .v51010-rating-row{margin-top:10px;display:flex;align-items:center;gap:8px;min-height:30px}#library .v51010-rating{display:inline-block;padding:6px 10px;border-radius:8px;background:#58341f;border:1px solid #8b6136;color:#f7d987;font:900 8px/1 Georgia,serif;box-shadow:0 2px 0 rgba(72,34,18,.18)}#library .v51010-favorite{color:#9b651f;font:900 5px/1 ui-monospace,monospace;white-space:nowrap}
#library .v51010-ledger{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}#library .v51010-ledger>div{position:relative;min-height:54px;padding:8px 9px;background:rgba(255,247,221,.36);border:1px solid rgba(155,110,60,.52);box-shadow:inset 0 0 0 1px rgba(255,255,255,.13)}#library .v51010-ledger>div:after{content:"❧";position:absolute;right:5px;bottom:4px;color:rgba(139,96,48,.45);font:900 7px/1 Georgia,serif}#library .v51010-ledger span{display:block;margin-bottom:5px;color:#846044;font:900 4.3px/1 ui-monospace,monospace;letter-spacing:.2px}#library .v51010-ledger b{display:block;padding-right:8px;color:#49301d;font:900 7px/1.12 Georgia,'Times New Roman',serif;overflow-wrap:anywhere}#library .v51010-notes{margin-top:8px;max-height:48px;overflow:hidden;padding:7px 3px 6px;border-top:1px solid rgba(142,99,54,.34);color:#654531;font:italic 700 6px/1.32 Georgia,'Times New Roman',serif}#library .v51010-notes b{display:block;margin-bottom:3px;color:#815b3c;font:900 4px/1 ui-monospace,monospace;font-style:normal;letter-spacing:.18px}#library .v51010-record-actions{margin-top:auto;display:grid;grid-template-columns:1fr 1fr;gap:8px}#library .v51010-record-actions button{min-height:34px;margin:0;padding:5px;border-radius:8px;box-shadow:0 4px 0 rgba(54,25,13,.28);font:900 5px/1 ui-monospace,monospace}#library .v51010-shelf-btn{background:#6f5846;color:#f5e1b6;border:2px solid #7d552f}#library .v51010-edit-btn{background:#82610f;color:#fff0c3;border:2px solid #93682d}
@media(max-width:420px){#library .v51010-shelf-row{height:318px}#library .v51010-books{left:7%;right:7%;top:36px;bottom:35px;gap:3px}#library .v51010-spine{max-width:58px;border-radius:10px 10px 3px 3px / 8px 8px 3px 3px}#library .v51010-spine-title{top:43px;bottom:67px;font-size:6.9px}#library .v51010-spine-series{left:6px;right:6px;bottom:10px;height:14px;font-size:3.65px}#library .v51010-shelf-candle{left:18px;transform:scale(1.7)}#library .v51010-shelf-books{right:17px;transform:scale(1.28)}#library .v51010-record-book{height:345px}#library .v51010-left-page{left:4.8%;top:9%;width:39.8%;bottom:8.5%;gap:6px}#library .v51010-cover-frame{width:71%;max-width:145px}#library .v51010-cover-actions{width:82%}#library .v51010-cover-main{min-height:29px;font-size:4px}#library .v51010-right-page{left:50.2%;right:5.8%;top:10%;bottom:9%}#library .v51010-entry-ribbon{padding:4px 9px;margin-bottom:5px;font-size:3.5px}#library .v51010-record-title{font-size:15px;line-height:1}#library .v51010-record-author{font-size:5.7px;margin-top:3px}#library .v51010-rating-row{margin-top:7px;min-height:24px;gap:5px}#library .v51010-rating{padding:5px 8px;font-size:6px}#library .v51010-favorite{font-size:4px}#library .v51010-ledger{gap:6px;margin-top:7px}#library .v51010-ledger>div{min-height:45px;padding:6px 7px}#library .v51010-ledger span{margin-bottom:4px;font-size:3.45px}#library .v51010-ledger b{font-size:5.4px}#library .v51010-notes{max-height:39px;margin-top:6px;font-size:4.6px}#library .v51010-record-actions{gap:6px}#library .v51010-record-actions button{min-height:29px;font-size:4px}}
</style>
'''
if 'v51010-concept-faithful-archive' not in text:
    text = text.replace('</head>', css + '\n</head>')

text = text.replace('v5.10.9', 'v5.10.10')
p.write_text(text)

sw = Path('service-worker.js')
sw_text = sw.read_text().replace('reading-mmo-v5.10.9-archive-visual-rebuild', 'reading-mmo-v5.10.10-concept-faithful-archive')
for key in ['6','5','4','3','2','1','standalone']:
    asset = f"  './archive-spine-{key}.svg',\n"
    if asset not in sw_text:
        sw_text = sw_text.replace("  './archive-approved-controls.jpg',\n", "  './archive-approved-controls.jpg',\n" + asset)
sw.write_text(sw_text)

Path('BUILD-NOTES-v5.10.10.txt').write_text('''Reading MMO v5.10.10 — Concept-Faithful Archive Rebuild

LOCKED / unchanged:
- Approved Enchanted Archive header, stats, search, Add Volume, and filters.

Shelf rebuild:
- Completely new shelf/spine component instead of another override on the legacy rectangles.
- Seven dedicated vector ornament overlays make the books feel like illustrated fantasy volumes.
- More natural height/width rhythm, richer leather texture, gold filigree, unique motifs, larger shelf decor, selected-volume bookmark/glow.

Open-book rebuild:
- Completely new two-page journal component so old CSS cannot interfere.
- Larger cover on the left page; title, author, rating, metadata, notes, and actions intentionally placed on the right page.
- Increased text sizes and page spacing for phone readability.
- Shelf View replaces the redundant floating Close Record control.

Existing saved library data, uploaded covers, filters, editing, and archive behavior are preserved.
''')
