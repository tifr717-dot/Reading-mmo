(()=>{
  'use strict';
  if(window.__v51031ReadingHistoryBooted)return;
  window.__v51031ReadingHistoryBooted=true;

  const BUILD='v5.10.31';
  const $=id=>document.getElementById(id);
  let activeBookId=null;
  let activeTab='overview';
  let wrappedEndTarget=null;
  let wrappedRenderTarget=null;
  let wrappedOpenTarget=null;

  function appState(){
    try{return typeof S!=='undefined'&&S?S:null}catch(_){return null}
  }

  function norm(v){
    return String(v||'').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
  }

  function libraryBookById(id){
    const s=appState();
    return (s?.library||[]).find(b=>String(b?.id)===String(id))||null;
  }

  function libraryBookForTitle(title){
    const s=appState(),key=norm(title);
    if(!key)return null;
    return (s?.library||[]).find(b=>norm(b?.title)===key)||null;
  }

  function ensureStore(){
    const s=appState();
    if(!s)return null;
    if(!Array.isArray(s.readingSessions))s.readingSessions=[];
    return s.readingSessions;
  }

  function sessionKey(x){
    if(x?.source==='crossink'&&Number(x?.readerSessionId)>0)return `crossink:${Number(x.readerSessionId)}`;
    return `app:${Number(x?.endedAt)||0}:${Number(x?.durationMs)||0}:${Number(x?.pages)||0}:${norm(x?.bookTitle)}`;
  }

  function persist(){
    try{if(typeof persistSilent==='function'){persistSilent();return}}catch(_){}
    try{if(typeof save==='function')save()}catch(_){}
  }

  function normalizeSession(input){
    const now=Date.now();
    const endedAt=Math.max(0,Number(input?.endedAt)||now);
    const durationMs=Math.max(0,Number(input?.durationMs)||0);
    const pages=Math.max(0,Math.floor(Number(input?.pages)||0));
    const startPage=Math.max(0,Math.floor(Number(input?.startPage)||0));
    const endPage=Math.max(0,Math.floor(Number(input?.endPage)||0));
    const bookTitle=String(input?.bookTitle||'').trim();
    const matched=input?.bookId?libraryBookById(input.bookId):libraryBookForTitle(bookTitle);
    const source=input?.source==='crossink'?'crossink':'app';
    const readerSessionId=source==='crossink'?Math.max(0,Math.floor(Number(input?.readerSessionId)||0)):0;
    return {
      id:String(input?.id||`${source}-${readerSessionId||endedAt}-${endedAt}`),
      bookId:matched?.id?String(matched.id):(input?.bookId?String(input.bookId):''),
      bookTitle:bookTitle||matched?.title||'Untitled Volume',
      startedAt:Math.max(0,Number(input?.startedAt)||Math.max(0,endedAt-durationMs)),
      endedAt,
      durationMs,
      pages,
      chapters:Math.max(0,Math.floor(Number(input?.chapters)||0)),
      startPage,
      endPage,
      source,
      readerSessionId
    };
  }

  function recordSession(input,{silent=false}={}){
    const store=ensureStore();if(!store)return null;
    const item=normalizeSession(input);
    const key=sessionKey(item);
    const existing=store.find(x=>sessionKey(x)===key);
    if(existing){
      Object.assign(existing,item);
      if(!silent)persist();
      renderHistory();
      return existing;
    }
    store.push(item);
    store.sort((a,b)=>Number(a?.endedAt||0)-Number(b?.endedAt||0));
    if(store.length>1000)store.splice(0,store.length-1000);
    if(!silent)persist();
    renderHistory();
    return item;
  }

  function backfillLastSession(){
    const s=appState(),store=ensureStore(),last=s?.reading?.lastSession;
    if(!s||!store||!last||!Number(last.endedAt))return;
    const bookTitle=String(s.reading?.bookName||'').trim();
    const source=last.source==='crossink'?'crossink':'app';
    const endPage=source==='crossink'?Number(last.readerEndPage||s.reading?.currentPage||0):Number(s.reading?.currentPage||0);
    const startPage=source==='crossink'?Number(last.readerStartPage||0):Math.max(0,endPage-Number(last.pages||0));
    const candidate=normalizeSession({
      bookTitle,
      endedAt:Number(last.endedAt),
      durationMs:Number(last.elapsedMs)||0,
      pages:Number(last.pages)||0,
      chapters:Number(last.chapters)||0,
      startPage,
      endPage,
      source,
      readerSessionId:Number(last.readerSessionId)||0
    });
    if(!store.some(x=>sessionKey(x)===sessionKey(candidate))){
      store.push(candidate);
      store.sort((a,b)=>Number(a?.endedAt||0)-Number(b?.endedAt||0));
      persist();
    }
  }

  function fmtDuration(ms){
    const sec=Math.max(0,Math.floor(Number(ms)||0)/1000|0);
    const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;
    if(h)return `${h}h ${m}m`;
    if(m)return `${m}m ${s}s`;
    return `${s}s`;
  }

  function fmtDateTime(ts){
    const d=new Date(Number(ts)||0);if(Number.isNaN(d.getTime()))return '—';
    try{return d.toLocaleString([], {month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'})}catch(_){return d.toLocaleString()}
  }

  function fmtDate(ts){
    const d=new Date(Number(ts)||0);if(Number.isNaN(d.getTime()))return '—';
    try{return d.toLocaleDateString([], {month:'short',day:'numeric',year:'numeric'})}catch(_){return d.toLocaleDateString()}
  }

  function escapeHtml(v){
    return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }

  function sessionsForBook(book){
    const store=ensureStore()||[],id=String(book?.id||''),title=norm(book?.title);
    return store.filter(x=>(id&&String(x?.bookId||'')===id)||(!x?.bookId&&title&&norm(x?.bookTitle)===title)||(!id&&title&&norm(x?.bookTitle)===title))
      .slice().sort((a,b)=>Number(b?.endedAt||0)-Number(a?.endedAt||0));
  }

  function ensureCss(){
    if($('v51031-history-css'))return;
    const style=document.createElement('style');
    style.id='v51031-history-css';
    style.textContent=`
      #library .v51031-book-tabs{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:0 0 8px;flex:0 0 auto}
      #library .v51031-book-tabs button{min-height:28px!important;margin:0!important;padding:5px!important;border-radius:7px!important;background:#725441!important;border:1px solid #9a744a!important;color:#ecd4a2!important;box-shadow:none!important;font:900 4.4px/1 ui-monospace,monospace!important;letter-spacing:.3px!important}
      #library .v51031-book-tabs button.active{background:#5f4175!important;border-color:#80609b!important;color:#fff0c6!important}
      #library .v51031-history-pane{display:flex;flex-direction:column;min-height:0;flex:1;color:#4b301f}
      #library .v51031-history-pane[hidden]{display:none!important}
      #library .v51031-history-summary{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:7px}
      #library .v51031-hstat{min-height:38px;padding:5px 6px;border:1px solid rgba(154,109,58,.52);background:rgba(255,247,220,.42);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14)}
      #library .v51031-hstat span{display:block;margin-bottom:3px;color:#866144;font:900 3.2px/1 ui-monospace,monospace;text-transform:uppercase;letter-spacing:.18px}
      #library .v51031-hstat b{display:block;color:#49301d;font:900 6.2px/1.12 Georgia,'Times New Roman',serif}
      #library .v51031-hstat.last{grid-column:1/-1;min-height:34px}
      #library .v51031-session-list{display:grid;gap:5px;overflow-y:auto;min-height:0;padding-right:2px;scrollbar-width:thin}
      #library .v51031-session{padding:6px 7px;background:linear-gradient(180deg,rgba(249,231,193,.75),rgba(226,198,147,.72));border:1px solid #9b7446;box-shadow:inset 0 0 0 1px rgba(255,250,230,.28)}
      #library .v51031-session-head{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:5px}
      #library .v51031-session-date{font:900 5.1px/1.12 Georgia,'Times New Roman',serif;color:#4b2e1d}
      #library .v51031-source{padding:3px 5px;border-radius:999px;background:#725441;color:#f3ddb0;font:900 3.2px/1 ui-monospace,monospace;white-space:nowrap}
      #library .v51031-source.crossink{background:#5f4175;color:#f6e4bc}
      #library .v51031-session-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px}
      #library .v51031-session-grid div{padding:4px;background:rgba(255,249,225,.38);border:1px solid rgba(148,104,58,.30)}
      #library .v51031-session-grid span{display:block;color:#866144;font:900 2.9px/1 ui-monospace,monospace;text-transform:uppercase}
      #library .v51031-session-grid b{display:block;margin-top:3px;color:#49301d;font:900 5.1px/1.1 Georgia,'Times New Roman',serif;overflow-wrap:anywhere}
      #library .v51031-empty{padding:13px 8px;text-align:center;border:1px dashed #9d7447;background:rgba(249,232,194,.46);color:#75573f;font:700 4.6px/1.35 ui-monospace,monospace}
      @media(max-width:420px){#library .v51031-book-tabs{margin-bottom:6px}#library .v51031-book-tabs button{min-height:25px!important;font-size:3.8px!important}#library .v51031-hstat{min-height:33px;padding:4px 5px}#library .v51031-hstat b{font-size:5.2px}#library .v51031-session{padding:5px 6px}#library .v51031-session-date{font-size:4.3px}#library .v51031-session-grid b{font-size:4.4px}}
    `;
    document.head.appendChild(style);
  }

  function ensureHistoryUi(){
    const right=document.querySelector('#libraryDetailView .v51010-right-page');
    if(!right||$('v51031BookTabs'))return;
    const tabs=document.createElement('div');
    tabs.id='v51031BookTabs';tabs.className='v51031-book-tabs';
    tabs.innerHTML='<button id="v51031OverviewTab" type="button" onclick="v51031SetBookTab(\'overview\')">OVERVIEW</button><button id="v51031HistoryTab" type="button" onclick="v51031SetBookTab(\'history\')">READING HISTORY</button>';
    right.insertBefore(tabs,right.firstChild);
    const pane=document.createElement('div');
    pane.id='v51031HistoryPane';pane.className='v51031-history-pane';pane.hidden=true;
    right.insertBefore(pane,$('libraryDetailNotes')||$('libraryDetailView')?.querySelector('.v51010-record-actions')||null);
    setTab(activeTab,false);
  }

  function overviewNodes(){
    const right=document.querySelector('#libraryDetailView .v51010-right-page');if(!right)return [];
    return Array.from(right.children).filter(el=>el.id!=='v51031BookTabs'&&el.id!=='v51031HistoryPane');
  }

  function setTab(tab,scroll=true){
    activeTab=tab==='history'?'history':'overview';
    ensureHistoryUi();
    const pane=$('v51031HistoryPane');
    overviewNodes().forEach(el=>{el.hidden=activeTab==='history'});
    if(pane)pane.hidden=activeTab!=='history';
    $('v51031OverviewTab')?.classList.toggle('active',activeTab==='overview');
    $('v51031HistoryTab')?.classList.toggle('active',activeTab==='history');
    if(activeTab==='history')renderHistory();
    if(scroll)try{$('libraryDetailView')?.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(_){}
  }

  function renderHistory(){
    const pane=$('v51031HistoryPane');if(!pane)return;
    const book=libraryBookById(activeBookId);if(!book){pane.innerHTML='';return}
    const list=sessionsForBook(book);
    const totalPages=list.reduce((n,x)=>n+Math.max(0,Number(x?.pages)||0),0);
    const totalMs=list.reduce((n,x)=>n+Math.max(0,Number(x?.durationMs)||0),0);
    const avg=list.length?Math.round(totalMs/list.length):0;
    const last=list.length?Math.max(...list.map(x=>Number(x?.endedAt)||0)):0;
    const cards=list.map(x=>{
      const source=x.source==='crossink'?'CrossInk':'Reading MMO';
      const sid=x.source==='crossink'&&Number(x.readerSessionId)>0?` #${Number(x.readerSessionId)}`:'';
      const range=Number(x.startPage)>0||Number(x.endPage)>0?`${Number(x.startPage)||'—'} → ${Number(x.endPage)||'—'}`:'—';
      return `<article class="v51031-session">
        <div class="v51031-session-head"><div class="v51031-session-date">${escapeHtml(fmtDateTime(x.endedAt))}</div><div class="v51031-source ${x.source==='crossink'?'crossink':''}">${escapeHtml(source+sid)}</div></div>
        <div class="v51031-session-grid">
          <div><span>PAGES</span><b>${Number(x.pages||0).toLocaleString()}</b></div>
          <div><span>PAGE RANGE</span><b>${escapeHtml(range)}</b></div>
          <div><span>DURATION</span><b>${escapeHtml(fmtDuration(x.durationMs))}</b></div>
        </div>
      </article>`;
    }).join('');
    pane.innerHTML=`
      <div class="v51031-history-summary">
        <div class="v51031-hstat"><span>SESSIONS</span><b>${list.length.toLocaleString()}</b></div>
        <div class="v51031-hstat"><span>PAGES READ</span><b>${totalPages.toLocaleString()}</b></div>
        <div class="v51031-hstat"><span>READING TIME</span><b>${escapeHtml(fmtDuration(totalMs))}</b></div>
        <div class="v51031-hstat"><span>AVG SESSION</span><b>${escapeHtml(fmtDuration(avg))}</b></div>
        <div class="v51031-hstat last"><span>LAST READ</span><b>${last?escapeHtml(fmtDate(last)):'—'}</b></div>
      </div>
      <div class="v51031-session-list">${cards||'<div class="v51031-empty">No reading sessions have been recorded for this book yet.<br>Your next Reading MMO or CrossInk session will appear here permanently.</div>'}</div>`;
    const htab=$('v51031HistoryTab');if(htab)htab.textContent=list.length?`READING HISTORY · ${list.length}`:'READING HISTORY';
  }

  function wrapLibrary(){
    if(typeof window.openLibraryRecord==='function'&&window.openLibraryRecord!==wrappedOpenTarget&&!window.openLibraryRecord.__v51031History){
      const prior=window.openLibraryRecord;
      const wrapped=function(id){activeBookId=String(id);activeTab='overview';const out=prior.apply(this,arguments);ensureHistoryUi();setTab('overview',false);renderHistory();return out};
      wrapped.__v51031History=true;wrappedOpenTarget=wrapped;window.openLibraryRecord=wrapped;
    }
    if(typeof window.renderLibraryDetail==='function'&&window.renderLibraryDetail!==wrappedRenderTarget&&!window.renderLibraryDetail.__v51031History){
      const prior=window.renderLibraryDetail;
      const wrapped=function(id){if(id!=null)activeBookId=String(id);const out=prior.apply(this,arguments);ensureHistoryUi();setTab(activeTab,false);renderHistory();return out};
      wrapped.__v51031History=true;wrappedRenderTarget=wrapped;window.renderLibraryDetail=wrapped;
    }
  }

  function wrapEndSession(){
    if(typeof window.endReadingSession!=='function'||window.endReadingSession.__v51031History)return;
    const prior=window.endReadingSession;
    const wrapped=function(){
      const s=appState(),r=s?.reading;
      const beforeEnded=Number(r?.lastSession?.endedAt||0);
      const before={
        bookTitle:String(r?.bookName||''),
        startPage:Math.max(0,Math.floor(Number(r?.sessionStartPage)||0)),
        endPage:Math.max(0,Math.floor(Number(r?.currentPage)||0))
      };
      const importCtx=window.__readingMmoHistoryImportContext?Object.assign({},window.__readingMmoHistoryImportContext):null;
      const out=prior.apply(this,arguments);
      const after=appState()?.reading?.lastSession;
      if(after&&Number(after.endedAt||0)&&Number(after.endedAt)!==beforeEnded){
        if(importCtx){
          recordSession({
            bookTitle:importCtx.bookTitle||before.bookTitle,
            endedAt:Number(after.endedAt),durationMs:Number(importCtx.durationMs)||Number(after.elapsedMs)||0,
            pages:Number(importCtx.pages)||Number(after.pages)||0,chapters:Number(after.chapters)||0,
            startPage:Number(importCtx.startPage)||0,endPage:Number(importCtx.endPage)||0,
            source:'crossink',readerSessionId:Number(importCtx.readerSessionId)||0
          });
        }else{
          recordSession({
            bookTitle:before.bookTitle,endedAt:Number(after.endedAt),durationMs:Number(after.elapsedMs)||0,
            pages:Number(after.pages)||0,chapters:Number(after.chapters)||0,
            startPage:before.startPage,endPage:before.endPage,source:'app'
          });
        }
      }
      return out;
    };
    // Keep the existing v5.10.29 wrap-up owner from trying to wrap over us later.
    wrapped.__v51029=true;
    wrapped.__v51031History=true;
    wrappedEndTarget=wrapped;
    window.endReadingSession=wrapped;
  }

  function stamp(){
    window.__readingMmoVersionOwner=BUILD;
    const badge=$('headerVersionText');if(badge)badge.textContent=BUILD;
    document.querySelectorAll('.health-row').forEach(row=>{
      if(row.querySelector('b')?.textContent.trim()==='Version'){
        const value=row.querySelector('span');if(value)value.textContent=BUILD;
      }
    });
  }

  function boot(){
    ensureCss();stamp();ensureStore();backfillLastSession();wrapLibrary();wrapEndSession();ensureHistoryUi();
    [100,350,900,1700,3200].forEach(ms=>setTimeout(()=>{stamp();wrapLibrary();wrapEndSession();ensureHistoryUi();},ms));
  }

  window.v51031SetBookTab=tab=>setTab(tab);
  window.readingMmoRecordSessionHistory=input=>recordSession(input);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){stamp();wrapLibrary();wrapEndSession();ensureHistoryUi();renderHistory();}});
})();
