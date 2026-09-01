(()=>{
  'use strict';

  const SERVICE_UUID='7d2ea28a-f7bd-485a-bd9d-92ad6ecfe93e';
  const STATS_UUID='7d2ea28b-f7bd-485a-bd9d-92ad6ecfe93e';
  const EXPECTED_DEVICE_NAME='Reading MMO Reader';
  const IMPORTED_KEY='readingMmoReaderBlePhase2Imported';
  let activeDevice=null;
  let pendingPayload=null;
  let pendingRaw='';

  function addStyles(){
    if(document.getElementById('readingMmoBleStyles')) return;
    const style=document.createElement('style');
    style.id='readingMmoBleStyles';
    style.textContent=`
      .v58-reading-canvas>.reader-sync-hit{
        position:absolute!important;left:55.5%!important;top:76%!important;width:27%!important;height:10%!important;
        z-index:8!important;border:2px solid #c79a3b!important;border-radius:3px!important;
        background:linear-gradient(#6b4632,#4a3025)!important;color:#fff0cc!important;
        box-shadow:0 3px 0 rgba(55,31,21,.35)!important;padding:4px 6px!important;
        font:900 clamp(6.4px,1.8vw,8.5px)/1.05 ui-monospace,SFMono-Regular,Consolas,monospace!important;
        letter-spacing:.35px!important;text-shadow:1px 1px 0 #2f1d16!important;
      }
      .v58-reading-canvas>.reader-sync-hit:active{transform:translateY(2px)!important;box-shadow:none!important}
      #readerSyncModal .modal-card{max-width:430px;text-align:left}
      #readerSyncModal h2{text-align:center}
      #readerSyncModal .reader-sync-help{font-size:10px;line-height:1.5;color:#ead9b7;margin:0 0 10px}
      #readerSyncModal .reader-sync-state{background:#0f0c0a;border:1px solid #c79a3b;padding:11px;min-height:76px;font-size:11px;line-height:1.5;white-space:pre-wrap}
      #readerSyncModal .reader-sync-state.ok{border-color:#6f914d}
      #readerSyncModal .reader-sync-state.bad{border-color:#9e4b3c}
      #readerSyncModal .reader-sync-payload{margin-top:8px;padding:8px;background:#2b211c;border:1px dashed #a98e68;color:#f3e6c9;font-size:10px;white-space:pre-wrap;word-break:break-word}
      #readerSyncModal .reader-sync-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
      #readerSyncModal .reader-sync-actions button{margin-top:0}
      #readerSyncImport[hidden]{display:none!important}
      @media(max-width:390px){#readerSyncModal .reader-sync-actions{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  const $=id=>document.getElementById(id);
  function modal(){return $('readerSyncModal')}
  function stateEl(){return $('readerSyncState')}
  function payloadEl(){return $('readerSyncPayload')}
  function syncBtn(){return $('readerSyncStart')}
  function importBtn(){return $('readerSyncImport')}

  function setState(message,kind=''){
    const el=stateEl();
    if(!el) return;
    el.textContent=message;
    el.classList.remove('ok','bad');
    if(kind) el.classList.add(kind);
  }

  function setPayload(text){
    const el=payloadEl();
    if(!el) return;
    if(text){el.hidden=false;el.textContent=text}
    else{el.hidden=true;el.textContent=''}
  }

  function setImportVisible(show){
    const button=importBtn();
    if(button) button.hidden=!show;
  }

  function openModal(){modal()?.classList.add('show')}
  function closeModal(){modal()?.classList.remove('show')}

  function disconnect(){
    try{if(activeDevice?.gatt?.connected) activeDevice.gatt.disconnect()}catch(_){}
    activeDevice=null;
  }

  function describeError(error){
    if(!error) return 'Unknown Bluetooth error.';
    if(error.name==='NotFoundError') return 'No reader was selected. Put the e-reader on Reading MMO Sync, then try again.';
    if(error.name==='SecurityError') return 'Bluetooth access was blocked. Allow Nearby Devices/Bluetooth and open Reading MMO from its secure installed/Chrome version.';
    if(error.name==='NetworkError') return 'The reader was found, but the Bluetooth connection dropped. Keep the reader on its sync screen and try again.';
    return error.message ? `${error.name||'Bluetooth error'}: ${error.message}` : String(error);
  }

  function finiteNonNegative(value){
    return Number.isFinite(Number(value)) && Number(value)>=0;
  }

  function normalizeReaderPayload(parsed,raw){
    const protocol=Number(parsed?.p);
    if(protocol!==2&&protocol!==3) throw new Error(`Unexpected reader protocol. Expected Phase 2 or 3, received: ${raw}`);
    if(Number(parsed?.none)===1) return {none:true,p:protocol};
    for(const key of ['sid','sp','ep','pg','sec']){
      if(!finiteNonNegative(parsed?.[key])) throw new Error(`Reader payload is missing ${key}: ${raw}`);
    }
    const payload={
      p:protocol,
      sid:Number(parsed.sid),
      sp:Number(parsed.sp),
      ep:Number(parsed.ep),
      pg:Number(parsed.pg),
      sec:Number(parsed.sec),
      title:protocol>=3?String(parsed?.title||'').trim():''
    };
    if(payload.sid<1) throw new Error(`Invalid reader session id: ${raw}`);
    return payload;
  }

  function normalizeBookName(value){
    return String(value||'').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
  }

  function formatDuration(seconds){
    const sec=Math.max(0,Math.floor(Number(seconds)||0));
    const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;
    if(h) return `${h}h ${m}m ${s}s`;
    if(m) return `${m}m ${s}s`;
    return `${s}s`;
  }

  function fingerprint(payload){
    return [payload.sid,payload.sp,payload.ep,payload.pg,payload.sec].join(':');
  }

  function importedFingerprints(){
    try{
      const value=JSON.parse(localStorage.getItem(IMPORTED_KEY)||'[]');
      return Array.isArray(value)?value:[];
    }catch(_){return []}
  }

  function wasImported(payload){
    return importedFingerprints().includes(fingerprint(payload));
  }

  function rememberImported(payload){
    const list=importedFingerprints().filter(x=>x!==fingerprint(payload));
    list.push(fingerprint(payload));
    try{localStorage.setItem(IMPORTED_KEY,JSON.stringify(list.slice(-100)))}catch(_){}
  }

  function appState(){
    try{return typeof S!=='undefined'&&S&&S.reading?S:null}catch(_){return null}
  }

  function currentAppSessionActive(s){
    const r=s?.reading;
    if(!r) return false;
    let ms=Math.max(0,Number(r.timerElapsedMs)||0);
    if(r.timerRunning&&r.timerStartedAt) ms+=Math.max(0,Date.now()-Number(r.timerStartedAt));
    const logged=Math.max(0,Number(r.sessionLoggedPages)||0);
    const chapters=Math.max(0,Number(r.chapters)||0);
    let liveDelta=0;
    try{
      const current=Math.max(0,Number($('readCurrentPage')?.value)||Number(r.currentPage)||0);
      const start=Math.max(0,Number($('readSessionStartPage')?.value)||Number(r.sessionStartPage)||0);
      liveDelta=Math.max(0,current-start);
    }catch(_){}
    return ms>0||logged>0||chapters>0||liveDelta>0;
  }

  function renderAfterImport(){
    try{if(typeof renderReading==='function')renderReading()}catch(_){}
    try{if(typeof renderHome==='function')renderHome()}catch(_){}
    try{if(typeof renderProfile==='function')renderProfile()}catch(_){}
    try{if(typeof renderQuestCards==='function')renderQuestCards()}catch(_){}
    try{if(typeof renderBookProgress==='function')renderBookProgress()}catch(_){}
  }

  function importPendingSession(){
    const payload=pendingPayload;
    if(!payload||payload.none) return;
    const s=appState();
    if(!s){
      setState('Reader session received, but the Reading MMO save is not ready yet. Close and reopen the app, then sync again.','bad');
      return;
    }
    if(wasImported(payload)){
      setState(`✓ Session ${payload.sid} was already imported. Nothing was counted twice.`,'ok');
      setImportVisible(false);
      return;
    }
    if(currentAppSessionActive(s)){
      setState('Reader session is ready, but an in-app reading session is already active. End that session first, then tap Sync Reader again so the two sessions cannot be mixed.','bad');
      return;
    }
    if(typeof recordQuestPageProgress!=='function' ||
       typeof recordQuestSessionProgress!=='function' ||
       typeof persistSilent!=='function' ||
       typeof window.endReadingSession!=='function'){
      setState('Reader session is valid, but this app build is missing the session-import hooks. Refresh Reading MMO and try again.','bad');
      return;
    }

    const r=s.reading;
    const readerBookTitle=String(payload.title||'').trim();
    const currentBookTitle=String(r.bookName||$('readBookName')?.value||'').trim();
    const appHadCurrentBook=Boolean(currentBookTitle);
    const readerMatchesCurrent=!readerBookTitle||normalizeBookName(readerBookTitle)===normalizeBookName(currentBookTitle);
    const applyReaderPosition=readerMatchesCurrent||!appHadCurrentBook;
    if(readerBookTitle&&!appHadCurrentBook){
      r.bookName=readerBookTitle;
      if($('readBookName')) $('readBookName').value=readerBookTitle;
    }

    const snapshot={
      pages:Number(s.pages)||0,
      reading:JSON.parse(JSON.stringify(r)),
      quests:JSON.parse(JSON.stringify(s.quests||[]))
    };
    const beforeEnded=Number(r.lastSession?.endedAt||0);

    try{
      const pages=Math.max(0,Math.floor(payload.pg));
      const endPage=Math.max(0,Math.floor(payload.ep));
      const seconds=Math.max(0,Math.floor(payload.sec));

      s.pages=Math.max(0,Number(s.pages)||0)+pages;
      recordQuestPageProgress(pages);

      // Stage an exact external session, then let the app's normal End Session
      // path handle time-based quests, save/render, and the existing wrap-up UI.
      r.timerElapsedMs=seconds*1000;
      r.timerStartedAt=null;
      r.timerRunning=false;
      r.chapters=0;
      r.sessionLoggedPages=pages;
      if(applyReaderPosition&&endPage>0) r.currentPage=endPage;
      r.sessionStartPage=Math.max(0,Number(r.currentPage)||0);

      if(applyReaderPosition&&r.bookTotal>0&&r.currentPage>=0){
        r.percent=Number(Math.min(100,Math.max(0,r.currentPage/r.bookTotal*100)).toFixed(1));
      }

      if(applyReaderPosition){
        if($('readCurrentPage')) $('readCurrentPage').value=r.currentPage||'';
        if($('readSessionCurrentPage')) $('readSessionCurrentPage').value=r.currentPage||'';
        if($('readPercent')&&r.bookTotal>0) $('readPercent').value=r.percent;
      }
      if($('readSessionStartPage')) $('readSessionStartPage').value=r.sessionStartPage||'';

      // Page progress was already credited exactly from the reader's pg field.
      // Prevent commitSessionPageDelta() from deriving a second page delta.
      window.__readingMmoHistoryImportContext={
        source:'crossink',
        readerSessionId:payload.sid,
        startPage:payload.sp,
        endPage:payload.ep,
        pages,
        durationMs:seconds*1000,
        bookTitle:readerBookTitle||String(r.bookName||'')
      };
      try{
        window.endReadingSession();
      }finally{
        window.__readingMmoHistoryImportContext=null;
      }

      const after=s.reading?.lastSession;
      if(!after||Number(after.endedAt||0)===beforeEnded){
        throw new Error('Reading MMO did not commit the imported session.');
      }

      Object.assign(after,{
        source:'crossink',
        readerSessionId:payload.sid,
        readerStartPage:payload.sp,
        readerEndPage:payload.ep,
        readerBookTitle:readerBookTitle||String(r.bookName||'')
      });
      persistSilent();
      rememberImported(payload);
      renderAfterImport();

      pendingPayload=null;
      pendingRaw='';
      setImportVisible(false);
      setState(`✓ CrossInk Session ${payload.sid} imported into Reading MMO.`,'ok');
      const filedBook=readerBookTitle||String(r.bookName||'your Reading MMO book');
      const positionNote=applyReaderPosition
        ? `Book progress was updated to reader page ${payload.ep}.`
        : `The session was filed under ${filedBook}; your current Reading MMO book progress was left unchanged.`;
      setPayload(
        `IMPORTED FROM CROSSINK\n`+
        `Book: ${filedBook}\n`+
        `Page range: ${payload.sp} → ${payload.ep}\n`+
        `Pages read: ${payload.pg}\n`+
        `Reading time: ${formatDuration(payload.sec)}\n\n`+
        `Pages and reading time were applied to your Reading MMO totals/active quests.\n${positionNote}`
      );
      if(typeof window.toast==='function') window.toast(`✓ CrossInk Session ${payload.sid} imported`);
      else if(typeof toast==='function') toast(`✓ CrossInk Session ${payload.sid} imported`);
    }catch(error){
      try{
        s.pages=snapshot.pages;
        s.reading=snapshot.reading;
        s.quests=snapshot.quests;
        persistSilent();
        renderAfterImport();
      }catch(_){}
      setState(`Import failed safely — nothing was kept.\n${error.message||String(error)}`,'bad');
    }
  }

  async function syncReader(){
    openModal();
    pendingPayload=null;
    pendingRaw='';
    setPayload('');
    setImportVisible(false);
    const button=syncBtn();
    if(button) button.disabled=true;

    if(!window.isSecureContext || !('bluetooth' in navigator)){
      setState('Web Bluetooth is not available here. Open the installed Reading MMO app on Android/Chrome and try again.','bad');
      if(button) button.disabled=false;
      return;
    }

    try{
      disconnect();
      setState('Looking for Reading MMO Reader…\nChoose your reader in the Bluetooth picker.');

      const device=await navigator.bluetooth.requestDevice({
        filters:[{services:[SERVICE_UUID]}],
        optionalServices:[SERVICE_UUID]
      });
      activeDevice=device;

      if(device.name&&device.name!==EXPECTED_DEVICE_NAME){
        throw new Error(`Found ${device.name}, not ${EXPECTED_DEVICE_NAME}.`);
      }

      setState(`Found ${device.name||EXPECTED_DEVICE_NAME}.\nConnecting…`);
      const server=await device.gatt.connect();
      setState('Connected. Reading latest completed CrossInk session…');

      const service=await server.getPrimaryService(SERVICE_UUID);
      const characteristic=await service.getCharacteristic(STATS_UUID);
      const value=await characteristic.readValue();
      const raw=new TextDecoder('utf-8').decode(value.buffer).replace(/\0+$/g,'').trim();
      pendingRaw=raw;

      let parsed;
      try{parsed=JSON.parse(raw)}catch(_){
        throw new Error(`Reader returned data, but it was not valid JSON: ${raw||'(empty)'}`);
      }

      // Keep Phase 1 devices friendly while the new firmware rolls out.
      if(Number(parsed?.p)===1&&Number(parsed?.sid)===1){
        setState('✓ Reader connected — Phase 1 test payload received.','ok');
        setPayload(`CrossInk → Reading MMO\n${raw}\n\nBluetooth transport works. Flash the Phase 2 firmware to sync a real reading session.`);
        return;
      }

      const payload=normalizeReaderPayload(parsed,raw);
      if(payload.none){
        setState('✓ Reader connected — no completed reader session is stored yet.','ok');
        setPayload('Read normally on CrossInk for at least 60 seconds, leave the book so the session commits, then open Reading MMO Sync and try again.');
        return;
      }

      pendingPayload=payload;
      if(wasImported(payload)){
        setState(`✓ Reader connected — Session ${payload.sid} was already imported. Nothing will be counted twice.`,'ok');
        setPayload(
          `CROSSINK SESSION ${payload.sid}\n`+
          `${payload.title?`Book: ${payload.title}\n`:''}`+
          `Page range: ${payload.sp} → ${payload.ep}\n`+
          `Pages read: ${payload.pg}\n`+
          `Reading time: ${formatDuration(payload.sec)}`
        );
        return;
      }

      const book=appState()?.reading?.bookName||$('readBookName')?.value?.trim()||'';
      const readerBook=payload.title||book||'your current Reading MMO book';
      const differentBook=Boolean(payload.title&&book&&normalizeBookName(payload.title)!==normalizeBookName(book));
      setState(`✓ Reader connected — Session ${payload.sid} is ready to import${payload.title?` for ${payload.title}`:''}.`,'ok');
      setPayload(
        `CROSSINK SESSION ${payload.sid}\n`+
        `Book: ${readerBook}\n`+
        `Page range: ${payload.sp} → ${payload.ep}\n`+
        `Pages read: ${payload.pg}\n`+
        `Reading time: ${formatDuration(payload.sec)}\n\n`+
        `${differentBook?`Reader book differs from Current Book (${book}). This session will be filed under ${readerBook} without changing ${book}'s page progress.\n\n`:''}`+
        `Tap IMPORT SESSION to apply it to Reading MMO.`
      );
      setImportVisible(true);
    }catch(error){
      pendingPayload=null;
      pendingRaw='';
      setImportVisible(false);
      setState(describeError(error),'bad');
      if(typeof window.toast==='function') window.toast('Reader sync did not complete');
    }finally{
      disconnect();
      if(button) button.disabled=false;
    }
  }

  function injectUi(){
    addStyles();

    const canvas=document.querySelector('#homePanelReading .v58-reading-canvas');
    if(canvas&&!$('readerSyncHomeButton')){
      const button=document.createElement('button');
      button.id='readerSyncHomeButton';
      button.type='button';
      button.className='reader-sync-hit';
      button.setAttribute('aria-label','Sync Reading MMO reader');
      button.textContent='SYNC READER';
      button.addEventListener('click',syncReader);
      canvas.appendChild(button);
    }

    if(!modal()){
      const wrap=document.createElement('div');
      wrap.id='readerSyncModal';
      wrap.className='modal';
      wrap.setAttribute('role','dialog');
      wrap.setAttribute('aria-modal','true');
      wrap.setAttribute('aria-labelledby','readerSyncTitle');
      wrap.innerHTML=`
        <div class="modal-card">
          <h2 id="readerSyncTitle">READING MMO READER SYNC</h2>
          <p class="reader-sync-help">On the e-reader, open <b>Reading MMO Sync</b> and leave the Bluetooth-ready screen showing. Reading MMO will preview the completed session before anything is imported.</p>
          <div id="readerSyncState" class="reader-sync-state">Ready to sync your CrossInk reader.</div>
          <div id="readerSyncPayload" class="reader-sync-payload" hidden></div>
          <div class="reader-sync-actions">
            <button id="readerSyncStart" type="button" class="btn-green">FIND READER</button>
            <button id="readerSyncImport" type="button" class="btn-gold" hidden>IMPORT SESSION</button>
            <button id="readerSyncClose" type="button" class="btn-plain">CLOSE</button>
          </div>
        </div>`;
      document.body.appendChild(wrap);
      $('readerSyncStart')?.addEventListener('click',syncReader);
      $('readerSyncImport')?.addEventListener('click',importPendingSession);
      $('readerSyncClose')?.addEventListener('click',closeModal);
      wrap.addEventListener('click',event=>{if(event.target===wrap) closeModal()});
    }
  }

  window.ReadingMmoReaderSync={
    sync:syncReader,
    importPending:importPendingSession,
    disconnect,
    serviceUuid:SERVICE_UUID,
    characteristicUuid:STATS_UUID
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',injectUi,{once:true});
  else injectUi();
})();
