(()=>{'use strict';
if(window.__v51045HomeLevelOnly)return;window.__v51045HomeLevelOnly=1;
const BUILD='v5.10.45-home-reader-xp-artbars1';
const MASTER='./home-v51045-master-clean-level.webp?v=51045artbars1';
const $=id=>document.getElementById(id);

function style(){
  if($('v51045LevelOnlyStyle'))return;
  const s=document.createElement('style');
  s.id='v51045LevelOnlyStyle';
  s.textContent=
    "html,body{overscroll-behavior:none;background:#160907!important}"+
    "body.v51045-home-active header,body.v51045-home-active .bottomnav{display:none!important}"+
    "#home.v51045-level-only-home{display:block!important;padding:0!important;margin:0!important;background:#160907!important;overflow:hidden!important;min-height:0!important}"+
    "#home.v51045-level-only-home>*:not(#v51045LevelOnlyHome){display:none!important}"+
    "#v51045LevelOnlyHome{position:relative;width:100%;height:100dvh;margin:0 auto;background:#160907;overflow:hidden;opacity:0}"+
    "#v51045LevelOnlyHome.v51045-ready{opacity:1}"+
    ".v51045-stage{position:relative;width:100%;height:100%;overflow:hidden;background:#160907}"+
    ".v51045-canvas{position:absolute;top:0;left:50%;width:max(100%,calc(100dvh * 2 / 3));aspect-ratio:2/3;transform:translateX(-50%);transform-origin:top center}"+
    ".v51045-master{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:fill;z-index:1;pointer-events:none}"+
    ".v51045-level-number{position:absolute;z-index:4;left:34.25%;top:32.15%;width:9.5%;transform:translate(-50%,-50%);text-align:center;color:#3b2117;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:clamp(20px,5vw,34px);line-height:1;text-shadow:0 1px rgba(255,244,216,.55);pointer-events:none}"+
    ".v51045-rank-frame{position:absolute;z-index:3;left:53.35%;top:28.95%;width:29.5%;height:auto;transform:translate(-50%,-50%);display:block;pointer-events:none}"+
    ".v51045-rank-text{position:absolute;z-index:4;left:53.35%;top:28.95%;width:22%;transform:translate(-50%,-50%);text-align:center;color:#3b2117;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:clamp(15px,3.15vw,22px);line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px rgba(255,244,216,.55);pointer-events:none}"+
    ".v51045-exp-art{position:absolute;z-index:3;left:53.2%;top:31.55%;width:25.8%;aspect-ratio:6.3/1;transform:translate(-50%,-50%);pointer-events:none}"+
    ".v51045-exp-art img{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:fill;z-index:1}"+
    ".v51045-exp-fill-clip{position:absolute;z-index:2;left:8.8%;right:8.8%;top:35%;height:30%;overflow:hidden;border-radius:999px}"+
    ".v51045-exp-fill{display:block;height:100%;width:0%;border-radius:999px;background:linear-gradient(180deg,#d7a0df 0%,#c17fce 48%,#9f5db3 100%);box-shadow:inset 0 1px rgba(255,255,255,.36),0 0 3px rgba(177,106,192,.18);transition:width .18s ease}"+
    ".v51045-xp-line{position:absolute;z-index:4;left:53.2%;top:33.62%;width:34%;transform:translate(-50%,-50%);text-align:center;color:#3b2117;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:clamp(9px,2.0vw,14px);line-height:1;white-space:nowrap;text-shadow:0 1px rgba(255,244,216,.55);pointer-events:none}"+
    ".v51045-error{position:absolute;z-index:12;left:8%;right:8%;top:12%;padding:10px;background:#3c2118;color:#f2d7a0;border:1px solid #b7863d;border-radius:8px;text-align:center;font:700 10px/1.4 ui-monospace,monospace}";
  document.head.appendChild(s);
}

function readerState(){
  try{
    if(
      typeof window.totalXp==='function' &&
      typeof window.levelFor==='function' &&
      typeof window.lvlXp==='function' &&
      typeof window.lvlNeed==='function'
    ){
      const total=Math.max(0,Number(window.totalXp())||0);
      const level=Math.max(1,Number(window.levelFor(total))||1);
      const curXp=Math.max(0,Number(window.lvlXp(total,level))||0);
      const needXp=Math.max(1,Number(window.lvlNeed(level))||1);
      let rank='';
      try{
        if(typeof window.rankFor==='function')rank=String(window.rankFor(level)||'');
      }catch(e){}
      return{
        level,
        rank,
        curXp,
        needXp,
        pct:Math.max(0,Math.min(100,(curXp/needXp)*100))
      };
    }
  }catch(e){}
  return null;
}

function renderReaderLevel(){
  const levelEl=$('v51045Level');
  const rankEl=$('v51045Rank');
  const fillEl=$('v51045ExpFill');
  const xpEl=$('v51045XpLine');
  const st=readerState();

  if(!st){
    if(levelEl)levelEl.textContent='';
    if(rankEl)rankEl.textContent='';
    if(fillEl)fillEl.style.width='0%';
    if(xpEl)xpEl.textContent='';
    return;
  }

  if(levelEl)levelEl.textContent=String(st.level);
  if(rankEl)rankEl.textContent=st.rank;
  if(fillEl)fillEl.style.width=st.pct+'%';
  if(xpEl)xpEl.textContent=
    st.curXp.toLocaleString()+' / '+st.needXp.toLocaleString()+' EXP';
}

function chrome(){
  const h=$('home');
  if(!h)return;
  document.body.classList.toggle('v51045-home-active',h.classList.contains('active')&&!h.hidden);
}

function reveal(root){
  root.classList.add('v51045-ready');
  renderReaderLevel();
  document.body.classList.remove('v51045-booting-home');
  document.body.classList.add('v51045-home-active','v51045-home-ready');
  const shell=$('v51045AppShell')||document.querySelector('.app');
  if(shell)shell.style.visibility='visible';
}

async function waitForArt(art){
  if(art.complete&&art.naturalWidth){
    if(art.decode){try{await art.decode()}catch(_){}}
    return;
  }
  await new Promise((resolve,reject)=>{
    art.addEventListener('load',resolve,{once:true});
    art.addEventListener('error',()=>reject(Error('clean Home WebP failed to load')),{once:true});
  });
  if(art.decode){try{await art.decode()}catch(_){}}
}

async function mount(){
  const home=$('home');
  if(!home)return;
  style();
  home.classList.add('v51045-level-only-home');

  let root=$('v51045LevelOnlyHome');
  if(root){renderReaderLevel();chrome();return}

  root=document.createElement('div');
  root.id='v51045LevelOnlyHome';
  root.dataset.build=BUILD;
  root.innerHTML='<div class="v51045-stage">'+
    '<div class="v51045-canvas">'+
      '<img id="v51045MasterArt" class="v51045-master" alt="">'+
      '<div id="v51045Level" class="v51045-level-number" aria-label="Reader level"></div>'+
      '<img class="v51045-rank-frame" src="./home-v51045-ornate-bar-frame.png?v=51045artbars1" alt="" aria-hidden="true">'+
      '<div id="v51045Rank" class="v51045-rank-text" aria-label="Reader rank"></div>'+
      '<div class="v51045-exp-art" aria-label="Reader experience progress">'+
        '<img src="./home-v51045-ornate-bar-frame.png?v=51045artbars1" alt="" aria-hidden="true">'+
        '<div class="v51045-exp-fill-clip"><i id="v51045ExpFill" class="v51045-exp-fill"></i></div>'+
      '</div>'+
      '<div id="v51045XpLine" class="v51045-xp-line" aria-label="Reader experience"></div>'+
    '</div>'+
    '<div id="v51045LevelOnlyError" class="v51045-error" hidden></div>'+
  '</div>';
  home.replaceChildren(root);

  const art=$('v51045MasterArt');
  art.src=MASTER;

  try{
    await waitForArt(art);
    reveal(root);
  }catch(e){
    console.error('[v51045 Home Reader XP]',e);
    const er=$('v51045LevelOnlyError');
    if(er){er.textContent='Home artwork failed to load.';er.hidden=false}
    reveal(root);
  }
}

mount();
document.addEventListener('DOMContentLoaded',mount,{once:true});

const bindLegacy=()=>{
  const oldGo=window.go;
  if(typeof oldGo==='function'&&!oldGo.__v51045Wrapped){
    const wrapped=function(){
      const r=oldGo.apply(this,arguments);
      setTimeout(()=>{chrome();renderReaderLevel()},0);
      return r;
    };
    wrapped.__v51045Wrapped=1;
    window.go=wrapped;
  }

  const oldRenderHome=window.renderHome;
  if(typeof oldRenderHome==='function'&&!oldRenderHome.__v51045Wrapped){
    const wrapped=function(){
      const r=oldRenderHome.apply(this,arguments);
      setTimeout(renderReaderLevel,0);
      return r;
    };
    wrapped.__v51045Wrapped=1;
    window.renderHome=wrapped;
  }
};

setInterval(()=>{try{bindLegacy();renderReaderLevel();chrome()}catch(e){}},500);
window.addEventListener('pageshow',()=>{mount();renderReaderLevel();chrome()});
})();