(()=>{
  'use strict';
  if(window.__v51043JournalUnified)return;
  window.__v51043JournalUnified=true;

  const BUILD='v5.10.43';
  const PARTS=Array.from({length:7},(_,i)=>`./journal-mockup-lower-pack-tiny-${String(i+1).padStart(2,'0')}.b64?v=51043s`);
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
    document.getElementById('v51043-journal-mockup-lower')?.remove();
    document.getElementById('v51043-journal-unified')?.remove();
    const s=document.createElement('style');
    s.id='v51043-journal-unified';
    s.textContent=`
      .v51034-backdrop{
        align-items:flex-start!important;
      }
      .v51034-shell.v51043-mockup{
        min-height:0!important;
        height:auto!important;
        max-height:none!important;
        align-self:flex-start!important;
        padding-bottom:0!important;
        overflow:visible!important;
        background-color:transparent!important;
      }
      .v51034-shell.v51043-mockup #v51034JournalBody{
        min-height:0!important;
        height:auto!important;
        overflow:visible!important;
        padding:0 7px!important;
        margin-bottom:0!important;
      }


      /* FINAL MOBILE FLOW REPAIR: keep body in normal flow below the fixed artwork header. */
      .v51034-shell.v51043-mockup #v51034JournalBody{
        position:relative!important;
        top:auto!important;
        bottom:auto!important;
        left:auto!important;
        right:auto!important;
        transform:none!important;
        margin-top:0!important;
        flex:none!important;
        align-self:stretch!important;
      }
      .v51034-shell.v51043-mockup .v51034-ribbon{
        scroll-margin-top:0!important;
      }

      /* MASTER LOWER PAGE — this file owns everything below the selector. */
      .v51034-shell.v51043-mockup .v51034-overall-hero{
        display:none!important;
      }

      /* STATS PARCHMENT */
      .v51034-shell.v51043-mockup .v51034-ribbon{
        position:relative!important;
        display:grid!important;
        grid-template-columns:1fr 1fr!important;
        grid-template-rows:1fr 1fr!important;
        gap:0!important;
        width:calc(100% + 14px)!important;
        aspect-ratio:802/304!important;
        min-height:0!important;
        height:auto!important;
        margin:0 -6px 4px!important;
        padding:0!important;
        overflow:hidden!important;
        border:0!important;
        outline:0!important;
        background:
          linear-gradient(rgba(119,83,44,.16),rgba(119,83,44,.16)) 50% 0/1px 100% no-repeat,
          linear-gradient(rgba(119,83,44,.14),rgba(119,83,44,.14)) 0 50%/100% 1px no-repeat,
          url('./archive-parchment-texture.png?v=51043s') center/cover no-repeat!important;
        border:0!important;
        box-shadow:none!important;
      }
      .v51034-shell.v51043-mockup .v51034-stat-pill{
        position:relative!important;
        display:flex!important;
        flex-direction:column!important;
        justify-content:center!important;
        align-items:flex-start!important;
        min-width:0!important;
        min-height:0!important;
        margin:0!important;
        padding:0!important;
        border:0!important;
        background:transparent!important;
        box-shadow:none!important;
        text-align:left!important;
      }
      .v51034-shell.v51043-mockup .v51034-stat-pill:nth-child(odd){padding:2.5% 2% 2% 45%!important}
      .v51034-shell.v51043-mockup .v51034-stat-pill:nth-child(even){padding:2.5% 3% 2% 34%!important}
      .v51034-shell.v51043-mockup .v51034-stat-pill:before{
        content:''!important;display:block!important;position:absolute!important;
        left:8%!important;top:50%!important;transform:translateY(-50%)!important;
        width:23%!important;aspect-ratio:1!important;border-radius:50%!important;
        background:rgba(190,155,104,.20) center/62% 62% no-repeat!important;
        box-shadow:inset 0 0 0 1px rgba(117,81,45,.10)!important;opacity:.95!important
      }
      .v51034-shell.v51043-mockup .v51034-stat-pill:nth-child(1):before{background-image:url('./journal-icon-pages-v51041.svg')!important}
      .v51034-shell.v51043-mockup .v51034-stat-pill:nth-child(2):before{background-image:url('./journal-icon-sessions-v51041.svg')!important}
      .v51034-shell.v51043-mockup .v51034-stat-pill:nth-child(3):before{background-image:url('./journal-icon-pages-v51041.svg')!important}
      .v51034-shell.v51043-mockup .v51034-stat-pill:nth-child(4):before{background-image:url('./journal-icon-time-v51041.svg')!important}
      .v51034-shell.v51043-mockup .v51034-stat-pill span{
        margin:0!important;color:#352317!important;
        font:700 clamp(7px,2vw,10px)/1.05 Georgia,'Times New Roman',serif!important;
        letter-spacing:.25px!important;text-transform:uppercase!important;white-space:nowrap!important
      }
      .v51034-shell.v51043-mockup .v51034-stat-pill b{
        margin:3px 0 0!important;color:#352317!important;
        font:500 clamp(15px,4.5vw,25px)/.95 Georgia,'Times New Roman',serif!important;
        letter-spacing:-.35px!important;white-space:nowrap!important
      }
      .v51034-shell.v51043-mockup .v51034-stat-pill i{
        margin:4px 0 0!important;color:#4c3726!important;
        font:400 clamp(6.5px,1.85vw,9.5px)/1.05 Georgia,'Times New Roman',serif!important;
        font-style:normal!important;white-space:nowrap!important
      }

      /* ALL BOOKS SECOND LEDGER */
      .v51034-shell.v51043-mockup .v51034-feature-row{
        position:relative!important;
        display:grid!important;
        grid-template-columns:1fr 1fr!important;
        grid-template-rows:1fr 1fr!important;
        gap:0!important;
        width:calc(100% + 12px)!important;
        aspect-ratio:805/210!important;
        min-height:0!important;
        margin:1px -6px 5px!important;
        padding:0!important;
        border:0!important;
        background:
          linear-gradient(rgba(121,83,44,.14),rgba(121,83,44,.14)) 50% 0/1px 100% no-repeat,
          linear-gradient(rgba(121,83,44,.13),rgba(121,83,44,.13)) 0 50%/100% 1px no-repeat,
          url('./archive-parchment-texture.png?v=51043s') center/cover no-repeat!important;
        border:0!important;
        box-shadow:none!important;
        overflow:hidden!important;
      }
      .v51034-shell.v51043-mockup .v51034-feature-row:before,
      .v51034-shell.v51043-mockup .v51034-feature-row:after{
        content:''!important;position:absolute!important;bottom:-5%!important;
        width:26%!important;aspect-ratio:1!important;
        background:url('./journal-botanical-corner-v51041.svg') center/contain no-repeat!important;
        opacity:.32!important;pointer-events:none!important;z-index:1!important
      }
      .v51034-shell.v51043-mockup .v51034-feature-row:before{left:-6%!important}
      .v51034-shell.v51043-mockup .v51034-feature-row:after{right:-6%!important;transform:scaleX(-1)!important}
      .v51034-shell.v51043-mockup .v51034-feature{
        position:relative!important;z-index:2!important;
        min-width:0!important;min-height:0!important;
        margin:0!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important
      }
      .v51034-shell.v51043-mockup .v51034-feature:before{
        content:''!important;position:absolute!important;left:5%!important;top:50%!important;
        transform:translateY(-50%)!important;width:12%!important;aspect-ratio:1!important;
        border-radius:50%!important;background:rgba(189,151,94,.20) center/66% 66% no-repeat!important;
        opacity:.9!important;z-index:1!important
      }
      .v51034-shell.v51043-mockup .v51034-feature:nth-child(1):before{background-image:url('./journal-icon-pages-v51041.svg')!important}
      .v51034-shell.v51043-mockup .v51034-feature:nth-child(2):before{background-image:url('./journal-icon-longest-v51041.svg')!important}
      .v51034-shell.v51043-mockup .v51034-feature:nth-child(3):before{background-image:url('./journal-flourish-v51041.svg')!important}
      .v51034-shell.v51043-mockup .v51034-feature:nth-child(4):before{background-image:url('./journal-icon-pages-v51041.svg')!important}
      .v51034-shell.v51043-mockup .v51034-feature span{
        position:absolute!important;
        left:18%!important;top:25%!important;right:7%!important;
        margin:0!important;color:#5d4227!important;
        font:700 clamp(6.5px,1.75vw,9px)/1 Georgia,'Times New Roman',serif!important;
        letter-spacing:.35px!important;text-transform:uppercase!important
      }
      .v51034-shell.v51043-mockup .v51034-feature b{
        position:absolute!important;
        left:18%!important;top:43%!important;right:7%!important;
        margin:0!important;color:#352317!important;
        font:500 clamp(13px,3.45vw,20px)/1.02 Georgia,'Times New Roman',serif!important;
        white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important
      }
      .v51034-shell.v51043-mockup .v51034-feature i{
        position:absolute!important;
        left:18%!important;top:67%!important;right:7%!important;
        margin:0!important;color:#59402c!important;
        font:400 clamp(6px,1.55vw,8px)/1.05 Georgia,'Times New Roman',serif!important;
        font-style:normal!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important
      }
      .v51034-shell.v51043-mockup .v51034-feature:nth-child(even) span,
      .v51034-shell.v51043-mockup .v51034-feature:nth-child(even) b,
      .v51034-shell.v51043-mockup .v51034-feature:nth-child(even) i{left:10%!important;right:16%!important}

      /* SECOND LEDGER — one full-width illustrated sheet */
      .v51034-shell.v51043-mockup:is([data-journal-mode="book"],[data-journal-mode="all"]) .v51034-ledger-note{
        position:relative!important;
        display:grid!important;
        grid-template-columns:1fr 1fr!important;
        grid-template-rows:1fr 1fr!important;
        gap:0!important;
        width:calc(100% + 12px)!important;
        aspect-ratio:805/250!important;
        min-height:0!important;
        margin:2px -6px 5px!important;
        padding:0!important;
        border:0!important;
        background:linear-gradient(rgba(129,91,48,.24),rgba(129,91,48,.24)) 50% 0/1px 100% no-repeat,linear-gradient(rgba(129,91,48,.20),rgba(129,91,48,.20)) 0 50%/100% 1px no-repeat,linear-gradient(180deg,rgba(246,226,182,.98),rgba(228,198,143,.96))!important;
        border:1px solid rgba(125,86,43,.34)!important;
        box-shadow:inset 0 0 18px rgba(112,72,34,.08)!important;
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
        width:min(66%,390px)!important;
        aspect-ratio:465/87!important;
        height:auto!important;
        min-height:0!important;
        margin:3px auto 1px!important;
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
        margin:0 0 2px!important;
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
        height:24px!important;
        margin:0!important;
        padding:4px 0 0 61px!important;
        border:0!important;
        background:transparent!important;
        z-index:3!important;
      }
      .v51034-shell.v51043-mockup .v51034-day-head:before{
        content:'✦'!important;
        position:absolute!important;
        left:33px!important;top:1px!important;
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
        margin:0 0 3px!important;
        padding:0!important;
        border:0!important;
        background:transparent!important;
        overflow:visible!important;
      }
      .v51034-shell.v51043-mockup .v51034-entry:before{content:none!important}
      .v51034-shell.v51043-mockup .v51034-time{
        padding:15px 7px 0 0!important;
        color:#432b1b!important;
        font:700 clamp(7.5px,1.95vw,10px)/1 Georgia,'Times New Roman',serif!important;
        text-align:center!important;
        white-space:nowrap!important;
      }

      .v51034-shell.v51043-mockup .v51034-entry-main{
        position:relative!important;
        width:100%!important;
        height:auto!important;
        min-height:0!important;
        aspect-ratio:620/108!important;
        margin:0!important;
        padding:0!important;
        border:0!important;
        border-radius:0!important;
        background:
          linear-gradient(180deg,rgba(249,235,205,.98),rgba(233,207,160,.98)),
          url('./archive-parchment-texture.png?v=51043s') center/cover no-repeat!important;
        clip-path:polygon(1% 7%,7% 2%,17% 4%,29% 1%,42% 4%,57% 2%,72% 4%,86% 2%,98% 7%,99% 28%,97% 48%,99% 68%,97% 92%,86% 96%,71% 94%,58% 98%,43% 95%,29% 98%,15% 95%,2% 92%,1% 70%,3% 49%,1% 28%)!important;
        box-shadow:inset 0 0 0 1px rgba(121,83,44,.25),0 2px 3px rgba(71,43,22,.13)!important;
        box-shadow:none!important;
        overflow:hidden!important;
      }
      .v51034-shell.v51043-mockup .v51034-entry:nth-of-type(even) .v51034-entry-main{
        background:
          linear-gradient(180deg,rgba(241,230,207,.98),rgba(218,204,178,.98)),
          url('./archive-parchment-texture.png?v=51043s') center/cover no-repeat!important;
      }

      /* Decorative layers are independent from the live session content. */
      .v51034-shell.v51043-mockup .v51034-entry-main:before{
        content:''!important;position:absolute!important;right:1%!important;bottom:-19%!important;
        width:30%!important;aspect-ratio:1!important;
        background:url('./journal-botanical-corner-v51041.svg') center/contain no-repeat!important;
        opacity:.22!important;transform:scaleX(-1)!important;z-index:1!important;pointer-events:none!important;
      }
      .v51034-shell.v51043-mockup .v51034-entry-main:after{
        content:''!important;position:absolute!important;left:2%!important;top:8%!important;
        width:3.2%!important;height:84%!important;border-radius:2px!important;
        background:linear-gradient(180deg,#7c5c45,#aa8361 60%,#73513c)!important;
        box-shadow:1px 0 rgba(255,255,255,.25)!important;opacity:.72!important;z-index:2!important;
      }

      .v51034-shell.v51043-mockup .v51034-entry-top{
        position:absolute!important;
        left:12%!important;
        right:24%!important;
        top:34%!important;
        display:block!important;
        margin:0!important;
        padding:0!important;
        z-index:3!important;
      }
      .v51034-shell.v51043-mockup .v51034-entry-book{
        margin:0!important;
        color:#352317!important;
        font:600 clamp(11px,3vw,17px)/1.02 Georgia,'Times New Roman',serif!important;
        letter-spacing:-.25px!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }
      .v51034-shell.v51043-mockup .v51034-entry-numbers{
        position:absolute!important;
        left:12%!important;
        right:24%!important;
        top:56%!important;
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
        font:500 clamp(10px,2.7vw,15px)/1 Georgia,'Times New Roman',serif!important;
      }
      .v51034-shell.v51043-mockup .v51034-gain,
      .v51034-shell.v51043-mockup .v51034-duration{
        color:#493323!important;
        font:500 clamp(6px,1.6vw,8.5px)/1 Georgia,'Times New Roman',serif!important;
      }
      .v51034-shell.v51043-mockup .v51034-book-link{
        position:absolute!important;
        left:12%!important;
        top:72%!important;
        margin:0!important;
        padding:3px 7px!important;
        border:1px solid rgba(121,86,43,.48)!important;
        background:rgba(241,222,184,.84)!important;
        color:#51371f!important;
        box-shadow:none!important;
        font:700 clamp(5.8px,1.5vw,7.5px)/1 Georgia,'Times New Roman',serif!important;
        text-decoration:none!important;
        z-index:3!important;
        display:none!important;
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

      .v51043-bookmark-layer{
        position:absolute!important;right:7%!important;top:-2%!important;width:8%!important;height:48%!important;
        background:linear-gradient(180deg,#4e3173,#6f4a99)!important;
        clip-path:polygon(0 0,100% 0,100% 100%,50% 76%,0 100%)!important;
        box-shadow:0 2px 3px rgba(52,31,24,.22)!important;z-index:3!important;pointer-events:none!important
      }
      .v51043-bookmark-layer:after{
        content:'✦'!important;position:absolute!important;inset:0!important;display:grid!important;place-items:center!important;
        color:#d9b45b!important;font:700 12px/1 Georgia!important
      }
      .v51043-flower-layer{
        position:absolute!important;right:8%!important;bottom:2%!important;width:17%!important;aspect-ratio:1!important;
        background:url('./journal-botanical-corner-v51041.svg') center/contain no-repeat!important;
        opacity:.16!important;transform:scaleX(-1)!important;z-index:1!important;pointer-events:none!important
      }

      /* BOTTOM VIGNETTE — edge-to-edge, then page ends */
      .v51034-shell.v51043-mockup .v51034-footer-art{
        width:calc(100% + 12px)!important;
        aspect-ratio:590/102!important;
        margin:2px -7px 0!important;
        background:url('${data('footer')}') center bottom/100% auto no-repeat!important;
        pointer-events:none!important;
        user-select:none!important;
      }

      @media(max-width:370px){
        .v51034-shell.v51043-mockup .v51034-feature-row{grid-template-columns:1fr 1fr!important;grid-template-rows:1fr 1fr!important}
        .v51034-shell.v51043-mockup .v51034-entry{grid-template-columns:60px minmax(0,1fr)!important}
        .v51034-shell.v51043-mockup .v51034-day:before{left:37px!important}
        .v51034-shell.v51043-mockup .v51034-day-head{padding-left:55px!important}
        .v51034-shell.v51043-mockup .v51034-day-head:before{left:28px!important}
        .v51034-shell.v51043-mockup .v51034-source{width:52px!important;height:52px!important;font-size:6.4px!important}
        .v51034-shell.v51043-mockup .v51034-entry-main{height:auto!important;min-height:0!important;aspect-ratio:620/108!important}
      }
    `;
    document.head.appendChild(s);
    document.documentElement.dataset.readingJournalMockupLower='51043-unified-s';
  }

  function decorate(){
    document.querySelectorAll('.v51043-exact-skin,#v51043-exact-skin-css').forEach(n=>n.remove());
    const shell=document.querySelector('.v51034-shell.v51043-mockup');
    const body=document.getElementById('v51034JournalBody');
    if(!shell||!body)return;
    const select=shell.querySelector('#v51034BookFilter');
    const all=!select||select.value==='all';
    shell.dataset.journalMode=all?'all':'book';
    const label=shell.querySelector('.v51034-toolbar-label');
    if(label)label.textContent=all?'ARCHIVE VIEW':'CURRENT BOOK';

    const feature=body.querySelector('.v51034-feature-row');
    if(feature&&!feature.querySelector('.v51043-bookmark-layer')){
      const mark=document.createElement('div');
      mark.className='v51043-bookmark-layer';
      mark.setAttribute('aria-hidden','true');
      feature.appendChild(mark);
    }
    body.querySelectorAll('.v51034-entry-main').forEach(card=>{
      if(!card.querySelector('.v51043-flower-layer')){
        const flower=document.createElement('div');
        flower.className='v51043-flower-layer';
        flower.setAttribute('aria-hidden','true');
        card.appendChild(flower);
      }
    });
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

  function stamp(){
    window.__readingMmoVersionOwner=BUILD;
    const badge=document.getElementById('headerVersionText');
    if(badge)badge.textContent=BUILD;
  }

  function queue(){
    stamp();installStyle();observe();decorate();
    [0,60,160,320].forEach(ms=>setTimeout(()=>{installStyle();loadAssets();observe();decorate();},ms));
  }
  document.addEventListener('change',e=>{if(e.target?.id==='v51034BookFilter')queue();},false);
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-journal-book],#v51034JournalLaunch,#v51034LibraryJournalLaunch'))queue();},false);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});else queue();
  window.addEventListener('pageshow',queue);
  [80,400,1200].forEach(ms=>setTimeout(()=>{stamp();decorate();},ms));
})();