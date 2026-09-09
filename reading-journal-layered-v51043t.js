(()=>{'use strict';
if(window.__v51043LayeredT)return;window.__v51043LayeredT=true;
const V='51043t';
const A=n=>`./${n}?v=${V}`;
const addImg=(p,cls,src)=>{if(!p||p.querySelector('.'+cls))return;const i=document.createElement('img');i.className=cls+' v51043-art-layer';i.alt='';i.setAttribute('aria-hidden','true');i.src=A(src);p.prepend(i)};
function apply(){
 const shell=document.querySelector('.v51034-shell.v51043-mockup');const body=document.getElementById('v51034JournalBody');
 if(!shell||!body)return;
 shell.dataset.layeredJournal='t';
 document.querySelectorAll('.v51043-exact-skin,#v51043-exact-skin-css').forEach(n=>n.remove());
 const hero=body.querySelector('.v51034-overall-hero');
 addImg(hero,'v51043-stats-paper','journal-layer-stats-paper-v51043t.svg');
 addImg(hero,'v51043-stats-flora-l','journal-botanical-corner-v51041.svg');
 addImg(hero,'v51043-stats-flora-r','journal-botanical-corner-v51041.svg');
 const feat=body.querySelector('.v51034-feature-row');
 addImg(feat,'v51043-highlights-paper','journal-layer-highlights-paper-v51043t.svg');
 addImg(feat,'v51043-highlights-flora-l','journal-botanical-corner-v51041.svg');
 addImg(feat,'v51043-highlights-flora-r','journal-botanical-corner-v51041.svg');
 addImg(feat,'v51043-highlights-bookmark','journal-layer-bookmark-v51043t.svg');
 const ribbon=body.querySelector('.v51034-ribbon');
 addImg(ribbon,'v51043-ribbon-art','journal-layer-timeline-ribbon-v51043t.svg');
 body.querySelectorAll('.v51034-entry-main').forEach((card,idx)=>{
   addImg(card,'v51043-slip-paper','journal-layer-slip-v51043t.svg');
   addImg(card,'v51043-slip-tab','journal-layer-book-tab-v51043t.svg');
   addImg(card,'v51043-slip-flora','journal-botanical-corner-v51041.svg');
   const src=card.querySelector('.v51034-entry-source');
   if(src){
     src.style.setProperty('--wax',`url("${A(idx%2?'journal-layer-wax-blue-v51043t.svg':'journal-layer-wax-red-v51043t.svg')}")`);
   }
 });
 const footer=body.querySelector('.v51034-footer-art');
 if(footer){footer.style.background='none';addImg(footer,'v51043-footer-art-layer','journal-layer-footer-v51043t.svg')}
 const badge=document.getElementById('headerVersionText');if(badge)badge.textContent='v5.10.43';
}
const css=document.createElement('style');css.id='v51043-layered-t-css';css.textContent=`
.v51034-shell.v51043-mockup[data-layered-journal="t"]{height:auto!important;min-height:0!important;max-height:none!important;padding-bottom:0!important;overflow:visible!important;background:transparent!important}
.v51034-shell.v51043-mockup[data-layered-journal="t"] #v51034JournalBody{height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;padding:0 7px!important;margin:0!important;background:transparent!important}
.v51043-art-layer{position:absolute!important;display:block!important;pointer-events:none!important;user-select:none!important;-webkit-user-drag:none!important;z-index:0!important}
.v51034-overall-hero,.v51034-feature-row,.v51034-ribbon,.v51034-entry-main,.v51034-footer-art{position:relative!important;isolation:isolate!important;background:none!important;border:0!important;box-shadow:none!important}
.v51034-overall-hero>*:not(.v51043-art-layer),.v51034-feature-row>*:not(.v51043-art-layer),.v51034-ribbon>*:not(.v51043-art-layer),.v51034-entry-main>*:not(.v51043-art-layer),.v51034-footer-art>*:not(.v51043-art-layer){position:relative!important;z-index:5!important}

/* stats layers */
.v51034-overall-hero{aspect-ratio:1200/420!important;padding:5.5% 5% 4%!important;display:grid!important;grid-template-columns:1fr 1fr!important;grid-template-rows:1fr 1fr!important;gap:0!important;margin:0!important}
.v51043-stats-paper{inset:0!important;width:100%!important;height:100%!important;object-fit:fill!important}
.v51043-stats-flora-l,.v51043-stats-flora-r{width:16%!important;height:auto!important;bottom:1%!important;opacity:.62!important;z-index:2!important}
.v51043-stats-flora-l{left:0!important}.v51043-stats-flora-r{right:0!important;transform:scaleX(-1)!important}
.v51034-stat-pill{display:grid!important;grid-template-columns:28% 1fr!important;grid-template-rows:auto auto auto!important;align-content:center!important;column-gap:4%!important;padding:4% 8%!important;background:none!important;border:0!important;box-shadow:none!important;min-height:0!important}
.v51034-stat-pill:before{grid-row:1/4!important;align-self:center!important;justify-self:center!important;position:static!important;transform:none!important;width:76%!important;aspect-ratio:1!important;background-size:68% 68%!important}
.v51034-stat-pill b,.v51034-stat-pill strong,.v51034-stat-pill span,.v51034-stat-pill small{position:relative!important;z-index:6!important}

/* highlight layers */
.v51034-feature-row{aspect-ratio:1200/360!important;padding:5% 5.5%!important;display:grid!important;grid-template-columns:1fr 1fr!important;grid-template-rows:1fr 1fr!important;margin:1% 0 0!important;gap:0!important}
.v51043-highlights-paper{inset:0!important;width:100%!important;height:100%!important;object-fit:fill!important}
.v51043-highlights-flora-l,.v51043-highlights-flora-r{width:17%!important;height:auto!important;bottom:0!important;opacity:.62!important;z-index:2!important}
.v51043-highlights-flora-l{left:0!important}.v51043-highlights-flora-r{right:0!important;transform:scaleX(-1)!important}
.v51043-highlights-bookmark{right:4.5%!important;top:-2%!important;width:8.5%!important;height:48%!important;z-index:3!important}
.v51034-feature{padding:4% 9%!important;background:none!important;border:0!important;box-shadow:none!important;align-self:stretch!important;display:flex!important;flex-direction:column!important;justify-content:center!important;min-width:0!important}
.v51034-feature:before,.v51034-feature:after{display:none!important}

/* ribbon is its own image layer */
.v51034-ribbon{height:auto!important;min-height:0!important;aspect-ratio:1000/180!important;margin:1.4% auto .4%!important;width:76%!important;display:grid!important;place-items:center!important;padding:0!important;overflow:visible!important}
.v51043-ribbon-art{inset:0!important;width:100%!important;height:100%!important;object-fit:contain!important}
.v51034-ribbon:before,.v51034-ribbon:after{display:none!important}
.v51034-ribbon>*:not(.v51043-art-layer){z-index:6!important}

/* timeline slips as independent layers */
.v51034-entry-main{height:auto!important;min-height:0!important;aspect-ratio:1100/190!important;margin:.5% 0 1.2%!important;padding:2.4% 23% 2.2% 10.5%!important;display:flex!important;flex-direction:column!important;justify-content:center!important;background:none!important;clip-path:none!important;overflow:visible!important}
.v51034-entry-main:before,.v51034-entry-main:after{display:none!important}
.v51043-slip-paper{inset:0!important;width:100%!important;height:100%!important;object-fit:fill!important;z-index:0!important}
.v51043-slip-tab{left:1.2%!important;top:8%!important;width:8.3%!important;height:84%!important;object-fit:fill!important;z-index:2!important}
.v51043-slip-flora{right:4.5%!important;bottom:4%!important;width:16%!important;height:82%!important;object-fit:contain!important;transform:scaleX(-1)!important;opacity:.55!important;z-index:2!important}
.v51034-entry-title{font-size:clamp(13px,3.4vw,20px)!important;line-height:1.03!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;max-width:100%!important;margin:0!important}
.v51034-entry-meta,.v51034-entry-pages{font-size:clamp(10px,2.5vw,14px)!important;line-height:1.05!important;margin-top:.3em!important}
.v51034-entry-source{position:absolute!important;right:3.3%!important;top:50%!important;transform:translateY(-50%)!important;width:15.5%!important;aspect-ratio:1!important;border:0!important;border-radius:0!important;background:var(--wax) center/contain no-repeat!important;display:grid!important;place-items:center!important;padding:17%!important;box-sizing:border-box!important;color:#fff4df!important;text-align:center!important;font:600 clamp(8px,2vw,12px)/1.05 Georgia,serif!important;z-index:7!important;box-shadow:none!important}

/* footer is a discrete ending layer; no parchment tail */
.v51034-footer-art{width:calc(100% + 14px)!important;margin:0 -7px!important;aspect-ratio:1200/260!important;min-height:0!important;height:auto!important;padding:0!important}
.v51043-footer-art-layer{inset:0!important;width:100%!important;height:100%!important;object-fit:fill!important}
.v51034-footer-art:before,.v51034-footer-art:after{display:none!important}
.v51034-shell.v51043-mockup[data-layered-journal="t"] #v51034JournalBody:after{display:none!important}
`;
document.head.appendChild(css);
function queue(){apply();[80,220,650,1400].forEach(ms=>setTimeout(apply,ms))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});else queue();
document.addEventListener('change',e=>{if(e.target?.id==='v51034BookFilter')queue()});
document.addEventListener('click',e=>{if(e.target.closest?.('[data-journal-book],#v51034JournalLaunch,#v51034LibraryJournalLaunch'))queue()});
window.addEventListener('pageshow',queue);
})();