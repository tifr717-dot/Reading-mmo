(()=>{
  'use strict';
  if(window.__v51043JournalMockupLowerClean)return;
  window.__v51043JournalMockupLowerClean=true;

  const PARTS=Array.from({length:7},(_,i)=>`./journal-mockup-lower-pack-tiny-${String(i+1).padStart(2,'0')}.b64?v=51043i`);
  let assets=null,loading=null;
  const data=k=>assets?.[k]?`data:image/webp;base64,${assets[k]}`:'';

  async function loadAssets(){
    if(assets)return assets;
    if(loading)return loading;
    loading=Promise.all(PARTS.map(p=>fetch(p,{cache:'no-store'}).then(r=>{
      if(!r.ok)throw new Error(`Journal art ${r.status}`);
      return r.text();
    }))).then(parts=>JSON.parse(parts.map(p=>atob(p.trim())).join('')))
      .then(pack=>{assets=pack;installStyle();decorate();return pack;})
      .catch(err=>{console.warn('[Journal lower clean]',err);loading=null;return null;});
    return loading;
  }

  function installStyle(){
    if(!assets)return;
    document.getElementById('v51043-journal-mockup-lower')?.remove();
    document.getElementById('v51043-journal-mockup-lower-clean')?.remove();
    const s=document.createElement('style');
    s.id='v51043-journal-mockup-lower-clean';
    s.textContent=`
      .v51034-shell.v51043-mockup{
        min-height:0!important;
        height:auto!important;
      }
      .v51034-shell.v51043-mockup #v51034JournalBody{
        min-height:0!important;
        height:auto!important;
        overflow:visible!important;
        padding-bottom:0!important;
      }

      /* SECOND LEDGER — one full-width illustrated sheet */
      .v51034-shell.v51043-mockup:is([data-journal-mode="book"],[data-journal-mode="all"]) .v51034-ledger-note{
        position:relative!important;
        display:grid!important;
        grid-template-columns:1fr 1fr!important;
        grid-template-rows:1fr 1fr!important;
        gap:0!important;
        width:calc(100% + 28px)!important;
        aspect-ratio:805/250!important;
        min-height:0!important;
        margin:4px -14px 10px!important;
        padding:0!important;
        border:0!important;
        background:url('${data('ledger')}') center/100% 100% no-repeat!important;
        box-shadow:none!important;
        overflow:hidden!important;
      }
      .v51034-shell.v51043-mockup .v51034-ledger-note:after{content:none!important}
      .v51034-shell.v51043-mockup .v51034-ledger-note>div{
        position:relative!important;
        min-width:0!important;
        min-height:0!important;
        margin:0!important;
        padding:0!important;
        border:0!important;
        background:transparent!important;
      }
      .v51034-shell.v51043-mockup .v51034-ledger-note span{
        position:absolute!important;width:1px!important;height:1px!important;margin:-1px!important;
        overflow:hidden!important;clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important;
      }
      .v51034-shell.v51043-mockup .v51034-ledger-note b{
        position:absolute!important;
        left:18%!important;
        right:8%!important;
        top:41%!important;
        margin:0!important;
        color:#352317!important;
        background:transparent!important;
        font:500 clamp(13px,3.55vw,21px)/1.02 Georgia,'Times New Roman',serif!important;
        letter-spacing:-.3px!important;
        white-space:normal!important;
        overflow:hidden!important;
        display:-webkit-box!important;
        -webkit-box-orient:vertical!important;
        -webkit-line-clamp:2!important;
        text-shadow:0 1px rgba(255,245,217,.5)!important;
      }
      .v51034-shell.v51043-mockup .v51034-ledger-note>div:nth-child(2) b,
      .v51034-shell.v51043-mockup .v51034-ledger-note>div:nth-child(4) b{left:10%!important;right:15%!important}

      /* READING TIMELINE — use the approved ribbon art; do not draw duplicate title text */
      .v51034-shell.v51043-mockup:is([data-journal-mode="book"],[data-journal-mode="all"]) .v51034-section-head{
        position:relative!important;
        display:block!important;
        width:min(72%,430px)!important;
        aspect-ratio:465/87!important;
        height:auto!important;
        min-height:0!important;
        margin:7px auto 4px!important;
        padding:0!important;
        border:0!important;
        background:url('${data('ribbon')}') center/100% 100% no-repeat!important;
        box-shadow:none!important;
        overflow:visible!important;
      }
      .v51034-shell.v51043-mockup .v51034-section-head:before,
      .v51034-shell.v51043-mockup .v51034-section-head:after{content:none!important}
      .v51034-shell.v51043-mockup .v51034-section-head b{
        position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;
        clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important;
      }
      .v51034-shell.v51043-mockup .v51034-section-head small{
        position:absolute!important;
        left:50%!important;
        bottom:5%!important;
        transform:translateX(-50%)!important;
        margin:0!important;
        padding:0!important;
        color:#4f3824!important;
        background:transparent!important;
        font:700 clamp(6px,1.55vw,8px)/1 Georgia,'Times New Roman',serif!important;
        letter-spacing:.45px!important;
        text-transform:uppercase!important;
        white-space:nowrap!important;
      }

      /* TIMELINE SPINE */
      .v51034-shell.v51043-mockup .v51034-day{
        position:relative!important;
        margin:0 0 5px!important;
        padding:0!important;
        border:0!important;
        background:transparent!important;
      }
      .v51034-shell.v51043-mockup .v51034-day:before{
        content:''!important;
        position:absolute!important;
        left:42px!important;
        top:19px!important;
        bottom:5px!important;
        width:1px!important;
        background:linear-gradient(#8f6a31,#c3a36d 76%,transparent)!important;
        opacity:.9!important;
      }
      .v51034-shell.v51043-mockup .v51034-day-head{
        position:relative!important;
        height:29px!important;
        margin:0!important;
        padding:6px 0 0 61px!important;
        border:0!important;
        background:transparent!important;
        z-index:3!important;
      }
      .v51034-shell.v51043-mockup .v51034-day-head:before{
        content:'✦'!important;
        position:absolute!important;
        left:33px!important;top:3px!important;
        width:18px!important;height:18px!important;
        display:grid!important;place-items:center!important;
        border:2px solid #8b642c!important;border-radius:50%!important;
        background:#ead09c!important;color:#765320!important;
        font:700 7px/1 Georgia!important;
        box-shadow:0 0 0 2px rgba(89,58,27,.2)!important;
      }
      .v51034-shell.v51043-mockup .v51034-day-head b{
        color:#4b301f!important;
        font:700 clamp(7px,1.85vw,9.5px)/1 Georgia,'Times New Roman',serif!important;
      }

      /* SESSION ROW */
      .v51034-shell.v51043-mockup .v51034-entry{
        position:relative!important;
        display:grid!important;
        grid-template-columns:68px minmax(0,1fr)!important;
        gap:0!important;
        align-items:start!important;
        margin:0 0 6px!important;
        padding:0!important;
        border:0!important;
        background:transparent!important;
        overflow:visible!important;
      }
      .v51034-shell.v51043-mockup .v51034-entry:before{content:none!important}
      .v51034-shell.v51043-mockup .v51034-time{
        padding:18px 7px 0 0!important;
        color:#432b1b!important;
        font:700 clamp(7.5px,1.95vw,10px)/1 Georgia,'Times New Roman',serif!important;
        text-align:center!important;
        white-space:nowrap!important;
      }

      .v51034-shell.v51043-mockup .v51034-entry-main{
        position:relative!important;
        width:100%!important;
        height:112px!important;
        min-height:112px!important;
        margin:0!important;
        padding:0!important;
        border:0!important;
        border-radius:0!important;
        background:url('${data('lav')}') center/100% 100% no-repeat!important;
        box-shadow:none!important;
        overflow:hidden!important;
      }
      .v51034-shell.v51043-mockup .v51034-entry:nth-of-type(even) .v51034-entry-main{
        background-image:url('${data('blue')}')!important;
      }

      /* Cover any text baked into the crop, while leaving the botanical/right-side art visible. */
      .v51034-shell.v51043-mockup .v51034-entry-main:before{
        content:''!important;
        position:absolute!important;
        left:8.5%!important;
        top:21%!important;
        width:57%!important;
        height:62%!important;
        background:linear-gradient(90deg,rgba(235,218,183,.96),rgba(235,218,183,.86) 78%,rgba(235,218,183,0))!important;
        filter:blur(.2px)!important;
        z-index:1!important;
        pointer-events:none!important;
      }

      .v51034-shell.v51043-mockup .v51034-entry-top{
        position:absolute!important;
        left:12%!important;
        right:21%!important;
        top:36%!important;
        display:block!important;
        margin:0!important;
        padding:0!important;
        z-index:3!important;
      }
      .v51034-shell.v51043-mockup .v51034-entry-book{
        margin:0!important;
        color:#352317!important;
        font:500 clamp(11px,3vw,17px)/1.02 Georgia,'Times New Roman',serif!important;
        letter-spacing:-.25px!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }
      .v51034-shell.v51043-mockup .v51034-entry-numbers{
        position:absolute!important;
        left:12%!important;
        right:22%!important;
        top:57%!important;
        display:flex!important;
        align-items:baseline!important;
        justify-content:flex-start!important;
        gap:6px!important;
        margin:0!important;
        padding:0!important;
        white-space:nowrap!important;
        z-index:3!important;
      }
      .v51034-shell.v51043-mockup .v51034-range{
        color:#352317!important;
        font:500 clamp(9px,2.45vw,14px)/1 Georgia,'Times New Roman',serif!important;
      }
      .v51034-shell.v51043-mockup .v51034-gain,
      .v51034-shell.v51043-mockup .v51034-duration{
        color:#493323!important;
        font:500 clamp(6px,1.6vw,8.5px)/1 Georgia,'Times New Roman',serif!important;
      }
      .v51034-shell.v51043-mockup .v51034-book-link{
        position:absolute!important;
        left:12%!important;
        top:73%!important;
        margin:0!important;
        padding:3px 7px!important;
        border:1px solid rgba(121,86,43,.48)!important;
        background:rgba(241,222,184,.84)!important;
        color:#51371f!important;
        box-shadow:none!important;
        font:700 clamp(5.8px,1.5vw,7.5px)/1 Georgia,'Times New Roman',serif!important;
        text-decoration:none!important;
        z-index:3!important;
      }
      .v51034-shell.v51043-mockup .v51034-source{
        position:absolute!important;
        right:3.3%!important;
        top:20%!important;
        width:58px!important;
        height:58px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        margin:0!important;
        padding:5px!important;
        border:0!important;
        border-radius:50%!important;
        background:radial-gradient(circle,rgba(74,27,25,.88) 0 57%,rgba(74,27,25,.30) 64%,transparent 70%)!important;
        color:#f7e6c7!important;
        font:500 7px/1.08 Georgia,'Times New Roman',serif!important;
        text-align:center!important;
        white-space:normal!important;
        z-index:4!important;
      }
      .v51034-shell.v51043-mockup .v51034-entry:nth-of-type(even) .v51034-source{
        background:radial-gradient(circle,rgba(29,45,63,.9) 0 57%,rgba(29,45,63,.3) 64%,transparent 70%)!important;
      }

      /* BOTTOM VIGNETTE — edge-to-edge, then page ends */
      .v51034-shell.v51043-mockup .v51034-footer-art{
        width:calc(100% + 28px)!important;
        aspect-ratio:590/104!important;
        margin:7px -14px 0!important;
        background:url('${data('footer')}') center/100% 100% no-repeat!important;
        pointer-events:none!important;
        user-select:none!important;
      }

      @media(max-width:360px){
        .v51034-shell.v51043-mockup .v51034-entry{grid-template-columns:60px minmax(0,1fr)!important}
        .v51034-shell.v51043-mockup .v51034-day:before{left:37px!important}
        .v51034-shell.v51043-mockup .v51034-day-head{padding-left:55px!important}
        .v51034-shell.v51043-mockup .v51034-day-head:before{left:28px!important}
        .v51034-shell.v51043-mockup .v51034-source{width:52px!important;height:52px!important;font-size:6.4px!important}
        .v51034-shell.v51043-mockup .v51034-entry-main{height:106px!important;min-height:106px!important}
      }
    `;
    document.head.appendChild(s);
    document.documentElement.dataset.readingJournalMockupLower='51043-clean-i';
  }

  function decorate(){
    const shell=document.querySelector('.v51034-shell.v51043-mockup');
    const body=document.getElementById('v51034JournalBody');
    if(!shell||!body)return;
    if(shell.dataset.journalMode==='book'||shell.dataset.journalMode==='all'){
      if(!body.querySelector('.v51034-footer-art')){
        const f=document.createElement('div');
        f.className='v51034-footer-art';
        f.setAttribute('aria-hidden','true');
        body.appendChild(f);
      }
    }else{
      body.querySelector('.v51034-footer-art')?.remove();
    }
  }

  function observe(){
    const body=document.getElementById('v51034JournalBody');
    if(!body||body.__v51043LowerCleanObserved)return;
    body.__v51043LowerCleanObserved=true;
    new MutationObserver(()=>{if(assets)decorate();}).observe(body,{childList:true});
  }

  function queue(){[0,60,160,320].forEach(ms=>setTimeout(()=>{loadAssets();observe();decorate();},ms));}
  document.addEventListener('change',e=>{if(e.target?.id==='v51034BookFilter')queue();},false);
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-journal-book],#v51034JournalLaunch,#v51034LibraryJournalLaunch'))queue();},false);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});else queue();
  window.addEventListener('pageshow',queue);
})();