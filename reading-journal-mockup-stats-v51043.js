(()=>{
  'use strict';
  if(window.__v51043JournalMockupStats)return;
  window.__v51043JournalMockupStats=true;

  const style=document.createElement('style');
  style.id='v51043-journal-mockup-stats';
  style.textContent=`
    /* Phase 2 — exact approved mockup parchment art with real Journal values. */
    .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-ribbon{
      position:relative!important;
      display:grid!important;
      grid-template-columns:1fr 1fr!important;
      grid-template-rows:1fr 1fr!important;
      gap:0!important;
      width:100%!important;
      aspect-ratio:802/304!important;
      min-height:0!important;
      margin:0 0 5px!important;
      padding:0!important;
      overflow:hidden!important;
      border:0!important;
      outline:0!important;
      background:url('./journal-mockup-stats-blank-v1.webp') center/100% 100% no-repeat!important;
      box-shadow:none!important;
    }

    .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-stat-pill{
      position:relative!important;
      display:flex!important;
      flex-direction:column!important;
      justify-content:center!important;
      align-items:flex-start!important;
      min-width:0!important;
      min-height:0!important;
      margin:0!important;
      border:0!important;
      border-right:0!important;
      background:transparent!important;
      box-shadow:none!important;
      text-align:left!important;
    }
    .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-stat-pill:nth-child(odd){
      padding:2.5% 2% 2% 46%!important;
    }
    .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-stat-pill:nth-child(even){
      padding:2.5% 3% 2% 35%!important;
    }
    .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-stat-pill:before{
      content:none!important;
      display:none!important;
      background:none!important;
    }
    .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-stat-pill span{
      display:block!important;
      margin:0!important;
      color:#352317!important;
      font:700 clamp(7px,2vw,10px)/1.05 Georgia,'Times New Roman',serif!important;
      font-style:normal!important;
      letter-spacing:.25px!important;
      text-transform:uppercase!important;
      white-space:nowrap!important;
    }
    .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-stat-pill b{
      display:block!important;
      margin:3px 0 0!important;
      color:#352317!important;
      font:500 clamp(15px,4.5vw,25px)/.95 Georgia,'Times New Roman',serif!important;
      letter-spacing:-.35px!important;
      white-space:nowrap!important;
    }
    .v51034-shell.v51043-mockup[data-journal-mode="book"] .v51034-stat-pill i{
      display:block!important;
      margin:4px 0 0!important;
      color:#4c3726!important;
      font:400 clamp(6.5px,1.85vw,9.5px)/1.05 Georgia,'Times New Roman',serif!important;
      font-style:normal!important;
      white-space:nowrap!important;
    }
  `;

  const install=()=>{
    const old=document.getElementById(style.id);
    if(old&&old!==style)old.remove();
    document.head.appendChild(style);
    document.documentElement.dataset.readingJournalMockupStats='51043-exact-v1';
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  window.addEventListener('pageshow',install);
})();
