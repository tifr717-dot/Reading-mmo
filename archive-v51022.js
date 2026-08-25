/* Reading MMO v5.10.22 — pixel archive shelf runtime. */
(function(){
  const BUILD='v5.10.22'; window.__readingMmoVersionOwner=BUILD;
  const safe=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  function ensureCss(){let l=document.getElementById('archive-v51022-css');if(!l){l=document.createElement('link');l.id='archive-v51022-css';l.rel='stylesheet';document.head.appendChild(l)}l.href='./archive-v51022.css?v=51022'}
  function stamp(){const b=document.getElementById('headerVersionText');if(b)b.textContent=BUILD;document.querySelectorAll('.health-row').forEach(r=>{if(r.querySelector('b')?.textContent.trim()==='Version'){const s=r.querySelector('span');if(s)s.textContent=BUILD}})}
  window.libraryBookCardMarkup=function(b,volumeNo){
    const series=window.librarySeriesShort?window.librarySeriesShort(b.series):String(b.series||'Standalone');
    const key=series==='#6'?'6':series==='#5'?'5':series==='#4'?'4':series==='#3'?'3':series==='#2'?'2':series==='#1'?'1':'standalone';
    const selected=String(window.__archiveSelectedId||'')===String(b.id)?' selected':'';
    const sid=String(b.id||'').replace(/'/g,"\\'");
    return `<button class="v51022-spine k${key}${selected}" onclick="window.__archiveSelectedId='${sid}';openLibraryRecord('${sid}')" aria-label="Open library record for ${safe(b.title)} by ${safe(b.author||'Unknown author')}"><img class="v51022-spine-asset" src="./archive-pixel-spine-${key}-v51022.svg?v=51022" alt="" aria-hidden="true">${b.favorite?'<span class="v51022-spine-fav">★</span>':''}<span class="v51022-spine-bookmark" aria-hidden="true"></span><span class="v51022-spine-title">${safe(b.title)}</span><span class="v51022-spine-series">${safe(series)}</span></button>`;
  };
  function apply(){ensureCss();stamp();if(typeof window.renderLibrary==='function')window.renderLibrary();[60,180,650,1300,2600].forEach(ms=>setTimeout(stamp,ms));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();