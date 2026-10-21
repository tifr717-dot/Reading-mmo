(()=>{
'use strict';
if(window.__v51045SimplifiedRedesign)return;
window.__v51045SimplifiedRedesign=true;
const BUILD='v5.10.45-test',$=id=>document.getElementById(id);
const TARGETS=[15,20,25,30,35,40,50],NAMES=['A Few More Pages','Turn the Page','Chapter Wander','Quiet Reading Quest','One More Chapter','Into the Story','Pagekeeper Challenge'];

function stamp(){
 const b=$('headerVersionText');if(b&&b.textContent!==BUILD)b.textContent=BUILD;
 window.__readingMmoVersionOwner=BUILD;
 document.querySelectorAll('.health-row').forEach(r=>{if(r.querySelector('b')?.textContent.trim()==='Version'){const v=r.querySelector('span');if(v&&v.textContent!==BUILD)v.textContent=BUILD}});
}
function style(){
 if($('v51045-simplified-style'))return;
 const s=document.createElement('style');s.id='v51045-simplified-style';s.textContent=`
 :root{--jink:#3d281d;--jpaper:#ead7aa;--jpaper2:#d6bb83;--jwood:#2b170f;--jgold:#b7863d;--jpurple:#6d4b86;--jcream:#f7e8bd}
 body{background:#160d09!important}
 .app{background:linear-gradient(180deg,#24130e,#120907)!important}
 header{background:linear-gradient(180deg,#3d2117,#21110c)!important;border-bottom:2px solid #b7863d!important;box-shadow:0 5px 14px rgba(0,0,0,.38)!important}
 header h1{font-family:Georgia,'Times New Roman',serif!important;letter-spacing:1.4px!important;color:#f1d79e!important}
 header .sub{color:#bca47a!important;font-family:Georgia,'Times New Roman',serif!important}
 .screen:not(#adventure):not(#world):not(#bag){background:radial-gradient(circle at 50% 0%,rgba(255,244,202,.16),transparent 26%),linear-gradient(180deg,#3b2418 0 52px,#25140e 52px 100%)!important;border-left:0!important;border-right:0!important;box-shadow:none!important}
 .screen:not(#home):not(#library):not(#adventure):not(#world):not(#bag){padding-top:12px!important}
 #adventure,#world,#bag{display:none!important}
 .bottomnav{background:linear-gradient(180deg,#3a2116,#20100b)!important;border-top:1px solid #b7863d!important;box-shadow:0 -4px 14px rgba(0,0,0,.42)!important}
 .bottomnav button{font-family:Georgia,'Times New Roman',serif!important;color:#d9c49a!important}
 .bottomnav button.active{color:#fff0c5!important;background:linear-gradient(180deg,rgba(109,75,134,.5),rgba(65,41,76,.3))!important}
 .bottomnav button[data-screen="journal"]:before{background-image:url('./asset-scroll.png')!important;background-size:24px!important}
 #profile .v593-profile-tabs button[data-v51045-hidden="1"]{display:none!important}
 #profile .v593-profile-tabs{grid-template-columns:repeat(4,1fr)!important}
 #reading .v597-adventure-hud{display:none!important}
 #v51045LegacyQuestsWrap{display:none!important}
 .v51045-page-title{position:relative;margin:2px auto 12px;max-width:560px;padding:12px 46px 11px;text-align:center;background:linear-gradient(180deg,#ead9ae,#d9bf8a);border:1px solid #9b6d36;box-shadow:0 4px 0 #170a06,inset 0 0 0 3px rgba(255,247,214,.25);color:#4a2d1c;font:900 14px/1 Georgia,'Times New Roman',serif;letter-spacing:.8px}
 .v51045-page-title:before,.v51045-page-title:after{content:'❧';position:absolute;top:50%;transform:translateY(-50%);color:#76528c;font-size:19px}.v51045-page-title:before{left:16px}.v51045-page-title:after{right:16px;transform:translateY(-50%) scaleX(-1)}
 .v51045-page-title small{display:block;margin-top:5px;color:#765d43;font:700 6.2px/1.3 ui-monospace,monospace;letter-spacing:.35px}
 #home.v58-home{padding:9px 9px 96px!important;background:radial-gradient(circle at 50% 7%,rgba(238,211,154,.14),transparent 30%),linear-gradient(180deg,#332017,#1b0e0a)!important}
 #home .v58-stage{max-width:620px;margin:0 auto;padding:9px 8px 13px;background:linear-gradient(180deg,#ead8ae,#d7bc87)!important;border:2px solid #8d6035!important;outline:1px solid #c79650;outline-offset:-6px;box-shadow:0 9px 18px rgba(0,0,0,.34)!important}
 #home .v58-frame{opacity:.26!important;filter:sepia(.25) saturate(.72)!important}
 #home .v58-tabs{position:relative!important;z-index:4!important;margin:3px 4px 8px!important;padding:4px!important;background:#3b2418!important;border:1px solid #916638!important;border-radius:0!important}
 #home .v58-tab{font-family:Georgia,'Times New Roman',serif!important;color:#ceb98f!important}
 #home .v58-tab.active{color:#fff0c4!important}
 #home .v58-panel-zone{position:relative!important;z-index:3!important;background:rgba(255,246,213,.28)!important;border:1px solid rgba(123,82,44,.42)!important;box-shadow:inset 0 0 22px rgba(95,57,27,.08)!important}
 #home .v58-panel-zone:before{content:'THE READER’S LEDGER';display:block;padding:9px 10px 7px;text-align:center;color:#583823;border-bottom:1px solid rgba(123,82,44,.35);font:900 9px/1 Georgia,'Times New Roman',serif;letter-spacing:1.1px}
 #home .v58-utils{position:relative!important;z-index:4!important;margin-top:8px!important}
 #home .v58-util button{font-family:Georgia,'Times New Roman',serif!important}
 #reading .v591-read-stage,#profile .v593-profile-stage{max-width:620px;margin:0 auto}
 #reading .v591-read-plaque,#profile .v593-profile-heading{background:linear-gradient(180deg,#ead9ae,#d7bb84)!important;color:#4a2d1c!important;border:1px solid #a2743b!important;outline:1px solid rgba(255,244,205,.25)!important;box-shadow:0 5px 0 rgba(20,8,5,.45)!important}
 #reading .v591-book-panel,#reading .v591-session-panel,#reading .v591-tool-drawer,#profile .v593-ledger-card,#profile .v593-save-grid>div{background:linear-gradient(180deg,#edddb7,#d9c08f)!important;border:1px solid #8d653c!important;box-shadow:0 5px 0 rgba(20,8,5,.35),inset 0 0 0 2px rgba(255,249,225,.25)!important;color:#442b1d!important}
 #reading input,#reading select,#profile input,#profile select,#profile textarea{background:#f6e8c8!important;border-color:#9a7448!important;color:#3f291d!important}
 #reading .v591-timer-wrap{background:linear-gradient(180deg,#3d2418,#24130e)!important;border:1px solid #9d723d!important;color:#efd9a4!important}
 #reading .read-timer{color:#f1d083!important;text-shadow:0 1px 0 #000!important}
 #quests.quest-rebuild{padding:10px 10px 104px!important;background:radial-gradient(circle at 50% 5%,rgba(236,208,150,.15),transparent 28%),linear-gradient(180deg,#382218,#21110c)!important}
 #v51045SimpleQuests{display:grid;gap:10px;max-width:620px;margin:0 auto 18px;padding:10px;background:linear-gradient(180deg,#ead8ad,#d5b984);border:2px solid #8c6034;outline:1px solid #c28f48;outline-offset:-6px;box-shadow:0 8px 18px rgba(0,0,0,.32)}
 #v51045SimpleQuests .head{position:relative;padding:14px 42px 12px;background:linear-gradient(#4b2c1d,#2a160e);border:1px solid #a77d43;color:#efd9aa;box-shadow:0 4px 0 #1408056b;text-align:center}
 #v51045SimpleQuests .head:before,#v51045SimpleQuests .head:after{content:'✦';position:absolute;top:50%;transform:translateY(-50%);color:#b98d45}#v51045SimpleQuests .head:before{left:17px}#v51045SimpleQuests .head:after{right:17px}
 #v51045SimpleQuests .head b{display:block;font:900 14px/1 Georgia,serif;letter-spacing:.8px}#v51045SimpleQuests .head small{display:block;margin-top:5px;color:#c8b28a!important;font:700 6.4px/1.35 ui-monospace,monospace}
 #v51045SimpleQuests .sq{position:relative;padding:15px 14px 14px;background:linear-gradient(#f0dfb8,#ddc18f);border:1px solid #9b7142;box-shadow:0 4px 0 #15090559,inset 0 0 0 3px rgba(255,249,226,.24)}
 #v51045SimpleQuests .sq:before{content:'❦';position:absolute;right:11px;bottom:8px;color:rgba(111,75,133,.30);font-size:20px}
 #v51045SimpleQuests .top{display:flex;justify-content:space-between;gap:8px}.qt{font:900 12px/1.1 Georgia,serif;color:#4d2d1c}.xp{padding:5px 7px;background:#5c4275;color:#f6e2b4;border:1px solid #8e6ca7;font:900 6px/1 ui-monospace,monospace}
 #v51045SimpleQuests .copy{margin-top:8px;color:#64452f;font:700 7px/1.35 Georgia,'Times New Roman',serif}.bar{margin-top:10px;height:9px;background:#b79c70;border:1px solid #7d603e;overflow:hidden}.bar i{display:block;height:100%;background:linear-gradient(90deg,#6c4a89,#a279ba)}
 #v51045SimpleQuests .meta{display:flex;justify-content:space-between;margin-top:5px;color:#70563f;font:800 6px/1 ui-monospace,monospace}.acts{display:grid;grid-template-columns:1fr auto;gap:7px;margin-top:10px}.acts button{min-height:34px!important;margin:0!important;padding:6px!important;font-size:6.5px!important}
 #profile.v593-profile{padding:10px 10px 105px!important}
 #profile .v593-profile-tabs{background:#321c14!important;border:1px solid #8a5e35!important}
 #profile .v593-profile-tabs button{font-family:Georgia,'Times New Roman',serif!important}
 .v51045-completed-shortcut{width:100%!important;margin:8px 0 12px!important;min-height:44px!important;background:linear-gradient(#6e4d8a,#4a325f)!important;border:1px solid #b18a4d!important;color:#f7e3b7!important;font:900 9px/1 Georgia,serif!important}
 `;document.head.appendChild(s);
}
function ensurePageTitles(){
 const defs=[['reading','READING DESK','Settle in, track your session, and move the story forward.'],['quests','READING CHALLENGES','Optional little goals for bonus EXP.'],['profile','READER PROFILE','Your level, finished books, milestones, and app tools.']];
 defs.forEach(([id,title,sub])=>{const root=$(id);if(!root||root.querySelector(':scope > .v51045-page-title'))return;const el=document.createElement('div');el.className='v51045-page-title';el.innerHTML=`${title}<small>${sub}</small>`;root.insertBefore(el,root.firstChild)})
}
function newQuest(){const target=TARGETS[Math.floor(Math.random()*TARGETS.length)],title=NAMES[Math.floor(Math.random()*NAMES.length)],xp=Math.round((target*4+25)/5)*5;return{id:'sq-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),title,target,xp,startPages:Number(S.pages||0),createdAt:Date.now()}}
function ensureQ(){if(typeof S==='undefined')return false;if(!Array.isArray(S.simpleQuests))S.simpleQuests=[];while(S.simpleQuests.length<3)S.simpleQuests.push(newQuest());S.simpleQuests=S.simpleQuests.slice(0,3);try{persistSilent()}catch(e){}return true}
function prog(q){return Math.max(0,Number(S.pages||0)-Number(q.startPages||0))}
function saveSafe(){try{save()}catch(e){try{persistSilent()}catch(_){}}}
function renderQ(){const root=$('v51045SimpleQuests');if(!root||!ensureQ())return;root.innerHTML=`<div class="head"><b>THE READER'S QUEST BOARD</b><small>Read. Earn bonus EXP. Keep going only when it sounds fun.</small></div>`+S.simpleQuests.map((q,i)=>{const p=prog(q),pct=Math.min(100,Math.round(p/q.target*100)),left=Math.max(0,q.target-p);return`<div class="sq"><div class="top"><div class="qt">${q.title}</div><div class="xp">+${q.xp} XP</div></div><div class="copy">Read ${q.target} pages at your own pace.</div><div class="bar"><i style="width:${pct}%"></i></div><div class="meta"><span>${Math.min(p,q.target)} / ${q.target} pages</span><span>${left?left+' to go':'READY ✨'}</span></div><div class="acts"><button class="btn-purple" ${p<q.target?'disabled':''} onclick="v51045ClaimQuest(${i})">${p>=q.target?'✨ CLAIM BONUS XP':'KEEP READING'}</button><button class="btn-plain" onclick="v51045RerollQuest(${i})">↻ NEW</button></div></div>`}).join('')}
function homeQ(){if(!ensureQ())return;S.simpleQuests.forEach((q,i)=>{const n=i+1,p=prog(q),t=$(`homeQ${n}Title`),o=$(`homeQ${n}Objective`),m=$(`homeQ${n}Meta`),x=$(`homeQ${n}Xp`);if(t)t.textContent=q.title;if(o)o.textContent=`Read ${q.target} pages`;if(m)m.textContent=`${Math.min(p,q.target)} / ${q.target} pages`;if(x)x.textContent=`+${q.xp} XP`})}
window.v51045RerollQuest=i=>{if(!ensureQ())return;S.simpleQuests[i]=newQuest();saveSafe();renderQ();homeQ()};
window.v51045ClaimQuest=i=>{if(!ensureQ())return;const q=S.simpleQuests[i],p=prog(q);if(p<q.target){if(typeof toast==='function')toast(`Keep reading — ${q.target-p} pages to go.`);return}S.questBonus=Number(S.questBonus||0)+q.xp;S.questsCompleted=Number(S.questsCompleted||0)+1;if(!Array.isArray(S.history))S.history=[];S.history.unshift({date:new Date().toISOString(),type:'Reading Challenge',quest:q.title,difficulty:'Bonus',xp:q.xp,target:`Read ${q.target} pages`});S.simpleQuests[i]=newQuest();saveSafe();try{renderHome()}catch(e){}renderQ();homeQ();if(typeof toast==='function')toast(`Challenge complete! +${q.xp} XP ✨`)};
function questScreen(){const q=$('quests');if(!q)return;if(!$('v51045SimpleQuests')){const root=document.createElement('div');root.id='v51045SimpleQuests';q.insertBefore(root,q.firstChild);const old=document.createElement('div');old.id='v51045LegacyQuestsWrap';while(root.nextSibling)old.appendChild(root.nextSibling);q.appendChild(old)}renderQ()}
function nav(){const n=document.querySelector('.bottomnav'),p=n?.querySelector('button[data-screen="adventure"],button[data-screen="journal"]');if(!n||!p)return;if(!p.dataset.v51045Journal){p.dataset.v51045Journal='1';p.dataset.screen='journal';p.textContent='Journal';p.removeAttribute('onclick');p.addEventListener('click',()=>{n.querySelectorAll('button').forEach(b=>b.classList.remove('active'));p.classList.add('active');if(typeof window.openReadingJournal==='function')window.openReadingJournal();else if(typeof go==='function')go('profile')})}}
function readScreen(){const end=document.querySelector('#reading .v595-end-session');if(end){for(const node of end.childNodes){if(node.nodeType===3){node.nodeValue='🏁 END READING SESSION';break}}const sm=end.querySelector('small');if(sm)sm.textContent='log pages • record time and chapters • update progress'}document.querySelectorAll('#reading .v591-session-plaque img').forEach(i=>i.src='./asset-book.png');const note=document.querySelector('#reading .v591-sync-note');if(note)note.textContent='Finished books can be saved to your Completed Books library.';document.querySelectorAll('#reading button').forEach(b=>{if(b.textContent.includes('OPEN LIBRARY'))b.textContent='📚 COMPLETED BOOKS';if(b.textContent.includes('ARCHIVE FINISHED VOLUME'))b.textContent='🏁 MARK BOOK FINISHED'})}
function profile(){const p=$('profile');if(!p)return;const h=p.querySelector('.v593-profile-heading b');if(h)h.textContent='READER PROFILE';const sub=p.querySelector('.v593-profile-heading small');if(sub)sub.textContent='Your level, reading record, completed books, titles, and app tools.';p.querySelectorAll('.v593-profile-tabs button').forEach(b=>{if((b.getAttribute('onclick')||'').includes('journalPanel'))b.dataset.v51045Hidden='1'});const lib=p.querySelector('.v598-library-shortcut');if(lib){lib.textContent='📚 COMPLETED BOOKS';lib.classList.add('v51045-completed-shortcut')}const safety=p.querySelector('.v593-safety-card');if(safety)safety.style.display='none';const base=p.querySelector('.v593-baseline-note');if(base)base.textContent='Your reading totals and bonus challenge XP feed your Reader Level.'}
function home(){const btn=[...document.querySelectorAll('.v58-util button')].find(b=>b.textContent.includes('CHARACTER LEDGER'));if(btn)btn.textContent='READER STATS';const p=$('homeLedgerPanel');if(p){const l=[...p.querySelectorAll('.v58-ledger-grid span')],v=[...p.querySelectorAll('.v58-ledger-grid b')];if(l[0])l[0].textContent='XP';if(l[1])l[1].textContent='BOOKS';if(l[2])l[2].textContent='DAYS';if(typeof S!=='undefined'){if(v[1])v[1].textContent=Number(S.books||0).toLocaleString();if(v[2])v[2].textContent=Number(S.days||0).toLocaleString()}const note=$('homeBonuses');if(note)note.textContent='Read → earn EXP → level up → repeat.'}homeQ()}
function library(){document.querySelectorAll('.v598-library-shortcut').forEach(b=>b.textContent='📚 COMPLETED BOOKS');const h=document.querySelector('#library .v5104-shelf-heading b');if(h)h.textContent='📚 COMPLETED BOOKS';const back=document.querySelector('#library .v5104-back');if(back)back.textContent='← RETURN TO READING'}
function watchVersion(){const b=$('headerVersionText');if(!b||b.dataset.v51045Watch)return;b.dataset.v51045Watch='1';new MutationObserver(()=>{if(b.textContent!==BUILD)b.textContent=BUILD}).observe(b,{childList:true,characterData:true,subtree:true})}
function apply(){stamp();style();nav();questScreen();readScreen();profile();home();library();ensurePageTitles();watchVersion();document.documentElement.dataset.readingMmoSimplified='51045-journal-style'}
function boot(){apply();[120,400,900,1800,3200,6000].forEach(ms=>setTimeout(apply,ms));window.addEventListener('pageshow',apply)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();