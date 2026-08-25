/* Reading MMO v5.10.16 — Phase 1 asset-spine prototype.
   Only three books are converted in this build. The approved Archive top
   and the open-book detail implementation are intentionally untouched. */
(function(){
  const BUILD='v5.10.16';
  const prototypeByTitle={
    "archangel's legion":{asset:'./archive-proto-legion.svg',cls:'proto-legion'},
    "angels' blood":{asset:'./archive-proto-angels.svg',cls:'proto-angels'},
    'a stage set for villains':{asset:'./archive-proto-stage.svg',cls:'proto-stage'}
  };
  const norm=v=>String(v||'').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
  const safe=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const prior=window.libraryBookCardMarkup;

  function ensureCss(){
    let l=document.getElementById('archive-v51016-css');
    if(l)return;
    l=document.createElement('link');
    l.id='archive-v51016-css';l.rel='stylesheet';l.href='./archive-v51016.css?v=51016';
    document.head.appendChild(l);
  }
  function stamp(){
    const badge=document.getElementById('headerVersionText');if(badge)badge.textContent=BUILD;
    document.querySelectorAll('.health-row').forEach(row=>{
      if(row.querySelector('b')?.textContent.trim()==='Version'){
        const s=row.querySelector('span');if(s)s.textContent=BUILD;
      }
    });
  }
  window.libraryBookCardMarkup=function(b,volumeNo){
    const proto=prototypeByTitle[norm(b&&b.title)];
    if(!proto)return typeof prior==='function'?prior(b,volumeNo):'';
    const selected=String(window.__archiveSelectedId||'')===String(b.id)?' selected':'';
    const series=window.librarySeriesShort?window.librarySeriesShort(b.series):String(b.series||'Standalone');
    const sid=String(b.id||'').replace(/'/g,"\\'");
    return `<button class="v51016-spine ${proto.cls}${selected}" onclick="window.__archiveSelectedId='${sid}';openLibraryRecord('${sid}')" aria-label="Open library record for ${safe(b.title)} by ${safe(b.author||'Unknown author')}"><img class="v51016-spine-asset" src="${proto.asset}?v=51016" alt="" aria-hidden="true">${b.favorite?'<span class="v51016-spine-fav">★</span>':''}<span class="v51016-spine-bookmark" aria-hidden="true"></span><span class="v51016-spine-title">${safe(b.title)}</span><span class="v51016-spine-series">${safe(series)}</span></button>`;
  };
  function apply(){
    ensureCss();stamp();
    if(typeof window.renderLibrary==='function')window.renderLibrary();
    setTimeout(stamp,80);setTimeout(stamp,500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
