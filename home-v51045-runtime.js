(()=>{'use strict';
if(window.__v51045HomeLayer01)return;window.__v51045HomeLayer01=1;
const BUILD='v5.10.45-home-layer-01';
const BASE_PARTS=['home-v51045-clean-base-01.txt','home-v51045-clean-base-02.txt'];
const $=id=>document.getElementById(id);
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmt=v=>Math.max(0,Math.round(num(v))).toLocaleString();

function state(){
  try{return JSON.parse(localStorage.getItem('readingMMO_save_v2')||localStorage.getItem('readingMMO_save')||'null')||{}}
  catch(e){return{}}
}

function style(){
  if($('v51045Layer01Style'))return;
  const s=document.createElement('style');
  s.id='v51045Layer01Style';
  s.textContent=
    "body.v51045-home-active header,body.v51045-home-active .bottomnav{display:none!important}"+
    "#home.v51045-layer01-home{padding:0!important;margin:0!important;background:#160907!important;overflow:hidden!important;min-height:0!important}"+
    "#home.v51045-layer01-home>*:not(#v51045Layer01Home){display:none!important}"+
    "#v51045Layer01Home{width:100%;max-width:600px;margin:0 auto;background:#160907;color:#3b2117;font-family:Georgia,'Times New Roman',serif;line-height:1}"+
    ".v51045-stage{position:relative;width:100%;aspect-ratio:240/426;overflow:hidden;background:#160907}"+
    ".v51045-layers{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden}"+
    ".v51045-hero-art{position:absolute;left:0;top:0;width:100%;height:84.507%;object-fit:fill;display:block;pointer-events:none;clip-path:inset(0 0 61% 0)}"+
    ".v51045-live{position:absolute;z-index:4;box-sizing:border-box;pointer-events:none;color:#3b2117;text-shadow:0 1px rgba(255,244,216,.55)}"+
    ".v51045-level{left:34.6%;top:27.085%;width:13.2%;transform:translate(-50%,-50%);text-align:center;font-weight:900;font-size:clamp(15px,4.0vw,25px)}"+
    ".v51045-rank{left:53.1%;top:26.662%;width:31%;transform:translate(-50%,-50%);text-align:center;font-size:clamp(8px,1.95vw,12px);font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}"+
    ".v51045-xp-current{left:46.55%;top:28.056%;transform:translateX(-50%);font-size:clamp(7px,1.65vw,10px);font-weight:800;white-space:nowrap}"+
    ".v51045-xp-target{left:56.85%;top:28.056%;transform:translateX(-50%);font-size:clamp(7px,1.65vw,10px);font-weight:800;white-space:nowrap}"+
    ".v51045-expbar{position:absolute;z-index:3;left:36.82%;top:24.211%;width:31.84%;height:1.428%;overflow:hidden;border-radius:999px;background:rgba(225,207,239,.90);box-shadow:inset 0 0 0 1px rgba(80,44,91,.28);pointer-events:none}"+
    ".v51045-expbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#9a5bb1,#c489d1);border-radius:inherit}"+
    ".v51045-error{position:absolute;z-index:12;left:8%;right:8%;top:12%;padding:10px;background:#3c2118;color:#f2d7a0;border:1px solid #b7863d;border-radius:8px;text-align:center;font:700 10px/1.4 ui-monospace,monospace}";
  document.head.appendChild(s);
}

function rankFallback(l){
  if(l>=50)return'Master Archivist';
  if(l>=35)return'Grand Archivist';
  if(l>=25)return'Senior Archivist';
  if(l>=15)return'Archivist';
  return'Apprentice Archivist';
}

function xpValues(){
  try{
    if(typeof window.totalXp==='function'&&typeof window.levelFor==='function'){
      const xp=Math.max(0,num(window.totalXp()));
      const level=Math.max(1,num(window.levelFor(xp),1));
      const cur=typeof window.lvlXp==='function'?Math.max(0,num(window.lvlXp(xp,level))):xp;
      const need=typeof window.lvlNeed==='function'?Math.max(1,num(window.lvlNeed(level),1000)):1000;
      const rank=typeof window.rankFor==='function'?String(window.rankFor(level)||rankFallback(level)):rankFallback(level);
      return{xp,level,cur,need,rank};
    }
  }catch(e){}
  const s=state();
  const xp=Math.max(0,num(s.readerxp,s.pages));
  const level=Math.max(1,Math.floor(xp/1000)+1);
  return{xp,level,cur:xp%1000,need:1000,rank:rankFallback(level)};
}

function set(id,v){const e=$(id);if(e)e.textContent=v}

function render(){
  if(!$('v51045Layer01Home'))return;
  const x=xpValues();
  set('v51045Level',x.level);
  set('v51045Rank',x.rank);
  set('v51045XpCurrent',fmt(x.cur));
  set('v51045XpTarget',fmt(x.need));
  const fill=$('v51045ExpFill');
  if(fill)fill.style.width=clamp(x.cur/x.need*100,0,100)+'%';
}

async function b64(file,min=5000){
  const r=await fetch('./'+file+'?v=51045layer01',{cache:'no-store'});
  if(!r.ok)throw Error(file+' '+r.status);
  const b=(await r.text()).trim();
  if(b.length<min)throw Error(file+' incomplete');
  return b;
}

async function artUrl(){
  const parts=await Promise.all(BASE_PARTS.map(f=>b64(f)));
  return'data:image/webp;base64,'+parts.join('');
}

function heroImage(src){
  return new Promise((resolve,reject)=>{
    const im=new Image();
    im.className='v51045-hero-art';
    im.dataset.layer='hero-rank';
    im.alt='';
    im.onload=()=>resolve(im);
    im.onerror=()=>reject(Error('hero-rank decode failed'));
    im.src=src;
  });
}

function chrome(){
  const h=$('home');
  if(!h)return;
  const c=getComputedStyle(h);
  const active=c.display!=='none'&&c.visibility!=='hidden'&&!h.hidden;
  document.body.classList.toggle('v51045-home-active',active);
}

async function mount(){
  const home=$('home');
  if(!home)return;
  style();
  home.classList.add('v51045-layer01-home');

  let root=$('v51045Layer01Home');
  if(root){render();chrome();return}

  root=document.createElement('div');
  root.id='v51045Layer01Home';
  root.dataset.build=BUILD;
  root.innerHTML='<div class="v51045-stage">'+
    '<div id="v51045Layer01Stack" class="v51045-layers" aria-hidden="true"></div>'+
    '<div class="v51045-expbar"><i id="v51045ExpFill"></i></div>'+
    '<div id="v51045Level" class="v51045-live v51045-level"></div>'+
    '<div id="v51045Rank" class="v51045-live v51045-rank"></div>'+
    '<div id="v51045XpCurrent" class="v51045-live v51045-xp-current"></div>'+
    '<div id="v51045XpTarget" class="v51045-live v51045-xp-target"></div>'+
    '<div id="v51045Layer01Error" class="v51045-error" hidden></div>'+
    '</div>';

  home.prepend(root);

  try{
    const src=await artUrl();
    const hero=await heroImage(src);
    $('v51045Layer01Stack').replaceChildren(hero);
  }catch(e){
    console.error('[v51045 Home Layer 01]',e);
    const er=$('v51045Layer01Error');
    if(er){er.textContent='Home Layer 01 artwork failed to load. Refresh once staging finishes.';er.hidden=false}
  }

  render();
  chrome();
}

const oldGo=window.go;
if(typeof oldGo==='function')window.go=function(){
  const r=oldGo.apply(this,arguments);
  setTimeout(chrome,0);
  return r;
};

const oldRenderHome=window.renderHome;
if(typeof oldRenderHome==='function')window.renderHome=function(){
  const r=oldRenderHome.apply(this,arguments);
  setTimeout(render,0);
  return r;
};

setInterval(()=>{try{render();chrome()}catch(e){}},1000);
setTimeout(mount,80);
setTimeout(mount,600);
setTimeout(mount,1600);
window.addEventListener('pageshow',()=>{mount();chrome()});
})();