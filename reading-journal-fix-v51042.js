(()=>{
  'use strict';
  if(window.__v51042JournalFix)return;
  window.__v51042JournalFix=true;

  const BUILD='v5.10.42';
  const style=document.createElement('style');
  style.id='v51042-journal-fix';
  style.textContent=`
    /* Keep the close medallion anchored to the page, not in normal flow. */
    .v51034-close{
      position:absolute!important;
      left:auto!important;
      right:14px!important;
      top:12px!important;
      z-index:9!important;
      transform:none!important;
    }

    /* The same four stat slots mean different things in archive vs single-book mode. */
    .v51034-shell[data-journal-mode="all"] .v51034-stat-pill:nth-child(1):before{background-image:url('./journal-icon-pages-v51041.svg')!important}
    .v51034-shell[data-journal-mode="all"] .v51034-stat-pill:nth-child(2):before{background-image:url('./journal-icon-sessions-v51041.svg')!important}
    .v51034-shell[data-journal-mode="all"] .v51034-stat-pill:nth-child(3):before{background-image:url('./journal-icon-pages-v51041.svg')!important}
    .v51034-shell[data-journal-mode="all"] .v51034-stat-pill:nth-child(4):before{background-image:url('./journal-icon-time-v51041.svg')!important}

    .v51034-shell[data-journal-mode="book"] .v51034-stat-pill:nth-child(1):before{background-image:url('./journal-icon-sessions-v51041.svg')!important}
    .v51034-shell[data-journal-mode="book"] .v51034-stat-pill:nth-child(2):before{background-image:url('./journal-icon-pages-v51041.svg')!important}
    .v51034-shell[data-journal-mode="book"] .v51034-stat-pill:nth-child(3):before{background-image:url('./journal-icon-time-v51041.svg')!important}
    .v51034-shell[data-journal-mode="book"] .v51034-stat-pill:nth-child(4):before{background-image:url('./journal-icon-longest-v51041.svg')!important}
  `;

  function stamp(){
    window.__readingMmoVersionOwner=BUILD;
    const badge=document.getElementById('headerVersionText');
    if(badge)badge.textContent=BUILD;
    document.querySelectorAll('.health-row').forEach(row=>{
      if(row.querySelector('b')?.textContent.trim()==='Version'){
        const value=row.querySelector('span');
        if(value)value.textContent=BUILD;
      }
    });
  }

  function install(){
    const old=document.getElementById(style.id);
    if(old)old.remove();
    document.head.appendChild(style);
    stamp();
  }

  function syncMode(){
    const shell=document.querySelector('.v51034-shell');
    const select=document.getElementById('v51034BookFilter');
    if(shell&&select)shell.dataset.journalMode=select.value==='all'?'all':'book';
  }

  function resetJournalScroll(){
    const body=document.getElementById('v51034JournalBody');
    if(!body)return;
    body.scrollTop=0;
    body.scrollLeft=0;
    try{body.scrollTo({top:0,left:0,behavior:'auto'})}catch(_){body.scrollTop=0}
  }

  function queueReset(){
    [0,30,90,180,320].forEach(ms=>setTimeout(()=>{
      install();
      syncMode();
      resetJournalScroll();
    },ms));
  }

  // Document-bubble change fires after the Journal's own select handler has rebuilt its body.
  document.addEventListener('change',e=>{
    if(e.target?.id==='v51034BookFilter')queueReset();
  },false);

  document.addEventListener('click',e=>{
    if(e.target.closest?.('[data-journal-book],#v51034JournalLaunch,#v51034LibraryJournalLaunch'))queueReset();
  },false);

  const apply=()=>{install();syncMode();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
  window.addEventListener('pageshow',apply);
})();
