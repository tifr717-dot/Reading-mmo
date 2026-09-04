(()=>{
  'use strict';
  if(window.__v51043JournalMockupFinal)return;
  window.__v51043JournalMockupFinal=true;

  const BUILD='v5.10.43';
  const style=document.createElement('style');
  style.id='v51043-journal-mockup-final';
  style.textContent=`
    /* Final v5.10.43 coherence pass. Single-book art remains literal mockup artwork;
       All Books receives the same romantic botanical archivist language. */

    .v51034-shell.v51043-mockup[data-journal-mode="all"] #v51034JournalBody{
      padding-top:2px!important;
    }
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-overall-hero{
      position:relative!important;
      margin:0 1px 5px!important;
      padding:19px 34px 20px!important;
      overflow:hidden!important;
      border:1px solid rgba(128,91,44,.72)!important;
      border-radius:2px!important;
      background:
        linear-gradient(110deg,rgba(255,250,225,.9),rgba(232,207,160,.82)),
        repeating-linear-gradient(0deg,rgba(83,55,29,.035) 0 1px,transparent 1px 5px)!important;
      box-shadow:0 4px 10px rgba(68,42,22,.18),inset 0 0 22px rgba(112,78,37,.09)!important;
      clip-path:polygon(.8% 4%,8% 1%,18% 3%,29% 1%,40% 3%,51% 1%,64% 3%,76% 1%,88% 3%,99% 2%,98.7% 93%,91% 98%,78% 96%,65% 99%,52% 96%,38% 99%,25% 96%,12% 99%,1% 95%)!important;
      text-align:center!important;
    }
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-overall-hero:before,
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-overall-hero:after{
      content:''!important;position:absolute!important;top:4px!important;width:74px!important;height:74px!important;
      background:url('./journal-botanical-corner-v51041.svg') center/contain no-repeat!important;opacity:.44!important;pointer-events:none!important;
    }
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-overall-hero:before{left:5px!important}
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-overall-hero:after{right:5px!important;transform:scaleX(-1)!important}
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-overall-kicker{
      color:#74532f!important;font:700 clamp(7px,1.95vw,10px)/1 Georgia,'Times New Roman',serif!important;letter-spacing:1.1px!important;
    }
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-overall-title{
      margin:7px auto 5px!important;max-width:86%!important;color:#342217!important;font:500 clamp(18px,5vw,28px)/1.02 Georgia,'Times New Roman',serif!important;letter-spacing:-.45px!important;
    }
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-overall-sub{
      margin:0 auto!important;max-width:88%!important;color:#5a422e!important;font:400 clamp(8px,2.15vw,11px)/1.35 Georgia,'Times New Roman',serif!important;
    }

    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-ribbon{
      position:relative!important;display:grid!important;grid-template-columns:1fr 1fr!important;grid-template-rows:1fr 1fr!important;gap:0!important;
      margin:0 1px 5px!important;padding:7px 9px!important;border:1px solid rgba(122,87,43,.65)!important;border-radius:1px!important;
      background:linear-gradient(105deg,#f0ddb5,#e3c892 49%,#eed9af)!important;
      box-shadow:0 5px 12px rgba(66,39,20,.18),inset 0 0 18px rgba(111,74,32,.08)!important;
      clip-path:polygon(1% 3%,16% 1%,29% 3%,42% 1%,57% 3%,72% 1%,87% 3%,99% 1%,98.5% 96%,84% 98%,70% 96%,56% 99%,41% 96%,26% 99%,12% 96%,1% 98%)!important;
    }
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-stat-pill{
      position:relative!important;min-height:76px!important;margin:0!important;padding:12px 9px 10px 49px!important;border:0!important;border-right:1px solid rgba(103,72,36,.2)!important;border-bottom:1px solid rgba(103,72,36,.2)!important;background:transparent!important;box-shadow:none!important;text-align:left!important;
    }
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-stat-pill:nth-child(even){border-right:0!important}
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-stat-pill:nth-child(n+3){border-bottom:0!important}
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-stat-pill:before{
      content:''!important;display:block!important;position:absolute!important;left:10px!important;top:50%!important;transform:translateY(-50%)!important;width:31px!important;height:31px!important;border-radius:50%!important;background-color:rgba(113,84,129,.16)!important;background-position:center!important;background-size:22px 22px!important;background-repeat:no-repeat!important;opacity:.92!important;
    }
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-stat-pill:nth-child(1):before{background-image:url('./journal-icon-pages-v51041.svg')!important}
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-stat-pill:nth-child(2):before{background-image:url('./journal-icon-sessions-v51041.svg')!important;background-color:rgba(91,115,76,.16)!important}
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-stat-pill:nth-child(3):before{background-image:url('./journal-icon-pages-v51041.svg')!important;background-color:rgba(155,120,66,.14)!important}
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-stat-pill:nth-child(4):before{background-image:url('./journal-icon-time-v51041.svg')!important;background-color:rgba(78,105,128,.15)!important}
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-stat-pill span{display:block!important;color:#49321f!important;font:700 clamp(6.6px,1.8vw,9px)/1 Georgia,'Times New Roman',serif!important;letter-spacing:.35px!important;text-transform:uppercase!important}
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-stat-pill b{display:block!important;margin:4px 0 0!important;color:#332116!important;font:500 clamp(15px,4vw,22px)/1 Georgia,'Times New Roman',serif!important}
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-stat-pill i{display:block!important;margin:4px 0 0!important;color:#5c4430!important;font:400 clamp(6.3px,1.7vw,8.5px)/1.05 Georgia,'Times New Roman',serif!important;font-style:normal!important}

    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-feature-row{
      position:relative!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:0!important;margin:1px 1px 6px!important;padding:12px 13px 14px!important;
      border:1px solid rgba(124,87,42,.62)!important;border-radius:1px!important;background:linear-gradient(100deg,#efdcb6,#e4c991 55%,#efdcb4)!important;
      box-shadow:0 5px 12px rgba(66,39,20,.18),inset 0 0 20px rgba(108,73,33,.08)!important;
      clip-path:polygon(1% 4%,12% 1%,25% 3%,38% 1%,52% 3%,66% 1%,79% 3%,91% 1%,99% 4%,98% 95%,87% 98%,74% 96%,61% 99%,47% 96%,34% 99%,20% 96%,8% 99%,1% 95%)!important;
    }
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-feature-row:after{
      content:'✦'!important;position:absolute!important;right:6%!important;top:-2px!important;width:30px!important;height:48px!important;padding-top:12px!important;
      background:linear-gradient(#5a3d75,#3d2c57)!important;color:#d9b64e!important;text-align:center!important;font:700 13px/1 Georgia!important;
      clip-path:polygon(0 0,100% 0,100% 100%,50% 78%,0 100%)!important;box-shadow:0 3px 6px rgba(55,34,25,.25)!important;
    }
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-feature{
      min-width:0!important;min-height:88px!important;margin:0!important;padding:13px 12px!important;border:0!important;border-right:1px solid rgba(105,74,38,.2)!important;border-bottom:1px solid rgba(105,74,38,.2)!important;background:transparent!important;box-shadow:none!important;
    }
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-feature:nth-child(even){border-right:0!important}.v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-feature:nth-child(n+3){border-bottom:0!important}
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-feature span{color:#654725!important;font:700 clamp(6.6px,1.8vw,9px)/1 Georgia,'Times New Roman',serif!important;letter-spacing:.35px!important}
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-feature b{display:block!important;margin:7px 0 3px!important;color:#332116!important;font:500 clamp(12px,3.3vw,18px)/1.08 Georgia,'Times New Roman',serif!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-feature i{display:block!important;color:#5e4632!important;font:400 clamp(6.4px,1.7vw,8.5px)/1.2 Georgia,'Times New Roman',serif!important;font-style:normal!important}

    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-section-head{
      margin:5px auto 4px!important;padding:8px 28px 7px!important;width:max-content!important;max-width:86%!important;border:1px solid rgba(104,72,39,.4)!important;background:linear-gradient(100deg,#d7c6d8,#eee0c4 50%,#d2bfd3)!important;color:#3c2a1c!important;
      clip-path:polygon(7% 0,93% 0,100% 50%,93% 100%,7% 100%,0 50%)!important;box-shadow:0 3px 7px rgba(63,39,23,.16)!important;text-align:center!important;
    }
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-section-head b{display:block!important;color:#463057!important;font:italic 600 clamp(13px,3.6vw,20px)/1 Georgia,'Times New Roman',serif!important;text-transform:none!important;letter-spacing:0!important}
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-section-head small{display:block!important;margin-top:3px!important;color:#5c432d!important;font:700 clamp(6px,1.6vw,8px)/1 Georgia,'Times New Roman',serif!important;letter-spacing:.5px!important}
    .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-book-link{
      margin:7px 0 0!important;padding:5px 8px!important;border:1px solid rgba(121,86,43,.52)!important;border-radius:0!important;background:rgba(241,222,184,.74)!important;color:#51371f!important;box-shadow:none!important;font:700 clamp(6px,1.6vw,8px)/1 Georgia,'Times New Roman',serif!important;letter-spacing:.3px!important;
    }

    @media(max-width:360px){
      .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-overall-hero{padding-left:24px!important;padding-right:24px!important}
      .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-stat-pill{min-height:68px!important;padding-left:44px!important}
      .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-stat-pill:before{left:8px!important;width:28px!important;height:28px!important;background-size:19px 19px!important}
      .v51034-shell.v51043-mockup[data-journal-mode="all"] .v51034-feature{min-height:80px!important;padding:11px 9px!important}
    }
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

  function apply(){
    const old=document.getElementById(style.id);if(old&&old!==style)old.remove();
    document.head.appendChild(style);
    const shell=document.querySelector('.v51034-shell');
    const select=document.getElementById('v51034BookFilter');
    const label=shell?.querySelector('.v51034-toolbar-label');
    if(shell&&select){
      const all=select.value==='all';
      shell.dataset.journalMode=all?'all':'book';
      if(label)label.textContent=all?'ARCHIVE VIEW':'CURRENT BOOK';
      select.setAttribute('aria-label',all?'Journal view':'Current book');
    }
    stamp();
  }

  function registerWorker(){
    if(!('serviceWorker' in navigator))return;
    navigator.serviceWorker.register('./service-worker-v51043.js?v=51043',{updateViaCache:'none'}).catch(()=>{});
  }

  function queue(){[0,40,100,220,420].forEach(ms=>setTimeout(apply,ms));}
  document.addEventListener('change',e=>{if(e.target?.id==='v51034BookFilter')queue();},false);
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-journal-book],#v51034JournalLaunch,#v51034LibraryJournalLaunch'))queue();},false);
  window.addEventListener('pageshow',queue);
  window.addEventListener('load',()=>{apply();registerWorker();},{once:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});else queue();
})();
