(()=>{
  'use strict';
  if(window.__v51034ReadingJournalBooted)return;
  window.__v51034ReadingJournalBooted=true;

  const BUILD='v5.10.39';
  const $=id=>document.getElementById(id);
  let selectedBook='all';

  function appState(){
    try{return typeof S!=='undefined'&&S?S:null}catch(_){return null}
  }
  function sessions(){
    const list=appState()?.readingSessions;
    return Array.isArray(list)?list:[];
  }
  function library(){
    const list=appState()?.library;
    return Array.isArray(list)?list:[];
  }
  function esc(v){
    return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[m]));
  }
  function norm(v){
    return String(v||'').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
  }
  function keyFor(x){
    if(x?.bookId)return `id:${String(x.bookId)}`;
    return `title:${norm(x?.bookTitle||'Unknown Book')}`;
  }
  function titleForKey(key){
    const item=sessions().find(x=>keyFor(x)===key);
    return String(item?.bookTitle||'Unknown Book');
  }
  function recordForKey(key){
    const title=titleForKey(key);
    const id=key.startsWith('id:')?key.slice(3):'';
    return library().find(b=>id&&String(b?.id)===id)
      ||library().find(b=>norm(b?.title)===norm(title))
      ||null;
  }
  function filteredSessions(){
    const list=sessions().slice().sort((a,b)=>Number(b?.endedAt||0)-Number(a?.endedAt||0));
    return selectedBook==='all'?list:list.filter(x=>keyFor(x)===selectedBook);
  }
  function fmtDuration(ms,{short=false}={}){
    const sec=Math.max(0,Math.floor((Number(ms)||0)/1000));
    const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;
    if(h)return short?`${h}h ${m}m`:`${h}h ${m}m ${s}s`;
    if(m)return `${m}m ${s}s`;
    return `${s}s`;
  }
  function fmtDate(ts,opts={}){
    const d=new Date(Number(ts)||0);if(Number.isNaN(d.getTime()))return '—';
    try{return d.toLocaleDateString([],opts)}catch(_){return d.toLocaleDateString()}
  }
  function fmtTime(ts){
    const d=new Date(Number(ts)||0);if(Number.isNaN(d.getTime()))return '—';
    try{return d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}catch(_){return d.toLocaleTimeString()}
  }
  function isoDateLabel(v){
    if(!v)return '';
    const d=new Date(`${v}T12:00:00`);if(Number.isNaN(d.getTime()))return String(v);
    try{return d.toLocaleDateString([], {month:'short',day:'numeric',year:'numeric'})}catch(_){return String(v)}
  }
  function ratingLabel(v){
    const n=Number(v)||0;
    if(!n)return '';
    return `${Number.isInteger(n)?n:n.toFixed(1)} ★`;
  }
  function sourceLabel(x){
    if(x?.source==='crossink')return `CrossInk${Number(x?.readerSessionId)>0?` #${Number(x.readerSessionId)}`:''}`;
    return 'Reading MMO';
  }
  function sourceClass(x){return x?.source==='crossink'?'crossink':'app'}
  function rangeLabel(x){
    const a=Number(x?.startPage)||0,b=Number(x?.endPage)||0;
    if(!a&&!b)return '—';
    return `${a||'—'} → ${b||'—'}`;
  }
  function sameLocalDay(a,b){
    return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
  }
  function dayLabel(ts){
    const d=new Date(Number(ts)||0);if(Number.isNaN(d.getTime()))return 'UNDATED';
    const now=new Date(),y=new Date(now);y.setDate(now.getDate()-1);
    if(sameLocalDay(d,now))return 'TODAY';
    if(sameLocalDay(d,y))return 'YESTERDAY';
    try{return d.toLocaleDateString([], {month:'short',day:'numeric',year:'numeric'}).toUpperCase()}catch(_){return d.toDateString().toUpperCase()}
  }
  function dayKey(ts){
    const d=new Date(Number(ts)||0);if(Number.isNaN(d.getTime()))return '0';
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }
  function groupByDay(list){
    const groups=[];let current=null;
    list.forEach(x=>{
      const key=dayKey(x?.endedAt);
      if(!current||current.key!==key){current={key,label:dayLabel(x?.endedAt),items:[]};groups.push(current)}
      current.items.push(x);
    });
    return groups;
  }
  function statsFor(list){
    const totalPages=list.reduce((n,x)=>n+Math.max(0,Number(x?.pages)||0),0);
    const totalMs=list.reduce((n,x)=>n+Math.max(0,Number(x?.durationMs)||0),0);
    const avgMs=list.length?Math.round(totalMs/list.length):0;
    const avgPages=list.length?totalPages/list.length:0;
    const longest=list.reduce((best,x)=>Number(x?.durationMs||0)>Number(best?.durationMs||0)?x:best,null);
    const biggest=list.reduce((best,x)=>Number(x?.pages||0)>Number(best?.pages||0)?x:best,null);
    const last=list.length?Math.max(...list.map(x=>Number(x?.endedAt)||0)):0;
    return {totalPages,totalMs,avgMs,avgPages,longest,biggest,last};
  }
  function representedBooks(list){
    const map=new Map();
    list.forEach(x=>{
      const key=keyFor(x);if(!map.has(key))map.set(key,{key,title:String(x?.bookTitle||'Unknown Book'),pages:0,ms:0,sessions:0,last:0});
      const b=map.get(key);b.pages+=Math.max(0,Number(x?.pages)||0);b.ms+=Math.max(0,Number(x?.durationMs)||0);b.sessions++;b.last=Math.max(b.last,Number(x?.endedAt)||0);
    });
    return [...map.values()];
  }
  function currentReadMatches(title){
    return norm(appState()?.reading?.bookName)===norm(title);
  }
  function bookStatus(meta,title){
    if(currentReadMatches(title))return {label:'CURRENT READ',cls:'current'};
    if(meta?.finishDate)return {label:'ARCHIVED',cls:'archived'};
    return {label:'RECORDED',cls:'recorded'};
  }
  function statPill(label,value,sub=''){
    return `<div class="v51034-stat-pill"><span>${esc(label)}</span><b>${esc(value)}</b>${sub?`<i>${esc(sub)}</i>`:''}</div>`;
  }
  function stampBuild(){
    window.__readingMmoVersionOwner=BUILD;
    const badge=$('headerVersionText');if(badge)badge.textContent=BUILD;
    document.querySelectorAll('.health-row').forEach(row=>{
      if(row.querySelector('b')?.textContent.trim()==='Version'){
        const value=row.querySelector('span');if(value)value.textContent=BUILD;
      }
    });
  }

  function ensureCss(){
    if($('v51034-journal-css'))return;
    const style=document.createElement('style');
    style.id='v51034-journal-css';
    style.textContent=`
      .v51034-journal-launch{width:100%;min-height:40px!important;margin-top:7px!important;background:linear-gradient(#6e4e86,#493356)!important;border:2px solid #a07bb7!important;color:#f8e5b6!important;box-shadow:0 4px 0 rgba(42,21,15,.34)!important;font:900 7px/1 ui-monospace,monospace!important;letter-spacing:.35px!important}
      #library .v51034-library-journal{width:100%;min-height:38px!important;margin:0 0 9px!important;background:linear-gradient(#6e4e86,#493356)!important;border:2px solid #a07bb7!important;color:#f8e5b6!important;box-shadow:0 4px 0 rgba(42,21,15,.34)!important;font:900 6px/1 ui-monospace,monospace!important}
      .v51034-backdrop{position:fixed;inset:0;z-index:310;display:flex;align-items:stretch;justify-content:center;padding:9px 7px 82px;background:rgba(13,6,5,.92);backdrop-filter:blur(3px);overflow-y:auto}
      .v51034-backdrop[hidden]{display:none!important}
      .v51034-shell{width:min(590px,100%);min-height:100%;position:relative;padding:16px 14px 26px;overflow:hidden;background:radial-gradient(circle at 50% 0%,rgba(255,239,185,.32),transparent 31%),repeating-linear-gradient(0deg,rgba(102,65,34,.018) 0 1px,transparent 1px 5px),linear-gradient(180deg,#efdbab,#d7b87a);border:3px solid #623b22;outline:2px solid #b98542;outline-offset:-7px;box-shadow:0 14px 38px rgba(0,0,0,.58),inset 0 0 42px rgba(91,49,22,.16);color:#43291b}
      .v51034-shell:before,.v51034-shell:after{content:'❦';position:absolute;top:13px;color:#8b5d31;font:900 16px/1 Georgia,serif;opacity:.9}.v51034-shell:before{left:17px}.v51034-shell:after{right:17px;transform:scaleX(-1)}
      .v51034-close{position:absolute;right:15px;top:12px;z-index:5;width:33px!important;min-width:33px!important;height:33px!important;min-height:33px!important;margin:0!important;padding:0!important;border-radius:999px!important;background:#4a2b20!important;border:1px solid #a1733e!important;color:#f2d89e!important;box-shadow:0 2px 0 rgba(52,27,16,.3)!important;font-size:16px!important}
      .v51034-head{text-align:center;padding:4px 42px 10px}
      .v51034-kicker{font:900 5px/1 ui-monospace,monospace;letter-spacing:1.05px;color:#805d3e;text-transform:uppercase}
      .v51034-title{margin-top:5px;font:900 21px/1 Georgia,'Times New Roman',serif;color:#492c1c;text-shadow:0 1px 0 rgba(255,242,208,.5)}
      .v51034-sub{margin-top:5px;font:700 5.5px/1.35 ui-monospace,monospace;color:#755a43}
      .v51034-rule{height:8px;margin:1px 0 8px;position:relative}.v51034-rule:before{content:'';position:absolute;left:5%;right:5%;top:3px;border-top:1px solid rgba(113,72,38,.44)}.v51034-rule:after{content:'✦';position:absolute;left:50%;top:-1px;transform:translateX(-50%);padding:0 7px;background:#e6cd96;color:#8c6238;font:900 8px/1 Georgia,serif}
      .v51034-toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 9px;padding:6px 7px;background:rgba(255,245,214,.32);border-top:1px solid rgba(135,91,48,.36);border-bottom:1px solid rgba(135,91,48,.36)}
      .v51034-toolbar-label{flex:0 0 auto;font:900 4.6px/1 ui-monospace,monospace;letter-spacing:.55px;color:#76543b}
      .v51034-book-select{width:auto!important;max-width:72%;height:31px!important;margin:0!important;padding:4px 26px 4px 8px!important;border:1px solid #9d7447!important;border-radius:999px!important;background:#f4e3bc!important;color:#432b1e!important;font:900 6px/1 ui-monospace,monospace!important;box-shadow:inset 0 0 0 1px rgba(255,250,227,.7)!important}
      .v51034-book-hero{display:grid;grid-template-columns:64px 1fr;gap:10px;align-items:center;margin:7px 0 9px;padding:9px;background:linear-gradient(180deg,rgba(252,237,199,.83),rgba(221,190,136,.73));border:1px solid #936a3e;box-shadow:inset 0 0 0 1px rgba(255,247,220,.44)}
      .v51034-cover{width:64px;aspect-ratio:2/3;position:relative;display:grid;place-items:center;overflow:hidden;background:linear-gradient(145deg,#6c4b84,#33213d);border:2px solid #2b160f;outline:1px solid #b4894b;outline-offset:-4px;box-shadow:2px 3px 0 rgba(49,25,14,.32)}
      .v51034-cover img{width:100%;height:100%;object-fit:cover;display:block}.v51034-cover span{font:900 23px/1 Georgia,serif;color:#f3daa0}.v51034-cover:after{content:'';position:absolute;inset:5px;border:1px solid rgba(244,211,135,.46);pointer-events:none}
      .v51034-book-copy{min-width:0}.v51034-book-status{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:5px}.v51034-chip{display:inline-block;padding:3px 5px;border:1px solid #87633e;border-radius:999px;background:rgba(255,246,218,.45);color:#6b4a34;font:900 3.7px/1 ui-monospace,monospace;letter-spacing:.25px}.v51034-chip.current{background:#516b3d;color:#f5e3b6;border-color:#6f8b54}.v51034-chip.archived{background:#5d4274;color:#f6e1ba;border-color:#8964a3}.v51034-chip.rating{background:#7b5b22;color:#ffe7a6;border-color:#9d7933}
      .v51034-book-title{font:900 15px/1.04 Georgia,'Times New Roman',serif;color:#472b1a;overflow-wrap:anywhere}.v51034-book-author{margin-top:4px;font:800 5.4px/1.2 ui-monospace,monospace;color:#74583f}.v51034-book-meta{margin-top:6px;font:800 4.5px/1.35 ui-monospace,monospace;color:#765940}
      .v51034-ribbon{display:flex;gap:5px;overflow-x:auto;padding:2px 0 7px;scrollbar-width:none}.v51034-ribbon::-webkit-scrollbar{display:none}.v51034-stat-pill{flex:1 0 82px;min-width:82px;padding:7px 7px 6px;background:linear-gradient(180deg,rgba(248,231,190,.9),rgba(219,184,126,.85));border-top:1px solid #9a7042;border-bottom:2px solid #855c34;box-shadow:inset 0 1px 0 rgba(255,248,222,.52)}.v51034-stat-pill span{display:block;font:900 3.7px/1 ui-monospace,monospace;letter-spacing:.32px;color:#876144}.v51034-stat-pill b{display:block;margin-top:4px;font:900 9px/1 Georgia,'Times New Roman',serif;color:#492d1c;white-space:nowrap}.v51034-stat-pill i{display:block;margin-top:3px;font:700 3.4px/1 ui-monospace,monospace;color:#7c6048;font-style:normal}
      .v51034-ledger-note{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:0 0 10px}.v51034-ledger-note>div{padding:7px 8px;background:rgba(255,244,211,.31);border-left:2px solid #90673d}.v51034-ledger-note span{display:block;font:900 3.7px/1 ui-monospace,monospace;color:#836044;letter-spacing:.3px}.v51034-ledger-note b{display:block;margin-top:4px;font:900 6.5px/1.15 Georgia,'Times New Roman',serif;color:#4b301e;overflow-wrap:anywhere}
      .v51034-overall-hero{margin:5px 0 9px;padding:10px 10px 9px;background:linear-gradient(145deg,rgba(76,43,29,.96),rgba(43,24,18,.96));border:1px solid #8d6338;box-shadow:inset 0 0 0 2px rgba(230,191,111,.07),0 4px 0 rgba(63,31,18,.16);color:#efd69f}.v51034-overall-kicker{font:900 4px/1 ui-monospace,monospace;letter-spacing:.6px;color:#bfa16f}.v51034-overall-title{margin-top:5px;font:900 13px/1.08 Georgia,'Times New Roman',serif;color:#f4daa0}.v51034-overall-sub{margin-top:5px;font:700 4.8px/1.35 ui-monospace,monospace;color:#bca989}
      .v51034-feature-row{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:0 0 11px}.v51034-feature{padding:8px;background:rgba(255,245,215,.34);border:1px solid rgba(136,91,47,.52)}.v51034-feature span{display:block;font:900 3.8px/1 ui-monospace,monospace;letter-spacing:.35px;color:#876247}.v51034-feature b{display:block;margin-top:5px;font:900 7px/1.1 Georgia,'Times New Roman',serif;color:#4b2f1f;overflow-wrap:anywhere}.v51034-feature i{display:block;margin-top:3px;font:700 3.7px/1.25 ui-monospace,monospace;color:#745b46;font-style:normal}
      .v51034-section-head{display:flex;align-items:center;gap:8px;margin:9px 0 4px;color:#5a3925}.v51034-section-head:before,.v51034-section-head:after{content:'';height:1px;background:rgba(113,72,38,.45);flex:1}.v51034-section-head b{font:900 7px/1 Georgia,'Times New Roman',serif;white-space:nowrap}.v51034-section-head small{font:900 3.6px/1 ui-monospace,monospace;color:#826248;white-space:nowrap}
      .v51034-day{margin-top:8px}.v51034-day-head{display:flex;align-items:center;gap:7px;margin:0 1px 3px}.v51034-day-head b{font:900 4.3px/1 ui-monospace,monospace;letter-spacing:.55px;color:#75543a}.v51034-day-head:after{content:'';height:1px;flex:1;background:rgba(113,72,38,.33)}
      .v51034-entry{position:relative;display:grid;grid-template-columns:48px 1fr;gap:8px;padding:8px 5px 8px 14px;margin-left:8px;border-left:1px solid rgba(118,75,40,.45)}.v51034-entry:before{content:'✦';position:absolute;left:-5px;top:13px;width:10px;height:10px;display:grid;place-items:center;background:#dfc38c;color:#7c5632;font:900 7px/1 Georgia,serif}.v51034-time{padding-top:1px;font:900 4.3px/1.2 ui-monospace,monospace;color:#765840}.v51034-entry-main{min-width:0;padding:7px 8px;background:linear-gradient(180deg,rgba(250,235,198,.72),rgba(223,192,140,.64));border:1px solid rgba(142,99,56,.48);box-shadow:inset 0 0 0 1px rgba(255,249,226,.28)}.v51034-entry-top{display:flex;align-items:flex-start;justify-content:space-between;gap:6px}.v51034-entry-book{min-width:0;font:900 8.2px/1.1 Georgia,'Times New Roman',serif;color:#472b1c;overflow-wrap:anywhere}.v51034-source{flex:0 0 auto;padding:3px 5px;border-radius:999px;font:900 3.2px/1 ui-monospace,monospace;white-space:nowrap;background:#6c513e;color:#f3ddb3}.v51034-source.crossink{background:#63467b;color:#f4dfb6}.v51034-source.app{background:#526645;color:#f2e1b8}.v51034-entry-numbers{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;margin-top:6px}.v51034-range{font:900 8px/1 Georgia,'Times New Roman',serif;color:#503321}.v51034-gain{font:900 4px/1 ui-monospace,monospace;color:#67523e}.v51034-duration{font:900 4px/1 ui-monospace,monospace;color:#67523e}.v51034-book-link{margin:6px 0 0!important;padding:0!important;border:0!important;background:transparent!important;color:#6d4b82!important;box-shadow:none!important;font:900 3.7px/1 ui-monospace,monospace!important;text-decoration:underline;text-underline-offset:2px}
      .v51034-empty{padding:28px 16px;text-align:center;background:rgba(250,235,199,.56);border:1px dashed #946c42;color:#765b44}.v51034-empty b{display:block;font:900 10px/1 Georgia,'Times New Roman',serif;color:#543621}.v51034-empty span{display:block;margin-top:7px;font:700 5px/1.45 ui-monospace,monospace}
      @media(max-width:390px){.v51034-backdrop{padding-left:4px;padding-right:4px}.v51034-shell{padding-left:10px;padding-right:10px}.v51034-title{font-size:18px}.v51034-book-hero{grid-template-columns:54px 1fr}.v51034-cover{width:54px}.v51034-book-title{font-size:12.5px}.v51034-stat-pill{flex-basis:74px;min-width:74px}.v51034-entry{grid-template-columns:43px 1fr;gap:6px}.v51034-entry-book{font-size:7.4px}.v51034-range{font-size:7px}}
    `;
    document.head.appendChild(style);
  }

  function ensureLaunchers(){
    const actions=document.querySelector('#reading .v591-book-actions');
    let button=$('v51032JournalLaunch')||$('v51034JournalLaunch');
    if(actions&&!button){
      button=document.createElement('button');
      button.id='v51034JournalLaunch';button.type='button';button.className='v51034-journal-launch';
      const row=actions.querySelector('.v598-read-library-row');
      if(row)row.insertAdjacentElement('afterend',button);else actions.appendChild(button);
    }
    if(button){button.className='v51034-journal-launch';button.textContent='📖  OPEN READING JOURNAL';button.onclick=openJournal}

    const libraryWrap=document.querySelector('#library .v5104-library-wrap');
    let libraryButton=$('v51032LibraryJournalLaunch')||$('v51034LibraryJournalLaunch');
    if(libraryWrap&&!libraryButton){
      libraryButton=document.createElement('button');
      libraryButton.id='v51034LibraryJournalLaunch';libraryButton.type='button';libraryButton.className='v51034-library-journal';
      const back=libraryWrap.querySelector('.v5104-back');
      if(back)back.insertAdjacentElement('afterend',libraryButton);else libraryWrap.prepend(libraryButton);
    }
    if(libraryButton){libraryButton.className='v51034-library-journal';libraryButton.textContent='📖  OPEN READING JOURNAL';libraryButton.onclick=openJournal}
  }

  function ensureModal(){
    const old=$('v51032JournalBackdrop');if(old)old.remove();
    if($('v51034JournalBackdrop'))return;
    const modal=document.createElement('div');
    modal.id='v51034JournalBackdrop';modal.className='v51034-backdrop';modal.hidden=true;
    modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Reading Journal');
    modal.innerHTML=`<div class="v51034-shell">
      <button class="v51034-close" type="button" aria-label="Close reading journal">×</button>
      <div class="v51034-head"><div class="v51034-kicker">THE ARCHIVIST'S READING RECORD</div><div class="v51034-title">Reading Journal</div><div class="v51034-sub">A living ledger of every page, every sitting, every story.</div></div>
      <div class="v51034-rule"></div>
      <div class="v51034-toolbar"><span class="v51034-toolbar-label">BOOK</span><select id="v51034BookFilter" class="v51034-book-select" aria-label="Show sessions for book"></select></div>
      <div id="v51034JournalBody"></div>
    </div>`;
    document.body.appendChild(modal);
    modal.querySelector('.v51034-close').onclick=closeJournal;
    modal.addEventListener('click',e=>{if(e.target===modal)closeJournal()});
    $('v51034BookFilter').addEventListener('change',e=>{selectedBook=e.target.value||'all';renderJournal()});
  }

  function renderFilter(){
    const select=$('v51034BookFilter');if(!select)return;
    const keys=new Map();
    sessions().forEach(x=>{const key=keyFor(x);if(key&&!keys.has(key))keys.set(key,String(x?.bookTitle||'Unknown Book'))});
    const sorted=[...keys.entries()].sort((a,b)=>a[1].localeCompare(b[1]));
    if(selectedBook!=='all'&&!keys.has(selectedBook))selectedBook='all';
    select.innerHTML='<option value="all">All Books</option>'+sorted.map(([key,title])=>`<option value="${esc(key)}">${esc(title)}</option>`).join('');
    select.value=selectedBook;
  }

  function timelineMarkup(list,{showBook=false}={}){
    if(!list.length)return `<div class="v51034-empty"><b>No sessions recorded yet.</b><span>Your completed Reading MMO and CrossInk sessions will appear here automatically.</span></div>`;
    return groupByDay(list).map(group=>`<section class="v51034-day"><div class="v51034-day-head"><b>${esc(group.label)}</b></div>${group.items.map(x=>{
      const key=keyFor(x),title=String(x?.bookTitle||'Unknown Book');
      return `<article class="v51034-entry">
        <div class="v51034-time">${esc(fmtTime(x?.endedAt))}</div>
        <div class="v51034-entry-main">
          <div class="v51034-entry-top"><div class="v51034-entry-book">${esc(title)}</div><div class="v51034-source ${sourceClass(x)}">${esc(sourceLabel(x))}</div></div>
          <div class="v51034-entry-numbers"><span class="v51034-range">${esc(rangeLabel(x))}</span><span class="v51034-gain">+${Math.max(0,Number(x?.pages)||0).toLocaleString()} pages</span><span class="v51034-duration">${esc(fmtDuration(x?.durationMs))}</span></div>
          ${showBook?`<button class="v51034-book-link" type="button" data-journal-book="${esc(key)}">VIEW THIS BOOK →</button>`:''}
        </div>
      </article>`;
    }).join('')}</section>`).join('');
  }

  function selectedBookMarkup(list){
    const title=titleForKey(selectedBook),meta=recordForKey(selectedBook),st=statsFor(list),status=bookStatus(meta,title);
    const firstChron=list.slice().sort((a,b)=>Number(a?.endedAt||0)-Number(b?.endedAt||0))[0]||null;
    const latest=list[0]||null;
    const cover=meta?.cover?`<img src="${esc(meta.cover)}" alt="${esc(title)} cover">`:`<span>📖</span>`;
    const author=String(meta?.author||'').trim();
    const series=String(meta?.series||'').trim();
    const rating=ratingLabel(meta?.rating);
    const metaBits=[];
    if(series)metaBits.push(series);
    if(meta?.pages)metaBits.push(`${Number(meta.pages).toLocaleString()} pages`);
    if(meta?.startDate)metaBits.push(`Started ${isoDateLabel(meta.startDate)}`);
    if(meta?.finishDate)metaBits.push(`Finished ${isoDateLabel(meta.finishDate)}`);
    const recordedMin=list.reduce((m,x)=>{const vals=[Number(x?.startPage)||0,Number(x?.endPage)||0].filter(Boolean);const v=vals.length?Math.min(...vals):0;return v&&(!m||v<m)?v:m},0);
    const recordedMax=list.reduce((m,x)=>Math.max(m,Number(x?.startPage)||0,Number(x?.endPage)||0),0);
    return `
      <section class="v51034-book-hero">
        <div class="v51034-cover">${cover}</div>
        <div class="v51034-book-copy">
          <div class="v51034-book-status"><span class="v51034-chip ${status.cls}">${status.label}</span>${rating?`<span class="v51034-chip rating">${esc(rating)}</span>`:''}</div>
          <div class="v51034-book-title">${esc(title)}</div>
          <div class="v51034-book-author">${esc(author||'AUTHOR NOT YET ADDED TO ARCHIVE')}</div>
          ${metaBits.length?`<div class="v51034-book-meta">${metaBits.map(esc).join(' • ')}</div>`:''}
        </div>
      </section>
      <div class="v51034-ribbon">
        ${statPill('SESSIONS',list.length.toLocaleString(),st.last?`last ${fmtDate(st.last,{month:'short',day:'numeric'})}`:'')}
        ${statPill('PAGES READ',st.totalPages.toLocaleString(),`${st.avgPages.toFixed(st.avgPages>=10?0:1)} avg / session`)}
        ${statPill('READING TIME',fmtDuration(st.totalMs,{short:true}),`avg ${fmtDuration(st.avgMs)}`)}
        ${statPill('LONGEST',st.longest?fmtDuration(st.longest.durationMs):'—',st.longest?`${Math.max(0,Number(st.longest.pages)||0)} pages`:'')}
      </div>
      <div class="v51034-ledger-note">
        <div><span>RECORDED JOURNEY</span><b>${recordedMin&&recordedMax?`${recordedMin.toLocaleString()} — ${recordedMax.toLocaleString()}`:'No page range yet'}</b></div>
        <div><span>LATEST SITTING</span><b>${latest?`${rangeLabel(latest)} • ${Math.max(0,Number(latest.pages)||0)} pages`:'—'}</b></div>
        <div><span>FIRST RECORD</span><b>${firstChron?fmtDate(firstChron.endedAt,{month:'short',day:'numeric',year:'numeric'}):'—'}</b></div>
        <div><span>MOST PAGES / SESSION</span><b>${st.biggest?`${Math.max(0,Number(st.biggest.pages)||0)} pages`:'—'}</b></div>
      </div>
      <div class="v51034-section-head"><b>READING TIMELINE</b><small>${list.length} ${list.length===1?'ENTRY':'ENTRIES'}</small></div>
      ${timelineMarkup(list)}
    `;
  }

  function allBooksMarkup(list){
    const st=statsFor(list),books=representedBooks(list);
    const mostRead=books.slice().sort((a,b)=>b.pages-a.pages||b.ms-a.ms)[0]||null;
    const longest=st.longest;
    const recentBook=books.slice().sort((a,b)=>b.last-a.last)[0]||null;
    return `
      <section class="v51034-overall-hero">
        <div class="v51034-overall-kicker">THE COMPLETE LEDGER</div>
        <div class="v51034-overall-title">Your reading life, session by session.</div>
        <div class="v51034-overall-sub">CrossInk and Reading MMO records live together here without changing the books on your Archive shelves.</div>
      </section>
      <div class="v51034-ribbon">
        ${statPill('BOOKS',books.length.toLocaleString(),'represented in journal')}
        ${statPill('SESSIONS',list.length.toLocaleString(),st.last?`last ${fmtDate(st.last,{month:'short',day:'numeric'})}`:'')}
        ${statPill('PAGES',st.totalPages.toLocaleString(),`${st.avgPages.toFixed(st.avgPages>=10?0:1)} avg / session`)}
        ${statPill('TIME',fmtDuration(st.totalMs,{short:true}),`avg ${fmtDuration(st.avgMs)}`)}
      </div>
      <div class="v51034-feature-row">
        <div class="v51034-feature"><span>MOST-READ BOOK</span><b>${esc(mostRead?.title||'—')}</b><i>${mostRead?`${mostRead.pages.toLocaleString()} pages • ${mostRead.sessions} sessions`:'No sessions yet'}</i></div>
        <div class="v51034-feature"><span>LONGEST SESSION</span><b>${longest?esc(fmtDuration(longest.durationMs)):'—'}</b><i>${longest?`${esc(longest.bookTitle||'Unknown Book')} • ${Math.max(0,Number(longest.pages)||0)} pages`:'No sessions yet'}</i></div>
        <div class="v51034-feature"><span>MOST RECENT BOOK</span><b>${esc(recentBook?.title||'—')}</b><i>${recentBook?fmtDate(recentBook.last,{month:'short',day:'numeric',year:'numeric'}):'No sessions yet'}</i></div>
        <div class="v51034-feature"><span>BIGGEST PAGE SESSION</span><b>${st.biggest?`${Math.max(0,Number(st.biggest.pages)||0)} pages`:'—'}</b><i>${st.biggest?esc(st.biggest.bookTitle||'Unknown Book'):'No sessions yet'}</i></div>
      </div>
      <div class="v51034-section-head"><b>RECENT READING</b><small>${list.length} ${list.length===1?'ENTRY':'ENTRIES'}</small></div>
      ${timelineMarkup(list,{showBook:true})}
    `;
  }

  function renderJournal(){
    ensureModal();renderFilter();stampBuild();
    const body=$('v51034JournalBody');if(!body)return;
    const list=filteredSessions();
    body.innerHTML=selectedBook==='all'?allBooksMarkup(list):selectedBookMarkup(list);
    body.querySelectorAll('[data-journal-book]').forEach(btn=>btn.addEventListener('click',()=>{
      selectedBook=btn.getAttribute('data-journal-book')||'all';
      renderJournal();
      $('v51034BookFilter')?.scrollIntoView({behavior:'smooth',block:'nearest'});
    }));
  }

  function openJournal(bookKey){
    ensureCss();ensureLaunchers();ensureModal();
    if(bookKey)selectedBook=bookKey;
    renderJournal();
    const modal=$('v51034JournalBackdrop');if(!modal)return;
    modal.hidden=false;document.body.style.overflow='hidden';
    setTimeout(()=>modal.querySelector('.v51034-close')?.focus({preventScroll:true}),20);
  }
  function closeJournal(){
    const modal=$('v51034JournalBackdrop');if(modal)modal.hidden=true;
    document.body.style.overflow='';
  }

  function refreshIfOpen(){
    const modal=$('v51034JournalBackdrop');if(modal&&!modal.hidden)renderJournal();
  }
  function wrapRenderAll(){
    const old=window.renderAll;
    if(typeof old!=='function'||old.__v51034JournalWrapped)return;
    const wrapped=function(){const out=old.apply(this,arguments);setTimeout(()=>{ensureLaunchers();refreshIfOpen();stampBuild()},0);return out};
    wrapped.__v51034JournalWrapped=true;window.renderAll=wrapped;
  }
  function boot(){
    ensureCss();ensureLaunchers();ensureModal();stampBuild();wrapRenderAll();
    window.openReadingJournal=openJournal;
    window.renderReadingJournalV2=renderJournal;
    [80,300,800,1800,3200].forEach(ms=>setTimeout(()=>{ensureLaunchers();stampBuild()},ms));
  }
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('v51034JournalBackdrop')?.hidden)closeJournal()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();