/* Reading MMO v5.10.10 — runtime Archive concept rebuild. */
(function(){
  const BUILD='v5.10.10';

  function escSvg(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function spineSvg(key){
    const commonTop='<path d="M18 28 C31 13 40 22 50 8 C60 22 69 13 82 28"/><path d="M24 35 C36 27 42 31 50 22 C58 31 64 27 76 35"/>';
    const commonBottom='<path d="M18 252 C31 267 40 258 50 274 C60 258 69 267 82 252"/><path d="M24 245 C36 253 42 249 50 258 C58 249 64 253 76 245"/>';
    const motifs={
      '6':'<path d="M50 47 l6 12 13 2-10 9 3 13-12-7-12 7 3-13-10-9 13-2z"/><path d="M50 212 v24 M38 224 h24 M43 217 l14 14 M57 217 l-14 14"/>',
      '5':'<path d="M34 58 C38 47 52 46 57 56 C70 54 74 70 64 75 H37 C26 74 25 61 34 58z"/><path d="M43 80 l-5 13 M53 80 l-5 13 M63 80 l-5 13"/><path d="M35 219 C40 209 54 209 59 218 C70 216 75 229 65 234 H38 C28 232 27 221 35 219z"/>',
      '4':'<path d="M35 49 l30 37 M65 49 L35 86 M39 47 l-7-7 M61 47 l7-7 M39 88 l-7 7 M61 88 l7 7"/><path d="M50 209 v32 M39 225 h22 M44 214 l6-7 6 7"/>',
      '3':'<path d="M50 44 C35 58 36 72 50 84 C64 72 65 58 50 44z"/><path d="M50 84 v18 M50 89 C40 86 34 91 30 98 M50 94 C61 90 67 95 71 103"/><path d="M50 207 v33 M50 221 C38 213 33 218 29 228 M50 226 C62 216 68 221 72 232"/>',
      '2':'<path d="M50 49 C43 38 28 44 30 57 C32 69 50 79 50 79 C50 79 68 69 70 57 C72 44 57 38 50 49z"/><path d="M50 212 C44 201 31 204 32 216 C33 228 50 239 50 239 C50 239 67 228 68 216 C69 204 56 201 50 212z"/>',
      '1':'<path d="M50 43 l7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z"/><path d="M50 207 C41 220 38 226 38 233 C38 242 43 248 50 248 C57 248 62 242 62 233 C62 226 59 220 50 207z"/>',
      'standalone':'<path d="M50 45 l12 14-12 14-12-14z"/><path d="M32 80 C42 71 58 71 68 80 M35 86 C43 79 57 79 65 86"/><path d="M50 211 l14 12-14 12-14-12z"/><path d="M33 242 C42 234 58 234 67 242"/>'
    };
    return `<svg class="v51010-spine-art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 300" fill="none" stroke="#e5bf6b" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path opacity=".9" d="M12 12 H88 Q94 12 94 20 V280 Q94 288 86 288 H14 Q6 288 6 280 V20 Q6 12 12 12z"/><path opacity=".45" d="M16 18 H84 M16 282 H84"/><g opacity=".92">${commonTop}</g><g opacity=".95">${motifs[key]||motifs.standalone}</g><g opacity=".82">${commonBottom}</g><circle cx="50" cy="31" r="2.4" fill="#e5bf6b" stroke="none"/></svg>`;
  }

  window.libraryBookCardMarkup=function(b,volumeNo){
    const n=Number(volumeNo||1), h=(n-1)%5+1;
    const selected=String(window.libraryDetailId||'')===String(b.id)?' selected':'';
    const series=window.librarySeriesShort?window.librarySeriesShort(b.series):String(b.series||'Standalone');
    const key=series==='#6'?'6':series==='#5'?'5':series==='#4'?'4':series==='#3'?'3':series==='#2'?'2':series==='#1'?'1':series==='STANDALONE'?'standalone':'standalone';
    const palettes={'6':['#a77a2f','#503715'],'5':['#77735d','#343127'],'4':['#397a9c','#17394a'],'3':['#39775f','#173c31'],'2':['#684493','#2f1e47'],'1':['#8a493c','#44231d'],'standalone':['#82516e','#402436']};
    const pal=palettes[key];
    const safe=window.esc||((s)=>escSvg(s));
    return `<button class="v51010-spine k${key} h${h}${selected}" style="--s1:${pal[0]};--s2:${pal[1]}" onclick="openLibraryRecord('${safe(b.id)}')" aria-label="Open library record for ${safe(b.title)} by ${safe(b.author||'Unknown author')}">${spineSvg(key)}${b.favorite?'<span class="v51010-spine-fav">★</span>':''}<span class="v51010-spine-bookmark" aria-hidden="true"></span><span class="v51010-spine-title">${safe(b.title)}</span><span class="v51010-spine-series">${safe(series)}</span></button>`;
  };

  window.libraryShelfRowsMarkup=function(rows,volumeNo){
    const chunks=[];for(let i=0;i<rows.length;i+=7)chunks.push(rows.slice(i,i+7));
    return chunks.map(chunk=>`<div class="v51010-shelf-row"><img class="v51010-shelf-candle" src="./v53-candle.png" alt="" aria-hidden="true"><img class="v51010-shelf-books" src="./v53-books.png" alt="" aria-hidden="true"><img class="v51010-shelf-ivy left" src="./asset-ivy.png" alt="" aria-hidden="true"><img class="v51010-shelf-ivy right" src="./asset-ivy.png" alt="" aria-hidden="true"><div class="v51010-books">${chunk.map(b=>window.libraryBookCardMarkup(b,volumeNo.get(String(b.id))||1)).join('')}</div></div>`).join('');
  };

  function replaceDetailMarkup(){
    const old=document.getElementById('libraryDetailView');
    if(!old||old.classList.contains('v51010-detail-view')) return;
    const wasHidden=old.hidden;
    old.outerHTML=`<div id="libraryDetailView" class="v51010-detail-view" ${wasHidden?'hidden':''}><div class="v51010-record-book"><img class="v51010-record-bg" src="./v53-open-book.png" alt="Open archive record book"><section class="v51010-left-page" aria-label="Book cover"><div class="v51010-cover-frame"><img id="libraryDetailCoverImg" alt="" hidden><div id="libraryDetailCoverPlaceholder" class="v51010-cover-placeholder"><span>📖</span><b id="libraryDetailCoverTitle">Archived Volume</b></div></div><input id="libraryCoverInput" type="file" accept="image/*" hidden onchange="handleLibraryCoverUpload(event)"><div class="v51010-cover-actions"><button class="v51010-cover-main" onclick="document.getElementById('libraryCoverInput').click()">🖼 ADD / CHANGE COVER</button><button id="libraryRemoveCoverBtn" class="v51010-remove-cover" onclick="removeLibraryCover()" hidden>REMOVE COVER 🗑</button></div></section><section class="v51010-right-page" aria-label="Archive record"><div id="libraryDetailEntry" class="v51010-entry-ribbon">LIBRARY ENTRY #001</div><div id="libraryDetailTitle" class="v51010-record-title">Archived Volume</div><div id="libraryDetailAuthor" class="v51010-record-author">Unknown author</div><div class="v51010-rating-row"><span id="libraryDetailRating" class="v51010-rating">Unrated</span><span id="libraryDetailFavorite" class="v51010-favorite" hidden>★ FAVORITE</span></div><div class="v51010-ledger"><div><span>SERIES</span><b id="libraryDetailSeries">Standalone</b></div><div><span>PAGES</span><b id="libraryDetailPages">—</b></div><div><span>STARTED</span><b id="libraryDetailStarted">—</b></div><div><span>FINISHED</span><b id="libraryDetailFinished">—</b></div></div><div id="libraryDetailNotes" class="v51010-notes" hidden><b>ARCHIVIST'S NOTES</b><span id="libraryDetailNotesText"></span></div><div class="v51010-record-actions"><button class="v51010-shelf-btn" onclick="closeLibraryDetail()">📚 SHELF VIEW</button><button class="v51010-edit-btn" onclick="editCurrentLibraryRecord()">✒ EDIT RECORD</button></div></section></div></div>`;
  }

  function apply(){
    replaceDetailMarkup();
    const badge=document.getElementById('headerVersionText'); if(badge) badge.textContent=BUILD;
    document.querySelectorAll('.health-row').forEach(row=>{if(row.querySelector('b')?.textContent.trim()==='Version'){const s=row.querySelector('span');if(s)s.textContent=BUILD;}});
    if(typeof window.renderLibrary==='function') window.renderLibrary();
    if(window.libraryDetailId&&typeof window.renderLibraryDetail==='function') window.renderLibraryDetail(window.libraryDetailId);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply,{once:true}); else apply();
})();
