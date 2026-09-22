(()=>{'use strict';
if(window.__v51045HomeLevelOnly)return;window.__v51045HomeLevelOnly=1;
const BUILD='v5.10.45-home-level-only-ready';
const MASTER='home-v51045-master-clean-level.b64.txt';
const $=id=>document.getElementById(id);

function style(){
  if($('v51045LevelOnlyStyle'))return;
  const s=document.createElement('style');
  s.id='v51045LevelOnlyStyle';
  s.textContent=
    "html,body{overscroll-behavior:none}"+
    "body.v51045-home-active header,body.v51045-home-active .bottomnav{display:none!important}"+
    "#home.v51045-level-only-home{padding:0!important;margin:0!important;background:#160907!important;overflow:hidden!important;min-height:0!important}"+
    "#home.v51045-level-only-home>*:not(#v51045LevelOnlyHome){display:none!important}"+
    "#v51045LevelOnlyHome{position:relative;width:100%;height:100dvh;margin:0 auto;background:#160907;overflow:hidden;opacity:0;transition:opacity .12s ease}"+"#v51045LevelOnlyHome.v51045-ready{opacity:1}"+
    ".v51045-stage{position:relative;width:100%;height:100%;overflow:hidden;background:#160907}"+
    ".v51045-canvas{position:absolute;top:0;left:50%;width:max(100%,calc(100dvh * 2 / 3));aspect-ratio:2/3;transform:translateX(-50%);transform-origin:top center}"+
    ".v51045-master{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:fill;z-index:1;pointer-events:none}"+
    ".v51045-level-number{position:absolute;z-index:4;left:34.25%;top:32.15%;width:9.5%;transform:translate(-50%,-50%);text-align:center;color:#3b2117;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:clamp(20px,5vw,34px);line-height:1;text-shadow:0 1px rgba(255,244,216,.55);pointer-events:none}"+
    ".v51045-error{position:absolute;z-index:12;left:8%;right:8%;top:12%;padding:10px;background:#3c2118;color:#f2d7a0;border:1px solid #b7863d;border-radius:8px;text-align:center;font:700 10px/1.4 ui-monospace,monospace}";
  document.head.appendChild(s);
}

async function masterUrl(){
  const r=await fetch('./'+MASTER+'?v=51045levelready',{cache:'no-store'});
  if(!r.ok)throw Error(MASTER+' '+r.status);
  const b=(await r.text()).replace(/\s+/g,'');
  if(b.length<100000)throw Error(MASTER+' incomplete');
  return'data:image/webp;base64,'+b;
}

function currentLevel(){
  try{
    if(typeof window.totalXp==='function'&&typeof window.levelFor==='function'){
      return Math.max(1,Number(window.levelFor(Math.max(0,Number(window.totalXp())||0)))||1);
    }
  }catch(e){}
  try{
    const raw=localStorage.getItem('readingMMO_save_v2')||localStorage.getItem('readingMMO_save');
    const s=raw?JSON.parse(raw):null;
    if(s){
      const xp=Math.max(0,Number(s.readerxp)||Number(s.pages)||0);
      return Math.max(1,Math.floor(xp/1000)+1);
    }
  }catch(e){}
  return 1;
}

function renderLevel(){
  const el=$('v51045Level');
  if(el)el.textContent=String(currentLevel());
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
  home.classList.add('v51045-level-only-home');

  let root=$('v51045LevelOnlyHome');
  if(root){renderLevel();chrome();return}

  root=document.createElement('div');
  root.id='v51045LevelOnlyHome';
  root.dataset.build=BUILD;
  root.innerHTML='<div class="v51045-stage">'+
    '<div class="v51045-canvas">'+
      '<img id="v51045MasterArt" class="v51045-master" alt="">'+
      '<div id="v51045Level" class="v51045-level-number" aria-label="Reader level"></div>'+
    '</div>'+
    '<div id="v51045LevelOnlyError" class="v51045-error" hidden></div>'+
  '</div>';

  home.prepend(root);

  try{
    const art=$('v51045MasterArt');art.src=await masterUrl();if(art.decode){try{await art.decode()}catch(_){}}root.classList.add('v51045-ready');
  }catch(e){
    console.error('[v51045 Home Level Only]',e);
    const er=$('v51045LevelOnlyError');
    if(er){er.textContent='Home artwork failed to load. Refresh once staging finishes.';er.hidden=false}
  }

  renderLevel();
  chrome();
}

const oldGo=window.go;
if(typeof oldGo==='function')window.go=function(){
  const r=oldGo.apply(this,arguments);
  setTimeout(()=>{chrome();renderLevel()},0);
  return r;
};

const oldRenderHome=window.renderHome;
if(typeof oldRenderHome==='function')window.renderHome=function(){
  const r=oldRenderHome.apply(this,arguments);
  setTimeout(renderLevel,0);
  return r;
};

setInterval(()=>{try{renderLevel();chrome()}catch(e){}},1000);
setTimeout(mount,80);
setTimeout(mount,600);
setTimeout(mount,1600);
window.addEventListener('pageshow',()=>{mount();renderLevel();chrome()});
})();