(()=>{
  'use strict';

  const SERVICE_UUID='7d2ea28a-f7bd-485a-bd9d-92ad6ecfe93e';
  const STATS_UUID='7d2ea28b-f7bd-485a-bd9d-92ad6ecfe93e';
  const EXPECTED_PROTOCOL=1;
  const EXPECTED_SESSION_ID=1;
  let activeDevice=null;

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
      #readerSyncModal .reader-sync-payload{margin-top:8px;padding:8px;background:#2b211c;border:1px dashed #a98e68;color:#f3e6c9;font-size:10px;word-break:break-all}
      #readerSyncModal .reader-sync-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
      #readerSyncModal .reader-sync-actions button{margin-top:0}
      @media(max-width:390px){#readerSyncModal .reader-sync-actions{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function modal(){return document.getElementById('readerSyncModal')}
  function stateEl(){return document.getElementById('readerSyncState')}
  function payloadEl(){return document.getElementById('readerSyncPayload')}
  function syncBtn(){return document.getElementById('readerSyncStart')}

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
    if(text){el.hidden=false;el.textContent='Received: '+text}
    else{el.hidden=true;el.textContent=''}
  }

  function openModal(){
    const el=modal();
    if(el) el.classList.add('show');
  }

  function closeModal(){
    const el=modal();
    if(el) el.classList.remove('show');
  }

  function disconnect(){
    try{
      if(activeDevice?.gatt?.connected) activeDevice.gatt.disconnect();
    }catch(_){ }
    activeDevice=null;
  }

  function describeError(error){
    if(!error) return 'Unknown Bluetooth error.';
    if(error.name==='NotFoundError') return 'No reader was selected. Put the e-reader on Reading MMO Sync, then try again.';
    if(error.name==='SecurityError') return 'Bluetooth access was blocked. Make sure the app is opened from its secure installed/web version.';
    if(error.name==='NetworkError') return 'The reader was found, but the Bluetooth connection dropped. Keep the reader on its sync screen and try again.';
    return `${error.name||'Bluetooth error'}: ${error.message||String(error)}`;
  }

  async function syncReader(){
    openModal();
    setPayload('');
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
        filters:[{services:[SERVICE_UUID]}]
      });
      activeDevice=device;

      setState(`Found ${device.name||'Reading MMO Reader'}.\nConnecting…`);
      const server=await device.gatt.connect();
      setState('Connected. Reading the Phase 1 sync payload…');

      const service=await server.getPrimaryService(SERVICE_UUID);
      const characteristic=await service.getCharacteristic(STATS_UUID);
      const value=await characteristic.readValue();
      const raw=new TextDecoder('utf-8').decode(value);
      setPayload(raw);

      let parsed;
      try{parsed=JSON.parse(raw)}catch(_){
        throw new Error('Reader returned data, but it was not valid JSON.');
      }

      if(Number(parsed?.p)!==EXPECTED_PROTOCOL || Number(parsed?.sid)!==EXPECTED_SESSION_ID){
        throw new Error(`Unexpected test payload. Expected protocol ${EXPECTED_PROTOCOL}, session ${EXPECTED_SESSION_ID}.`);
      }

      setState('✓ Reader sync test passed!\nSession 1 was received directly from the e-reader.','ok');
      if(typeof window.toast==='function') window.toast('✓ Reader connected — Session 1 received');
      else if(typeof toast==='function') toast('✓ Reader connected — Session 1 received');
    }catch(error){
      setState(describeError(error),'bad');
      if(typeof window.toast==='function') window.toast('Reader sync test did not complete');
    }finally{
      disconnect();
      if(button) button.disabled=false;
    }
  }

  function injectUi(){
    addStyles();

    const canvas=document.querySelector('#homePanelReading .v58-reading-canvas');
    if(canvas && !document.getElementById('readerSyncHomeButton')){
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
          <p class="reader-sync-help">On the e-reader, open <b>Reading MMO Sync</b> and leave the “Bluetooth is ready” screen showing. This first app test only reads the harmless Phase 1 test session; it does not change your reading history.</p>
          <div id="readerSyncState" class="reader-sync-state">Ready to test the reader connection.</div>
          <div id="readerSyncPayload" class="reader-sync-payload" hidden></div>
          <div class="reader-sync-actions">
            <button id="readerSyncStart" type="button" class="btn-green">FIND READER</button>
            <button id="readerSyncClose" type="button" class="btn-plain">CLOSE</button>
          </div>
        </div>`;
      document.body.appendChild(wrap);
      wrap.querySelector('#readerSyncStart').addEventListener('click',syncReader);
      wrap.querySelector('#readerSyncClose').addEventListener('click',closeModal);
      wrap.addEventListener('click',event=>{if(event.target===wrap) closeModal()});
    }
  }

  window.ReadingMmoReaderSync={
    sync:syncReader,
    disconnect,
    serviceUuid:SERVICE_UUID,
    characteristicUuid:STATS_UUID
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',injectUi,{once:true});
  else injectUi();
})();
