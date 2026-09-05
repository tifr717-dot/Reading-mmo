(()=>{
  'use strict';
  if(window.__v51041JournalArt)return;
  window.__v51041JournalArt=true;

  const style=document.createElement('style');
  style.id='v51041-journal-art';
  style.textContent=`
    /* v5.10.41 — illustrated vintage Archivist Journal.
       Keep the stable 5.10.39 scroll model; replace dashboard styling with a cohesive book-page composition. */

    .v51034-shell{
      background:
        radial-gradient(circle at 50% -8%,rgba(255,249,219,.48),transparent 34%),
        linear-gradient(90deg,rgba(80,44,22,.055),transparent 7%,transparent 93%,rgba(80,44,22,.055)),
        repeating-linear-gradient(0deg,rgba(95,62,35,.017) 0 1px,transparent 1px 5px),
        linear-gradient(180deg,#f0dcad 0%,#e4c98f 54%,#d9b978 100%)!important;
      border:4px solid #3d2418!important;
      outline:2px solid #ad7d3f!important;
      outline-offset:-9px!important;
      box-shadow:
        0 18px 42px rgba(0,0,0,.62),
        inset 0 0 0 1px rgba(255,242,199,.46),
        inset 0 0 50px rgba(83,43,20,.16)!important;
    }
    .v51034-shell:before,.v51034-shell:after{
      content:''!important;
      position:absolute!important;
      top:5px!important;
      width:112px!important;
      height:112px!important;
      background:url('./journal-botanical-corner-v51041.svg') center/contain no-repeat!important;
      opacity:.62!important;
      pointer-events:none!important;
      z-index:0!important;
    }
    .v51034-shell:before{left:4px!important}
    .v51034-shell:after{right:4px!important;transform:scaleX(-1)!important}
    .v51034-head,.v51034-rule,.v51034-toolbar,#v51034JournalBody,.v51034-close{position:relative;z-index:1}

    /* Antique brass close medallion. */
    .v51034-close{
      right:14px!important;
      top:12px!important;
      width:42px!important;
      min-width:42px!important;
      height:42px!important;
      min-height:42px!important;
      border-radius:50%!important;
      border:2px solid #8d642e!important;
      outline:1px solid #2c170f!important;
      outline-offset:2px!important;
      background:
        radial-gradient(circle at 38% 32%,#76503b 0 8%,#4b2a20 48%,#2c1712 100%)!important;
      color:#f2d99a!important;
      box-shadow:
        inset 0 0 0 3px rgba(206,157,77,.23),
        0 3px 5px rgba(50,27,16,.35)!important;
      font:900 19px/1 Georgia,serif!important;
    }

    /* Title page, not app header. */
    .v51034-head{padding:4px 52px 8px!important}
    .v51034-kicker{
      font:700 7px/1.15 Georgia,'Times New Roman',serif!important;
      font-style:italic!important;
      letter-spacing:.7px!important;
      text-transform:none!important;
      color:#6e4a31!important;
    }
    .v51034-title{
      margin-top:4px!important;
      font:900 28px/.98 Georgia,'Times New Roman',serif!important;
      letter-spacing:-.4px!important;
      color:#3e2418!important;
      text-shadow:0 1px rgba(255,242,204,.75)!important;
    }
    .v51034-sub{
      max-width:360px!important;
      margin:6px auto 0!important;
      font:700 8px/1.35 ui-monospace,monospace!important;
      color:#71543d!important;
    }
    .v51034-rule{
      height:18px!important;
      margin:0 5% 6px!important;
      background:url('./journal-flourish-v51041.svg') center/100% 100% no-repeat!important;
    }
    .v51034-rule:before,.v51034-rule:after{display:none!important}

    /* Book selector as an illustrated archive bookplate. */
    .v51034-toolbar{
      display:block!important;
      margin:0 5px 11px!important;
      padding:8px 10px 10px!important;
      border:0!important;
      background:rgba(255,245,216,.20)!important;
      box-shadow:none!important;
    }
    .v51034-toolbar-label{
      display:block!important;
      margin:0 0 5px 7px!important;
      font:italic 900 8px/1 Georgia,'Times New Roman',serif!important;
      letter-spacing:.2px!important;
      text-transform:none!important;
      color:#624128!important;
    }
    .v51034-book-select{
      width:100%!important;
      max-width:none!important;
      height:48px!important;
      padding:7px 38px 7px 18px!important;
      border:2px solid #76502e!important;
      border-radius:2px!important;
      outline:1px solid rgba(139,92,49,.58)!important;
      outline-offset:-5px!important;
      background:
        linear-gradient(90deg,rgba(112,75,39,.06),transparent 18%,transparent 82%,rgba(112,75,39,.06)),
        linear-gradient(180deg,#f7e8c4,#e6c78e)!important;
      color:#3f281a!important;
      box-shadow:
        0 3px 4px rgba(67,38,20,.20),
        inset 0 1px rgba(255,250,229,.75)!important;
      font:900 14px/1.1 Georgia,'Times New Roman',serif!important;
    }

    /* All-books opening becomes an archive bookplate rather than a dark dashboard hero. */
    .v51034-overall-hero{
      position:relative!important;
      margin:2px 5px 10px!important;
      padding:12px 16px 11px!important;
      border:1px solid rgba(115,76,39,.50)!important;
      border-left:1px solid rgba(115,76,39,.50)!important;
      background:
        linear-gradient(rgba(246,226,183,.87),rgba(224,194,135,.86)),
        url('./journal-botanical-corner-v51041.svg') right bottom/78px auto no-repeat!important;
      color:#4a2d1c!important;
      box-shadow:0 2px 4px rgba(75,43,24,.13),inset 0 0 0 3px rgba(255,246,218,.26)!important;
    }
    .v51034-overall-hero:before{
      content:'ARCHIVE OVERVIEW';
      display:block;
      margin-bottom:6px;
      font:900 6px/1 ui-monospace,monospace;
      letter-spacing:1px;
      color:#805d3d;
    }
    .v51034-overall-kicker{display:none!important}
    .v51034-overall-title{font:900 16px/1.08 Georgia,'Times New Roman',serif!important;color:#422718!important}
    .v51034-overall-sub{margin-top:5px!important;max-width:82%!important;font:700 7.4px/1.4 ui-monospace,monospace!important;color:#70553e!important}

    /* Main stats = one illustrated framed ledger panel. */
    .v51034-ribbon{
      display:grid!important;
      grid-template-columns:repeat(4,minmax(0,1fr))!important;
      gap:0!important;
      overflow:visible!important;
      margin:0 5px 11px!important;
      padding:6px 3px!important;
      border:1px solid #8d6339!important;
      outline:1px solid rgba(122,79,39,.28)!important;
      outline-offset:-5px!important;
      background:linear-gradient(180deg,rgba(248,231,191,.92),rgba(227,196,138,.88))!important;
      box-shadow:0 3px 5px rgba(65,37,20,.15),inset 0 1px rgba(255,249,225,.75)!important;
    }
    .v51034-stat-pill{
      position:relative!important;
      min-width:0!important;
      padding:35px 6px 9px!important;
      border:0!important;
      border-right:1px solid rgba(119,77,40,.36)!important;
      background:transparent!important;
      box-shadow:none!important;
      text-align:center!important;
    }
    .v51034-stat-pill:last-child{border-right:0!important}
    .v51034-stat-pill:before{
      content:'';
      position:absolute;
      top:7px;left:50%;
      width:25px;height:25px;
      transform:translateX(-50%);
      background:center/contain no-repeat;
      opacity:.82;
    }
    .v51034-stat-pill:nth-child(1):before{background-image:url('./journal-icon-sessions-v51041.svg')}
    .v51034-stat-pill:nth-child(2):before{background-image:url('./journal-icon-pages-v51041.svg')}
    .v51034-stat-pill:nth-child(3):before{background-image:url('./journal-icon-time-v51041.svg')}
    .v51034-stat-pill:nth-child(4):before{background-image:url('./journal-icon-longest-v51041.svg')}
    .v51034-stat-pill span{
      font:italic 800 7px/1.05 Georgia,'Times New Roman',serif!important;
      letter-spacing:0!important;
      text-transform:none!important;
      color:#65462f!important;
    }
    .v51034-stat-pill b{
      margin-top:5px!important;
      font:900 16px/1 Georgia,'Times New Roman',serif!important;
      color:#402719!important;
    }
    .v51034-stat-pill i{
      margin-top:4px!important;
      font:700 6.4px/1.2 ui-monospace,monospace!important;
      color:#795c43!important;
    }

    /* Supporting records become one archive card with ruled seams. */
    .v51034-feature-row,.v51034-ledger-note{
      position:relative!important;
      display:grid!important;
      grid-template-columns:1fr 1fr!important;
      gap:0!important;
      margin:0 5px 12px!important;
      padding:4px!important;
      border:1px solid #8c6239!important;
      outline:1px solid rgba(122,79,39,.24)!important;
      outline-offset:-5px!important;
      background:
        linear-gradient(rgba(247,229,190,.90),rgba(228,198,141,.86)),
        repeating-linear-gradient(0deg,transparent 0 27px,rgba(109,77,45,.08) 28px 29px)!important;
      box-shadow:0 2px 4px rgba(67,39,22,.12)!important;
    }
    .v51034-feature-row:after,.v51034-ledger-note:after{
      content:'✦';
      position:absolute;left:50%;top:50%;
      transform:translate(-50%,-50%);
      width:18px;height:18px;display:grid;place-items:center;
      background:#ead19a;color:#815c37;
      font:900 8px/1 Georgia,serif;
    }
    .v51034-feature,.v51034-ledger-note>div{
      min-height:64px!important;
      padding:11px 13px!important;
      border:0!important;
      border-radius:0!important;
      background:transparent!important;
      box-shadow:none!important;
    }
    .v51034-feature:nth-child(odd),.v51034-ledger-note>div:nth-child(odd){border-right:1px dashed rgba(110,73,38,.35)!important}
    .v51034-feature:nth-child(-n+2),.v51034-ledger-note>div:nth-child(-n+2){border-bottom:1px dashed rgba(110,73,38,.32)!important}
    .v51034-feature span,.v51034-ledger-note span{
      font:900 6.5px/1.05 ui-monospace,monospace!important;
      letter-spacing:.3px!important;
      color:#76543b!important;
    }
    .v51034-feature b,.v51034-ledger-note b{
      margin-top:6px!important;
      font:900 13px/1.13 Georgia,'Times New Roman',serif!important;
      color:#43291a!important;
    }
    .v51034-feature i{margin-top:4px!important;font:700 6.7px/1.25 ui-monospace,monospace!important;color:#755a44!important}

    /* Timeline title = printed chapter divider. */
    .v51034-section-head{
      position:relative!important;
      min-height:27px!important;
      margin:7px 5px 6px!important;
      gap:7px!important;
    }
    .v51034-section-head:before,.v51034-section-head:after{
      height:16px!important;
      flex:1!important;
      border:0!important;
      background:url('./journal-flourish-v51041.svg') center/100% 100% no-repeat!important;
      opacity:.72!important;
    }
    .v51034-section-head:before{transform:scaleX(-1)!important}
    .v51034-section-head b{
      font:900 12px/1 Georgia,'Times New Roman',serif!important;
      letter-spacing:1.2px!important;
      color:#563721!important;
    }
    .v51034-section-head small{font:900 6.3px/1 ui-monospace,monospace!important;color:#836249!important}

    /* Day labels and timeline feel written into the ledger margin. */
    .v51034-day{margin-top:8px!important}
    .v51034-day-head{margin:0 4px 2px!important;gap:8px!important}
    .v51034-day-head b{
      font:italic 900 10px/1 Georgia,'Times New Roman',serif!important;
      letter-spacing:0!important;
      text-transform:none!important;
      color:#634329!important;
    }
    .v51034-day-head:after{background:linear-gradient(90deg,rgba(111,73,38,.42),transparent)!important}
    .v51034-entry{
      grid-template-columns:58px minmax(0,1fr)!important;
      gap:8px!important;
      margin-left:13px!important;
      padding:8px 3px 12px 15px!important;
      border-left:1px solid #866039!important;
    }
    .v51034-entry:before{
      content:''!important;
      left:-7px!important;top:19px!important;
      width:12px!important;height:12px!important;
      border-radius:50%!important;
      border:2px solid #795229!important;
      background:radial-gradient(circle,#c99a52 0 24%,#674326 27% 48%,#e2c17d 52% 68%,#5a371e 72%)!important;
      box-shadow:0 1px 2px rgba(60,33,18,.3)!important;
    }
    .v51034-time{
      padding-top:9px!important;
      font:900 8px/1.25 ui-monospace,monospace!important;
      color:#76563e!important;
    }

    /* Each reading session becomes a layered archival paper slip. */
    .v51034-entry-main{
      position:relative!important;
      min-height:86px!important;
      padding:13px 72px 12px 17px!important;
      border:1px solid rgba(126,83,42,.46)!important;
      border-left:0!important;
      border-radius:1px!important;
      clip-path:polygon(1% 3%,97% 0,100% 7%,99% 93%,95% 100%,4% 97%,0 91%,1% 10%)!important;
      background:
        linear-gradient(rgba(246,225,183,.88),rgba(233,204,150,.88)),
        url('./journal-botanical-corner-v51041.svg') right bottom/78px 78px no-repeat!important;
      box-shadow:0 4px 7px rgba(66,38,21,.20)!important;
    }
    .v51034-entry-main:before{
      content:'';
      position:absolute;left:0;top:0;bottom:0;width:5px;
      background:linear-gradient(180deg,#8a613a,#b58a53,#7c5432);
      opacity:.7;
    }
    .v51034-entry-top{display:block!important}
    .v51034-entry-book{
      padding-right:4px!important;
      font:900 16px/1.08 Georgia,'Times New Roman',serif!important;
      color:#402619!important;
    }
    .v51034-entry-numbers{margin-top:9px!important;gap:8px!important}
    .v51034-range{
      font:900 15px/1 Georgia,'Times New Roman',serif!important;
      color:#4b2d1c!important;
    }
    .v51034-gain,.v51034-duration{font:900 7px/1 ui-monospace,monospace!important;color:#65503d!important}
    .v51034-book-link{
      margin-top:9px!important;
      color:#724d3a!important;
      font:italic 900 7px/1 Georgia,'Times New Roman',serif!important;
      text-decoration:none!important;
      border-bottom:1px solid rgba(114,77,58,.45)!important;
      width:max-content!important;
    }

    /* CrossInk becomes a wax archive seal. */
    .v51034-source{
      position:absolute!important;
      right:11px!important;
      top:50%!important;
      transform:translateY(-50%) rotate(-2deg)!important;
      width:54px!important;
      height:54px!important;
      display:grid!important;
      place-items:center!important;
      padding:8px 5px!important;
      border-radius:50%!important;
      white-space:normal!important;
      text-align:center!important;
      font:900 6.8px/1.13 Georgia,'Times New Roman',serif!important;
      letter-spacing:.15px!important;
      box-shadow:0 3px 5px rgba(61,29,20,.30),inset 0 0 0 3px rgba(255,209,145,.11)!important;
    }
    .v51034-source.crossink{
      border:2px solid #5a2019!important;
      outline:1px solid #8d4a31!important;
      outline-offset:2px!important;
      background:
        radial-gradient(circle at 42% 34%,#a54c35 0 11%,#7d2d24 43%,#5a1d19 72%,#3d1513 100%)!important;
      color:#f4dba5!important;
      text-shadow:0 1px #3b1713!important;
    }
    .v51034-source.app{
      width:auto!important;height:auto!important;
      min-width:52px!important;min-height:28px!important;
      border:1px dashed #5e704b!important;
      border-radius:2px!important;
      outline:0!important;
      background:rgba(221,227,193,.8)!important;
      color:#405035!important;
      transform:translateY(-50%) rotate(1deg)!important;
      box-shadow:none!important;
    }

    .v51034-empty{
      margin:8px 5px!important;
      border:1px solid #8e663e!important;
      background:linear-gradient(rgba(246,228,191,.86),rgba(229,200,146,.86))!important;
      box-shadow:inset 0 0 0 4px rgba(255,244,215,.25)!important;
    }

    /* A faint illustrated footer crest in otherwise empty parchment. */
    #v51034JournalBody:after{
      content:'';
      display:block;
      width:130px;height:72px;
      margin:22px auto 5px;
      background:url('./journal-botanical-corner-v51041.svg') center/contain no-repeat;
      transform:rotate(-45deg) scale(.82);
      opacity:.34;
      pointer-events:none;
    }

    @media(max-width:430px){
      .v51034-title{font-size:25px!important}
      .v51034-head{padding-left:45px!important;padding-right:45px!important}
      .v51034-ribbon{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      .v51034-stat-pill:nth-child(2){border-right:0!important}
      .v51034-stat-pill:nth-child(-n+2){border-bottom:1px solid rgba(119,77,40,.36)!important}
      .v51034-entry{grid-template-columns:51px minmax(0,1fr)!important;gap:6px!important}
      .v51034-entry-main{padding-left:13px!important;padding-right:66px!important}
      .v51034-entry-book{font-size:14.5px!important}
      .v51034-range{font-size:13.5px!important}
      .v51034-source{width:49px!important;height:49px!important;font-size:6.1px!important;right:8px!important}
    }
  `;

  function syncMode(resetScroll=false){
    const shell=document.querySelector('.v51034-shell');
    const select=document.getElementById('v51034BookFilter');
    const body=document.getElementById('v51034JournalBody');
    if(shell&&select)shell.dataset.journalMode=select.value==='all'?'all':'book';
    if(resetScroll&&body)requestAnimationFrame(()=>{body.scrollTop=0});
  }

  function install(){
    const old=document.getElementById(style.id);
    if(old)old.remove();
    document.head.appendChild(style);
    document.documentElement.dataset.readingJournalArt='51041';
    window.__readingMmoVersionOwner='v5.10.43';
    const badge=document.getElementById('headerVersionText');
    if(badge)badge.textContent='v5.10.43';
    document.querySelectorAll('.health-row').forEach(row=>{
      if(row.querySelector('b')?.textContent.trim()==='Version'){
        const value=row.querySelector('span');if(value)value.textContent='v5.10.43';
      }
    });
    syncMode(false);
  }

  const apply=()=>{
    install();
    [0,80,220].forEach(ms=>setTimeout(()=>{install();syncMode(false)},ms));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
  window.addEventListener('pageshow',apply);
  document.addEventListener('click',e=>{
    if(e.target.closest?.('#v51034JournalLaunch,#v51034LibraryJournalLaunch')){
      setTimeout(()=>{install();syncMode(true)},0);
      setTimeout(()=>{install();syncMode(true)},120);
    }
  },true);
  document.addEventListener('change',e=>{
    if(e.target?.id==='v51034BookFilter')setTimeout(()=>{install();syncMode(true)},0);
  },true);
})();
