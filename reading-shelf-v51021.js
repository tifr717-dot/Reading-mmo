/* Reading MMO v5.10.21 — dedicated Shelved Volumes loader.
   Kept separate from Archive scripts so Android cache/version changes cannot hide the feature. */
(function(){
  const BUILD=window.__readingMmoVersionOwner||'v5.10.21';
  window.__readingMmoVersionOwner=BUILD;
  const $id=id=>document.getElementById(id);
  const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const clone=v=>JSON.parse(JSON.stringify(v));

  function stamp(){
    const badge=$id('headerVersionText'); if(badge)badge.textContent=BUILD;
    document.querySelectorAll('.health-row').forEach(row=>{
      if(row.querySelector('b')?.textContent.trim()==='Version'){
        const val=row.querySelector('span'); if(val)val.textContent=BUILD;
      }
    });
  }
  function shelves(){
    if(typeof S==='undefined')return [];
    if(!Array.isArray(S.shelvedBooks))S.shelvedBooks=[];
    return S.shelvedBooks;
  }
  function defaultReading(lastFinished){
    return {
      bookName:'',lastFinishedBook:lastFinished||'',readMode:'first',bookTotal:0,currentPage:0,percent:0,
      sessionStartPage:0,sessionLoggedPages:0,chapters:0,timerElapsedMs:0,timerStartedAt:null,
      timerRunning:false,lastSession:null
    };
  }
  function progress(r){
    const total=Math.max(0,Number(r?.bookTotal)||0);
    const page=Math.max(0,Number(r?.currentPage)||0);
    const pct=total?Math.max(0,Math.min(100,page/total*100)):Math.max(0,Math.min(100,Number(r?.percent)||0));
    return {total,page,pct};
  }
  function id(){return 'shelf-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);}
  function pausedLabel(ts){
    try{return 'Paused '+new Date(ts).toLocaleDateString(undefined,{month:'short',day:'numeric'});}catch(_){return 'Paused';}
  }
  function pauseCurrentTimer(){
    if(typeof S==='undefined'||!S.reading||!S.reading.timerRunning)return;
    try{S.reading.timerElapsedMs=Math.max(0,Number(readingTimerMs())||0);}catch(_){S.reading.timerElapsedMs=Math.max(0,Number(S.reading.timerElapsedMs)||0);}
    S.reading.timerRunning=false; S.reading.timerStartedAt=null;
  }
  function refreshAll(){
    try{persistSilent();}catch(_){}
    try{renderReading();}catch(_){}
    try{renderHome();}catch(_){}
    try{renderProfile();}catch(_){}
    try{renderQuestCards();}catch(_){}
    renderShelf(); stamp();
  }

  function shelveCurrent(silent){
    if(typeof S==='undefined'||!S.reading)return null;
    try{saveReadingDesk(true);}catch(_){}
    const title=String(S.reading.bookName||'').trim();
    if(!title){if(!silent&&typeof toast==='function')toast('Add a current book before shelving it.');return null;}
    pauseCurrentTimer();
    const snap=clone(S.reading);
    delete snap.lastFinishedBook;
    const p=progress(snap); if(p.total)snap.percent=Number(p.pct.toFixed(1));
    shelves().push({id:id(),title,shelvedAt:Date.now(),reading:snap});
    const lastFinished=S.reading.lastFinishedBook||'';
    S.reading=defaultReading(lastFinished);
    refreshAll();
    if(!silent&&typeof toast==='function')toast(p.total?`${title} shelved at page ${p.page}.`:`${title} shelved safely.`);
    return true;
  }

  window.shelfCurrentBook=function(){shelveCurrent(false);};
  window.resumeShelvedBook=function(bookId){
    if(typeof S==='undefined')return;
    const list=shelves();
    const wanted=list.find(x=>String(x.id)===String(bookId));
    if(!wanted)return;
    if(String(S.reading?.bookName||'').trim())shelveCurrent(true);
    const live=shelves();
    const idx=live.findIndex(x=>String(x.id)===String(bookId));
    if(idx<0)return;
    const picked=live.splice(idx,1)[0];
    const lastFinished=S.reading?.lastFinishedBook||'';
    const restored=Object.assign(defaultReading(lastFinished),clone(picked.reading||{}));
    restored.lastFinishedBook=lastFinished;
    restored.timerRunning=false; restored.timerStartedAt=null;
    const p=progress(restored); if(p.total)restored.percent=Number(p.pct.toFixed(1));
    S.reading=restored;
    refreshAll();
    closeShelvedBooks();
    if(typeof toast==='function')toast(`${picked.title||restored.bookName||'Book'} returned to your Reading Desk.`);
  };

  function card(entry){
    const r=entry.reading||{}; const p=progress(r);
    const page=p.total?`Page ${p.page.toLocaleString()} / ${p.total.toLocaleString()}`:(p.page?`Page ${p.page.toLocaleString()}`:'Page not set');
    const mode=r.readMode==='reread'?'REREAD':'FIRST READ';
    const active=String(S?.reading?.bookName||'').trim();
    return `<article class="v51019-shelf-card">
      <div class="v51019-shelf-top"><div><div class="v51019-shelf-title">${esc(entry.title||r.bookName||'Untitled Volume')}</div><div class="v51019-shelf-meta"><span>${esc(page)}</span><span>${p.pct.toFixed(1)}%</span><span>${esc(pausedLabel(entry.shelvedAt))}</span></div></div><b>${mode}</b></div>
      <div class="v51019-shelf-bar"><div style="width:${p.pct}%"></div></div>
      <button class="btn-purple" onclick="resumeShelvedBook('${String(entry.id)}')">${active?'↔ SHELVE CURRENT & RESUME':'▶ RESUME VOLUME'}</button>
    </article>`;
  }
  function renderShelf(){
    if(typeof S==='undefined')return;
    const list=shelves();
    const count=$id('shelvedBookCount'); if(count)count.textContent=String(list.length);
    const open=$id('openShelvedBooksBtn'); if(open)open.disabled=!list.length;
    const shelve=$id('shelfCurrentBookBtn'); if(shelve)shelve.disabled=!String(S.reading?.bookName||'').trim();
    const box=$id('readingShelfList');
    if(box)box.innerHTML=list.length?list.slice().sort((a,b)=>Number(b.shelvedAt||0)-Number(a.shelvedAt||0)).map(card).join(''):'<div class="v51019-shelf-empty">No paused volumes yet.<br><br>Shelve your current volume whenever you want to switch books without losing your place.</div>';
  }
  window.openShelvedBooks=function(){renderShelf();const m=$id('readingShelfModal');if(m)m.hidden=false;};
  window.closeShelvedBooks=function(){const m=$id('readingShelfModal');if(m)m.hidden=true;};
  window.readingShelfBackdrop=function(e){if(e?.target?.id==='readingShelfModal')closeShelvedBooks();};

  function css(){
    if($id('reading-shelf-v51019-css'))return;
    const s=document.createElement('style'); s.id='reading-shelf-v51019-css';
    s.textContent=`
      #reading .v51019-shelf-actions{display:grid;grid-template-columns:1.15fr .85fr;gap:8px;margin:9px 0 2px}
      #reading .v51019-shelf-actions button{min-height:44px;font-size:10px;line-height:1.2;padding:8px 6px}
      #reading .v51019-count{display:inline-block;min-width:19px;padding:2px 5px;margin-left:3px;border:1px solid rgba(255,241,190,.45);border-radius:99px}
      .v51019-modal[hidden]{display:none!important}.v51019-modal{position:fixed;inset:0;z-index:180;background:rgba(13,7,5,.9);display:flex;align-items:center;justify-content:center;padding:18px}
      .v51019-window{width:min(540px,100%);max-height:86vh;overflow:auto;background:linear-gradient(#efddb0,#d2b478);border:4px double #5b3925;box-shadow:0 0 0 2px #c79a3b,0 18px 45px #000;padding:12px;color:#3a261c}
      .v51019-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;border-bottom:1px solid #b8945d;padding-bottom:9px;margin-bottom:9px}.v51019-head h2{font-family:Georgia,serif;font-size:17px;margin:0;color:#4b2d20}.v51019-head small{display:block;margin-top:3px}
      .v51019-shelf-card{background:#f8ecd2;border:2px solid #9d7949;padding:10px;margin:9px 0}.v51019-shelf-top{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.v51019-shelf-top>b{font-size:8px;color:#6d4a8c;white-space:nowrap}.v51019-shelf-title{font-family:Georgia,serif;font-size:14px;font-weight:900;color:#4b2d20}.v51019-shelf-meta{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:9px;color:#6e5743;margin-top:4px}
      .v51019-shelf-bar{height:12px;border:2px solid #704b31;background:#351f17;margin:8px 0}.v51019-shelf-bar>div{height:100%;background:#75519a}.v51019-shelf-card button{width:100%;box-shadow:none;min-height:39px;font-size:10px}.v51019-shelf-empty{text-align:center;padding:22px 12px;border:1px dashed #9d7949;font-size:10px;line-height:1.45}
      @media(max-width:390px){#reading .v51019-shelf-actions{grid-template-columns:1fr 1fr}.v51019-window{padding:10px}}
    `;
    document.head.appendChild(s);
  }
  function inject(){
    css();
    if(!$id('shelfCurrentBookBtn')){
      const actions=document.querySelector('#reading .v591-book-actions');
      if(actions){
        const row=document.createElement('div'); row.className='v51019-shelf-actions';
        row.innerHTML='<button id="shelfCurrentBookBtn" class="btn-plain" onclick="shelfCurrentBook()">📚 SHELVE VOLUME</button><button id="openShelvedBooksBtn" class="btn-purple" onclick="openShelvedBooks()">📖 SHELVED <span id="shelvedBookCount" class="v51019-count">0</span></button>';
        const note=actions.querySelector('.v591-sync-note'); if(note)actions.insertBefore(row,note); else actions.appendChild(row);
      }
    }
    if(!$id('readingShelfModal')){
      const m=document.createElement('div');m.id='readingShelfModal';m.className='v51019-modal';m.hidden=true;m.setAttribute('onclick','readingShelfBackdrop(event)');
      m.innerHTML='<div class="v51019-window" role="dialog" aria-modal="true" aria-labelledby="readingShelfTitle"><div class="v51019-head"><div><h2 id="readingShelfTitle">📚 SHELVED VOLUMES</h2><small>Pause a book now. Resume it later with its progress intact.</small></div><button class="btn-plain" onclick="closeShelvedBooks()">CLOSE</button></div><div id="readingShelfList"></div></div>';
      document.body.appendChild(m);
    }
    renderShelf(); stamp();
  }

  function boot(){inject();setTimeout(inject,80);setTimeout(inject,600);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
