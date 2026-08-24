/* Reading MMO v5.10.11 — runtime shelf + open-book polish. */
(function(){
  const BUILD='v5.10.11';
  const escSvg=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  function art(key){
    const motifs={
      '6':'<path d="M50 45 l7 14 15 2-11 10 3 15-14-8-14 8 3-15-11-10 15-2z"/><path d="M50 211 v28 M36 225 h28 M40 216 l20 19 M60 216 l-20 19"/>',
      '5':'<path d="M33 57 C37 46 52 45 58 55 C71 53 76 70 65 76 H36 C24 74 24 61 33 57z"/><path d="M42 82 l-6 15 M53 82 l-6 15 M64 82 l-6 15"/><path d="M34 217 C40 207 55 207 60 216 C72 215 76 229 66 235 H38 C27 232 26 220 34 217z"/>',
      '4':'<path d="M34 49 l32 39 M66 49 L34 88 M38 47 l-8-8 M62 47 l8-8 M38 90 l-8 8 M62 90 l8 8"/><path d="M50 207 v34 M38 225 h24 M43 215 l7-8 7 8"/>',
      '3':'<path d="M50 43 C34 58 35 73 50 86 C65 73 66 58 50 43z"/><path d="M50 86 v19 M50 91 C40 87 33 92 28 100 M50 96 C61 91 68 96 73 104"/><path d="M50 206 v36 M50 221 C37 212 31 218 27 229 M50 227 C63 216 70 221 74 233"/>',
      '2':'<path d="M50 48 C42 37 27 43 29 57 C31 70 50 81 50 81 C50 81 69 70 71 57 C73 43 58 37 50 48z"/><path d="M50 211 C43 200 30 204 31 217 C32 229 50 241 50 241 C50 241 68 229 69 217 C70 204 57 200 50 211z"/>',
      '1':'<path d="M50 42 l8 16 17 2-13 12 3 17-15-9-15 9 3-17-13-12 17-2z"/><path d="M50 206 C40 220 37 227 37 234 C37 244 42 251 50 251 C58 251 63 244 63 234 C63 227 60 220 50 206z"/>',
      'standalone':'<path d="M50 45 l13 14-13 15-13-15z"/><path d="M31 82 C42 72 58 72 69 82 M34 89 C43 81 57 81 66 89"/><path d="M50 210 l15 13-15 13-15-13z"/><path d="M32 244 C42 235 58 235 68 244"/>'
    };
    return `<svg class="v51011-spine-art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 300" fill="none" stroke="#e7c471" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path opacity=".95" d="M12 12 H88 Q94 12 94 20 V280 Q94 288 86 288 H14 Q6 288 6 280 V20 Q6 12 12 12z"/><path opacity=".65" d="M17 19 H83 M17 281 H83"/><path opacity=".9" d="M19 31 C31 15 40 23 50 9 C60 23 69 15 81 31 M25 38 C36 29 42 33 50 24 C58 33 64 29 75 38"/><g opacity=".98">${motifs[key]||motifs.standalone}</g><path opacity=".84" d="M19 251 C31 267 40 259 50 275 C60 259 69 267 81 251 M25 244 C36 253 42 249 50 258 C58 249 64 253 75 244"/><circle cx="50" cy="31" r="2.7" fill="#e7c471" stroke="none"/></svg>`;
  }
  window.libraryBookCardMarkup=function(b,volumeNo){
    const n=Number(volumeNo||1),h=(n-1)%5+1;
    const selected=String(window.libraryDetailId||'')===String(b.id)?' selected':'';
    const series=window.librarySeriesShort?window.librarySeriesShort(b.series):String(b.series||'Standalone');
    const key=series==='#6'?'6':series==='#5'?'5':series==='#4'?'4':series==='#3'?'3':series==='#2'?'2':series==='#1'?'1':'standalone';
    const palettes={'6':['#aa7c2f','#4c3312'],'5':['#716f59','#312e25'],'4':['#34799b','#17394a'],'3':['#37775f','#173c31'],'2':['#684794','#2e1d46'],'1':['#8a4b3e','#41221d'],'standalone':['#80526e','#3f2436']};
    const pal=palettes[key],safe=window.esc||escSvg;
    return `<button class="v51011-spine k${key} h${h}${selected}" style="--s1:${pal[0]};--s2:${pal[1]}" onclick="openLibraryRecord('${safe(b.id)}')" aria-label="Open library record for ${safe(b.title)} by ${safe(b.author||'Unknown author')}">${art(key)}${b.favorite?'<span class="v51011-spine-fav">★</span>':''}<span class="v51011-spine-bookmark" aria-hidden="true"></span><span class="v51011-spine-title">${safe(b.title)}</span><span class="v51011-spine-series">${safe(series)}</span></button>`;
  };
  window.libraryShelfRowsMarkup=function(rows,volumeNo){
    const chunks=[];for(let i=0;i<rows.length;i+=7)chunks.push(rows.slice(i,i+7));
    return chunks.map(chunk=>`<div class="v51011-shelf-row"><span class="v51011-side-post left" aria-hidden="true"></span><span class="v51011-side-post right" aria-hidden="true"></span><img class="v51011-shelf-lantern" src="./asset-crystal-lamp.png" alt="" aria-hidden="true"><img class="v51011-shelf-books" src="./v53-books.png" alt="" aria-hidden="true"><div class="v51011-books">${chunk.map(b=>window.libraryBookCardMarkup(b,volumeNo.get(String(b.id))||1)).join('')}</div></div>`).join('');
  };
  function replaceDetail(){
    const old=document.getElementById('libraryDetailView'); if(!old||old.classList.contains('v51011-detail-view'))return;
    const hidden=old.hidden;
    old.outerHTML=`<div id="libraryDetailView" class="v51011-detail-view" ${hidden?'hidden':''}><div class="v51011-record-book"><img class="v51011-record-bg" src="./v53-open-book.png" alt="Open archive record book"><section class="v51011-left-page" aria-label="Book cover"><div class="v51011-cover-frame"><img id="libraryDetailCoverImg" alt="" hidden><div id="libraryDetailCoverPlaceholder" class="v51011-cover-placeholder"><span>📖</span><b id="libraryDetailCoverTitle">Archived Volume</b></div></div><input id="libraryCoverInput" type="file" accept="image/*" hidden onchange="handleLibraryCoverUpload(event)"><div class="v51011-cover-actions"><button class="v51011-cover-main" onclick="document.getElementById('libraryCoverInput').click()">🖼 ADD / CHANGE COVER</button><button id="libraryRemoveCoverBtn" class="v51011-remove-cover" onclick="removeLibraryCover()" hidden>REMOVE COVER</button></div></section><section class="v51011-right-page" aria-label="Archive record"><div id="libraryDetailEntry" class="v51011-entry-ribbon">LIBRARY ENTRY #001</div><div id="libraryDetailTitle" class="v51011-record-title">Archived Volume</div><div id="libraryDetailAuthor" class="v51011-record-author">Unknown author</div><div class="v51011-rating-row"><span id="libraryDetailRating" class="v51011-rating">Unrated</span><span id="libraryDetailFavorite" class="v51011-favorite" hidden>★ FAVORITE</span></div><div class="v51011-ledger"><div><span>SERIES</span><b id="libraryDetailSeries">Standalone</b></div><div><span>PAGES</span><b id="libraryDetailPages">—</b></div><div><span>STARTED</span><b id="libraryDetailStarted">—</b></div><div><span>FINISHED</span><b id="libraryDetailFinished">—</b></div></div><div id="libraryDetailNotes" class="v51011-notes" hidden><b>ARCHIVIST'S NOTES</b><span id="libraryDetailNotesText"></span></div><div class="v51011-record-actions"><button class="v51011-shelf-btn" onclick="closeLibraryDetail()">📚 SHELF VIEW</button><button class="v51011-edit-btn" onclick="editCurrentLibraryRecord()">✒ EDIT RECORD</button></div></section></div></div>`;
  }
  function apply(){
    replaceDetail();
    const badge=document.getElementById('headerVersionText');if(badge)badge.textContent=BUILD;
    document.querySelectorAll('.health-row').forEach(row=>{if(row.querySelector('b')?.textContent.trim()==='Version'){const s=row.querySelector('span');if(s)s.textContent=BUILD;}});
    if(typeof window.renderLibrary==='function')window.renderLibrary();
    if(window.libraryDetailId&&typeof window.renderLibraryDetail==='function')window.renderLibraryDetail(window.libraryDetailId);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
