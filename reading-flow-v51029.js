/* Reading MMO v5.10.29 — seamless Session → Quest → Replacement flow.
   Reuses the existing quest/reward engine, but keeps the whole post-reading loop
   inside one compact wrap-up instead of bouncing through modal sequences/screens. */
(function(){
  'use strict';
  if(window.__v51029FlowBooted)return;
  window.__v51029FlowBooted=true;

  const BUILD='v5.10.29';
  const $=id=>document.getElementById(id);
  const escHtml=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const roleMeta=[
    {icon:'⚔️',name:'HUNT',cls:'hunt',empty:'Roll a Hunt quest'},
    {icon:'🌿',name:'GATHER',cls:'gather',empty:'Roll a Gather quest'},
    {icon:'⚗️',name:'ALCHEMY',cls:'alchemy',empty:'Roll an Alchemy quest'}
  ];

  let flow=null;
  let capture=null;
  let originalShowSequence=null;
  let originalEndReadingSession=null;

  function state(){
    try{return typeof S!=='undefined'&&S?S:null;}catch(_){return null;}
  }

  function stamp(){
    window.__readingMmoVersionOwner=BUILD;
    const badge=$('headerVersionText');if(badge)badge.textContent=BUILD;
    document.querySelectorAll('.health-row').forEach(row=>{
      if(row.querySelector('b')?.textContent.trim()==='Version'){
        const value=row.querySelector('span');if(value)value.textContent=BUILD;
      }
    });
  }

  function ensureCss(){
    if($('v51029-flow-css'))return;
    const style=document.createElement('style');
    style.id='v51029-flow-css';
    style.textContent=`
      .v51029-flow-backdrop{position:fixed;inset:0;z-index:150;background:rgba(16,9,6,.87);backdrop-filter:blur(3px);display:flex;align-items:flex-start;justify-content:center;padding:22px 12px 94px;overflow-y:auto}
      .v51029-flow-backdrop[hidden]{display:none!important}
      .v51029-flow-book{width:min(540px,100%);background:linear-gradient(180deg,#f4e3bc,#e8cf9b);border:2px solid #a6753e;box-shadow:0 0 0 3px #4a2a1a,0 12px 34px rgba(0,0,0,.45),inset 0 0 0 2px rgba(255,249,224,.4);color:#432b1d;padding:12px}
      .v51029-flow-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding-bottom:9px;border-bottom:1px solid rgba(120,78,40,.35)}
      .v51029-flow-kicker{font-size:7px;font-weight:900;letter-spacing:1px;color:#78553a;text-transform:uppercase}
      .v51029-flow-title{margin-top:2px;font:900 18px/1.05 Georgia,'Times New Roman',serif;color:#4a2e1d}
      .v51029-flow-close{min-width:40px;min-height:38px;padding:5px!important;margin:0!important;background:#65432f!important;border-color:#9c7042!important;box-shadow:none!important}
      .v51029-session-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0}
      .v51029-session-stat{background:#2a1711;border:1px solid #8c6637;padding:8px 5px;text-align:center;color:#ddc28b}
      .v51029-session-stat b{display:block;font:900 15px/1.05 Georgia,'Times New Roman',serif;color:#f0d58f;margin-bottom:2px}
      .v51029-session-stat span{font-size:6px;font-weight:900;letter-spacing:.45px}
      .v51029-section-label{margin:12px 0 6px;font-size:7px;font-weight:900;letter-spacing:1px;color:#755337;text-transform:uppercase}
      .v51029-quest-list{display:grid;gap:8px}
      .v51029-qcard{border:1px solid #aa804d;background:rgba(255,244,211,.6);padding:9px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.25)}
      .v51029-qcard.hunt{border-left:5px solid #984c3f}.v51029-qcard.gather{border-left:5px solid #557443}.v51029-qcard.alchemy{border-left:5px solid #74518e}
      .v51029-qhead{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .v51029-qrole{font-size:7px;font-weight:900;letter-spacing:.55px}.v51029-qstate{font-size:6px;font-weight:900;padding:3px 5px;background:#ead5a7;border:1px solid #bc9563;white-space:nowrap}
      .v51029-qstate.ready{background:#d9e5c8;border-color:#789259;color:#3f5a31}.v51029-qstate.verify{background:#eadcf1;border-color:#9879aa;color:#5e4472}.v51029-qstate.done{background:#f1dfad;border-color:#b58a39;color:#76530c}.v51029-qstate.new{background:#dfe3ef;border-color:#79859f;color:#46526e}
      .v51029-qname{margin:5px 0 3px;font:900 13px/1.08 Georgia,'Times New Roman',serif;color:#472e20}
      .v51029-qtext{font-size:7px;line-height:1.4;color:#70523c}
      .v51029-progress{margin-top:7px;padding:6px 7px;background:#f4e2b7;border:1px solid #b9905c;font-size:7px;font-weight:800;color:#624733}
      .v51029-bar{height:7px;background:#d5bc8d;border:1px solid #ad8655;margin-top:5px;overflow:hidden}.v51029-bar i{display:block;height:100%;background:#76549b}
      .v51029-actions{display:grid;grid-template-columns:1fr;gap:6px;margin-top:8px}.v51029-actions.two{grid-template-columns:1fr 1fr}
      .v51029-actions button{min-height:42px;margin:0!important;padding:7px 6px!important;font-size:7px!important;box-shadow:none!important}
      .v51029-turnin.hunt{background:#8e4438!important}.v51029-turnin.gather{background:#4f6e3b!important}.v51029-turnin.alchemy{background:#694684!important}
      .v51029-reward{margin-top:7px;padding:7px;background:#2a1711;border:1px solid #8d6637;color:#e2c995}
      .v51029-reward-row{padding:5px 0;border-bottom:1px dashed rgba(224,190,126,.22);font-size:6.8px;line-height:1.35}.v51029-reward-row:last-child{border-bottom:0}.v51029-reward-row b{color:#f0d58f}
      .v51029-new-objective{margin-top:6px;padding:7px;background:#efe0bc;border:1px dashed #aa8052;font-size:7px;line-height:1.4;color:#664834;white-space:pre-wrap}
      .v51029-footer{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px;padding-top:10px;border-top:1px solid rgba(120,78,40,.35)}
      .v51029-footer button{min-height:44px;margin:0!important;font-size:7px!important;box-shadow:none!important}
      .v51029-note{margin-top:7px;text-align:center;font-size:6px;line-height:1.4;color:#7c644e}
      @media(max-width:390px){.v51029-flow-backdrop{padding-left:8px;padding-right:8px}.v51029-session-summary{gap:4px}.v51029-session-stat{padding-left:3px;padding-right:3px}.v51029-footer{grid-template-columns:1fr 1fr}}
    `;
    document.head.appendChild(style);
  }

  function ensureModal(){
    if($('v51029FlowBackdrop'))return;
    const el=document.createElement('div');
    el.id='v51029FlowBackdrop';
    el.className='v51029-flow-backdrop';
    el.hidden=true;
    el.setAttribute('role','dialog');
    el.setAttribute('aria-modal','true');
    el.setAttribute('aria-label','Session wrap-up');
    el.innerHTML='<div class="v51029-flow-book"><div id="v51029FlowBody"></div></div>';
    document.body.appendChild(el);
  }

  function fmt(ms){
    if(typeof fmtTimer==='function')return fmtTimer(ms);
    const total=Math.floor(Math.max(0,Number(ms)||0)/1000),h=Math.floor(total/3600),m=Math.floor((total%3600)/60),s=total%60;
    return [h,m,s].map(x=>String(x).padStart(2,'0')).join(':');
  }

  function qState(q){
    try{return typeof questRequirementState==='function'?questRequirementState(q):{tracked:false,met:false,needsConfirm:false,baseMet:false,text:''};}
    catch(_){return {tracked:false,met:false,needsConfirm:false,baseMet:false,text:''};}
  }

  function fraction(q,st){
    try{return typeof questHudFraction==='function'?Math.max(0,Math.min(1,questHudFraction(q,st))):0;}
    catch(_){return st?.met||st?.baseMet?1:0;}
  }

  function rewardRows(steps){
    const list=Array.isArray(steps)?steps:[];
    const keep=/GOLDEN DROP|LOOT DROP|HUNTER BONUS|LOOT FEVER|PAGEWORM HOARD|FORAGE COMPLETE|POTION BREWED|XP GAINED|TITLE UNLOCKED|AREA BOSS UNLOCKED|TEST MODE/i;
    const rows=list.filter(s=>keep.test(String(s?.title||''))).map(s=>{
      let text=String(s?.text||'').trim();
      if(text.length>180)text=text.slice(0,177)+'…';
      return {icon:s?.icon||'✨',title:s?.title||'Reward',text};
    });
    return rows.length?rows:[{icon:'✨',title:'QUEST RECORDED',text:'Rewards and quest XP were applied to your save.'}];
  }

  function questCard(i){
    const s=state(),q=s?.quests?.[i],meta=roleMeta[i];
    const reward=flow?.rewards?.[i];
    const freshlyRolled=flow?.newQuests?.[i]&&q?.status==='Active';

    if(!q?.name){
      return `<div class="v51029-qcard ${meta.cls}">
        <div class="v51029-qhead"><span class="v51029-qrole">${meta.icon} ${meta.name}</span><span class="v51029-qstate">EMPTY</span></div>
        <div class="v51029-qname">No active quest</div>
        <div class="v51029-qtext">This slot is ready whenever you want another objective.</div>
        <div class="v51029-actions"><button type="button" class="btn-purple" onclick="v51029RollReplacement(${i})">🎲 ${escHtml(meta.empty).toUpperCase()}</button></div>
      </div>`;
    }

    if(q.status==='Completed'&&reward){
      const rows=reward.rows.map(r=>`<div class="v51029-reward-row"><b>${escHtml(r.icon)} ${escHtml(r.title)}</b><br>${escHtml(r.text).replace(/\n/g,'<br>')}</div>`).join('');
      return `<div class="v51029-qcard ${meta.cls}">
        <div class="v51029-qhead"><span class="v51029-qrole">${meta.icon} ${meta.name}</span><span class="v51029-qstate done">QUEST COMPLETE</span></div>
        <div class="v51029-qname">${escHtml(reward.questName||q.name)}</div>
        <div class="v51029-reward">${rows}</div>
        <div class="v51029-actions"><button type="button" class="btn-purple" onclick="v51029RollReplacement(${i})">🎲 ROLL NEW ${meta.name} QUEST</button></div>
      </div>`;
    }

    if(freshlyRolled){
      const sync=flow.widgetStatus?.[i];
      return `<div class="v51029-qcard ${meta.cls}">
        <div class="v51029-qhead"><span class="v51029-qrole">${meta.icon} ${meta.name}</span><span class="v51029-qstate new">NEW QUEST</span></div>
        <div class="v51029-qname">${escHtml(q.name)}</div>
        <div class="v51029-new-objective">${escHtml(q.objective||'')}</div>
        <div class="v51029-qtext" style="margin-top:6px"><b>${escHtml(q.difficulty||'Normal')}</b> • +${Number(q.xp||0).toLocaleString()} XP${sync?` • ${escHtml(sync)}`:''}</div>
        <div class="v51029-actions two">
          <button type="button" class="btn-plain" onclick="v51029RollReplacement(${i})">↻ ROLL AGAIN</button>
          <button type="button" class="btn-green" onclick="v51029ReturnToReading()">✓ ACCEPT & RETURN</button>
        </div>
      </div>`;
    }

    const st=qState(q),f=fraction(q,st),pct=Math.round(f*100);
    let label='IN PROGRESS',cls='';
    if(st.met){label='READY TO TURN IN';cls='ready';}
    else if(st.needsConfirm){label='VERIFY REQUIREMENT';cls='verify';}
    else if(st.baseMet){label='READING TARGET MET';cls='verify';}

    let action='';
    if(st.needsConfirm||st.baseMet&&!st.met){
      action=`<div class="v51029-actions"><button type="button" class="btn-purple" onclick="v51029VerifyAndTurnIn(${i})">✓ YES — COMPLETE REQUIREMENT & TURN IN</button></div>`;
    }else if(st.met){
      let act={icon:'✨',label:'TURN IN QUEST'};
      try{if(typeof questActionLabel==='function')act=questActionLabel(i)||act;}catch(_){}
      action=`<div class="v51029-actions"><button type="button" class="v51029-turnin ${meta.cls}" onclick="v51029TurnIn(${i})">${escHtml(act.icon||'✨')} ${escHtml(act.label||'TURN IN QUEST')}</button></div>`;
    }

    return `<div class="v51029-qcard ${meta.cls}">
      <div class="v51029-qhead"><span class="v51029-qrole">${meta.icon} ${meta.name}</span><span class="v51029-qstate ${cls}">${label}</span></div>
      <div class="v51029-qname">${escHtml(q.name)}</div>
      <div class="v51029-progress">${escHtml(st.text||'Quest progress updated')}<div class="v51029-bar"><i style="width:${pct}%"></i></div></div>
      ${action}
    </div>`;
  }

  function renderFlow(){
    if(!flow)return;
    ensureModal();
    const body=$('v51029FlowBody');if(!body)return;
    const session=flow.session||{};
    body.innerHTML=`
      <div class="v51029-flow-top">
        <div><div class="v51029-flow-kicker">READING DESK • ADVENTURE WRAP-UP</div><div class="v51029-flow-title">📖 Session Complete</div></div>
        <button type="button" class="btn-plain v51029-flow-close" onclick="v51029ReturnToReading()" aria-label="Close wrap-up">×</button>
      </div>
      <div class="v51029-session-summary">
        <div class="v51029-session-stat"><b>${escHtml(fmt(session.elapsedMs||0))}</b><span>READING TIME</span></div>
        <div class="v51029-session-stat"><b>${Number(session.pages||0).toLocaleString()}</b><span>PAGES</span></div>
        <div class="v51029-session-stat"><b>${Number(session.chapters||0).toLocaleString()}</b><span>CHAPTERS</span></div>
      </div>
      <div class="v51029-section-label">Quest Results</div>
      <div class="v51029-quest-list">${[0,1,2].map(questCard).join('')}</div>
      <div class="v51029-footer">
        <button type="button" class="btn-plain" onclick="v51029OpenQuestBoard()">📜 QUEST BOARD</button>
        <button type="button" class="btn-green" onclick="v51029ReturnToReading()">📖 RETURN TO READING</button>
      </div>
      <div class="v51029-note">Turn-ins, loot, XP, and replacement rolls all use the existing save system. Nothing is awarded twice.</div>`;
    const backdrop=$('v51029FlowBackdrop');backdrop.hidden=false;
    document.body.style.overflow='hidden';
  }

  function openFromLastSession(){
    const s=state();if(!s?.reading?.lastSession)return;
    flow={
      session:Object.assign({},s.reading.lastSession),
      rewards:{},newQuests:{},widgetStatus:{},
      questIds:(s.quests||[]).map(q=>q?.id||'')
    };
    renderFlow();
  }

  function closeFlow(goBoard){
    const el=$('v51029FlowBackdrop');if(el)el.hidden=true;
    document.body.style.overflow='';
    flow=null;
    if(goBoard&&typeof go==='function'){
      const nav=document.querySelector('.bottomnav button[data-screen="quests"]');
      go('quests',nav);
    }
  }

  function captureShowSequence(steps,completionSlot){
    if(capture){
      capture.steps=Array.isArray(steps)?steps.slice():[];
      capture.completionSlot=completionSlot;
      return true;
    }
    return false;
  }

  function installSequenceHook(){
    if(typeof window.showSequence!=='function'||window.showSequence.__v51029)return;
    originalShowSequence=window.showSequence;
    const wrapped=function(steps,completionSlot=null){
      if(captureShowSequence(steps,completionSlot))return;
      return originalShowSequence.apply(this,arguments);
    };
    wrapped.__v51029=true;
    window.showSequence=wrapped;
  }

  function installEndHook(){
    if(typeof window.endReadingSession!=='function'||window.endReadingSession.__v51029)return;
    originalEndReadingSession=window.endReadingSession;
    const wrapped=function(){
      const s=state();
      const before=Number(s?.reading?.lastSession?.endedAt||0);
      capture={kind:'session',steps:null,completionSlot:null};
      let out;
      try{out=originalEndReadingSession.apply(this,arguments);}finally{
        const got=capture?.steps;capture=null;
        const after=Number(state()?.reading?.lastSession?.endedAt||0);
        if(got&&after&&after!==before)setTimeout(openFromLastSession,0);
      }
      return out;
    };
    wrapped.__v51029=true;
    window.endReadingSession=wrapped;
  }

  function turnIn(i,verify){
    const s=state(),q=s?.quests?.[i];if(!flow||!q?.name)return;
    if(verify){
      q.requirementsConfirmed=true;
      if(typeof persistSilent==='function')persistSilent();
      if(typeof renderQuestCards==='function')renderQuestCards();
      if(typeof renderHome==='function')renderHome();
    }
    const questName=q.name,questId=q.id;
    capture={kind:'turnin',slot:i,steps:null,completionSlot:null};
    try{
      if(typeof window.turnInTrackedQuest==='function')window.turnInTrackedQuest(i);
    }finally{
      const cap=capture;capture=null;
      const now=state()?.quests?.[i];
      if(now?.status==='Completed'){
        flow.rewards[i]={questName,questId,rows:rewardRows(cap?.steps)};
        flow.newQuests[i]=false;
      }
      renderFlow();
    }
  }

  async function rollReplacement(i){
    const s=state();if(!flow||!s?.quests?.[i])return;
    if(typeof rollQuest!=='function')return;
    rollQuest(i);
    flow.newQuests[i]=true;
    flow.widgetStatus[i]='Widget update pending';
    renderFlow();
    if(typeof sendQuestToKWGT==='function'){
      try{
        const result=await sendQuestToKWGT(i);
        if(!flow)return;
        flow.widgetStatus[i]=result===true?'Widget synced':result==='queued'?'Widget sync queued':'Widget sync not confirmed';
        renderFlow();
      }catch(_){
        if(flow){flow.widgetStatus[i]='Widget sync not confirmed';renderFlow();}
      }
    }
  }

  function boot(){
    ensureCss();ensureModal();stamp();
    installSequenceHook();installEndHook();
    [80,280,800,1600,3000].forEach(ms=>setTimeout(()=>{stamp();installSequenceHook();installEndHook();},ms));
  }

  window.v51029TurnIn=i=>turnIn(Number(i),false);
  window.v51029VerifyAndTurnIn=i=>turnIn(Number(i),true);
  window.v51029RollReplacement=i=>rollReplacement(Number(i));
  window.v51029ReturnToReading=()=>closeFlow(false);
  window.v51029OpenQuestBoard=()=>closeFlow(true);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){stamp();installSequenceHook();installEndHook();}});
})();
