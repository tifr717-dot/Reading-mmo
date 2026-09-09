(()=>{'use strict';
if(window.__v51043CanvasV)return;window.__v51043CanvasV=true;
const V='51043v';
const PARTS=Array.from({length:12},(_,i)=>'journal-approved-lower-v51043q-part'+String(i+1).padStart(2,'0')+'.b64?v='+V);
let sourcePromise=null;
async function source(){
 if(sourcePromise)return sourcePromise;
 sourcePromise=(async()=>{
   const chunks=await Promise.all(PARTS.map(p=>fetch('./'+p,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(p);return r.text()})));
   const img=new Image();
   img.src='data:image/webp;base64,'+chunks.join('').replace(/\s+/g,'');
   await img.decode();
   return img;
 })();
 return sourcePromise;
}
function canvas(cls,w,h){
 const c=document.createElement('canvas');c.className=cls+' v51043-canvas-layer';c.width=w;c.height=h;c.setAttribute('aria-hidden','true');return c;
}
function crop(img,sx,sy,sw,sh,cls){
 const c=canvas(cls,sw,sh),x=c.getContext('2d');x.drawImage(img,sx,sy,sw,sh,0,0,sw,sh);return c;
}
function patchTexture(ctx,img,dx,dy,dw,dh,sx,sy,sw,sh){
 for(let y=dy;y<dy+dh;y+=sh)for(let x=dx;x<dx+dw;x+=sw)ctx.drawImage(img,sx,sy,Math.min(sw,dw-(x-dx)),Math.min(sh,dh-(y-dy)),x,y,Math.min(sw,dw-(x-dx)),Math.min(sh,dh-(y-dy)));
}
function removeOld(body){
 body.querySelectorAll('.v51043-art-layer,.v51043-raster-layer,.v51043-exact-skin,.v51043-bookmark-layer,.v51043-flower-layer,.v51043-canvas-layer').forEach(n=>n.remove());
}
function add(p,n){p?.prepend(n)}
async function build(){
 const shell=document.querySelector('.v51034-shell.v51043-mockup'),body=document.getElementById('v51034JournalBody');if(!shell||!body)return;
 shell.dataset.canvasJournal='v';removeOld(body);
 let img;try{img=await source()}catch(e){return}
 // Approved mockup source is 768x830. We use it as a sprite sheet, not as one flattened page.
 const stats=body.querySelector('.v51034-overall-hero');
 if(stats){
   const c=crop(img,0,0,768,175,'cv-stats-art'),ctx=c.getContext('2d');
   // erase old baked data areas with genuine parchment sampled from the same painterly artwork
   patchTexture(ctx,img,150,36,225,54,330,20,68,44);
   patchTexture(ctx,img,500,36,220,54,330,20,68,44);
   patchTexture(ctx,img,150,103,225,54,330,20,68,44);
   patchTexture(ctx,img,500,103,220,54,330,20,68,44);
   add(stats,c);
 }
 const feat=body.querySelector('.v51034-feature-row');
 if(feat){
   const c=crop(img,0,165,768,180,'cv-highlight-art'),ctx=c.getContext('2d');
   patchTexture(ctx,img,90,37,285,56,330,190,72,42);
   patchTexture(ctx,img,425,37,270,56,330,190,72,42);
   patchTexture(ctx,img,90,102,285,56,330,190,72,42);
   patchTexture(ctx,img,425,102,270,56,330,190,72,42);
   add(feat,c);
 }
 const ribbon=body.querySelector('.v51034-ribbon');
 if(ribbon)add(ribbon,crop(img,110,330,548,92,'cv-ribbon-art'));
 const entries=[...body.querySelectorAll('.v51034-entry-main')];
 const entryY=[405,500,595];
 entries.forEach((card,i)=>{
   const sy=entryY[Math.min(i,2)];
   const c=crop(img,118,sy,590,90,'cv-slip-art'),ctx=c.getContext('2d');
   // scrub only the live-data zone; keep painterly torn paper, tabs, flora and wax.
   patchTexture(ctx,img,120,sy+22,330,52,300,sy+15,62,38);
   add(card,c);
 });
 const footer=body.querySelector('.v51034-footer-art');
 if(footer)add(footer,crop(img,0,675,768,155,'cv-footer-art'));

 const badge=document.getElementById('headerVersionText');if(badge)badge.textContent='v5.10.43';
}
const s=document.createElement('style');s.id='v51043-canvas-v-css';s.textContent=`
.v51034-shell.v51043-mockup[data-canvas-journal="v"]{height:auto!important;min-height:0!important;max-height:none!important;padding-bottom:0!important;overflow:visible!important;background:transparent!important}
.v51034-shell.v51043-mockup[data-canvas-journal="v"] #v51034JournalBody{height:auto!important;min-height:0!important;overflow:visible!important;padding:0 7px!important;margin:0!important;background:transparent!important}
.v51043-canvas-layer{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;pointer-events:none!important;z-index:0!important}
.v51034-overall-hero,.v51034-feature-row,.v51034-ribbon,.v51034-entry-main,.v51034-footer-art{position:relative!important;isolation:isolate!important;background:none!important;border:0!important;box-shadow:none!important}
.v51034-overall-hero>*:not(.v51043-canvas-layer),.v51034-feature-row>*:not(.v51043-canvas-layer),.v51034-ribbon>*:not(.v51043-canvas-layer),.v51034-entry-main>*:not(.v51043-canvas-layer){position:relative!important;z-index:10!important}
.v51034-overall-hero{aspect-ratio:768/175!important;display:grid!important;grid-template-columns:1fr 1fr!important;grid-template-rows:1fr 1fr!important;gap:0!important;padding:2.5% 5.5%!important;margin:0!important}
.v51034-stat-pill{background:none!important;border:0!important;box-shadow:none!important;padding:4% 8% 4% 28%!important;display:flex!important;flex-direction:column!important;justify-content:center!important;align-items:flex-start!important}
.v51034-stat-pill:before{display:none!important}
.v51034-feature-row{aspect-ratio:768/180!important;display:grid!important;grid-template-columns:1fr 1fr!important;grid-template-rows:1fr 1fr!important;gap:0!important;padding:2.5% 6%!important;margin:0!important}
.v51034-feature{background:none!important;border:0!important;box-shadow:none!important;padding:4% 8%!important;display:flex!important;flex-direction:column!important;justify-content:center!important}
.v51034-feature:before,.v51034-feature:after{display:none!important}
.v51034-ribbon{width:76%!important;aspect-ratio:548/92!important;height:auto!important;margin:.8% auto .2%!important;padding:0!important;display:grid!important;place-items:center!important;background:none!important}
.v51034-ribbon:before,.v51034-ribbon:after{display:none!important}
.v51034-entry-main{aspect-ratio:590/90!important;height:auto!important;min-height:0!important;margin:.45% 0 .9%!important;padding:2.3% 23% 2.2% 12%!important;display:flex!important;flex-direction:column!important;justify-content:center!important;background:none!important;clip-path:none!important;overflow:visible!important}
.v51034-entry-main:before,.v51034-entry-main:after{display:none!important}
.v51034-entry-title{font-size:clamp(13px,3.25vw,19px)!important;line-height:1.02!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;margin:0!important}
.v51034-entry-pages,.v51034-entry-meta{font-size:clamp(10px,2.35vw,14px)!important;line-height:1!important}
.v51034-entry-source{position:absolute!important;right:4.2%!important;top:50%!important;transform:translateY(-50%)!important;width:14.8%!important;aspect-ratio:1!important;background:none!important;border:0!important;box-shadow:none!important;display:grid!important;place-items:center!important;color:#fff4df!important;text-align:center!important;padding:18%!important;font:600 clamp(8px,1.9vw,11px)/1.05 Georgia,serif!important;z-index:12!important}
.v51034-footer-art{width:calc(100% + 14px)!important;margin:0 -7px!important;aspect-ratio:768/155!important;height:auto!important;min-height:0!important;background:none!important;overflow:hidden!important}
.v51034-footer-art:before,.v51034-footer-art:after{display:none!important}
.v51034-shell.v51043-mockup[data-canvas-journal="v"] #v51034JournalBody:after{display:none!important}
`;
document.head.appendChild(s);
function q(){build();[120,400,1100].forEach(ms=>setTimeout(build,ms))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',q,{once:true});else q();
document.addEventListener('change',e=>{if(e.target?.id==='v51034BookFilter')q()});
document.addEventListener('click',e=>{if(e.target.closest?.('[data-journal-book],#v51034JournalLaunch,#v51034LibraryJournalLaunch'))q()});
window.addEventListener('pageshow',q);
})();