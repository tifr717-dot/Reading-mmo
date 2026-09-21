(()=>{'use strict';
if(window.__v51045JetpackHome)return;window.__v51045JetpackHome=1;
const BUILD='v5.10.45-jetpack-empty-01';
const PARTS=[['hero','home-v51045-hero-rank.b64.txt'],['reading','home-v51045-currently-reading.b64.txt'],['stats','home-v51045-stats.b64.txt'],['progress','home-v51045-progress-challenges.b64.txt'],['footer','home-v51045-footer-navigation.b64.txt']];
const $=id=>document.getElementById(id);
function css(){if($('v51045JetpackStyle'))return;const s=document.createElement('style');s.id='v51045JetpackStyle';s.textContent=`
body.v51045-home-active header,body.v51045-home-active .bottomnav{display:none!important}
#home.v51045-jetpack{padding:0!important;background:#1b0d09!important;overflow-x:hidden!important}
#home.v51045-jetpack>*:not(#v51045JetpackHome){display:none!important}
#v51045JetpackHome{width:100%;max-width:600px;margin:0 auto;background:#1b0d09;line-height:0}
.v51045-jp-section{position:relative;width:100%;line-height:0}.v51045-jp-art{display:block;width:100%;height:auto;margin:0;padding:0}
.v51045-live-slot{position:absolute;z-index:4;box-sizing:border-box;pointer-events:none;color:transparent;background:transparent}
.v51045-level-slot{left:12.5%;top:49%;width:16%;height:20%}.v51045-rank-slot{left:30%;top:48%;width:53%;height:22%}
.v51045-book-title-slot{left:29%;top:20%;width:55%;height:13%}.v51045-book-author-slot{left:29%;top:34%;width:55%;height:11%}.v51045-book-series-slot{left:29%;top:46%;width:55%;height:11%}.v51045-book-progress-slot{left:29%;top:68%;width:55%;height:14%}
.v51045-stat-slot{top:39%;width:17%;height:23%}.v51045-stat1{left:9%}.v51045-stat2{left:30%}.v51045-stat3{left:51%}.v51045-stat4{left:72%}
.v51045-daily-slot{left:10%;top:36%;width:35%;height:36%}.v51045-challenges-slot{left:56%;top:34%;width:35%;height:42%}
.v51045-nav{position:absolute;z-index:6;bottom:0;height:38%;border:0;background:transparent;padding:0;margin:0;-webkit-tap-highlight-color:transparent}.v51045-nav.home{left:0;width:20%}.v51045-nav.read{left:20%;width:20%}.v51045-nav.quests{left:40%;width:20%}.v51045-nav.journal{left:60%;width:20%}.v51045-nav.me{left:80%;width:20%}
.v51045-jp-error{padding:24px;color:#f4dfbd;background:#2d1711;font:700 12px/1.5 system-ui,sans-serif;line-height:1.5}
`;document.head.appendChild(s)}
async function src(file){const r=await fetch('./'+file+'?v=51045jp1',{cache:'no-store'});if(!r.ok)throw Error(file+' '+r.status);const b=(await r.text()).trim();if(b.length<1000)throw Error(file+' incomplete');return'data:image/webp;base64,'+b}
function slot(cls,name){return'<div class="v51045-live-slot '+cls+'" data-live-slot="'+name+'" aria-hidden="true"></div>'}
function nav(){return'<button class="v51045-nav home" aria-label="Home"></button><button class="v51045-nav read" aria-label="Read"></button><button class="v51045-nav quests" aria-label="Quests"></button><button class="v51045-nav journal" aria-label="Journal"></button><button class="v51045-nav me" aria-label="Me"></button>'}
function go(name){try{if(name==='home')return;if(name==='journal'&&typeof window.openReadingJournal==='function')return window.openReadingJournal();if(typeof window.go==='function')return window.go(name)}catch(e){console.error('[v51045 jetpack nav]',e)}}
function chrome(){const h=$('home');if(!h)return;const c=getComputedStyle(h);document.body.classList.toggle('v51045-home-active',c.display!=='none'&&c.visibility!=='hidden'&&!h.hidden)}
async function mount(){const home=$('home');if(!home)return;css();home.classList.add('v51045-jetpack');let root=$('v51045JetpackHome');if(root){chrome();return}root=document.createElement('div');root.id='v51045JetpackHome';root.innerHTML=`
<section class="v51045-jp-section" data-layer="hero"><img class="v51045-jp-art" alt="">${slot('v51045-level-slot','level')}${slot('v51045-rank-slot','rank-exp')}</section>
<section class="v51045-jp-section" data-layer="reading"><img class="v51045-jp-art" alt="">${slot('v51045-book-title-slot','book-title')}${slot('v51045-book-author-slot','book-author')}${slot('v51045-book-series-slot','book-series')}${slot('v51045-book-progress-slot','book-progress')}</section>
<section class="v51045-jp-section" data-layer="stats"><img class="v51045-jp-art" alt="">${slot('v51045-stat-slot v51045-stat1','books-read')}${slot('v51045-stat-slot v51045-stat2','pages-read')}${slot('v51045-stat-slot v51045-stat3','days-read')}${slot('v51045-stat-slot v51045-stat4','streak')}</section>
<section class="v51045-jp-section" data-layer="progress"><img class="v51045-jp-art" alt="">${slot('v51045-daily-slot','today-progress')}${slot('v51045-challenges-slot','today-challenges')}</section>
<section class="v51045-jp-section" data-layer="footer"><img class="v51045-jp-art" alt="">${nav()}</section>`;home.prepend(root);
try{const urls=await Promise.all(PARTS.map(x=>src(x[1])));PARTS.forEach((x,i)=>{root.querySelector('[data-layer="'+x[0]+'"] .v51045-jp-art').src=urls[i]})}catch(e){root.innerHTML='<div class="v51045-jp-error">Jetpack Home artwork package failed to load.</div>';console.error('[v51045 jetpack]',e);return}
root.querySelector('.read').onclick=()=>go('reading');root.querySelector('.quests').onclick=()=>go('quests');root.querySelector('.journal').onclick=()=>go('journal');root.querySelector('.me').onclick=()=>go('profile');chrome()}
const oldGo=window.go;if(typeof oldGo==='function')window.go=function(){const r=oldGo.apply(this,arguments);setTimeout(chrome,0);return r};
setInterval(chrome,300);setTimeout(mount,50);setTimeout(mount,500);
})();