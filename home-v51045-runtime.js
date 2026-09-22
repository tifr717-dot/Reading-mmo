(()=>{'use strict';
if(window.__v51045HomeBaseOnly)return;window.__v51045HomeBaseOnly=1;
const BUILD='v5.10.45-home-base-only';
const MASTER='home-v51045-master-base.b64.txt';
const $=id=>document.getElementById(id);

function style(){
  if($('v51045BaseOnlyStyle'))return;
  const s=document.createElement('style');
  s.id='v51045BaseOnlyStyle';
  s.textContent=
    "html,body{overscroll-behavior:none}"+
    "body.v51045-home-active header,body.v51045-home-active .bottomnav{display:none!important}"+
    "#home.v51045-base-only-home{padding:0!important;margin:0!important;background:#160907!important;overflow:hidden!important;min-height:0!important}"+
    "#home.v51045-base-only-home>*:not(#v51045BaseOnlyHome){display:none!important}"+
    "#v51045BaseOnlyHome{position:relative;width:100%;height:100dvh;margin:0 auto;background:#160907;overflow:hidden}"+
    ".v51045-stage{position:relative;width:100%;height:100%;overflow:hidden;background:#160907}"+
    ".v51045-canvas{position:absolute;top:0;left:50%;width:max(100%,calc(100dvh * 2 / 3));aspect-ratio:2/3;transform:translateX(-50%);transform-origin:top center}"+
    ".v51045-master{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:fill;z-index:1;pointer-events:none}"+
    ".v51045-error{position:absolute;z-index:12;left:8%;right:8%;top:12%;padding:10px;background:#3c2118;color:#f2d7a0;border:1px solid #b7863d;border-radius:8px;text-align:center;font:700 10px/1.4 ui-monospace,monospace}";
  document.head.appendChild(s);
}

async function masterUrl(){
  const r=await fetch('./'+MASTER+'?v=51045baseonly',{cache:'no-store'});
  if(!r.ok)throw Error(MASTER+' '+r.status);
  const b=(await r.text()).replace(/\s+/g,'');
  if(b.length<100000)throw Error(MASTER+' incomplete');
  return'data:image/webp;base64,'+b;
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
  home.classList.add('v51045-base-only-home');

  let root=$('v51045BaseOnlyHome');
  if(root){chrome();return}

  root=document.createElement('div');
  root.id='v51045BaseOnlyHome';
  root.dataset.build=BUILD;
  root.innerHTML='<div class="v51045-stage">'+
    '<div class="v51045-canvas">'+
      '<img id="v51045MasterArt" class="v51045-master" alt="">'+
    '</div>'+
    '<div id="v51045BaseOnlyError" class="v51045-error" hidden></div>'+
  '</div>';

  home.prepend(root);

  try{
    $('v51045MasterArt').src=await masterUrl();
  }catch(e){
    console.error('[v51045 Home Base Only]',e);
    const er=$('v51045BaseOnlyError');
    if(er){er.textContent='Home master artwork failed to load. Refresh once staging finishes.';er.hidden=false}
  }

  chrome();
}

const oldGo=window.go;
if(typeof oldGo==='function')window.go=function(){
  const r=oldGo.apply(this,arguments);
  setTimeout(chrome,0);
  return r;
};

setTimeout(mount,80);
setTimeout(mount,600);
setTimeout(mount,1600);
window.addEventListener('pageshow',()=>{mount();chrome()});
})();