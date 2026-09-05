(()=>{
  'use strict';
  if(window.__v51040JournalVisual)return;
  window.__v51040JournalVisual=true;

  const style=document.createElement('style');
  style.id='v51040-journal-visual';
  style.textContent=`
    /* v5.10.40 — compact Archivist ledger polish. Keep 5.10.39 scrolling/readability. */

    /* Reclaim vertical space in the fixed header without returning to tiny type. */
    .v51034-shell{padding-top:11px!important}
    .v51034-head{padding:1px 45px 7px!important}
    .v51034-kicker{font-size:6.8px!important;letter-spacing:1.05px!important;line-height:1.1!important}
    .v51034-title{margin-top:4px!important;font-size:23px!important;line-height:1!important}
    .v51034-sub{margin-top:5px!important;font-size:8.2px!important;line-height:1.32!important}
    .v51034-rule{height:8px!important;margin:0 0 6px!important}
    .v51034-rule:before{top:4px!important}
    .v51034-rule:after{top:-1px!important;font-size:9px!important;padding:0 7px!important}

    .v51034-toolbar{
      gap:5px!important;
      margin:0 0 8px!important;
      padding:7px 8px!important;
      box-shadow:0 9px 12px -13px rgba(67,41,27,.95)!important;
    }
    .v51034-toolbar-label{font-size:6.6px!important;letter-spacing:.55px!important}
    .v51034-book-select{
      height:38px!important;
      padding:5px 31px 5px 10px!important;
      font-size:10.5px!important;
    }

    /* The selected-book hero duplicates the selector and was rendering as a clipped strip. */
    .v51034-book-hero{display:none!important}

    /* All-books introduction: still distinct, but less dashboard-like and less tall. */
    .v51034-overall-hero{
      margin:3px 0 8px!important;
      padding:9px 11px 10px!important;
      border-left-width:3px!important;
      box-shadow:none!important;
    }
    .v51034-overall-kicker{font-size:6.5px!important}
    .v51034-overall-title{margin-top:4px!important;font-size:16.5px!important;line-height:1.12!important}
    .v51034-overall-sub{margin-top:5px!important;font-size:7.8px!important;line-height:1.38!important}

    /* Main totals stay readable but become shallower. */
    .v51034-ribbon{gap:6px!important;padding-bottom:7px!important}
    .v51034-stat-pill{
      padding:8px 9px 7px!important;
      box-shadow:none!important;
    }
    .v51034-stat-pill span{font-size:6.4px!important}
    .v51034-stat-pill b{margin-top:4px!important;font-size:14.5px!important;line-height:1!important}
    .v51034-stat-pill i{margin-top:3px!important;font-size:6.9px!important;line-height:1.18!important}

    /* Turn the supporting summaries into ruled ledger cells instead of floating boxes. */
    .v51034-feature-row,
    .v51034-ledger-note{
      gap:0!important;
      margin-bottom:10px!important;
      border-top:1px solid rgba(112,73,40,.42)!important;
      border-bottom:1px solid rgba(112,73,40,.42)!important;
      background:rgba(255,244,210,.11)!important;
    }
    .v51034-feature,
    .v51034-ledger-note>div{
      padding:8px 9px!important;
      border:0!important;
      border-radius:0!important;
      background:transparent!important;
      box-shadow:none!important;
    }
    .v51034-feature:nth-child(odd),
    .v51034-ledger-note>div:nth-child(odd){border-right:1px dashed rgba(112,73,40,.32)!important}
    .v51034-feature:nth-child(-n+2),
    .v51034-ledger-note>div:nth-child(-n+2){border-bottom:1px dashed rgba(112,73,40,.30)!important}
    .v51034-feature span,.v51034-ledger-note span{font-size:6.3px!important;letter-spacing:.35px!important}
    .v51034-feature b{margin-top:4px!important;font-size:12px!important;line-height:1.12!important}
    .v51034-feature i{margin-top:3px!important;font-size:6.7px!important;line-height:1.24!important}
    .v51034-ledger-note b{margin-top:4px!important;font-size:11.5px!important;line-height:1.15!important}

    /* Section headings should read like chapter rules, not UI headers. */
    .v51034-section-head{margin:10px 0 6px!important;gap:8px!important}
    .v51034-section-head:before,.v51034-section-head:after{opacity:.58!important}
    .v51034-section-head b{font-size:11.5px!important;letter-spacing:.2px!important}
    .v51034-section-head small{font-size:6.6px!important}
    .v51034-day{margin-top:9px!important}
    .v51034-day-head{margin-bottom:5px!important}
    .v51034-day-head b{font-size:7.1px!important}

    /* Keep session cards strong and readable, but soften the nested-box feeling. */
    .v51034-entry{padding-top:6px!important;padding-bottom:8px!important}
    .v51034-entry-main{
      padding:9px 10px!important;
      border:0!important;
      border-left:2px solid rgba(126,85,46,.58)!important;
      border-top:1px solid rgba(126,85,46,.30)!important;
      border-bottom:1px solid rgba(126,85,46,.30)!important;
      border-radius:0!important;
      box-shadow:none!important;
      background:linear-gradient(90deg,rgba(255,244,214,.46),rgba(255,244,214,.22))!important;
    }
    .v51034-entry-book{font-size:14px!important;line-height:1.1!important}
    .v51034-range{font-size:12.5px!important}
    .v51034-gain,.v51034-duration{font-size:7.3px!important}
    .v51034-source{font-size:6.2px!important}
    .v51034-book-link{margin-top:7px!important;font-size:7.2px!important}

    /* A little air at the bottom so the final entry never feels trapped by the nav. */
    #v51034JournalBody{padding-bottom:38px!important}
  `;

  function install(){
    const old=document.getElementById(style.id);
    if(old)old.remove();
    document.head.appendChild(style);
    document.documentElement.dataset.readingJournalVisual='51040';
    window.__readingMmoVersionOwner='v5.10.43';
    const badge=document.getElementById('headerVersionText');
    if(badge)badge.textContent='v5.10.43';
    document.querySelectorAll('.health-row').forEach(row=>{
      if(row.querySelector('b')?.textContent.trim()==='Version'){
        const value=row.querySelector('span');if(value)value.textContent='v5.10.43';
      }
    });
  }

  const apply=()=>{
    install();
    [0,60,180].forEach(ms=>setTimeout(install,ms));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
  window.addEventListener('pageshow',apply);
  document.addEventListener('click',e=>{
    if(e.target.closest?.('#v51034JournalLaunch,#v51034LibraryJournalLaunch')){
      setTimeout(install,0);setTimeout(install,100);
    }
  },true);
})();
