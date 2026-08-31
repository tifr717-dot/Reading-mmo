(() => {
  'use strict';

  const SERVICE_UUID = '7d2ea28a-f7bd-485a-bd9d-92ad6ecfe93e';
  const CHARACTERISTIC_UUID = '7d2ea28b-f7bd-485a-bd9d-92ad6ecfe93e';
  const EXPECTED_DEVICE_NAME = 'Reading MMO Reader';
  const LAST_PREVIEW_KEY = 'readingMmoReaderBlePhase2LastPayload';
  const UI_ID = 'crossInkReaderSyncBlock';

  function addStyles() {
    if (document.getElementById('crossInkReaderSyncStyles')) return;
    const style = document.createElement('style');
    style.id = 'crossInkReaderSyncStyles';
    style.textContent = `
      #${UI_ID}{margin-bottom:12px}
      #${UI_ID} .reader-sync-status{margin:7px 0}
      #${UI_ID} .reader-sync-payload{display:none;margin-top:8px;word-break:break-word}
      #${UI_ID} .reader-sync-payload.show{display:block}
      #${UI_ID} .reader-sync-last{margin-top:6px}
      #${UI_ID} .reader-sync-help{display:block;margin-top:7px}
      #${UI_ID} .reader-sync-preview-note{margin-top:8px;padding:8px;border:1px dashed #9b6d00;background:#fff2c9;font-weight:900;font-size:10px}
      #readerSyncButton{width:100%;min-height:46px}
    `;
    document.head.appendChild(style);
  }

  function findSetupHost() {
    const setup = document.getElementById('setupPanel');
    if (!setup) return null;
    return setup.querySelector('.v593-ledger-card') || setup;
  }

  function formatDuration(seconds) {
    const sec = Math.max(0, Number(seconds) || 0);
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const remainder = sec % 60;
    if (hours) return `${hours}h ${minutes}m ${remainder}s`;
    if (minutes) return `${minutes}m ${remainder}s`;
    return `${remainder}s`;
  }

  function formatLastPreview() {
    try {
      const saved = JSON.parse(localStorage.getItem(LAST_PREVIEW_KEY) || 'null');
      if (!saved || !saved.receivedAt || !saved.payload) return 'No real CrossInk session preview received yet.';
      const when = new Date(saved.receivedAt);
      const timeText = Number.isNaN(when.getTime()) ? '' : ` • ${when.toLocaleString()}`;
      return `Last preview: Session ${saved.payload.sid} • ${saved.payload.pg} pages • ${formatDuration(saved.payload.sec)}${timeText}`;
    } catch (_) {
      return 'No real CrossInk session preview received yet.';
    }
  }

  function installUi() {
    if (document.getElementById(UI_ID)) return;
    const host = findSetupHost();
    if (!host) return;

    addStyles();
    const block = document.createElement('div');
    block.id = UI_ID;
    block.className = 'v593-setup-block';
    block.innerHTML = `
      <div class="v593-mini-title">📖 CROSSINK READER</div>
      <div id="readerSyncStatus" class="simple-status reader-sync-status">Ready to preview your latest completed reader session.</div>
      <button id="readerSyncButton" class="btn-green v593-full" type="button">🔵 Sync Reader</button>
      <div id="readerSyncPayload" class="result reader-sync-payload" aria-live="polite"></div>
      <div class="reader-sync-preview-note">🧪 PHASE 2 PREVIEW ONLY — received reader sessions are not added to your Reading MMO stats, XP, quests, or history yet.</div>
      <div id="readerSyncLast" class="muted reader-sync-last"></div>
      <small class="reader-sync-help">On your CrossInk first choose <b>Home → Reading MMO Sync</b>. Then tap Sync Reader here. Phase 2 reads the latest completed CrossInk session.</small>
    `;

    const firstSetupBlock = host.querySelector('.v593-setup-block');
    if (firstSetupBlock) host.insertBefore(block, firstSetupBlock);
    else host.appendChild(block);

    const last = document.getElementById('readerSyncLast');
    if (last) last.textContent = formatLastPreview();
    document.getElementById('readerSyncButton')?.addEventListener('click', syncReader);
  }

  function setStatus(message, kind = 'normal') {
    const el = document.getElementById('readerSyncStatus');
    if (!el) return;
    el.textContent = message;
    el.style.borderColor = kind === 'success' ? '#5f8045' : kind === 'error' ? '#9e4b3c' : '';
    el.style.background = kind === 'success' ? '#e0edcf' : kind === 'error' ? '#f2d6cf' : '';
  }

  function showPayload(text) {
    const el = document.getElementById('readerSyncPayload');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
  }

  function friendlyBleError(error) {
    if (!error) return 'Bluetooth sync did not complete.';
    if (error.name === 'NotFoundError') {
      return 'No reader was selected. Make sure CrossInk is on Reading MMO Sync, then try again.';
    }
    if (error.name === 'SecurityError') {
      return 'Bluetooth permission was blocked. Allow Nearby Devices/Bluetooth for Reading MMO and try again.';
    }
    if (error.name === 'NetworkError') {
      return 'The reader was found but the Bluetooth connection dropped. Re-open Reading MMO Sync on CrossInk and retry.';
    }
    return error.message ? `Bluetooth sync failed: ${error.message}` : 'Bluetooth sync did not complete.';
  }

  function isFiniteNonNegative(value) {
    return Number.isFinite(Number(value)) && Number(value) >= 0;
  }

  function validatePhase2Payload(payload, text) {
    if (payload.p !== 2) throw new Error(`Unexpected reader protocol: ${text}`);
    if (payload.none === 1) return { none: true };

    for (const key of ['sid', 'sp', 'ep', 'pg', 'sec']) {
      if (!isFiniteNonNegative(payload[key])) throw new Error(`Phase 2 payload is missing ${key}: ${text}`);
    }
    if (Number(payload.sid) < 1) throw new Error(`Invalid session id: ${text}`);
    return { none: false };
  }

  async function syncReader() {
    const button = document.getElementById('readerSyncButton');
    if (button) button.disabled = true;
    let device = null;
    let finished = false;

    try {
      showPayload('');
      document.getElementById('readerSyncPayload')?.classList.remove('show');

      if (!navigator.bluetooth || typeof navigator.bluetooth.requestDevice !== 'function') {
        throw new Error('This installed browser does not expose Web Bluetooth. Open/install Reading MMO with Chrome on Android.');
      }

      setStatus('Scanning for Reading MMO Reader…');
      device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [SERVICE_UUID] }],
        optionalServices: [SERVICE_UUID]
      });

      if (device.name && device.name !== EXPECTED_DEVICE_NAME) {
        throw new Error(`Found ${device.name}, not ${EXPECTED_DEVICE_NAME}.`);
      }

      device.addEventListener('gattserverdisconnected', () => {
        if (!finished) setStatus('Reader disconnected before the preview finished.', 'error');
      });

      setStatus(`Found ${device.name || EXPECTED_DEVICE_NAME}. Connecting…`);
      const server = await device.gatt.connect();

      setStatus('Connected. Opening Reading MMO service…');
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

      setStatus('Reading latest completed CrossInk session…');
      const value = await characteristic.readValue();
      const text = new TextDecoder('utf-8').decode(value.buffer).replace(/\0+$/g, '').trim();
      let payload;
      try {
        payload = JSON.parse(text);
      } catch (_) {
        throw new Error(`Reader returned data that was not valid JSON: ${text || '(empty)'}`);
      }

      // Keep the already-proven Phase 1 firmware friendly while Phase 2 rolls out.
      if (payload.p === 1 && payload.sid === 1) {
        finished = true;
        setStatus('✓ Reader connected — Phase 1 test payload received', 'success');
        showPayload(`CrossInk → Reading MMO\n${text}\n\nPhase 1 connection still works. Flash Phase 2 firmware to preview a real session.`);
        return;
      }

      const result = validatePhase2Payload(payload, text);
      finished = true;

      if (result.none) {
        setStatus('✓ Reader connected — no completed Phase 2 session is stored yet', 'success');
        showPayload('CrossInk → Reading MMO\nNo completed session is ready yet.\n\nRead normally for at least 60 seconds, leave the book so CrossInk commits the session, then open Reading MMO Sync again.');
        return;
      }

      const normalized = {
        p: 2,
        sid: Number(payload.sid),
        sp: Number(payload.sp),
        ep: Number(payload.ep),
        pg: Number(payload.pg),
        sec: Number(payload.sec)
      };
      localStorage.setItem(LAST_PREVIEW_KEY, JSON.stringify({ text, payload: normalized, receivedAt: Date.now() }));

      const pageRange = normalized.sp > 0 && normalized.ep > 0
        ? `${normalized.sp} → ${normalized.ep}`
        : normalized.ep > 0 ? `ending on page ${normalized.ep}` : 'page range unavailable';

      setStatus(`✓ Reader connected — Session ${normalized.sid} received`, 'success');
      showPayload(
        `REAL CROSSINK SESSION — PREVIEW ONLY\n\n` +
        `Session ID: ${normalized.sid}\n` +
        `Page range: ${pageRange}\n` +
        `Pages read: ${normalized.pg}\n` +
        `Reading time: ${formatDuration(normalized.sec)}\n\n` +
        `Raw: ${text}\n\n` +
        `Nothing was added to Reading MMO stats, XP, quests, or history.`
      );
      const last = document.getElementById('readerSyncLast');
      if (last) last.textContent = formatLastPreview();
    } catch (error) {
      finished = true;
      console.error('Reading MMO CrossInk BLE session preview failed', error);
      setStatus(friendlyBleError(error), 'error');
    } finally {
      try {
        if (device?.gatt?.connected) device.gatt.disconnect();
      } catch (_) {}
      if (button) button.disabled = false;
    }
  }

  function init() {
    installUi();
    let attempts = 0;
    const timer = setInterval(() => {
      installUi();
      attempts += 1;
      if (attempts >= 20 || document.getElementById(UI_ID)) clearInterval(timer);
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
