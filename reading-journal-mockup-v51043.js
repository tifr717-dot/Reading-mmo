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
      width:calc(100% + 12px);
      aspect-ratio:941/365;
      margin:0 -6px;
      background:url('./journal-mockup-top-exact-v1.webp') center top/100% 100% no-repeat;
      pointer-events:none;
      user-select:none;
    }

    /* Keep semantic heading text but don't draw a duplicate over the approved art. */
    .v51034-shell.v51043-mockup .v51034-head,
    .v51034-shell.v51043-mockup .v51034-rule{
      position:absolute!important;
      width:1px!important;
      height:1px!important;
      margin:-1px!important;
      padding:0!important;
      border:0!important;
      overflow:hidden!important;
      clip:rect(0 0 0 0)!important;
      clip-path:inset(50%)!important;
      white-space:nowrap!important;
    }

    /* The purple star medallion in the artwork is the actual close hit target. */
    .v51034-shell.v51043-mockup .v51034-close{
      position:absolute!important;
      z-index:30!important;
      top:15px!important;
      right:4.2%!important;
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
      width:calc(100% + 12px)!important;
      aspect-ratio:941/185!important;
      min-height:0!important;
      height:auto!important;
      margin:-1.55% -6px 0!important;
      padding:0!important;
      border:0!important;
      outline:0!important;
      border-radius:0!important;
      background:url('./journal-mockup-selector-strip-blank-v1.webp') center/100% 100% no-repeat!important;
      box-shadow:none!important;
      overflow:visible!important;
    }

    .v51034-shell.v51043-mockup .v51034-toolbar-label{
      display:block!important;
      position:absolute!important;
      z-index:6!important;
      left:38.8%!important;
      top:25.5%!important;
      width:34%!important;
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
      left:38.8%!important;
      top:38%!important;
      width:34.8%!important;
      max-width:none!important;
      height:40%!important;
      min-height:0!important;
      margin:0!important;
      padding:0 22px 0 0!important;
      border:0!important;
      outline:0!important;
      border-radius:0!important;
      background:transparent!important;
      box-shadow:none!important;
      color:#352317!important;
      font:500 clamp(17px,4.8vw,29px)/1 Georgia,'Times New Roman',serif!important;
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
      left:72.1%;
      top:47%;
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
        font-size:16px!important;
        left:38.5%!important;
        width:35.5%!important;
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
      const art=document.createElement('div');
      art.className='v51043-top-art';
      art.setAttribute('aria-hidden','true');
      shell.insertBefore(art,shell.firstChild);
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
