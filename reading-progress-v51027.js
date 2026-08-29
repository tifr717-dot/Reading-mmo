/* Reading MMO v5.10.27 — streamlined progress + session sync.
   Adds Percent / Page+Total input modes without changing quest/session accounting. */
(function(){
  'use strict';
  if(window.__v51027ProgressBooted)return;
  window.__v51027ProgressBooted=true;

  const BUILD='v5.10.27';
  const $=id=>document.getElementById(id);
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const num=v=>Math.max(0,Number(v)||0);

  function stamp(){
    window.__readingMmoVersionOwner=BUILD;
    const badge=$('headerVersionText'); if(badge)badge.textContent=BUILD;
    document.querySelectorAll('.health-row').forEach(row=>{
      if(row.querySelector('b')?.textContent.trim()==='Version'){
        const value=row.querySelector('span'); if(value)value.textContent=BUILD;
      }
    });
  }

  function ensureCss(){
    if($('v51027-progress-css'))return;
    const style=document.createElement('style');
    style.id='v51027-progress-css';
    style.textContent=`
      #reading .v591-mmo-total{display:none!important}
      #reading .v51027-sync{padding:2px 0 1px}
      #reading .v51027-mode-row{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:2px 0 10px}
      #reading .v51027-mode-row button{min-height:39px;padding:7px 5px;font-size:8px;box-shadow:none;background:#6d5643;border-color:#987342;color:#f6e5bd}
      #reading .v51027-mode-row button.active{background:linear-gradient(#76549b,#5d3f7e);border-color:#9870b9;box-shadow:inset 0 0 0 1px rgba(255,239,197,.16)}
      #reading .v51027-sync-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:end}
      #reading .v51027-sync-field label{margin:0 0 4px;font-size:8px;letter-spacing:.15px;color:#634733}
      #reading .v51027-sync-field input{min-height:44px;background:#f8e8c2;border:1px solid #9f7b4d;font-size:13px}
      #reading .v51027-sync-field.is-hidden{display:none}
      #reading .v51027-progress-preview{margin:10px 0 8px;padding:8px 9px;background:#2a1711;border:1px solid #8c6636;box-shadow:inset 0 0 0 2px rgba(207,159,73,.12);color:#ead19b}
      #reading .v51027-preview-head{display:flex;justify-content:space-between;gap:8px;font-size:8px;font-weight:900;letter-spacing:.15px}
      #reading .v51027-preview-head b{color:#f0d58f;font-size:9px}
      #reading .v51027-preview-bar{height:9px;margin-top:7px;background:#4a281d;border:1px solid #6d4c36;overflow:hidden}
      #reading .v51027-preview-bar>span{display:block;height:100%;width:0;background:#76549b;transition:width .18s ease}
      #reading .v51027-apply{width:100%;min-height:44px;margin:0!important;background:linear-gradient(#6f568f,#523b70)!important;font-size:9px!important;letter-spacing:.15px}
      #reading .v51027-copy{margin:0 0 9px;color:#745e49;font-size:7.5px;line-height:1.4}
      #reading .v51027-session-stats{display:block!important;margin-top:12px!important}
      #reading .v51027-session-card{border:1px solid #ad8a57;background:linear-gradient(180deg,#f5e4bc,#ead3a2);padding:10px;box-shadow:inset 0 0 0 2px rgba(255,250,225,.45)}
      #reading .v51027-session-head{display:flex;justify-content:space-between;align-items:end;gap:8px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px dashed rgba(107,76,43,.35)}
      #reading .v51027-session-head b{font-family:Georgia,'Times New Roman',serif;color:#4d3021;font-size:11px}
      #reading .v51027-session-head small{font-size:6.5px;color:#80674d;text-align:right}
      #reading .v51027-session-inputs{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      #reading .v51027-session-inputs label{font-size:7.5px;margin:0 0 4px;color:#654936}
      #reading .v51027-session-inputs input{min-height:42px;background:#fae9c1;border-color:#a17b4d;font-size:13px}
      #reading .v51027-session-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;align-items:stretch}
      #reading .v51027-use-current{min-height:43px;font-size:7.5px!important;padding:7px 5px!important;margin:0!important}
      #reading .v51027-pages-live{display:flex;align-items:center;justify-content:space-between;gap:8px;background:#f8e4b6;border:1px solid #aa824e;padding:6px 9px}
      #reading .v51027-pages-live span{font-size:6.8px;font-weight:900;color:#76593f;letter-spacing:.25px}
      #reading .v51027-pages-live b{font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#76509a}
      #reading .v51027-add-pages{width:100%;min-height:43px;margin-top:8px!important;font-size:8px!important;background:linear-gradient(#9b7415,#795607)!important}
      #reading .v51027-mmo-strip{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 0 0;padding:8px 10px;background:#281710;border:1px solid #8e6939;color:#dcc28c;box-shadow:inset 0 0 0 2px rgba(205,155,68,.11)}
      #reading .v51027-mmo-strip span{font-size:6.8px;font-weight:900;letter-spacing:.55px}
      #reading .v51027-mmo-strip b{font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#f0d58f}
      #reading .v51027-mmo-strip small{font:700 5.6px/1 ui-monospace,monospace;color:#9e896b;margin-left:4px}
      #reading .v591-tool-drawer summary .v591-tool-hint{font-size:6px}
      @media(max-width:390px){
        #reading .v51027-sync-grid,#reading .v51027-session-inputs,#reading .v51027-session-actions{grid-template-columns:1fr 1fr}
        #reading .v51027-session-head{align-items:flex-start}
      }
    `;
    document.head.appendChild(style);
  }

  function mode(){
    try{return localStorage.getItem('readingProgressInputMode')==='percent'?'percent':'page';}catch(_){return 'page';}
  }

  function setMode(next){
    next=next==='percent'?'percent':'page';
    try{localStorage.setItem('readingProgressInputMode',next);}catch(_){}
    document.querySelectorAll('#v51027ModeRow button').forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===next));
    $('v51027PercentField')?.classList.toggle('is-hidden',next!=='percent');
    $('v51027PageField')?.classList.toggle('is-hidden',next!=='page');
    previewProgress();
  }

  function progressValues(){
    const total=num($('progressTotalPages')?.value||$('readBookTotal')?.value||window.S?.reading?.bookTotal);
    const currentMode=mode();
    let page=num($('readCurrentPage')?.value||window.S?.reading?.currentPage);
    let pct=clamp(Number($('readPercent')?.value)||0,0,100);
    if(total){
      if(currentMode==='percent')page=clamp(Math.round(total*pct/100),0,total);
      else pct=clamp(page/total*100,0,100);
    }
    return {total,page,pct};
  }

  function previewProgress(){
    const {total,page,pct}=progressValues();
    if(mode()==='percent'&&$('readCurrentPage'))$('readCurrentPage').value=total?page:'';
    if(mode()==='page'&&$('readPercent'))$('readPercent').value=total?pct.toFixed(1):'';
    const label=$('v51027PreviewLabel');
    if(label)label.textContent=total?`PAGE ${page.toLocaleString()} / ${total.toLocaleString()}`:(page?`PAGE ${page.toLocaleString()}`:'SET YOUR POSITION');
    const percent=$('v51027PreviewPercent');if(percent)percent.textContent=total?`${pct.toFixed(1)}%`:'—';
    const bar=$('v51027PreviewBar');if(bar)bar.style.width=`${total?pct:0}%`;
  }

  function applyProgress(){
    const total=num($('progressTotalPages')?.value||$('readBookTotal')?.value);
    if(!total){if(typeof toast==='function')toast('Enter the total book pages first.');return;}
    if($('readBookTotal'))$('readBookTotal').value=total;
    if(mode()==='percent'){
      if(typeof calcPageFromPercent==='function')calcPageFromPercent();
    }else{
      if(typeof calcPercentFromPage==='function')calcPercentFromPage();
    }
    if(typeof saveReadingDesk==='function')saveReadingDesk(true);
    syncFromState();
    const {page,pct}=progressValues();
    if(typeof toast==='function')toast(`Progress updated — page ${page.toLocaleString()} • ${pct.toFixed(1)}%.`);
  }

  function buildProgressSync(){
    const drawer=document.querySelector('#reading .v591-tool-drawer');
    if(!drawer)return;
    const summary=drawer.querySelector('summary');
    if(summary){
      const spans=summary.querySelectorAll('span');
      if(spans[0])spans[0].textContent='📖';
      if(spans[1])spans[1].textContent='PROGRESS SYNC';
      if(spans[2])spans[2].textContent='percent or pages';
    }
    const body=drawer.querySelector('.v591-tool-body');
    if(!body||body.dataset.v51027==='1')return;
    body.dataset.v51027='1';
    body.innerHTML=`
      <div class="v51027-sync">
        <div class="v51027-copy">Choose what your e-reader shows. The app calculates the other value and keeps your book progress in sync.</div>
        <div id="v51027ModeRow" class="v51027-mode-row">
          <button type="button" data-mode="page" onclick="setProgressInputMode('page')">PAGE / TOTAL</button>
          <button type="button" data-mode="percent" onclick="setProgressInputMode('percent')">PERCENT</button>
        </div>
        <div class="v51027-sync-grid">
          <div id="v51027PageField" class="v51027-sync-field"><label>Current page</label><input id="readCurrentPage" type="number" min="0" inputmode="numeric" placeholder="210" oninput="previewReadingProgress()"></div>
          <div id="v51027PercentField" class="v51027-sync-field"><label>Current %</label><input id="readPercent" type="number" min="0" max="100" step="0.1" inputmode="decimal" placeholder="52.9" oninput="previewReadingProgress()"></div>
          <div class="v51027-sync-field"><label>Total pages</label><input id="progressTotalPages" type="number" min="1" inputmode="numeric" placeholder="397" oninput="syncProgressTotal();previewReadingProgress()"></div>
        </div>
        <div class="v51027-progress-preview">
          <div class="v51027-preview-head"><b id="v51027PreviewLabel">SET YOUR POSITION</b><span id="v51027PreviewPercent">—</span></div>
          <div class="v51027-preview-bar"><span id="v51027PreviewBar"></span></div>
        </div>
        <button type="button" class="btn-purple v51027-apply" onclick="applyReadingProgress()">✓ APPLY PROGRESS</button>
        <div id="readPositionResult" style="display:none"></div>
      </div>`;
    drawer.addEventListener('toggle',()=>{if(drawer.open)syncFromState();});
  }

  function syncTotal(){
    const total=num($('progressTotalPages')?.value);
    if(total&&$('readBookTotal'))$('readBookTotal').value=total;
  }

  function sessionPreview(){
    const current=num($('readSessionCurrentPage')?.value);
    if($('readCurrentPage'))$('readCurrentPage').value=current||'';
    const total=num($('readBookTotal')?.value||window.S?.reading?.bookTotal);
    if(total&&$('readPercent'))$('readPercent').value=clamp(current/total*100,0,100).toFixed(1);
    if(typeof updateReadingLive==='function')updateReadingLive();
    previewProgress();
  }

  function commitSessionCurrent(){
    sessionPreview();
    if(!window.S?.reading)return;
    const current=num($('readSessionCurrentPage')?.value);
    const total=num($('readBookTotal')?.value||window.S.reading.bookTotal);
    window.S.reading.currentPage=current;
    if(total){window.S.reading.bookTotal=total;window.S.reading.percent=Number(clamp(current/total*100,0,100).toFixed(1));}
    if(typeof persistSilent==='function')persistSilent();
    if(typeof renderBookProgress==='function')renderBookProgress();
    updateMmoTotal();
  }

  function startFromCurrent(){
    commitSessionCurrent();
    if(typeof setSessionStartFromCurrent==='function')setSessionStartFromCurrent();
    syncFromState(false);
  }

  function addSessionPages(){
    commitSessionCurrent();
    if(typeof logSessionPages==='function')logSessionPages();
    syncFromState(false);
  }

  function buildSession(){
    const stats=document.querySelector('#reading .v591-session-stats');
    if(!stats||stats.dataset.v51027==='1')return;
    stats.dataset.v51027='1';
    stats.classList.add('v51027-session-stats');
    stats.innerHTML=`
      <div class="v51027-session-card">
        <div class="v51027-session-head"><b>SESSION PROGRESS</b><small>Pages read calculate automatically</small></div>
        <div class="v51027-session-inputs">
          <div><label>Start page</label><input id="readSessionStartPage" type="number" min="0" inputmode="numeric"></div>
          <div><label>Current page</label><input id="readSessionCurrentPage" type="number" min="0" inputmode="numeric" oninput="previewSessionPage()" onchange="commitSessionPage()"></div>
        </div>
        <div class="v51027-session-actions">
          <button type="button" class="btn-blue v51027-use-current" onclick="setSessionStartSmart()">↳ SET START = CURRENT</button>
          <div class="v51027-pages-live"><span>PAGES READ</span><b id="readPagesSession">0</b></div>
        </div>
        <button type="button" class="btn-gold v51027-add-pages" onclick="addSessionPagesSmart()">＋ ADD PAGES TO MMO</button>
      </div>`;

    if(!$('v51027MmoTotal')){
      const strip=document.createElement('div');
      strip.id='v51027MmoTotal';strip.className='v51027-mmo-strip';
      strip.innerHTML='<span>MMO READING TOTAL</span><div><b id="v51027MmoNumber">0</b><small>PAGES</small></div>';
      stats.insertAdjacentElement('afterend',strip);
    }

    const end=document.querySelector('#reading .v595-end-session');
    if(end&&!end.dataset.v51027){
      end.dataset.v51027='1';
      end.setAttribute('onclick','commitSessionPage();endReadingSession()');
      const sm=end.querySelector('small');if(sm)sm.textContent='record pages • time • chapters • check quests';
    }
  }

  function updateMmoTotal(){
    const total=num(window.S?.pages||$('readMmoPages')?.value);
    const el=$('v51027MmoNumber');if(el)el.textContent=total.toLocaleString();
  }

  function polishBookFields(){
    const modeSelect=$('readMode');
    const modeLabel=modeSelect?.closest('.v591-field')?.querySelector('label');if(modeLabel)modeLabel.textContent='Reading mode';
    const totalLabel=$('readBookTotal')?.closest('.v591-field')?.querySelector('label');if(totalLabel)totalLabel.textContent='Book length';
    const mmo=$('readMmoPages')?.closest('.v591-field');if(mmo)mmo.style.display='none';
    const totalInput=$('readBookTotal');
    if(totalInput&&!totalInput.dataset.v51027){
      totalInput.dataset.v51027='1';
      totalInput.addEventListener('input',()=>{
        if($('progressTotalPages'))$('progressTotalPages').value=totalInput.value;
        previewProgress();
      });
    }
  }

  function syncFromState(syncSessionCurrent=true){
    const r=window.S?.reading||{};
    if($('progressTotalPages'))$('progressTotalPages').value=$('readBookTotal')?.value||r.bookTotal||'';
    if($('readCurrentPage'))$('readCurrentPage').value=r.currentPage||$('readCurrentPage').value||'';
    if($('readPercent'))$('readPercent').value=(r.percent||r.percent===0)?r.percent:$('readPercent').value||'';
    if($('readSessionStartPage'))$('readSessionStartPage').value=r.sessionStartPage||'';
    if(syncSessionCurrent&&$('readSessionCurrentPage'))$('readSessionCurrentPage').value=r.currentPage||'';
    setMode(mode());
    if(typeof updateReadingLive==='function')updateReadingLive();
    updateMmoTotal();
    stamp();
  }

  function wrapRenderers(){
    if(typeof window.renderReading==='function'&&!window.renderReading.__v51027){
      const old=window.renderReading;
      const wrapped=function(){const out=old.apply(this,arguments);setTimeout(()=>syncFromState(),0);return out;};
      wrapped.__v51027=true;window.renderReading=wrapped;
    }
    if(typeof window.renderSaveHealth==='function'&&!window.renderSaveHealth.__v51027){
      const old=window.renderSaveHealth;
      const wrapped=function(){const out=old.apply(this,arguments);setTimeout(stamp,0);return out;};
      wrapped.__v51027=true;window.renderSaveHealth=wrapped;
    }
  }

  window.setProgressInputMode=setMode;
  window.previewReadingProgress=previewProgress;
  window.syncProgressTotal=syncTotal;
  window.applyReadingProgress=applyProgress;
  window.previewSessionPage=sessionPreview;
  window.commitSessionPage=commitSessionCurrent;
  window.setSessionStartSmart=startFromCurrent;
  window.addSessionPagesSmart=addSessionPages;

  function boot(){
    ensureCss();
    buildProgressSync();
    buildSession();
    polishBookFields();
    wrapRenderers();
    syncFromState();
    [80,300,900,1800].forEach(ms=>setTimeout(()=>{stamp();polishBookFields();updateMmoTotal();},ms));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)stamp();});
})();
