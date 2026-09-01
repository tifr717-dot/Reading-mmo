(()=>{
  'use strict';
  if(window.__v51032ReadingJournalBooted)return;
  window.__v51032ReadingJournalBooted=true;

  const BUILD='v5.10.32';
  const $=id=>document.getElementById(id);
  let selectedBook='all';

  function appState(){
    try{return typeof S!=='undefined'&&S?S:null}catch(_){return null}
  }

  function sessions(){
    const list=appState()?.readingSessions;
    return Array.isArray(list)?list:[];
  }

  function esc(v){
    return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }

  function fmtDuration(ms){
    const sec=Math.max(0,Math.floor((Number(ms)||0)/1000));
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

  function keyFor(x){
    if(x?.bookId)return `id:${String(x.bookId)}`;
    return `title:${String(x?.bookTitle||'').trim().toLowerCase()}`;
  }

  function titleForKey(key){
    const item=sessions().find(x=>keyFor(x)===key);
    return String(item?.bookTitle||'Unknown Book');
  }

  function filteredSessions(){
    const list=sessions().slice().sort((a,b)=>Number(b?.endedAt||0)-Number(a?.endedAt||0));
    return selectedBook==='all'?list:list.filter(x=>keyFor(x)===selectedBook);
  }

  function ensureCss(){
    if($('v51032-journal-css'))return;
    const style=document.createElement('style');
    style.id='v51032-journal-css';
    style.textContent=`
      .v51032-journal-launch{width:100%;min-height:38px!important;margin-top:7px!important;background:linear-gradient(#6d4f87,#4e375f)!important;border:2px solid #9c76b5!important;color:#f7e7bd!important;box-shadow:0 4px 0 rgba(42,21,15,.34)!important;font:900 7px/1 ui-monospace,monospace!important;letter-spacing:.35px!important}
      #library .v51032-library-journal{width:100%;min-height:36px!important;margin:0 0 9px!important;background:linear-gradient(#6d4f87,#4e375f)!important;border:2px solid #9c76b5!important;color:#f7e7bd!important;box-shadow:0 4px 0 rgba(42,21,15,.34)!important;font:900 6px/1 ui-monospace,monospace!important}
      .v51032-journal-backdrop{position:fixed;inset:0;z-index:310;display:flex;align-items:stretch;justify-content:center;padding:12px 10px 82px;background:rgba(14,7,5,.90);backdrop-filter:blur(3px);overflow-y:auto}
      .v51032-journal-backdrop[hidden]{display:none!important}
      .v51032-journal-shell{width:min(570px,100%);min-height:100%;position:relative;padding:18px 15px 22px;background:radial-gradient(circle at 50% 2%,rgba(255,225,151,.20),transparent 28%),linear-gradient(180deg,#ead5a6,#d7b97f);border:3px solid #704424;outline:2px solid #b78342;outline-offset:-7px;box-shadow:0 14px 38px rgba(0,0,0,.55),inset 0 0 34px rgba(88,50,24,.14);color:#43291b}
      .v51032-journal-shell:before,.v51032-journal-shell:after{content:'❧';position:absolute;top:12px;color:#8a5d32;font:900 18px/1 Georgia,serif}.v51032-journal-shell:before{left:15px}.v51032-journal-shell:after{right:15px;transform:scaleX(-1)}
      .v51032-journal-head{text-align:center;padding:3px 38px 12px;border-bottom:1px solid rgba(107,67,35,.38)}
      .v51032-journal-kicker{font:900 5.5px/1 ui-monospace,monospace;letter-spacing:1px;color:#815f42;text-transform:uppercase}
      .v51032-journal-title{margin-top:5px;font:900 21px/1 Georgia,'Times New Roman',serif;color:#4b2e1c}
      .v51032-journal-sub{margin-top:5px;font:700 6px/1.35 ui-monospace,monospace;color:#785d45}
      .v51032-close{position:absolute;right:17px;top:14px;z-index:2;width:34px!important;min-width:34px!important;height:31px!important;min-height:31px!important;margin:0!important;padding:0!important;border-radius:999px!important;background:#4a2c20!important;border:1px solid #9e7343!important;color:#f3ddb0!important;box-shadow:none!important;font-size:16px!important}
      .v51032-toolbar{display:grid;grid-template-columns:1fr;gap:5px;margin:12px 0 9px;padding:8px;background:rgba(255,245,216,.34);border:1px solid #a17b4b}
      .v51032-toolbar label{margin:0!important;color:#6d4a35!important;font:900 5px/1 ui-monospace,monospace!important;letter-spacing:.45px!important}
      .v51032-toolbar select{height:36px!important;padding:6px 8px!important;border:1px solid #9d7447!important;background:#f4e3bc!important;color:#432b1e!important;font:800 7px/1 ui-monospace,monospace!important}
      .v51032-summary{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:10px}
      .v51032-stat{min-height:57px;padding:8px;background:linear-gradient(180deg,rgba(253,240,204,.78),rgba(228,199,145,.74));border:1px solid #9e7546;box-shadow:inset 0 0 0 1px rgba(255,251,233,.34)}
      .v51032-stat span{display:block;color:#876246;font:900 4.4px/1 ui-monospace,monospace;letter-spacing:.3px}.v51032-stat b{display:block;margin-top:5px;color:#4b2d1b;font:900 13px/1 Georgia,'Times New Roman',serif}
      .v51032-stat.last{grid-column:1/-1;min-height:48px}.v51032-stat.last b{font-size:10px}
      .v51032-section-label{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:12px 0 7px;padding-bottom:5px;border-bottom:1px solid rgba(116,77,43,.38)}
      .v51032-section-label b{font:900 8px/1 Georgia,'Times New Roman',serif}.v51032-section-label span{font:900 4.3px/1 ui-monospace,monospace;color:#7b5e46}
      .v51032-list{display:grid;gap:8px}
      .v51032-session{padding:10px;background:linear-gradient(180deg,rgba(249,232,193,.86),rgba(222,191,139,.80));border:1px solid #956d42;box-shadow:0 3px 0 rgba(68,38,22,.12),inset 0 0 0 1px rgba(255,248,224,.38)}
      .v51032-session-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}.v51032-session-book{min-width:0;font:900 11px/1.08 Georgia,'Times New Roman',serif;color:#482c1c;overflow-wrap:anywhere}.v51032-source{flex:0 0 auto;padding:4px 6px;border-radius:999px;background:#6c513e;color:#f3ddb3;font:900 3.7px/1 ui-monospace,monospace;white-space:nowrap}.v51032-source.crossink{background:#604477;color:#f3dfb6}
      .v51032-date{margin-top:4px;color:#795c46;font:800 5px/1.15 ui-monospace,monospace}
      .v51032-session-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:8px}.v51032-session-grid div{padding:6px;background:rgba(255,248,222,.42);border:1px solid rgba(146,101,55,.34)}.v51032-session-grid span{display:block;color:#876246;font:900 3.5px/1 ui-monospace,monospace}.v51032-session-grid b{display:block;margin-top:4px;color:#49301e;font:900 7px/1.08 Georgia,'Times New Roman',serif;overflow-wrap:anywhere}
      .v51032-empty{padding:26px 15px;text-align:center;background:rgba(250,235,199,.64);border:1px dashed #946c42;color:#765b44;font:800 6px/1.45 ui-monospace,monospace}
      @media(max-width:390px){.v51032-journal-backdrop{padding-left:6px;padding-right:6px}.v51032-journal-shell{padding-left:11px;padding-right:11px}.v51032-journal-title{font-size:18px}.v51032-session-book{font-size:9.5px}.v51032-session-grid b{font-size:6.1px}.v51032-stat b{font-size:11px}}
    `;
    document.head.appendChild(style);
  }

  function ensureLaunchers(){
    const actions=document.querySelector('#reading .v591-book-actions');
    if(actions&&!$('v51032JournalLaunch')){
      const button=document.createElement('button');
      button.id='v51032JournalLaunch';button.type='button';button.className='v51032-journal-launch';
      button.textContent='📖  OPEN READING JOURNAL';button.onclick=openJournal;
      const row=actions.querySelector('.v598-read-library-row');
      if(row)row.insertAdjacentElement('afterend',button);else actions.appendChild(button);
    }
    const libraryWrap=document.querySelector('#library .v5104-library-wrap');
    if(libraryWrap&&!$('v51032LibraryJournalLaunch')){
      const button=document.createElement('button');
      button.id='v51032LibraryJournalLaunch';button.type='button';button.className='v51032-library-journal';
      button.textContent='📖  READING JOURNAL';button.onclick=openJournal;
      const back=libraryWrap.querySelector('.v5104-back');
      if(back)back.insertAdjacentElement('afterend',button);else libraryWrap.prepend(button);
    }
  }

  function ensureModal(){
    if($('v51032JournalBackdrop'))return;
    const modal=document.createElement('div');
    modal.id='v51032JournalBackdrop';modal.className='v51032-journal-backdrop';modal.hidden=true;
    modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Reading Journal');
    modal.innerHTML=`<div class="v51032-journal-shell">
      <button class="v51032-close" type="button" aria-label="Close reading journal">×</button>
      <div class="v51032-journal-head"><div class="v51032-journal-kicker">THE ARCHIVIST'S READING RECORD</div><div class="v51032-journal-title">📖 Reading Journal</div><div class="v51032-journal-sub">Every recorded reading session, together in one place.</div></div>
      <div class="v51032-toolbar"><label for="v51032BookFilter">SHOW SESSIONS FOR</label><select id="v51032BookFilter"></select></div>
      <div id="v51032JournalBody"></div>
    </div>`;
    document.body.appendChild(modal);
    modal.querySelector('.v51032-close').onclick=closeJournal;
    modal.addEventListener('click',e=>{if(e.target===modal)closeJournal()});
    $('v51032BookFilter').addEventListener('change',e=>{selectedBook=e.target.value||'all';renderJournal()});
  }

  function renderFilter(){
    const select=$('v51032BookFilter');if(!select)return;
    const keys=new Map();
    sessions().forEach(x=>{const key=keyFor(x);if(key&&!keys.has(key))keys.set(key,String(x?.bookTitle||'Unknown Book'))});
    const sorted=[...keys.entries()].sort((a,b)=>a[1].localeCompare(b[1]));
    if(selectedBook!=='all'&&!keys.has(selectedBook))selectedBook='all';
    select.innerHTML='<option value="all">All Books</option>'+sorted.map(([key,title])=>`<option value="${esc(key)}">${esc(title)}</option>`).join('');
    select.value=selectedBook;
  }

  function renderJournal(){
    ensureModal();renderFilter();
    const body=$('v51032JournalBody');if(!body)return;
    const list=filteredSessions();
    const totalPages=list.reduce((n,x)=>n+Math.max(0,Number(x?.pages)||0),0);
    const totalMs=list.reduce((n,x)=>n+Math.max(0,Number(x?.durationMs)||0),0);
    const avg=list.length?Math.round(totalMs/list.length):0;
    const last=list.length?Math.max(...list.map(x=>Number(x?.endedAt)||0)):0;
    const cards=list.map(x=>{
      const source=x?.source==='crossink'?'CrossInk':'Reading MMO';
      const sid=x?.source==='crossink'&&Number(x?.readerSessionId)>0?` #${Number(x.readerSessionId)}`:'';
      const range=Number(x?.startPage)>0||Number(x?.endPage)>0?`${Number(x?.startPage)||'—'} → ${Number(x?.endPage)||'—'}`:'—';
      return `<article class="v51032-session">
        <div class="v51032-session-top"><div class="v51032-session-book">${esc(x?.bookTitle||'Unknown Book')}</div><div class="v51032-source ${x?.source==='crossink'?'crossink':''}">${esc(source+sid)}</div></div>
        <div class="v51032-date">${esc(fmtDateTime(x?.endedAt))}</div>
        <div class="v51032-session-grid">
          <div><span>PAGES</span><b>${Math.max(0,Number(x?.pages)||0).toLocaleString()}</b></div>
          <div><span>PAGE RANGE</span><b>${esc(range)}</b></div>
          <div><span>DURATION</span><b>${esc(fmtDuration(x?.durationMs))}</b></div>
        </div>
      </article>`;
    }).join('');
    const scope=selectedBook==='all'?'ALL BOOKS':titleForKey(selectedBook).toUpperCase();
    body.innerHTML=`
      <div class="v51032-summary">
        <div class="v51032-stat"><span>SESSIONS</span><b>${list.length.toLocaleString()}</b></div>
        <div class="v51032-stat"><span>PAGES READ</span><b>${totalPages.toLocaleString()}</b></div>
        <div class="v51032-stat"><span>READING TIME</span><b>${esc(fmtDuration(totalMs))}</b></div>
        <div class="v51032-stat"><span>AVG SESSION</span><b>${esc(fmtDuration(avg))}</b></div>
        <div class="v51032-stat last"><span>LAST READ</span><b>${last?esc(fmtDate(last)):'—'}</b></div>
      </div>
      <div class="v51032-section-label"><b>SESSION LOG</b><span>${esc(scope)} • ${list.length} ${list.length===1?'ENTRY':'ENTRIES'}</span></div>
      <div class="v51032-list">${cards||'<div class="v51032-empty">No sessions are recorded here yet.<br><br>Finish a Reading MMO session or import one from CrossInk and it will appear automatically.</div>'}</div>`;
  }

  function openJournal(){
    ensureModal();selectedBook='all';renderJournal();
    const modal=$('v51032JournalBackdrop');if(modal)modal.hidden=false;
    document.documentElement.style.overflow='hidden';
  }

  function closeJournal(){
    const modal=$('v51032JournalBackdrop');if(modal)modal.hidden=true;
    document.documentElement.style.overflow='';
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
    ensureCss();ensureModal();ensureLaunchers();stamp();
    [100,350,900,1800,3200].forEach(ms=>setTimeout(()=>{ensureLaunchers();stamp();},ms));
  }

  window.openReadingJournal=openJournal;
  window.closeReadingJournal=closeJournal;
  window.renderReadingJournal=renderJournal;

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){ensureLaunchers();stamp();if(!$('v51032JournalBackdrop')?.hidden)renderJournal();}});
})();
