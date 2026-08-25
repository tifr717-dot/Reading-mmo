/* Reading MMO v5.10.22 — Reading Desk clarity + aesthetic polish.
   Separates book-specific data from MMO-wide totals and gives shelving a clearer hierarchy. */
(function(){
  const BUILD='v5.10.22';
  window.__readingMmoVersionOwner=BUILD;
  const $=id=>document.getElementById(id);

  function stamp(){
    const badge=$('headerVersionText'); if(badge)badge.textContent=BUILD;
    document.querySelectorAll('.health-row').forEach(row=>{
      if(row.querySelector('b')?.textContent.trim()==='Version'){
        const val=row.querySelector('span'); if(val)val.textContent=BUILD;
      }
    });
  }

  function addCss(){
    if($('reading-desk-v51022-css'))return;
    const s=document.createElement('style');
    s.id='reading-desk-v51022-css';
    s.textContent=`
      /* ---- Current Volume: book data only ---- */
      #reading .v51022-hidden-source{display:none!important}
      #reading .v591-book-panel{padding-bottom:12px!important}
      #reading .v591-book-grid{grid-template-columns:1fr 1fr!important;gap:9px 10px!important}
      #reading .v591-book-name{grid-column:1/-1!important}
      #reading .v591-status-field{grid-column:1!important}
      #reading .v591-page-total{grid-column:2!important}
      #reading .v591-status-field label:after{content:''}
      #reading .v591-book-grid input,#reading .v591-book-grid select{min-height:45px!important}

      #reading .v51022-recent{
        display:flex;align-items:center;gap:7px;margin:8px 0 10px;padding:7px 10px;
        border:1px solid rgba(135,98,52,.34);background:rgba(255,246,218,.42);
        color:#72583f;font:700 8.2px/1.25 ui-monospace,SFMono-Regular,monospace;
      }
      #reading .v51022-recent b{color:#4b2f21;font-family:Georgia,'Times New Roman',serif;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #reading .v51022-recent span:first-child{opacity:.82;white-space:nowrap}

      /* ---- Action hierarchy ---- */
      #reading .v591-book-actions{display:block!important;margin-top:10px!important}
      #reading .v51022-primary-save{width:100%!important;min-height:50px!important;margin:0 0 11px!important;font-size:10px!important;letter-spacing:.2px!important}
      #reading .v51022-action-label{margin:11px 0 5px;padding-left:2px;color:#76563c;font:900 6.8px/1 ui-monospace,monospace;letter-spacing:.85px}
      #reading .v51022-action-label:after{content:'';display:inline-block;width:34px;margin:0 0 2px 7px;border-top:1px solid rgba(118,86,60,.34)}
      #reading .v51022-shelf-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px!important;margin:0!important}
      #reading .v51022-shelf-actions button{min-height:47px!important;margin:0!important;padding:8px 7px!important;font-size:8.6px!important;line-height:1.15!important}
      #reading .v51022-shelf-actions #shelfCurrentBookBtn{background:linear-gradient(#76583e,#5e412e)!important;border-color:#a27a48!important}
      #reading .v51022-shelf-actions #openShelvedBooksBtn{background:linear-gradient(#76549b,#5b3d7a)!important;border-color:#8e6caf!important}
      #reading .v51022-count{display:inline-grid;place-items:center;min-width:19px;height:19px;margin-left:4px;padding:0 5px;border:1px solid rgba(255,238,196,.58);border-radius:99px;background:rgba(29,15,35,.25);font-size:7px}
      #reading .v598-read-library-row{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;margin:0!important}
      #reading .v598-read-library-row button{min-height:41px!important;margin:0!important;padding:7px 6px!important;font-size:7.4px!important;line-height:1.15!important}
      #reading .v591-sync-note{margin-top:8px!important;text-align:center!important;font-size:6.4px!important;line-height:1.3!important;color:#80694f!important}

      /* ---- MMO total lives with Reading Session, not Current Volume ---- */
      #reading .v51022-mmo-total{
        display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 0 0;padding:9px 11px;
        border:1px solid #8c6739;outline:1px solid rgba(212,169,88,.25);outline-offset:-4px;
        background:linear-gradient(180deg,#3b241a,#27150f);color:#e6cc95;
      }
      #reading .v51022-mmo-copy{min-width:0}
      #reading .v51022-mmo-copy b{display:block;font:900 7px/1 ui-monospace,monospace;letter-spacing:.75px;color:#d9bd83}
      #reading .v51022-mmo-copy small{display:block;margin-top:4px;font:700 5.8px/1.2 ui-monospace,monospace;color:#9f896a}
      #reading .v51022-mmo-number{flex:0 0 auto;font:900 16px/1 Georgia,'Times New Roman',serif;color:#f1d58f;text-align:right}
      #reading .v51022-mmo-number span{display:block;margin-top:3px;font:900 5px/1 ui-monospace,monospace;letter-spacing:.65px;color:#9f896a}

      /* ---- Paused Volumes: more like a shelf, less like a settings dialog ---- */
      .v51019-modal{background:rgba(11,6,5,.91)!important;padding:16px!important;backdrop-filter:blur(1px)}
      .v51019-window{
        width:min(520px,100%)!important;max-height:84vh!important;padding:13px!important;
        background:linear-gradient(180deg,#ecd9a8 0%,#dbc28b 58%,#caa96f 100%)!important;
        border:3px solid #5a3723!important;outline:2px solid #b9873f!important;outline-offset:-7px!important;
        box-shadow:0 0 0 1px #2e190f,0 18px 48px #000!important;
      }
      .v51019-head{padding:5px 5px 11px!important;margin-bottom:10px!important;border-bottom:1px solid rgba(104,72,39,.35)!important}
      .v51019-head h2{font-size:18px!important;letter-spacing:.2px!important;color:#4a2d1f!important}
      .v51019-head small{margin-top:5px!important;color:#765b40!important;font-size:8px!important;line-height:1.25!important}
      .v51019-head>button{min-width:72px!important;min-height:35px!important;margin:0!important;padding:6px 8px!important;background:#694d3a!important;font-size:7px!important}
      .v51019-shelf-card{
        position:relative!important;margin:10px 1px!important;padding:12px!important;
        background:linear-gradient(180deg,#fbefd4,#f0ddb5)!important;
        border:1px solid #9b7443!important;outline:1px solid rgba(255,250,224,.72)!important;outline-offset:-4px!important;
        box-shadow:0 4px 0 rgba(70,40,22,.16)!important;
      }
      .v51019-shelf-title{font-size:15px!important;color:#4a2c20!important}
      .v51019-shelf-top>b{padding:4px 6px!important;border:1px solid #a98abf!important;background:rgba(111,76,151,.08)!important;color:#72508f!important;font-size:6.5px!important;letter-spacing:.45px!important}
      .v51019-shelf-meta{margin-top:6px!important;gap:4px 7px!important;font-size:7.7px!important;color:#725a44!important}
      .v51019-shelf-meta span{padding-right:7px;border-right:1px solid rgba(112,82,51,.24)}
      .v51019-shelf-meta span:last-child{border-right:0;padding-right:0}
      .v51019-shelf-bar{height:9px!important;margin:9px 0 11px!important;border:1px solid #6c4930!important;box-shadow:inset 0 0 0 1px rgba(236,196,111,.34)!important}
      .v51019-shelf-card button{min-height:42px!important;background:linear-gradient(#7959a0,#5c3f7c)!important;border-color:#6b4b8b!important;font-size:8.5px!important;letter-spacing:.1px!important}
      .v51019-shelf-empty{background:rgba(255,246,221,.46)!important;border-color:#9b7547!important;color:#735941!important}
      .v51022-shelf-foot{margin:8px 4px 2px;text-align:center;color:#7a624b;font:700 6.4px/1.35 ui-monospace,monospace}

      @media(max-width:390px){
        #reading .v591-book-grid{grid-template-columns:1fr!important}
        #reading .v591-status-field,#reading .v591-page-total{grid-column:1!important}
        #reading .v51022-recent{align-items:flex-start;flex-wrap:wrap}
        #reading .v51022-shelf-actions{grid-template-columns:1fr 1fr}
        .v51019-window{padding:11px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function ensurePolishedShelfShell(){
    const oldRow=$('shelfCurrentBookBtn')?.closest('.v51017-shelf-row,.v51019-shelf-actions');
    if(oldRow&&!oldRow.classList.contains('v51022-shelf-actions'))oldRow.remove();
    const oldModal=$('readingShelfModal');
    if(oldModal&&!oldModal.classList.contains('v51019-modal'))oldModal.remove();

    const actions=document.querySelector('#reading .v591-book-actions');
    if(actions&&!$('shelfCurrentBookBtn')){
      const row=document.createElement('div');
      row.className='v51022-shelf-actions';
      row.innerHTML='<button id="shelfCurrentBookBtn" class="btn-plain" onclick="shelfCurrentBook()">📚 SHELVE THIS BOOK</button><button id="openShelvedBooksBtn" class="btn-purple" onclick="openShelvedBooks()">📖 PAUSED VOLUMES <span id="shelvedBookCount" class="v51022-count">0</span></button>';
      const lib=actions.querySelector('.v598-read-library-row');
      if(lib)actions.insertBefore(row,lib); else actions.appendChild(row);
    }

    if(!$('readingShelfModal')){
      const m=document.createElement('div');
      m.id='readingShelfModal';m.className='v51019-modal';m.hidden=true;m.setAttribute('onclick','readingShelfBackdrop(event)');
      m.innerHTML='<div class="v51019-window" role="dialog" aria-modal="true" aria-labelledby="readingShelfTitle"><div class="v51019-head"><div><h2 id="readingShelfTitle">📚 PAUSED VOLUMES</h2><small>Books waiting for you on the shelf.</small></div><button class="btn-plain" onclick="closeShelvedBooks()">CLOSE</button></div><div id="readingShelfList"></div><div class="v51022-shelf-foot">Switching books safely shelves whatever is currently on your Reading Desk.</div></div>';
      document.body.appendChild(m);
    }
  }

  function decorateStructure(){
    addCss();
    const panel=document.querySelector('#reading .v591-book-panel');
    if(!panel)return;

    const lastWrap=panel.querySelector('.v591-last-book');
    if(lastWrap)lastWrap.classList.add('v51022-hidden-source');
    const mmoWrap=panel.querySelector('.v591-mmo-total');
    if(mmoWrap)mmoWrap.classList.add('v51022-hidden-source');

    const mode=$('readMode');
    if(mode){
      const wrap=mode.closest('.v591-field');
      const lab=wrap?.querySelector('label');if(lab)lab.textContent='Reading mode';
      const first=mode.querySelector('option[value="first"]');if(first)first.textContent='First read';
      const reread=mode.querySelector('option[value="reread"]');if(reread)reread.textContent='Reread / familiar';
    }
    const pages=$('readBookTotal');
    const pLab=pages?.closest('.v591-field')?.querySelector('label');if(pLab)pLab.textContent='Book length';

    if(!$('v51022Recent')){
      const recent=document.createElement('div');recent.id='v51022Recent';recent.className='v51022-recent';
      const banner=panel.querySelector('.v591-book-banner');
      if(banner)banner.insertAdjacentElement('afterend',recent);
    }

    const actions=panel.querySelector('.v591-book-actions');
    if(actions){
      const save=Array.from(actions.children).find(el=>el.tagName==='BUTTON'&&String(el.getAttribute('onclick')||'').includes('saveReadingDesk'));
      if(save){save.classList.add('v51022-primary-save');save.textContent='💾 SAVE CURRENT VOLUME';}
      const lib=actions.querySelector('.v598-read-library-row');
      if(lib){
        const bs=lib.querySelectorAll('button');
        if(bs[0])bs[0].textContent='📚 OPEN LIBRARY';
        if(bs[1])bs[1].textContent='🏁 ARCHIVE WHEN FINISHED';
      }
      const note=actions.querySelector('.v591-sync-note');
      if(note)note.textContent='Current-book details stay here • finished books live in the Archive.';
    }

    ensurePolishedShelfShell();

    if(actions){
      const shelf=$('shelfCurrentBookBtn')?.closest('.v51022-shelf-actions');
      const lib=actions.querySelector('.v598-read-library-row');
      if(shelf&&lib&&shelf.nextElementSibling!==lib)actions.insertBefore(shelf,lib);

      if(shelf&&!$('v51022PauseLabel')){
        const l=document.createElement('div');l.id='v51022PauseLabel';l.className='v51022-action-label';l.textContent='PAUSE & SWITCH';
        actions.insertBefore(l,shelf);
      }
      if(lib&&!$('v51022LibraryLabel')){
        const l=document.createElement('div');l.id='v51022LibraryLabel';l.className='v51022-action-label';l.textContent='LIBRARY';
        actions.insertBefore(l,lib);
      }
    }

    const session=document.querySelector('#reading .v591-session-panel');
    const stats=session?.querySelector('.v591-session-stats');
    if(session&&stats&&!$('v51022MmoTotal')){
      const box=document.createElement('div');box.id='v51022MmoTotal';box.className='v51022-mmo-total';
      box.innerHTML='<div class="v51022-mmo-copy"><b>MMO READING TOTAL</b><small>Pages you have added across all reading sessions</small></div><div class="v51022-mmo-number"><b id="v51022MmoNumber">0</b><span>PAGES</span></div>';
      session.insertBefore(box,stats);
    }

    updateDynamic();
    wireLiveInputs();
    decorateShelfCards();
    stamp();
  }

  function updateDynamic(){
    const recent=$('v51022Recent');
    if(recent){
      const raw=String($('readLastFinishedBook')?.value || (typeof S!=='undefined'?S.reading?.lastFinishedBook:'') || '').trim();
      recent.innerHTML=raw?`<span>RECENTLY FINISHED</span><b>${escapeHtml(raw)}</b>`:'<span>RECENTLY FINISHED</span><b>Nothing archived yet</b>';
    }
    const total=$('v51022MmoNumber');
    if(total){
      const n=Math.max(0,Number($('readMmoPages')?.value)||(typeof S!=='undefined'?Number(S.pages)||0:0));
      total.textContent=n.toLocaleString();
    }
    const shelf=$('shelfCurrentBookBtn');
    if(shelf){
      const typed=String($('readBookName')?.value||'').trim();
      shelf.disabled=!typed;
    }
    const count=$('shelvedBookCount');
    if(count&&typeof S!=='undefined'&&Array.isArray(S.shelvedBooks))count.textContent=String(S.shelvedBooks.length);
    const open=$('openShelvedBooksBtn');
    if(open&&typeof S!=='undefined'&&Array.isArray(S.shelvedBooks))open.disabled=!S.shelvedBooks.length;
    stamp();
  }

  function escapeHtml(v){return String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

  function wireLiveInputs(){
    const book=$('readBookName');
    if(book&&!book.__v51022){book.addEventListener('input',updateDynamic);book.__v51022=true;}
    const last=$('readLastFinishedBook');
    if(last&&!last.__v51022){last.addEventListener('input',updateDynamic);last.__v51022=true;}
  }

  function decorateShelfCards(){
    const title=$('readingShelfTitle');if(title)title.textContent='📚 PAUSED VOLUMES';
    const sub=document.querySelector('#readingShelfModal .v51019-head small');if(sub)sub.textContent='Books waiting for you on the shelf.';
    document.querySelectorAll('#readingShelfList .v51019-shelf-card button').forEach(btn=>{
      const hasActive=!!String($('readBookName')?.value||'').trim();
      btn.textContent=hasActive?'↔ SHELVE CURRENT & SWITCH':'📖 RESUME READING';
    });
  }

  function wrapFunctions(){
    if(typeof window.renderReading==='function'&&!window.renderReading.__v51022){
      const old=window.renderReading;
      const wrapped=function(){const r=old.apply(this,arguments);setTimeout(()=>{decorateStructure();updateDynamic();},0);return r;};
      wrapped.__v51022=true;window.renderReading=wrapped;
    }
    if(typeof window.renderSaveHealth==='function'&&!window.renderSaveHealth.__v51022){
      const old=window.renderSaveHealth;
      const wrapped=function(){const r=old.apply(this,arguments);setTimeout(stamp,0);return r;};
      wrapped.__v51022=true;window.renderSaveHealth=wrapped;
    }
    if(typeof window.openShelvedBooks==='function'&&!window.openShelvedBooks.__v51022){
      const old=window.openShelvedBooks;
      const wrapped=function(){const r=old.apply(this,arguments);setTimeout(()=>{decorateStructure();decorateShelfCards();},0);return r;};
      wrapped.__v51022=true;window.openShelvedBooks=wrapped;
    }
  }

  function observeShelf(){
    const box=$('readingShelfList');
    if(!box||box.__v51022)return;
    const mo=new MutationObserver(()=>{decorateShelfCards();updateDynamic();});
    mo.observe(box,{childList:true,subtree:true});box.__v51022=true;
  }

  function boot(){
    addCss();wrapFunctions();decorateStructure();observeShelf();stamp();
    [80,250,700,1100].forEach(ms=>setTimeout(()=>{wrapFunctions();decorateStructure();observeShelf();updateDynamic();},ms));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
