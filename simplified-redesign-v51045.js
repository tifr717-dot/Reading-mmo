(()=>{
  'use strict';
  if(window.__v51045SimplifiedRedesign)return;
  window.__v51045SimplifiedRedesign=true;

  const BUILD='v5.10.45-test';
  const $id=id=>document.getElementById(id);
  const PAGE_TARGETS=[15,20,25,30,35,40,50];
  const TITLES=['A Few More Pages','Turn the Page','Chapter Wander','Quiet Reading Quest','One More Chapter','Into the Story','Pagekeeper Challenge'];

  function stampBuild(){
    window.__readingMmoVersionOwner=BUILD;
    const badge=$id('headerVersionText');
    if(badge)badge.textContent=BUILD;
    document.querySelectorAll('.health-row').forEach(row=>{
      if(row.querySelector('b')?.textContent.trim()==='Version'){
        const value=row.querySelector('span');
        if(value)value.textContent=BUILD;
      }
    });
  }

  function ensureStyle(){
    if($id('v51045-simplified-style'))return;
    const style=document.createElement('style');
    style.id='v51045-simplified-style';
    style.textContent=`
      /* v5.10.45 structural surgery: old systems remain in save data, but leave normal play. */
      #adventure,#world,#bag{display:none!important}
      .bottomnav button[data-screen="journal"]:before{background-image:url('./asset-scroll.png')!important;background-size:24px!important}
      #profile .v593-profile-tabs button[data-v51045-hidden="1"]{display:none!important}
      #profile .v593-profile-tabs{grid-template-columns:repeat(4,1fr)!important}
      #reading .v597-adventure-hud{display:none!important}
      #v51045SimpleQuests{display:grid;gap:10px;margin:8px 0 18px}
      #v51045SimpleQuests .v51045-quest-head{padding:12px 13px;background:linear-gradient(180deg,#4f3022,#2d190f);border:1px solid #a77d43;color:#efd9aa;box-shadow:0 4px 0 rgba(20,8,5,.42)}
      #v51045SimpleQuests .v51045-quest-head b{display:block;font:900 13px/1 Georgia,'Times New Roman',serif;letter-spacing:.5px}
      #v51045SimpleQuests .v51045-quest-head small{display:block;margin-top:5px;color:#bca681!important;font:700 7px/1.35 ui-monospace,monospace}
      #v51045SimpleQuests .v51045-card{padding:12px;background:linear-gradient(180deg,#efdcb4,#ddc18e);border:2px solid #77502e;box-shadow:0 4px 0 rgba(21,9,5,.35),inset 0 0 0 2px rgba(255,248,220,.30)}
      #v51045SimpleQuests .v51045-top{display:flex;justify-content:space-between;gap:8px;align-items:start}
      #v51045SimpleQuests .v51045-title{font:900 11px/1.1 Georgia,'Times New Roman',serif;color:#4d2d1c}
      #v51045SimpleQuests .v51045-xp{white-space:nowrap;padding:4px 6px;background:#5c4275;color:#f6e2b4;border:1px solid #8e6ca7;font:900 6px/1 ui-monospace,monospace}
      #v51045SimpleQuests .v51045-copy{margin-top:7px;color:#64452f;font:700 7px/1.35 ui-monospace,monospace}
      #v51045SimpleQuests .v51045-progress{margin-top:9px;height:9px;background:#b79c70;border:1px solid #7d603e;overflow:hidden}
      #v51045SimpleQuests .v51045-progress i{display:block;height:100%;background:linear-gradient(90deg,#6c4a89,#a279ba);width:0}
      #v51045SimpleQuests .v51045-meta{display:flex;justify-content:space-between;gap:8px;margin-top:5px;color:#70563f;font:800 6px/1 ui-monospace,monospace}
      #v51045SimpleQuests .v51045-actions{display:grid;grid-template-columns:1fr auto;gap:7px;margin-top:9px}
      #v51045SimpleQuests button{min-height:34px!important;margin:0!important;padding:6px!important;font-size:6.5px!important}
      #v51045LegacyQuestsWrap{display:none!important}
      .v51045-completed-shortcut{width:100%!important;margin:8px 0 12px!important;min-height:44px!important;background:linear-gradient(#6e4d8a,#4a325f)!important;border:1px solid #b18a4d!important;color:#f7e3b7!important;font:900 9px/1 Georgia,'Times New Roman',serif!important}
      .v51045-structure-note{margin:8px 0;padding:8px 10px;background:rgba(238,216,173,.10);border:1px solid rgba(197,151,74,.38);color:#cbb78f;font:700 6.5px/1.35 ui-monospace,monospace}
    `;
    document.head.appendChild(style);
  }

  function makeQuest(){
    const target=PAGE_TARGETS[Math.floor(Math.random()*PAGE_TARGETS.length)];
    const title=TITLES[Math.floor(Math.random()*TITLES.length)];
    const xp=Math.round((target*4+25)/5)*5;
    return {id:'sq-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),title,type:'pages',target,xp,startPages:Number(S?.pages||0),createdAt:Date.now()};
  }

  function ensureSimpleQuests(){
    if(typeof S==='undefined')return;
    if(!Array.isArray(S.simpleQuests))S.simpleQuests=[];
    while(S.simpleQuests.length<3)S.simpleQuests.push(makeQuest());
    if(S.simpleQuests.length>3)S.simpleQuests=S.simpleQuests.slice(0,3);
    try{persistSilent()}catch(e){try{save()}catch(_){}}
  }

  function questProgress(q){
    const current=Number(S?.pages||0);
    return Math.max(0,current-Number(q.startPages||0));
  }

  function rerollSimpleQuest(index){
    ensureSimpleQuests();
    S.simpleQuests[index]=makeQuest();
    try{save()}catch(e){try{persistSilent()}catch(_){}}
    renderSimpleQuests();
    renderHomeSimpleQuests();
  }

  function claimSimpleQuest(index){
    ensureSimpleQuests();
    const q=S.simpleQuests[index];
    if(!q)return;
    const progress=questProgress(q);
    if(progress<q.target){
      if(typeof toast==='function')toast(`Keep reading — ${q.target-progress} pages to go.`);
      return;
    }
    S.questBonus=Number(S.questBonus||0)+Number(q.xp||0);
    S.questsCompleted=Number(S.questsCompleted||0)+1;
    if(!Array.isArray(S.history))S.history=[];
    S.history.unshift({date:new Date().toISOString(),type:'Reading Challenge',quest:q.title,difficulty:'Bonus',xp:q.xp,target:`Read ${q.target} pages`});
    S.simpleQuests[index]=makeQuest();
    try{save()}catch(e){try{persistSilent()}catch(_){}}
    if(typeof renderHome==='function')try{renderHome()}catch(_){ }
    renderSimpleQuests();
    renderHomeSimpleQuests();
    if(typeof toast==='function')toast(`Challenge complete! +${q.xp} XP ✨`);
  }

  function renderSimpleQuests(){
    const root=$id('v51045SimpleQuests');
    if(!root||typeof S==='undefined')return;
    ensureSimpleQuests();
    root.innerHTML=`
      <div class="v51045-quest-head"><b>READING CHALLENGES</b><small>Optional little goals for bonus EXP. No loot, materials, crafting, or inventory.</small></div>
      ${S.simpleQuests.map((q,i)=>{
        const p=questProgress(q),pct=Math.min(100,Math.round((p/q.target)*100)),left=Math.max(0,q.target-p);
        return `<div class="v51045-card">
          <div class="v51045-top"><div class="v51045-title">${q.title}</div><div class="v51045-xp">+${q.xp} XP</div></div>
          <div class="v51045-copy">Read ${q.target} pages at your own pace.</div>
          <div class="v51045-progress"><i style="width:${pct}%"></i></div>
          <div class="v51045-meta"><span>${Math.min(p,q.target)} / ${q.target} pages</span><span>${left?left+' to go':'READY ✨'}</span></div>
          <div class="v51045-actions"><button class="btn-purple" ${p<q.target?'disabled':''} onclick="window.v51045ClaimQuest(${i})">${p>=q.target?'✨ CLAIM BONUS XP':'KEEP READING'}</button><button class="btn-plain" onclick="window.v51045RerollQuest(${i})">↻ NEW</button></div>
        </div>`;
      }).join('')}`;
  }

  function renderHomeSimpleQuests(){
    if(typeof S==='undefined')return;
    ensureSimpleQuests();
    const slots=[1,2,3];
    slots.forEach((n,i)=>{
      const q=S.simpleQuests[i]; if(!q)return;
      const p=questProgress(q);
      const t=$id(`homeQ${n}Title`),o=$id(`homeQ${n}Objective`),m=$id(`homeQ${n}Meta`),x=$id(`homeQ${n}Xp`);
      if(t)t.textContent=q.title;
      if(o)o.textContent=`Read ${q.target} pages`;
      if(m)m.textContent=`${Math.min(p,q.target)} / ${q.target} pages`;
      if(x)x.textContent=`+${q.xp} XP`;
    });
  }

  function simplifyQuestScreen(){
    const quests=$id('quests');
    if(!quests)return;
    if(!$id('v51045SimpleQuests')){
      const root=document.createElement('div');root.id='v51045SimpleQuests';
      quests.insertBefore(root,quests.firstChild);
      const legacy=document.createElement('div');legacy.id='v51045LegacyQuestsWrap';
      while(root.nextSibling)legacy.appendChild(root.nextSibling);
      quests.appendChild(legacy);
    }
    renderSimpleQuests();
  }

  function simplifyReadScreen(){
    const end=document.querySelector('#reading .v595-end-session');
    if(end){
      end.childNodes[0].nodeValue='🏁 END READING SESSION';
      const small=end.querySelector('small');
      if(small)small.textContent='log pages • record time and chapters • update progress';
    }
    document.querySelectorAll('#reading .v591-session-plaque img').forEach(img=>{img.src='./asset-book.png'});
    const sync=document.querySelector('#reading .v591-sync-note');
    if(sync)sync.textContent='Finished books can be saved to your Completed Books library.';
    document.querySelectorAll('#reading button').forEach(btn=>{
      if(btn.textContent.includes('OPEN LIBRARY'))btn.textContent='📚 COMPLETED BOOKS';
      if(btn.textContent.includes('ARCHIVE FINISHED VOLUME'))btn.textContent='🏁 MARK BOOK FINISHED';
    });
  }

  function simplifyProfile(){
    const profile=$id('profile');if(!profile)return;
    const heading=profile.querySelector('.v593-profile-heading b');if(heading)heading.textContent='READER PROFILE';
    const sub=profile.querySelector('.v593-profile-heading small');if(sub)sub.textContent='Your level, reading record, completed books, titles, and app tools.';
    profile.querySelectorAll('.v593-profile-tabs button').forEach(btn=>{
      const call=btn.getAttribute('onclick')||'';
      if(call.includes('journalPanel'))btn.dataset.v51045Hidden='1';
    });
    const shortcut=profile.querySelector('.v598-library-shortcut');
    if(shortcut){shortcut.textContent='📚 COMPLETED BOOKS';shortcut.classList.add('v51045-completed-shortcut')}
    const safety=profile.querySelector('.v593-safety-card');if(safety)safety.style.display='none';
    const baseline=profile.querySelector('.v593-baseline-note');if(baseline)baseline.textContent='Your reading totals and bonus challenge XP feed your Reader Level.';
  }

  function simplifyHome(){
    const ledgerBtn=[...document.querySelectorAll('.v58-util button')].find(b=>b.textContent.includes('CHARACTER LEDGER'));
    if(ledgerBtn)ledgerBtn.textContent='READER STATS';
    const panel=$id('homeLedgerPanel');
    if(panel){
      const labels=[...panel.querySelectorAll('.v58-ledger-grid span')];
      if(labels[0])labels[0].textContent='XP';
      if(labels[1])labels[1].textContent='BOOKS';
      if(labels[2])labels[2].textContent='DAYS';
      const vals=[...panel.querySelectorAll('.v58-ledger-grid b')];
      if(typeof S!=='undefined'){
        if(vals[1])vals[1].textContent=Number(S.books||0).toLocaleString();
        if(vals[2])vals[2].textContent=Number(S.days||0).toLocaleString();
      }
      const note=$id('homeBonuses');if(note)note.textContent='Read → earn EXP → level up → repeat.';
    }
    renderHomeSimpleQuests();
  }

  function setupNav(){
    const nav=document.querySelector('.bottomnav');if(!nav)return;
    const play=nav.querySelector('button[data-screen="adventure"]');
    if(play&&!play.dataset.v51045Journal){
      play.dataset.v51045Journal='1';
      play.dataset.screen='journal';
      play.textContent='Journal';
      play.removeAttribute('onclick');
      play.addEventListener('click',()=>{
        nav.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
        play.classList.add('active');
        if(typeof window.openReadingJournal==='function')window.openReadingJournal();
        else if(typeof go==='function')go('profile');
      });
    }
  }

  function relabelLibrary(){
    document.querySelectorAll('.v598-library-shortcut').forEach(b=>b.textContent='📚 COMPLETED BOOKS');
    const title=document.querySelector('#library .v5104-shelf-heading b');if(title)title.textContent='📚 COMPLETED BOOKS';
    const back=document.querySelector('#library .v5104-back');if(back)back.textContent='← RETURN TO READING';
  }

  function apply(){
    stampBuild();ensureStyle();setupNav();simplifyQuestScreen();simplifyReadScreen();simplifyProfile();simplifyHome();relabelLibrary();
    document.documentElement.dataset.readingMmoSimplified='51045-structure';
  }

  window.v51045ClaimQuest=claimSimpleQuest;
  window.v51045RerollQuest=rerollSimpleQuest;

  function wrapRenderAll(){
    try{
      if(typeof renderAll==='function'&&!renderAll.__v51045Wrapped){
        const old=renderAll;
        const wrapped=function(){const out=old.apply(this,arguments);setTimeout(apply,0);return out};
        wrapped.__v51045Wrapped=true;
        renderAll=wrapped;
      }
    }catch(e){}
  }

  function boot(){
    wrapRenderAll();apply();
    const observer=new MutationObserver(()=>{stampBuild();setupNav()});
    observer.observe(document.body,{childList:true,subtree:true});
    [100,350,900,1800].forEach(ms=>setTimeout(apply,ms));
    window.addEventListener('pageshow',apply);
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();