(()=>{'use strict';
if(window.__v51044Loader)return;window.__v51044Loader=1;
const P=["reading-journal-v51044-runtime-01.txt","reading-journal-v51044-runtime-02.txt","reading-journal-v51044-runtime-03.txt"];
function add(src,key){if(document.querySelector(`script[data-${key}]`))return;const s=document.createElement('script');s.src=src;s.dataset[key]='1';s.async=false;document.head.appendChild(s)}

Promise.all(P.map(n=>fetch(`./${n}?v=51044`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`${n} ${r.status}`);return r.text()})))
.then(parts=>{(0,eval)(parts.join(''));})
.catch(err=>{console.error('[journal 51044] runtime load failed',err);window.__v51044Loader=0;})
.finally(()=>add('./simplified-redesign-v51045.js?v=51045structural','v51045Simplified'));
})();