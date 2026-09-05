(()=>{
  'use strict';
  if(window.__v51043JournalMockup)return;
  window.__v51043JournalMockup=true;

  const style=document.createElement('style');
  style.id='v51043-journal-mockup';
  style.textContent=`
    /* v5.10.43-dev — approved mockup translated directly into the real Journal.
       Branch-only while visual matching is in progress. */

    .v51034-backdrop{
      background:rgba(8,7,5,.96)!important;
      padding:5px 4px calc(78px + env(safe-area-inset-bottom))!important;
    }

    .v51034-shell.v51043-mockup{
      width:100%!important;
      max-width:590px!important;
      height:100%!important;
      max-height:100%!important;
      min-height:0!important;
      padding:0 6px 10px!important;
      overflow:hidden!important;
      display:flex!important;
      flex-direction:column!important;
      background:
        radial-gradient(circle at 50% 7%,rgba(255,247,218,.34),transparent 24%),
        repeating-linear-gradient(0deg,rgba(92,64,36,.018) 0 1px,transparent 1px 5px),
        linear-gradient(180deg,#f0dfb9 0%,#e7cf9c 54%,#dcbf83 100%)!important;
      border:3px solid #17170f!important;
      outline:2px solid #a67d38!important;
      outline-offset:-7px!important;
      box-shadow:0 18px 46px rgba(0,0,0,.68),
        inset 0 0 0 1px rgba(246,216,151,.42),
        inset 0 0 55px rgba(83,51,24,.13)!important;
    }

    .v51034-shell.v51043-mockup:before,
    .v51034-shell.v51043-mockup:after{
      content:none!important;
      display:none!important;
      background:none!important;
    }

    /* Literal upper-title crop from the approved mockup. */
    .v51043-top-art{
      order:-5;
      position:relative;
      z-index:2;
      flex:0 0 auto;
      display:block;
      width:calc(100% + 12px);
      height:auto;
      aspect-ratio:920/390;
      margin:0 -6px;
      object-fit:fill;
      pointer-events:none;
      user-select:none;
    }

    /* Overlay the real Journal title copy on the illustrated header art. */
    .v51034-shell.v51043-mockup .v51034-head{
      position:absolute!important;
      z-index:8!important;
      top:8.5%!important;
      left:18%!important;
      width:64%!important;
      height:auto!important;
      margin:0!important;
      padding:0!important;
      border:0!important;
      overflow:visible!important;
      clip:auto!important;
      clip-path:none!important;
      white-space:normal!important;
      text-align:center!important;
      pointer-events:none!important;
    }
    .v51034-shell.v51043-mockup .v51034-kicker{
      display:block!important;
      color:#4d3422!important;
      font:italic 700 clamp(8px,2.2vw,12px)/1.05 Georgia,'Times New Roman',serif!important;
      letter-spacing:.1px!important;
      text-transform:none!important;
    }
    .v51034-shell.v51043-mockup .v51034-title{
      display:block!important;
      margin:5px 0 0!important;
      color:#352217!important;
      font:500 clamp(28px,8vw,46px)/.94 Georgia,'Times New Roman',serif!important;
      letter-spacing:-1.4px!important;
      text-shadow:0 1px rgba(255,245,215,.55)!important;
    }
    .v51034-shell.v51043-mockup .v51034-sub{
      display:block!important;
      margin:12px auto 0!important;
      max-width:78%!important;
      color:#5d432d!important;
      font:400 clamp(8px,2.1vw,12px)/1.35 Georgia,'Times New Roman',serif!important;
      letter-spacing:.35px!important;
    }
    .v51034-shell.v51043-mockup .v51034-rule{
      position:absolute!important;
      z-index:8!important;
      top:24.2%!important;
      left:35%!important;
      width:30%!important;
      height:16px!important;
      margin:0!important;
      padding:0!important;
      border:0!important;
      overflow:visible!important;
      clip:auto!important;
      clip-path:none!important;
      pointer-events:none!important;
    }
    .v51034-shell.v51043-mockup .v51034-rule:before{
      content:''!important;position:absolute!important;left:0!important;right:0!important;top:7px!important;border-top:1px solid #9c7841!important;
    }
    .v51034-shell.v51043-mockup .v51034-rule:after{
      content:'✦'!important;position:absolute!important;left:50%!important;top:0!important;transform:translateX(-50%)!important;
      padding:0 7px!important;background:#efddb7!important;color:#8c6238!important;font:700 9px/1 Georgia,serif!important;
    }

    /* The purple star medallion in the artwork is the actual close hit target. */
    .v51034-shell.v51043-mockup .v51034-close{
      position:absolute!important;
      z-index:30!important;
      top:3.5%!important;
      right:4.6%!important;
      left:auto!important;
      width:clamp(46px,12vw,62px)!important;
      min-width:46px!important;
      height:clamp(46px,12vw,62px)!important;
      min-height:46px!important;
      margin:0!important;
      padding:0!important;
      border:0!important;
      outline:0!important;
      border-radius:50%!important;
      background:transparent!important;
      box-shadow:none!important;
      color:transparent!important;
      text-shadow:none!important;
      transform:none!important;
      opacity:1!important;
      -webkit-tap-highlight-color:transparent!important;
    }
    .v51034-shell.v51043-mockup .v51034-close:focus-visible{
      outline:2px solid rgba(232,201,113,.95)!important;
      outline-offset:-4px!important;
    }

    /* Exact selector-and-side-illustration strip from the approved mockup.
       The baked-in title was removed so the real select can stay dynamic. */
    .v51034-shell.v51043-mockup .v51034-toolbar{
      order:-4;
      position:relative!important;
      z-index:4!important;
      display:block!important;
      flex:0 0 auto!important;
      width:86%!important;
      aspect-ratio:720/190!important;
      min-height:0!important;
      height:auto!important;
      margin:-3.2% auto 1px!important;
      padding:0!important;
      border:0!important;
      outline:0!important;
      border-radius:0!important;
      background:transparent!important;
      box-shadow:none!important;
      overflow:visible!important;
    }
    .v51034-shell.v51043-mockup .v51043-selector-art{
      position:absolute!important;
      inset:0!important;
      z-index:1!important;
      display:block!important;
      width:100%!important;
      height:100%!important;
      object-fit:fill!important;
      pointer-events:none!important;
      user-select:none!important;
    }

    .v51034-shell.v51043-mockup .v51034-toolbar-label{
      display:block!important;
      position:absolute!important;
      z-index:6!important;
      left:29%!important;
      top:30%!important;
      width:46%!important;
      margin:0!important;
      padding:0!important;
      color:#3c2a1b!important;
      background:transparent!important;
      border:0!important;
      font:700 clamp(7px,2.1vw,12px)/1 Georgia,'Times New Roman',serif!important;
      letter-spacing:.3px!important;
      text-transform:uppercase!important;
      text-align:left!important;
      white-space:nowrap!important;
      pointer-events:none!important;
    }

    .v51034-shell.v51043-mockup .v51034-book-select{
      -webkit-appearance:none!important;
      appearance:none!important;
      position:absolute!important;
      z-index:7!important;
      left:29%!important;
      top:39%!important;
      width:58%!important;
      max-width:none!important;
      height:40%!important;
      min-height:0!important;
      margin:0!important;
      padding:0!important;
      border:0!important;
      outline:0!important;
      border-radius:0!important;
      background:transparent!important;
      box-shadow:none!important;
      color:#352317!important;
      font:500 clamp(15.5px,4.1vw,24px)/1 Georgia,'Times New Roman',serif!important;
      letter-spacing:-.4px!important;
      text-align:left!important;
      text-overflow:ellipsis!important;
      white-space:nowrap!important;
      overflow:hidden!important;
      cursor:pointer!important;
    }
    .v51034-shell.v51043-mockup .v51034-book-select:focus{
      outline:1px dashed rgba(115,80,42,.38)!important;
      outline-offset:2px!important;
    }

    .v51034-shell.v51043-mockup .v51034-toolbar:after{
      content:'';
      position:absolute;
      z-index:6;
      left:91%;
      top:49%;
      width:11px;
      height:11px;
      border-right:2px solid #352317;
      border-bottom:2px solid #352317;
      transform:translate(-50%,-50%) rotate(45deg);
      pointer-events:none;
    }

    .v51034-shell.v51043-mockup .v51034-book-hero{
      display:none!important;
    }

    /* Preserve the proven Android/PWA internal scroll behavior. */
    .v51034-shell.v51043-mockup #v51034JournalBody{
      flex:1 1 auto!important;
      min-height:0!important;
      overflow-y:auto!important;
      overflow-x:hidden!important;
      -webkit-overflow-scrolling:touch!important;
      overscroll-behavior:contain!important;
      touch-action:pan-y!important;
      padding:3px 7px 34px!important;
      scrollbar-width:thin;
      position:relative!important;
      z-index:3!important;
    }

    @media(max-width:360px){
      .v51034-shell.v51043-mockup .v51034-toolbar-label{font-size:7px!important}
      .v51034-shell.v51043-mockup .v51034-book-select{
        font-size:15px!important;
        left:38.5%!important;
        width:33.5%!important;
      }
      .v51034-shell.v51043-mockup .v51034-toolbar:after{
        width:9px;height:9px;
      }
    }
  `;

  function putStyleLast(){
    const old=document.getElementById(style.id);
    if(old&&old!==style)old.remove();
    document.head.appendChild(style);
  }

  function enhance(){
    putStyleLast();
    const shell=document.querySelector('.v51034-shell');
    if(!shell)return;

    shell.classList.add('v51043-mockup');
    shell.dataset.mockupPhase='top-exact-v1';

    if(!shell.querySelector('.v51043-top-art')){
      const art=document.createElement('img');
      art.className='v51043-top-art';
      art.src='./journal-mockup-header-v1.svg?v=51043b';
      art.alt='';
      art.setAttribute('aria-hidden','true');
      shell.insertBefore(art,shell.firstChild);
    }

    const toolbar=shell.querySelector('.v51034-toolbar');
    if(toolbar&&!toolbar.querySelector('.v51043-selector-art')){
      const plate=document.createElement('img');
      plate.className='v51043-selector-art';
      plate.src='./journal-mockup-bookplate-v1.svg?v=51043b';
      plate.alt='';
      plate.setAttribute('aria-hidden','true');
      toolbar.insertBefore(plate,toolbar.firstChild);
    }

    const label=shell.querySelector('.v51034-toolbar-label');
    if(label)label.textContent='CURRENT BOOK';

    const select=shell.querySelector('#v51034BookFilter');
    if(select){
      select.setAttribute('aria-label','Current book');
      select.dataset.mockupInteractive='true';
    }

    document.documentElement.dataset.readingJournalMockup='51043-top-exact-v1';
  }

  function queueEnhance(){
    [0,30,90,180,340].forEach(ms=>setTimeout(enhance,ms));
  }

  function boot(){
    enhance();
    queueEnhance();

    const observer=new MutationObserver(mutations=>{
      if(mutations.some(m=>[...m.addedNodes].some(n=>
        n?.nodeType===1&&(n.id==='v51034JournalBackdrop'||n.querySelector?.('#v51034JournalBackdrop'))
      )))queueEnhance();
    });
    if(document.body)observer.observe(document.body,{childList:true,subtree:true});
  }

  document.addEventListener('click',e=>{
    if(e.target.closest?.('#v51034JournalLaunch,#v51034LibraryJournalLaunch,[data-journal-book]'))queueEnhance();
  },true);

  document.addEventListener('change',e=>{
    if(e.target?.id==='v51034BookFilter')queueEnhance();
  },false);

  window.addEventListener('pageshow',queueEnhance);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
