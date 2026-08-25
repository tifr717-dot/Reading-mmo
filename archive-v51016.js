/* Reading MMO v5.10.17 — Shelved Volumes + Phase 1 asset-spine prototype.
   Adds safe multi-book pausing/resuming without redesigning the approved Archive top
   or open-book detail. Existing v5.10.16 three-spine prototype remains intact. */
(function(){
  const BUILD='v5.10.17';
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
    if(!l){
      l=document.createElement('link');
      l.id='archive-v51016-css';l.rel='stylesheet';l.href='./archive-v51016.css?v=51016';
      document.head.appendChild(l);
    }
    if(document.getElementById('reading-shelf-v51017-css'))return;
    const s=document.createElement('style');
    s.id='reading-shelf-v51017-css';
    s.textContent=`
      #reading .v51017-shelf-row{display:grid;grid-template-columns:1.25fr .9fr;gap:8px;margin-top:9px}
      #reading .v51017-shelf-row button{min-height:44px;font-size:10px;line-height:1.25;padding:8px 6px}
      #reading .v51017-shelf-count{display:inline-block;min-width:20px;padding:2px 5px;margin-left:4px;border:1px solid rgba(255,239,187,.55);background:rgba(20,9,6,.28);border-radius:999px}
      #reading .v51017-open-shelf:disabled{opacity:.48}
      .v51017-shelf-modal[hidden]{display:none!important}
      .v51017-shelf-modal{position:fixed;inset:0;z-index:165;background:rgba(15,8,6,.9);display:flex;align-items:center;justify-content:center;padding:18px}
      .v51017-shelf-window{width:min(540px,100%);max-height:min(720px,88vh);overflow:auto;background:linear-gradient(180deg,#ead7aa,#d4bb83);color:#3a261c;border:4px double #5f3d28;box-shadow:0 0 0 2px #c79a3b,0 18px 48px #000;padding:13px}
      .v51017-shelf-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;border-bottom:1px solid rgba(92,59,36,.35);padding:2px 2px 10px;margin-bottom:10px}
      .v51017-shelf-head h2{font-family:Georgia,serif;font-size:17px;letter-spacing:.5px;margin:0;color:#4c2d20}
      .v51017-shelf-head small{display:block;margin-top:3px;color:#705642}
      .v51017-shelf-close{box-shadow:none;min-width:74px;padding:7px 8px;font-size:9px}
      .v51017-shelf-empty{border:1px dashed #9b7b56;background:rgba(255,248,226,.5);padding:20px 12px;text-align:center;font-size:10px;line-height:1.5;color:#6d5541}
      .v51017-shelf-card{background:#f8ecd2;border:2px solid #a98551;box-shadow:0 3px 0 rgba(75,45,28,.18);padding:10px;margin:9px 0}
      .v51017-shelf-card-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
      .v51017-shelf-title{font-family:Georgia,serif;font-weight:900;font-size:14px;color:#4c2d20;line-height:1.15}
      .v51017-shelf-mode{font-size:8px;font-weight:900;color:#6d4a8c;letter-spacing:.55px;white-space:nowrap}
      .v51017-shelf-meta{font-size:9px;color:#725a47;margin-top:5px;display:flex;flex-wrap:wrap;gap:5px 10px}
      .v51017-shelf-progress{height:12px;border:2px solid #7a5537;background:#39221a;margin:8px 0 9px;box-shadow:inset 0 0 0 1px #d1ad63}
      .v51017-shelf-progress>div{height:100%;background:#75519a;min-width:0}
      .v51017-shelf-resume{width:100%;box-shadow:none;min-height:40px;font-size:10px}
      .v51017-shelf-note{font-size:8.5px;line-height:1.4;color:#6a513d;margin-top:9px;text-align:center}
      @media(max-width:390px){#reading .v51017-shelf-row{grid-template-columns:1fr 1fr}.v51017-shelf-window{padding:10px}.v51017-shelf-title{font-size:13px}}
    `;
    document.head.appendChild(s);
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

  function shelfArray(){
    if(typeof S==='undefined')return [];
    if(!Array.isArray(S.shelvedBooks))S.shelvedBooks=[];
    return S.shelvedBooks;
  }
  function currentReading(){return (typeof S!=='undefined'&&S.reading)?S.reading:{};}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function shelfId(){return 'shelf-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);}
  function fmtPaused(ts){
    if(!ts)return 'Paused';
    try{return 'Paused '+new Date(ts).toLocaleDateString(undefined,{month:'short',day:'numeric'});}catch(_){return 'Paused';}
  }
  function progressOf(r){
    const total=Math.max(0,Number(r?.bookTotal)||0),page=Math.max(0,Number(r?.currentPage)||0);
    const pct=total?Math.max(0,Math.min(100,page/total*100)):Math.max(0,Math.min(100,Number(r?.percent)||0));
    return {total,page,pct};
  }
  function defaultReading(lastFinishedBook){
    let base={bookName:'',lastFinishedBook:'',readMode:'first',bookTotal:0,currentPage:0,percent:0,sessionStartPage:0,sessionLoggedPages:0,chapters:0,timerElapsedMs:0,timerStartedAt:null,timerRunning:false,lastSession:null};
    try{if(typeof fresh==='function'&&fresh()?.reading)base=Object.assign(base,fresh().reading);}catch(_){}
    base.lastFinishedBook=lastFinishedBook||'';
    return base;
  }
  function pauseTimerIntoReading(r){
    if(!r?.timerRunning)return;
    try{r.timerElapsedMs=Math.max(0,Number(typeof readingTimerMs==='function'?readingTimerMs():r.timerElapsedMs)||0);}catch(_){r.timerElapsedMs=Math.max(0,Number(r.timerElapsedMs)||0);}
    r.timerRunning=false;r.timerStartedAt=null;
  }
  function snapshotReading(){
    const r=currentReading();
    pauseTimerIntoReading(r);
    const snap=clone(r);
    delete snap.lastFinishedBook;
    const p=progressOf(snap);
    if(p.total)snap.percent=Number(p.pct.toFixed(1));
    return snap;
  }
  function redrawAfterShelfChange(){
    try{if(typeof persistSilent==='function')persistSilent();}catch(_){}
    try{if(typeof renderReading==='function')renderReading();}catch(_){}
    try{if(typeof renderHome==='function')renderHome();}catch(_){}
    try{if(typeof renderProfile==='function')renderProfile();}catch(_){}
    try{if(typeof renderQuestCards==='function')renderQuestCards();}catch(_){}
    renderShelfUi();
  }

  function shelveCurrentInternal(options){
    options=options||{};
    if(typeof S==='undefined'||!S.reading)return null;
    try{if(typeof saveReadingDesk==='function')saveReadingDesk(true);}catch(_){}
    const r=currentReading();
    const title=String(r.bookName||'').trim();
    if(!title){if(!options.silent&&typeof toast==='function')toast('Add a current book before shelving it.');return null;}
    const snap=snapshotReading();
    const entry={id:shelfId(),title,shelvedAt:Date.now(),reading:snap};
    shelfArray().push(entry);
    const lastFinished=r.lastFinishedBook||'';
    S.reading=defaultReading(lastFinished);
    redrawAfterShelfChange();
    if(!options.silent&&typeof toast==='function'){
      const p=progressOf(snap);
      toast(p.total?`${title} shelved at page ${p.page}.`:`${title} shelved safely.`);
    }
    return entry;
  }

  window.shelfCurrentBook=function(){shelveCurrentInternal({silent:false});};

  window.resumeShelvedBook=function(id){
    if(typeof S==='undefined')return;
    const shelves=shelfArray();
    const target=shelves.find(x=>String(x.id)===String(id));
    if(!target)return;
    const active=String(S.reading?.bookName||'').trim();
    if(active)shelveCurrentInternal({silent:true});
    const refreshed=shelfArray();
    const idx=refreshed.findIndex(x=>String(x.id)===String(id));
    if(idx<0)return;
    const picked=refreshed.splice(idx,1)[0];
    const lastFinished=S.reading?.lastFinishedBook||'';
    const base=defaultReading(lastFinished);
    const restored=Object.assign(base,clone(picked.reading||{}),{lastFinishedBook:lastFinished});
    restored.timerRunning=false;restored.timerStartedAt=null;
    const p=progressOf(restored);if(p.total)restored.percent=Number(p.pct.toFixed(1));
    S.reading=restored;
    redrawAfterShelfChange();
    closeShelvedBooks();
    if(typeof toast==='function')toast(`${picked.title||restored.bookName||'Book'} returned to your Reading Desk.`);
  };

  function shelfCard(entry){
    const r=entry.reading||{};const p=progressOf(r);
    const mode=r.readMode==='reread'?'REREAD':'FIRST READ';
    const pageText=p.total?`Page ${p.page.toLocaleString()} / ${p.total.toLocaleString()}`:(p.page?`Page ${p.page.toLocaleString()}`:'Page not set');
    const sessionMs=Math.max(0,Number(r.timerElapsedMs)||0);
    const sessionPages=Math.max(0,Number(r.sessionLoggedPages)||0)+Math.max(0,Number(r.currentPage||0)-Number(r.sessionStartPage||0));
    const sessionBits=[];
    if(sessionMs>=1000&&typeof fmtTimer==='function')sessionBits.push(`session ${fmtTimer(sessionMs)}`);
    if(sessionPages>0)sessionBits.push(`${sessionPages} session page${sessionPages===1?'':'s'}`);
    const active=String(S?.reading?.bookName||'').trim();
    const label=active?'↔ SHELVE CURRENT & RESUME':'▶ RESUME VOLUME';
    return `<article class="v51017-shelf-card">
      <div class="v51017-shelf-card-top"><div><div class="v51017-shelf-title">${safe(entry.title||r.bookName||'Untitled Volume')}</div><div class="v51017-shelf-meta"><span>${safe(pageText)}</span><span>${p.pct.toFixed(1)}%</span><span>${safe(fmtPaused(entry.shelvedAt))}</span>${sessionBits.length?`<span>${safe(sessionBits.join(' • '))}</span>`:''}</div></div><div class="v51017-shelf-mode">${mode}</div></div>
      <div class="v51017-shelf-progress"><div style="width:${p.pct}%"></div></div>
      <button class="btn-purple v51017-shelf-resume" onclick="resumeShelvedBook('${safe(String(entry.id))}')">${label}</button>
    </article>`;
  }

  function renderShelfUi(){
    if(typeof S==='undefined')return;
    const shelves=shelfArray();
    const c=document.getElementById('shelvedBookCount');if(c)c.textContent=String(shelves.length);
    const open=document.getElementById('openShelvedBooksBtn');if(open)open.disabled=!shelves.length;
    const shelve=document.getElementById('shelfCurrentBookBtn');if(shelve)shelve.disabled=!String(S.reading?.bookName||'').trim();
    const list=document.getElementById('readingShelfList');
    if(list)list.innerHTML=shelves.length?shelves.slice().sort((a,b)=>Number(b.shelvedAt||0)-Number(a.shelvedAt||0)).map(shelfCard).join(''):'<div class="v51017-shelf-empty">No paused volumes yet.<br>Use <b>Shelve Volume</b> when you want to switch books without losing your place or session state.</div>';
  }

  window.openShelvedBooks=function(){renderShelfUi();const m=document.getElementById('readingShelfModal');if(m)m.hidden=false;};
  window.closeShelvedBooks=function(){const m=document.getElementById('readingShelfModal');if(m)m.hidden=true;};
  window.readingShelfBackdrop=function(e){if(e?.target?.id==='readingShelfModal')closeShelvedBooks();};

  function injectShelfUi(){
    if(document.getElementById('shelfCurrentBookBtn')){renderShelfUi();return;}
    const actions=document.querySelector('#reading .v591-book-actions');
    if(actions){
      const row=document.createElement('div');row.className='v51017-shelf-row';
      row.innerHTML='<button id="shelfCurrentBookBtn" class="btn-plain" onclick="shelfCurrentBook()">📚 SHELVE VOLUME</button><button id="openShelvedBooksBtn" class="btn-purple v51017-open-shelf" onclick="openShelvedBooks()">📖 SHELVED <span id="shelvedBookCount" class="v51017-shelf-count">0</span></button>';
      const note=actions.querySelector('.v591-sync-note');
      if(note)actions.insertBefore(row,note);else actions.appendChild(row);
    }
    if(!document.getElementById('readingShelfModal')){
      const modal=document.createElement('div');modal.id='readingShelfModal';modal.className='v51017-shelf-modal';modal.hidden=true;modal.setAttribute('onclick','readingShelfBackdrop(event)');
      modal.innerHTML='<div class="v51017-shelf-window" role="dialog" aria-modal="true" aria-labelledby="readingShelfTitle"><div class="v51017-shelf-head"><div><h2 id="readingShelfTitle">📚 SHELVED VOLUMES</h2><small>Paused books keep their page, mode, timer/session state, and progress.</small></div><button class="btn-plain v51017-shelf-close" onclick="closeShelvedBooks()">CLOSE</button></div><div id="readingShelfList"></div><div class="v51017-shelf-note">Resuming while another volume is active automatically shelves the current one first, so nothing is overwritten.</div></div>';
      document.body.appendChild(modal);
    }
    renderShelfUi();
  }

  function wrapReadingRender(){
    if(window.__v51017ReadingWrapped)return;
    const original=window.renderReading;
    if(typeof original!=='function')return;
    window.renderReading=function(){const out=original.apply(this,arguments);renderShelfUi();return out;};
    window.__v51017ReadingWrapped=true;
  }

  function apply(){
    ensureCss();stamp();injectShelfUi();wrapReadingRender();
    if(typeof window.renderLibrary==='function')window.renderLibrary();
    setTimeout(()=>{stamp();injectShelfUi();},80);
    setTimeout(()=>{stamp();injectShelfUi();},500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
