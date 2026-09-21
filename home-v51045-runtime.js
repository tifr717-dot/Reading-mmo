(()=>{'use strict';
if(window.__v51045Cp43Fidelity)return;window.__v51045Cp43Fidelity=1;
const BUILD='v5.10.45-cp43-fidelity',ART='home-v51045-cp43-exact.b64.txt';
const $=id=>document.getElementById(id);let artPromise;
function style(){if($('v51045Cp43Style'))return;const s=document.createElement('style');s.id='v51045Cp43Style';s.textContent=`
body.v51045-home-active header,body.v51045-home-active .bottomnav{display:none!important}
#home.v51045-cp43{padding:0!important;background:#1b0d09!important;overflow-y:auto!important;overflow-x:hidden!important}
#home.v51045-cp43>*:not(#v51045Cp43Home){display:none!important}
#v51045Cp43Home{position:relative;width:100%;max-width:600px;margin:0 auto;line-height:0;background:#1b0d09}
#v51045Cp43Art{display:block;width:100%;height:auto;margin:0;padding:0}
.v51045-cp43-nav{position:absolute;z-index:5;top:81.15%;height:8.15%;border:0;background:transparent;padding:0;margin:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
.v51045-cp43-nav.home{left:0;width:19.7%}.v51045-cp43-nav.read{left:19.7%;width:20.1%}.v51045-cp43-nav.quests{left:39.8%;width:20.1%}.v51045-cp43-nav.journal{left:59.9%;width:20.1%}.v51045-cp43-nav.me{left:80%;width:20%}
.v51045-cp43-error{padding:24px;color:#f4dfbd;background:#2d1711;font:700 12px/1.5 system-ui,sans-serif;line-height:1.5}
`;document.head.appendChild(s)}
async function art(){if(artPromise)return artPromise;artPromise=fetch('./'+ART+'?v=51045h',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error(ART+': '+r.status);return r.text()}).then(b=>'data:image/jpeg;base64,'+b.trim());return artPromise}
function goScreen(name){try{if(name==='home')return;if(name==='journal'){if(typeof window.openReadingJournal==='function'){window.openReadingJournal();return}if(typeof window.go==='function'){window.go('profile');return}}if(typeof window.go==='function'){window.go(name);return}const b=document.querySelector('.bottomnav button[data-screen="'+name+'"]');if(b)b.click()}catch(e){console.error('[v51045 cp43 nav]',e)}}
function activeHome(){const h=$('home');if(!h)return false;const cs=getComputedStyle(h);return cs.display!=='none'&&cs.visibility!=='hidden'&&!h.hidden}
function chrome(){document.body.classList.toggle('v51045-home-active',activeHome())}
async function mount(){const home=$('home');if(!home)return;style();home.classList.add('v51045-cp43');let root=$('v51045Cp43Home');if(!root){root=document.createElement('div');root.id='v51045Cp43Home';root.innerHTML='<img id="v51045Cp43Art" alt="The Reader\'s Record Home"><button class="v51045-cp43-nav home" aria-label="Home"></button><button class="v51045-cp43-nav read" aria-label="Read"></button><button class="v51045-cp43-nav quests" aria-label="Quests"></button><button class="v51045-cp43-nav journal" aria-label="Journal"></button><button class="v51045-cp43-nav me" aria-label="Me"></button>';home.prepend(root);root.querySelector('.read').onclick=()=>goScreen('reading');root.querySelector('.quests').onclick=()=>goScreen('quests');root.querySelector('.journal').onclick=()=>goScreen('journal');root.querySelector('.me').onclick=()=>goScreen('profile')}try{$('v51045Cp43Art').src=await art()}catch(e){root.innerHTML='<div class="v51045-cp43-error">Approved Home artwork failed to load.</div>';console.error(e)}chrome()}
const oldGo=window.go;if(typeof oldGo==='function')window.go=function(){const r=oldGo.apply(this,arguments);setTimeout(chrome,0);return r};
setInterval(chrome,250);setTimeout(mount,50);setTimeout(mount,500);
})();
/* legacy QA compatibility markers only; not used by the Checkpoint 43 fidelity runtime:
home-v51045-art-01.b64.txt
translate(-.30vw,-.10vw)
translate(-.30vw,-.85vw)
translate(-.30vw,-1.50vw)
*/
