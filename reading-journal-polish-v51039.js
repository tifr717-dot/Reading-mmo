(()=>{
  'use strict';
  if(window.__v51039JournalPolish)return;
  window.__v51039JournalPolish=true;

  const style=document.createElement('style');
  style.id='v51039-journal-polish';
  style.textContent=`
    /* v5.10.39 — readable middle-ground sizing + reliable Android/PWA scrolling */
    .v51034-backdrop{
      height:100dvh!important;
      max-height:100dvh!important;
      min-height:0!important;
      overflow:hidden!important;
      overscroll-behavior:none!important;
      padding:7px 6px calc(78px + env(safe-area-inset-bottom))!important;
    }
    .v51034-shell{
      width:100%!important;
      height:100%!important;
      max-height:100%!important;
      min-height:0!important;
      display:flex!important;
      flex-direction:column!important;
      overflow:hidden!important;
      padding:14px 11px 10px!important;
    }
    .v51034-head,.v51034-rule,.v51034-toolbar{
      flex:0 0 auto!important;
    }
    #v51034JournalBody{
      flex:1 1 auto!important;
      min-height:0!important;
      overflow-y:auto!important;
      overflow-x:hidden!important;
      -webkit-overflow-scrolling:touch!important;
      overscroll-behavior:contain!important;
      touch-action:pan-y!important;
      padding:0 1px 30px!important;
      scrollbar-width:thin;
    }

    /* Keep the readability gain, but reclaim some vertical space. */
    .v51034-head{padding:3px 45px 10px!important}
    .v51034-kicker{font-size:7.5px!important;letter-spacing:1px!important}
    .v51034-title{margin-top:5px!important;font-size:25px!important;line-height:1.02!important}
    .v51034-sub{margin-top:6px!important;font-size:9px!important;line-height:1.35!important}
    .v51034-rule{height:11px!important;margin:1px 0 9px!important}
    .v51034-rule:before{top:5px!important}
    .v51034-rule:after{font-size:10px!important;padding:0 8px!important}

    .v51034-toolbar{
      gap:6px!important;
      margin-bottom:10px!important;
      padding:8px 9px!important;
    }
    .v51034-toolbar-label{font-size:7px!important}
    .v51034-book-select{
      height:40px!important;
      padding:6px 32px 6px 11px!important;
      font-size:11px!important;
    }

    .v51034-overall-hero{
      margin:5px 0 10px!important;
      padding:11px 12px!important;
    }
    .v51034-overall-kicker{font-size:7px!important}
    .v51034-overall-title{
      margin-top:5px!important;
      font-size:18.5px!important;
      line-height:1.12!important;
    }
    .v51034-overall-sub{
      margin-top:6px!important;
      font-size:8.5px!important;
      line-height:1.42!important;
    }

    .v51034-ribbon{
      gap:7px!important;
      padding-bottom:8px!important;
    }
    .v51034-stat-pill{padding:9px 9px 8px!important}
    .v51034-stat-pill span{font-size:6.8px!important}
    .v51034-stat-pill b{margin-top:5px!important;font-size:15.5px!important}
    .v51034-stat-pill i{margin-top:4px!important;font-size:7.3px!important;line-height:1.2!important}

    .v51034-feature-row{gap:7px!important;margin-bottom:12px!important}
    .v51034-feature{padding:9px!important}
    .v51034-feature span{font-size:6.5px!important}
    .v51034-feature b{margin-top:5px!important;font-size:12.5px!important;line-height:1.14!important}
    .v51034-feature i{margin-top:4px!important;font-size:7px!important;line-height:1.28!important}

    .v51034-section-head{margin:11px 0 7px!important}
    .v51034-section-head b{font-size:12px!important}
    .v51034-section-head small{font-size:7px!important}
    .v51034-day{margin-top:10px!important}
    .v51034-day-head b{font-size:7.5px!important}

    .v51034-entry{
      grid-template-columns:54px minmax(0,1fr)!important;
      gap:7px!important;
      padding:7px 2px 9px 13px!important;
    }
    .v51034-time{font-size:7.5px!important}
    .v51034-entry-main{padding:10px!important}
    .v51034-entry-book{font-size:14.5px!important;line-height:1.12!important}
    .v51034-source{font-size:6.4px!important;padding:3px 5px!important}
    .v51034-entry-numbers{margin-top:7px!important;gap:7px!important}
    .v51034-range{font-size:13px!important}
    .v51034-gain,.v51034-duration{font-size:7.5px!important}
    .v51034-book-link{margin-top:8px!important;font-size:7.5px!important}

    .v51034-ledger-note{gap:7px!important;margin-bottom:11px!important}
    .v51034-ledger-note>div{padding:9px!important}
    .v51034-ledger-note span{font-size:6.7px!important}
    .v51034-ledger-note b{margin-top:5px!important;font-size:12px!important}
  `;

  function install(){
    if(!document.getElementById(style.id))document.head.appendChild(style);
    else document.head.appendChild(document.getElementById(style.id));
    document.documentElement.dataset.readingJournalPolish='51039';
    window.__readingMmoVersionOwner='v5.10.39';
    const badge=document.getElementById('headerVersionText');
    if(badge)badge.textContent='v5.10.39';
    document.querySelectorAll('.health-row').forEach(row=>{
      if(row.querySelector('b')?.textContent.trim()==='Version'){
        const value=row.querySelector('span');if(value)value.textContent='v5.10.39';
      }
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  window.addEventListener('pageshow',install);
  document.addEventListener('click',e=>{
    if(e.target.closest?.('#v51034JournalLaunch,#v51034LibraryJournalLaunch')){
      setTimeout(install,0);
      setTimeout(install,100);
    }
  },true);
})();
