(()=>{'use strict';
if(window.__v51043ApprovedZA)return;window.__v51043ApprovedZA=1;
const REV='51043za',BUILD='v5.10.43';
const A={
 stats:`./journal-approved-stats-v51043z.webp?v=${REV}`,
 highlights:`./journal-approved-highlights-v51043z.webp?v=${REV}`,
 timeline:`./journal-approved-timeline-v51043z.webp?v=${REV}`,
 slips:[1,2,3].map(n=>`./journal-approved-slip${n}-v51043z.webp?v=${REV}`)
};
const css=`
.v51034-backdrop{align-items:flex-start!important;overflow-y:auto!important;background:rgba(7,6,5,.97)!important;padding:5px 4px calc(76px + env(safe-area-inset-bottom))!important}
.v51034-shell[data-real-journal="${REV}"]{height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;padding-bottom:0!important;background:#ead29d!important;border-color:#17150f!important;box-shadow:0 18px 46px rgba(0,0,0,.72)!important}
.v51034-shell[data-real-journal="${REV}"] #v51034JournalBody{display:block!important;height:auto!important;overflow:visible!important;padding:0 7px 4px!important;margin:0!important;background:linear-gradient(#ead3a3,#dfbf83)!important}
.v51034-shell[data-real-journal="${REV}"] .v51043-canvas-layer,.v51034-shell[data-real-journal="${REV}"] .v51043-raster-layer,.v51034-shell[data-real-journal="${REV}"] .v51043-art-layer,.v51034-shell[data-real-journal="${REV}"] .v51034-overall-hero,.v51034-shell[data-real-journal="${REV}"] .v51043-real-footer{display:none!important}

/* approved illustrated four-stat ledger */
.v51034-shell[data-real-journal="${REV}"] .v51034-ribbon{position:relative!important;display:grid!important;grid-template-columns:1fr 1fr!important;grid-template-rows:1fr 1fr!important;gap:0!important;width:calc(100% + 14px)!important;aspect-ratio:980/216!important;height:auto!important;min-height:0!important;margin:0 -7px!important;padding:0!important;overflow:hidden!important;background:url('${A.stats}') center/100% 100% no-repeat!important;border:0!important;box-shadow:none!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-stat-pill{position:relative!important;min-width:0!important;margin:0!important;padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important;overflow:hidden!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-stat-pill span{display:none!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-stat-pill b,.v51034-shell[data-real-journal="${REV}"] .v51034-stat-pill i{position:absolute!important;left:43%!important;right:5%!important;margin:0!important;padding:0!important;color:#3e291d!important;background:transparent!important;box-shadow:none!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;font-family:Georgia,'Times New Roman',serif!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-stat-pill b{top:46%!important;font-size:clamp(15px,4.1vw,25px)!important;font-weight:500!important;line-height:1!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-stat-pill i{top:72%!important;font-size:clamp(6px,1.55vw,9px)!important;font-weight:500!important;line-height:1.05!important;font-style:normal!important}

/* approved illustrated highlights ledger */
.v51034-shell[data-real-journal="${REV}"] .v51034-feature-row{position:relative!important;display:grid!important;grid-template-columns:1fr 1fr!important;grid-template-rows:1fr 1fr!important;gap:0!important;width:calc(100% + 14px)!important;aspect-ratio:964/213!important;height:auto!important;margin:-1px -7px 0!important;padding:0!important;overflow:hidden!important;background:url('${A.highlights}') center/100% 100% no-repeat!important;border:0!important;box-shadow:none!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-feature{position:relative!important;margin:0!important;padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important;overflow:hidden!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-feature span{display:none!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-feature b,.v51034-shell[data-real-journal="${REV}"] .v51034-feature i{position:absolute!important;left:34%!important;right:6%!important;margin:0!important;padding:0!important;color:#3e291d!important;background:transparent!important;box-shadow:none!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;font-family:Georgia,'Times New Roman',serif!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-feature b{top:46%!important;font-size:clamp(10px,2.8vw,17px)!important;font-weight:500!important;line-height:1!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-feature i{top:72%!important;font-size:clamp(6px,1.45vw,9px)!important;font-style:normal!important;line-height:1.05!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-ledger-note{width:calc(100% + 14px)!important;margin:0 -7px 7px!important;padding:5px 8px!important;background:url('./archive-parchment-texture.png?v=${REV}') center/cover!important;border:1px solid rgba(113,73,39,.35)!important}

/* approved Reading Timeline art */
.v51034-shell[data-real-journal="${REV}"] .v51034-section-head{position:relative!important;display:block!important;width:calc(100% + 14px)!important;aspect-ratio:885/88!important;height:auto!important;margin:-1px -7px 2px!important;padding:0!important;overflow:hidden!important;background:url('${A.timeline}') center/100% 100% no-repeat!important;border:0!important;box-shadow:none!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-section-head:before,.v51034-shell[data-real-journal="${REV}"] .v51034-section-head:after,.v51034-shell[data-real-journal="${REV}"] .v51034-section-head b{display:none!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-section-head small{position:absolute!important;z-index:2!important;left:39%!important;right:39%!important;bottom:5%!important;margin:0!important;padding:1px 3px!important;text-align:center!important;color:#59402d!important;background:rgba(239,215,174,.84)!important;box-shadow:0 0 3px 2px rgba(239,215,174,.72)!important;font:600 clamp(6px,1.6vw,10px)/1 Georgia,serif!important;white-space:nowrap!important}

/* dated timeline */
.v51034-shell[data-real-journal="${REV}"] .v51034-day{margin:0!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-day-head{position:relative!important;height:clamp(31px,8vw,47px)!important;margin:0!important;padding:0 5% 0 16.5%!important;display:flex!important;align-items:center!important;gap:7px!important;background:transparent!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-day-head:before{content:'✦'!important;position:absolute!important;left:5.5%!important;width:clamp(25px,7vw,42px)!important;height:clamp(25px,7vw,42px)!important;display:grid!important;place-items:center!important;border:2px solid #a37b43!important;border-radius:50%!important;background:#ead09a!important;box-shadow:inset 0 0 0 3px rgba(255,239,195,.55)!important;color:#78512f!important;font:700 clamp(13px,3.7vw,22px)/1 Georgia,serif!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-day-head b{color:#4b3323!important;font:700 clamp(9px,2.3vw,14px)/1 Georgia,serif!important;letter-spacing:.35px!important;white-space:nowrap!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-day-head:after{content:''!important;display:block!important;height:1px!important;flex:1!important;background:rgba(94,60,31,.48)!important}

/* real illustrated session slips */
.v51034-shell[data-real-journal="${REV}"] .v51034-entry{position:relative!important;display:grid!important;grid-template-columns:15% 1fr!important;gap:0!important;align-items:center!important;margin:0!important;padding:0 1% 1.8% 5.5%!important;border:0!important;background:linear-gradient(rgba(100,65,34,.38),rgba(100,65,34,.38)) 7.1% 0/1px 100% no-repeat!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-entry:before{display:none!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-time{padding:0 8% 0 0!important;margin:0!important;color:#4b3425!important;text-align:right!important;font:600 clamp(8px,2.2vw,13px)/1 Georgia,serif!important;white-space:nowrap!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-entry-main{position:relative!important;isolation:isolate!important;width:100%!important;aspect-ratio:814/100!important;height:auto!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;background-image:var(--journal-slip)!important;background-position:center!important;background-size:100% 100%!important;background-repeat:no-repeat!important;border:0!important;box-shadow:none!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-entry-top{display:contents!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-entry-book{position:absolute!important;z-index:3!important;left:13.5%!important;right:25%!important;top:23%!important;margin:0!important;color:#3e291d!important;background:transparent!important;box-shadow:none!important;font:500 clamp(10px,2.9vw,18px)/1 Georgia,serif!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-entry-numbers{position:absolute!important;z-index:3!important;left:13.5%!important;right:25%!important;top:58%!important;margin:0!important;display:flex!important;align-items:baseline!important;gap:clamp(4px,1.4vw,9px)!important;flex-wrap:nowrap!important;white-space:nowrap!important;overflow:hidden!important;background:transparent!important;box-shadow:none!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-range{color:#4b3120!important;font:600 clamp(9px,2.5vw,15px)/1 Georgia,serif!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-gain,.v51034-shell[data-real-journal="${REV}"] .v51034-duration{color:#66503d!important;font:500 clamp(6px,1.55vw,9px)/1 Georgia,serif!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-source,.v51034-shell[data-real-journal="${REV}"] .v51034-source.app,.v51034-shell[data-real-journal="${REV}"] .v51034-source.crossink{position:absolute!important;z-index:5!important;right:7.1%!important;top:18%!important;width:12.8%!important;aspect-ratio:1!important;height:auto!important;min-width:0!important;margin:0!important;padding:0 5px!important;display:flex!important;align-items:center!important;justify-content:center!important;border:0!important;border-radius:50%!important;color:#fff4e4!important;text-align:center!important;white-space:normal!important;font:700 clamp(5px,1.35vw,8px)/1 Georgia,serif!important;background:transparent!important;box-shadow:none!important}
.v51034-shell[data-real-journal="${REV}"] .v51034-book-link{position:absolute!important;z-index:9!important;inset:0!important;width:100%!important;height:100%!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;color:transparent!important;opacity:0!important}

/* keep the original detailed illustrated ending; remove every experimental footer */
.v51034-shell[data-real-journal="${REV}"] .v51034-footer-art{display:block!important;width:calc(100% + 14px)!important;margin:0 -7px!important}
.v51034-shell[data-real-journal="${REV}"] #v51034JournalBody:after{display:none!important}
`;
let busy=false,timer=0;
function ensureStyle(){if(document.getElementById('v51043-approved-za-css'))return;['v51043-approved-real-css','v51043-layered-t-css','v51043-approved-z-css','v51043-approved-za-css'].forEach(id=>document.getElementById(id)?.remove());const s=document.createElement('style');s.id='v51043-approved-za-css';s.textContent=css;document.head.appendChild(s)}
function clearInline(el){if(!el)return;['background','background-image','background-size','background-position','background-repeat','height','min-height','aspect-ratio','box-shadow'].forEach(p=>el.style.removeProperty(p))}
function apply(){if(busy)return;busy=true;try{
 const shell=document.querySelector('.v51034-shell'),body=document.getElementById('v51034JournalBody');if(!shell||!body)return;
 ensureStyle();shell.dataset.realJournal=REV;delete shell.dataset.canvasJournal;delete shell.dataset.rasterJournal;
 body.querySelectorAll('.v51043-canvas-layer,.v51043-raster-layer,.v51043-art-layer,.v51043-exact-skin,.v51043-bookmark-layer,.v51043-flower-layer,.v51043-real-footer').forEach(n=>n.remove());
 [body.querySelector('.v51034-ribbon'),body.querySelector('.v51034-feature-row'),...body.querySelectorAll('.v51034-section-head'),...body.querySelectorAll('.v51034-entry-main')].forEach(clearInline);
 body.querySelectorAll('.v51034-entry-main').forEach((e,i)=>e.style.setProperty('--journal-slip',`url("${A.slips[i%3]}")`));
 window.__readingMmoVersionOwner=BUILD;const v=document.getElementById('headerVersionText');if(v&&v.textContent!==BUILD)v.textContent=BUILD;document.documentElement.dataset.readingJournalArt='approved-real-za';
 }finally{busy=false}}
// Observe journal structure only. Updating the version badge creates a text node,
// so watching every addition in document.body made apply() schedule itself forever.
function queue(){if(timer)return;timer=setTimeout(()=>{timer=0;apply()},0)}
function boot(){apply();new MutationObserver(ms=>{
 const changed=ms.some(m=>m.type==='childList'&&[...m.addedNodes].some(n=>
  n.nodeType===1&&(n.id==='v51034JournalBackdrop'||n.id==='v51034JournalBody'||
   n.querySelector?.('#v51034JournalBody')||m.target.closest?.('#v51034JournalBody'))));
 if(changed)queue();
}).observe(document.body,{childList:true,subtree:true})}
document.addEventListener('click',e=>{if(e.target.closest?.('#v51034JournalLaunch,#v51034LibraryJournalLaunch,[data-journal-book]'))queue()},true);
document.addEventListener('change',e=>{if(e.target.id==='v51034BookFilter')queue()},true);addEventListener('pageshow',queue);addEventListener('resize',queue);
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();