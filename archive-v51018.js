/* Reading MMO v5.10.18 — artistic three-spine refinement.
   The approved Archive top and open-book detail are deliberately left alone. */
(function(){
  const BUILD='v5.10.18';
  const prototypeByTitle={
    "archangel's legion":{asset:'./archive-proto-legion-art.svg',cls:'proto-legion'},
    "angels' blood":{asset:'./archive-proto-angels-art.svg',cls:'proto-angels'},
    'a stage set for villains':{asset:'./archive-proto-stage-art.svg',cls:'proto-stage'}
  };
  const norm=v=>String(v||'').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
  const safe=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const prior=window.libraryBookCardMarkup;
  function ensureCss(){
    let l=document.getElementById('archive-v51018-css');
    if(l){if(!String(l.href||'').includes('v=51018'))l.href='./archive-v51018.css?v=51018';return;}
    l=document.createElement('link');l.id='archive-v51018-css';l.rel='stylesheet';l.href='./archive-v51018.css?v=51018';document.head.appendChild(l);
  }
  function stamp(){
    const badge=document.getElementById('headerVersionText');if(badge&&badge.textContent!==BUILD)badge.textContent=BUILD;
    document.querySelectorAll('.health-row').forEach(row=>{if(row.querySelector('b')?.textContent.trim()==='Version'){const s=row.querySelector('span');if(s&&s.textContent!==BUILD)s.textContent=BUILD;}});
  }
  window.libraryBookCardMarkup=function(b,volumeNo){
    const proto=prototypeByTitle[norm(b&&b.title)];
    if(!proto)return typeof prior==='function'?prior(b,volumeNo):'';
    const selected=String(window.__archiveSelectedId||'')===String(b.id)?' selected':'';
    const series=window.librarySeriesShort?window.librarySeriesShort(b.series):String(b.series||'Standalone');
    const sid=String(b.id||'').replace(/'/g,"\\'");
    return `<button class="v51018-spine ${proto.cls}${selected}" onclick="window.__archiveSelectedId='${sid}';openLibraryRecord('${sid}')" aria-label="Open library record for ${safe(b.title)} by ${safe(b.author||'Unknown author')}"><img class="v51018-spine-asset" src="${proto.asset}?v=51018" alt="" aria-hidden="true">${b.favorite?'<span class="v51018-spine-fav">★</span>':''}<span class="v51018-spine-bookmark" aria-hidden="true"></span><span class="v51018-spine-title">${safe(b.title)}</span><span class="v51018-spine-series">${safe(series)}</span></button>`;
  };
  function wrapHealth(){const old=window.renderSaveHealth;if(typeof old==='function'&&!old.__v51018){const wrapped=function(){const r=old.apply(this,arguments);setTimeout(stamp,0);return r};wrapped.__v51018=true;window.renderSaveHealth=wrapped;}}
  function apply(){ensureCss();wrapHealth();stamp();if(typeof window.renderLibrary==='function')window.renderLibrary();[80,350,700,1400,2600].forEach(ms=>setTimeout(stamp,ms));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();