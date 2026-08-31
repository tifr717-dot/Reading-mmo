/* Reading MMO v5.10.28 — manual session time correction.
   Lets readers add missed time or set the exact session total without changing
   quest accounting: time is still banked only by End Session + Check Quests. */
(function(){
  'use strict';
  if(window.__v51028TimeBooted)return;
  window.__v51028TimeBooted=true;

  const BUILD=window.__readingMmoVersionOwner||'v5.10.28';
  const $=id=>document.getElementById(id);
  const num=v=>Math.max(0,Number(v)||0);

  function readingState(){
    try{return typeof S!=='undefined'&&S&&S.reading?S.reading:null;}catch(_){return null;}
  }

  function timerMs(){
    if(typeof readingTimerMs==='function')return Math.max(0,Number(readingTimerMs())||0);
    const r=readingState();
    if(!r)return 0;
    return Math.max(0,Number(r.timerElapsedMs||0)+(r.timerRunning&&r.timerStartedAt?Date.now()-Number(r.timerStartedAt):0));
  }

  function formatMs(ms){
    if(typeof fmtTimer==='function')return fmtTimer(ms);
    const total=Math.floor(Math.max(0,ms)/1000),h=Math.floor(total/3600),m=Math.floor((total%3600)/60),s=total%60;
    return [h,m,s].map(x=>String(x).padStart(2,'0')).join(':');
  }

  function persist(){
    if(typeof persistSilent==='function')persistSilent();
    if(typeof updateReadingLive==='function')updateReadingLive();
    refreshManualTime();
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
    if($('v51028-time-css'))return;
    const style=document.createElement('style');
    style.id='v51028-time-css';
    style.textContent=`
      #reading .v591-timer-controls button[onclick*="resetReadingTimer"]{display:none!important}
      #reading .v51028-edit-time{background:linear-gradient(#76549b,#5a3d76)!important;border-color:#9b75bc!important;color:#fff0c9!important}
      #reading .v51028-time-panel{margin:10px 0 0;padding:10px;background:linear-gradient(180deg,#f3dfb3,#e7cd97);border:1px solid #aa814d;box-shadow:inset 0 0 0 2px rgba(255,250,226,.42);color:#4b3425}
      #reading .v51028-time-panel[hidden]{display:none!important}
      #reading .v51028-time-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding-bottom:7px;margin-bottom:8px;border-bottom:1px dashed rgba(95,65,38,.34)}
      #reading .v51028-time-head b{font-family:Georgia,'Times New Roman',serif;font-size:11px;color:#4a3020}
      #reading .v51028-time-head small{display:block;margin-top:2px;font-size:6.5px;line-height:1.35;color:#80684f}
      #reading .v51028-time-now{flex:0 0 auto;padding:5px 7px;background:#2a1711;border:1px solid #8b6638;color:#edd39a;font:900 8px/1 ui-monospace,monospace;white-space:nowrap}
      #reading .v51028-time-inputs{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      #reading .v51028-time-field label{display:block;margin:0 0 4px;font-size:7.5px;font-weight:900;color:#664936}
      #reading .v51028-time-field input{width:100%;min-height:43px;background:#f9e8c0;border:1px solid #9f7a4c;font-size:14px;text-align:center}
      #reading .v51028-time-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}
      #reading .v51028-time-actions button{min-height:44px;margin:0!important;padding:7px 5px!important;font-size:7.5px!important;line-height:1.15}
      #reading .v51028-time-note{margin:8px 1px 0;font-size:6.3px;line-height:1.45;color:#735c45}
      #reading .v51028-reset-row{display:flex;justify-content:flex-end;margin-top:7px}
      #reading .v51028-reset{min-height:32px!important;padding:4px 8px!important;margin:0!important;font-size:6.5px!important;background:#6b4333!important}
      @media(max-width:390px){#reading .v51028-time-actions{grid-template-columns:1fr 1fr}}
    `;
    document.head.appendChild(style);
  }

  function inputMs(){
    const hours=Math.min(999,Math.floor(num($('v51028Hours')?.value)));
    const minutes=Math.min(59,Math.floor(num($('v51028Minutes')?.value)));
    return (hours*60+minutes)*60000;
  }

  function clearInputs(){
    if($('v51028Hours'))$('v51028Hours').value='';
    if($('v51028Minutes'))$('v51028Minutes').value='';
  }

  function refreshManualTime(){
    const now=$('v51028TimeNow');if(now)now.textContent=formatMs(timerMs());
  }

  function togglePanel(force){
    const panel=$('v51028TimePanel');if(!panel)return;
    const open=typeof force==='boolean'?force:panel.hidden;
    panel.hidden=!open;
    if(open){refreshManualTime();$('v51028Minutes')?.focus();}
  }

  function addMissedTime(){
    const r=readingState();if(!r)return;
    const add=inputMs();
    if(add<=0){if(typeof toast==='function')toast('Enter the missed reading time first.');return;}
    const wasRunning=!!r.timerRunning;
    r.timerElapsedMs=timerMs()+add;
    r.timerStartedAt=wasRunning?Date.now():null;
    r.timerRunning=wasRunning;
    persist();clearInputs();togglePanel(false);
    if(typeof toast==='function')toast(`Added ${formatMs(add)} of missed reading time.`);
  }

  function setExactTime(){
    const r=readingState();if(!r)return;
    const exact=inputMs();
    if(exact<=0){if(typeof toast==='function')toast('Enter the session time you actually read.');return;}
    r.timerElapsedMs=exact;
    r.timerStartedAt=null;
    r.timerRunning=false;
    persist();clearInputs();togglePanel(false);
    if(typeof toast==='function')toast(`Session time corrected to ${formatMs(exact)} and paused.`);
  }

  function resetFromDrawer(){
    if(typeof confirm==='function'&&!confirm('Reset the current session timer to 00:00:00?'))return;
    if(typeof resetReadingTimer==='function')resetReadingTimer();
    else{
      const r=readingState();if(!r)return;
      r.timerElapsedMs=0;r.timerStartedAt=null;r.timerRunning=false;persist();
    }
    clearInputs();refreshManualTime();togglePanel(false);
  }

  function build(){
    const wrap=document.querySelector('#reading .v591-timer-wrap');
    const controls=wrap?.querySelector('.v591-timer-controls');
    if(!wrap||!controls)return;

    if(!$('v51028EditTimeBtn')){
      const btn=document.createElement('button');
      btn.type='button';btn.id='v51028EditTimeBtn';btn.className='btn-purple v51028-edit-time';
      btn.textContent='✏️ Edit Time';btn.addEventListener('click',()=>togglePanel());
      controls.appendChild(btn);
    }

    if(!$('v51028TimePanel')){
      const panel=document.createElement('div');
      panel.id='v51028TimePanel';panel.className='v51028-time-panel';panel.hidden=true;
      panel.innerHTML=`
        <div class="v51028-time-head">
          <div><b>CORRECT SESSION TIME</b><small>Forgot to start or stop the timer? Fix it here.</small></div>
          <div id="v51028TimeNow" class="v51028-time-now">00:00:00</div>
        </div>
        <div class="v51028-time-inputs">
          <div class="v51028-time-field"><label>Hours</label><input id="v51028Hours" type="number" min="0" max="999" inputmode="numeric" placeholder="0"></div>
          <div class="v51028-time-field"><label>Minutes</label><input id="v51028Minutes" type="number" min="0" max="59" inputmode="numeric" placeholder="25"></div>
        </div>
        <div class="v51028-time-actions">
          <button id="v51028AddTime" type="button" class="btn-green">＋ ADD MISSED TIME</button>
          <button id="v51028SetTime" type="button" class="btn-blue">✓ SET TOTAL & PAUSE</button>
        </div>
        <div class="v51028-time-note">Added or corrected time stays in this session. Time-based quests are still credited only when you tap <b>End Session + Check Quests</b>, so manual fixes cannot double-count.</div>
        <div class="v51028-reset-row"><button id="v51028ResetTime" type="button" class="btn-plain v51028-reset">↺ RESET TIMER</button></div>`;
      wrap.appendChild(panel);
      $('v51028AddTime')?.addEventListener('click',addMissedTime);
      $('v51028SetTime')?.addEventListener('click',setExactTime);
      $('v51028ResetTime')?.addEventListener('click',resetFromDrawer);
    }
    refreshManualTime();
  }

  function wrapStatusRenderer(name){
    const fn=window[name];
    if(typeof fn!=='function'||fn.__v51028)return;
    const wrapped=function(){const out=fn.apply(this,arguments);setTimeout(stamp,0);return out;};
    wrapped.__v51028=true;window[name]=wrapped;
  }

  window.toggleManualReadingTime=togglePanel;
  window.addMissedReadingTime=addMissedTime;
  window.setExactReadingTime=setExactTime;

  function boot(){
    ensureCss();build();stamp();
    wrapStatusRenderer('renderSaveHealth');
    wrapStatusRenderer('renderAppStatus');
    [100,350,950,1900,3200].forEach(ms=>setTimeout(()=>{build();stamp();refreshManualTime();},ms));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){build();stamp();refreshManualTime();}});
})();