(() => {
  'use strict';

  const LOG_KEY = 'readingHubDailyLogV1';
  const IMPORT_KEY = 'readingHubX4ProImportsV1';
  const SERVICE_UUID = '7d2ea28a-f7bd-485a-bd9d-92ad6ecfe93e';
  const CHARACTERISTIC_UUID = '7d2ea28b-f7bd-485a-bd9d-92ad6ecfe93e';
  let viewDate = new Date();
  viewDate.setDate(1);

  const $ = id => document.getElementById(id);
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function readLogs() {
    try {
      const v = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (_) { return []; }
  }

  function writeLogs(rows) {
    localStorage.setItem(LOG_KEY, JSON.stringify(rows));
  }

  function importedIds() {
    try {
      const v = JSON.parse(localStorage.getItem(IMPORT_KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (_) { return []; }
  }

  function rememberImports(newIds) {
    const incoming = Array.isArray(newIds) ? newIds : [newIds];
    const ids = importedIds().filter(x => !incoming.includes(x));
    incoming.forEach(id => { if (id) ids.push(id); });
    localStorage.setItem(IMPORT_KEY, JSON.stringify(ids.slice(-2000)));
  }

  function isoLocal(d) {
    const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
    return y+'-'+m+'-'+day;
  }

  function monthRows() {
    const year = viewDate.getFullYear(), month = viewDate.getMonth();
    return readLogs().filter(r => {
      const d = new Date(String(r.date)+'T12:00:00');
      return !isNaN(d) && d.getFullYear() === year && d.getMonth() === month;
    });
  }

  function byDate(rows) {
    return rows.reduce((acc,r) => ((acc[r.date] ||= []).push(r), acc), {});
  }

  function allLogs() {
    return readLogs().slice().sort((a,b)=>{
      const da=String(a.date||''), db=String(b.date||'');
      if (da !== db) return da.localeCompare(db);
      return String(a.importedAt||'').localeCompare(String(b.importedAt||''));
    });
  }

  function findLibraryBook(title) {
    const clean = String(title||'').trim().toLowerCase();
    if (!clean) return null;
    const base = clean.replace(/\s*\([^)]*\)\s*$/,'').trim();
    const books = window.READING_LIBRARY_DATA || [];
    return books.find(b => String(b.title||'').trim().toLowerCase() === clean)
      || books.find(b => String(b.title||'').trim().toLowerCase().replace(/\s*\([^)]*\)\s*$/,'').trim() === base)
      || null;
  }

  function updateHomeFromDiary() {
    const rows = allLogs();
    if (!rows.length) return;
    const today = isoLocal(new Date());
    const todayRows = rows.filter(r=>r.date===today);
    const todayPages = todayRows.reduce((n,r)=>n+(Number(r.pages)||0),0);
    const todaySeconds = todayRows.reduce((n,r)=>n+(Number(r.seconds)||0),0);
    if ($('todayPages')) $('todayPages').textContent = todayPages;
    if ($('todayMinutes')) $('todayMinutes').textContent = Math.floor(todaySeconds/60);

    const latest = rows[rows.length-1];
    const sameBook = rows.filter(r=>r.title===latest.title && r.date===latest.date);
    const last = sameBook[sameBook.length-1] || latest;
    const pct = Number(last.endPercent);
    const book = findLibraryBook(last.title);
    const titleEl = document.querySelector('#home .book');
    const authorEl = document.querySelector('#home .author');
    const labelEl = document.querySelector('#home .label');
    if (titleEl) titleEl.textContent = last.title || 'Current book';
    if (authorEl) authorEl.textContent = book ? [book.author,book.series].filter(Boolean).join(' · ') : 'Synced from X4 Pro';
    if (Number.isFinite(pct)) {
      if ($('currentProgress')) $('currentProgress').style.width = Math.max(0,Math.min(100,pct))+'%';
      if ($('progressText')) $('progressText').textContent = pct.toFixed(1)+'% complete';
    }
    if (labelEl) labelEl.textContent = 'Currently reading · synced '+new Date(last.date+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'});
    const homeCover = $('homeCover');
    if (homeCover && window.ReadingCovers) window.ReadingCovers.refreshElement(homeCover,last.title||'',book?.author||'');

    const compare = $('homePageCompare');
    const totalPrint = Number(book?.pages)||0;
    const endXte = Number(last.endXte)||0;
    if (compare && totalPrint>0 && Number.isFinite(pct) && endXte>0) {
      const estimatedPrint = Math.max(1,Math.min(totalPrint,Math.round(totalPrint*pct/100)));
      if ($('homeActualPage')) $('homeActualPage').textContent = estimatedPrint;
      if ($('homeActualTotal')) $('homeActualTotal').textContent = 'of '+totalPrint+' pages';
      if ($('homeXtePage')) $('homeXtePage').textContent = endXte;
      const startPct = Number(sameBook[0]?.startPercent);
      const startXte = Number(sameBook[0]?.startXte);
      const printDelta = Number.isFinite(startPct) ? Math.max(0,Math.round(totalPrint*(pct-startPct)/100)) : null;
      const xteDelta = startXte>0 ? Math.max(0,endXte-startXte) : null;
      if ($('homePageCompareNote')) {
        $('homePageCompareNote').textContent =
          printDelta!=null && xteDelta!=null
            ? 'Last synced session: ~'+printDelta+' print pages · '+xteDelta+' XTE pages · +'+Math.max(0,pct-startPct).toFixed(1)+'%'
            : 'Print '+estimatedPrint+' · XTE '+endXte;
      }
      compare.hidden = false;
    } else if (compare) {
      compare.hidden = true;
    }
  }


  function estimatePrintDelta(rows,book){
    const total=Number(book?.pages)||0;
    if(!total||!rows.length)return 0;
    return rows.reduce((sum,r)=>{
      const a=Number(r.startPercent),b=Number(r.endPercent);
      return sum+(Number.isFinite(a)&&Number.isFinite(b)?Math.max(0,Math.round(total*(b-a)/100)):0);
    },0);
  }

  function renderHomeDashboard(){
    const rows=allLogs();
    const today=isoLocal(new Date());
    const dayRows=rows.filter(r=>r.date===today);
    const currentTitle=(rows[rows.length-1]?.title)||'';
    const currentBook=findLibraryBook(currentTitle);
    const todayXte=dayRows.reduce((n,r)=>n+(Number(r.pages)||0),0);
    const todaySec=dayRows.reduce((n,r)=>n+(Number(r.seconds)||0),0);
    const todaySessions=dayRows.reduce((n,r)=>n+(Number(r.sessions)||0),0);
    if($('todayPages'))$('todayPages').textContent=todayXte;
    if($('todayPrintPages'))$('todayPrintPages').textContent=estimatePrintDelta(dayRows,currentBook);
    if($('todayMinutes'))$('todayMinutes').textContent=Math.floor(todaySec/60);
    if($('todaySessions'))$('todaySessions').textContent=todaySessions||0;

    const daily={};
    rows.forEach(r=>{
      const d=String(r.date||'');
      (daily[d]||=( {pages:0,seconds:0,sessions:0} ));
      daily[d].pages+=Number(r.pages)||0;
      daily[d].seconds+=Number(r.seconds)||0;
      daily[d].sessions+=Number(r.sessions)||0;
    });

    const seven=[];
    for(let i=6;i>=0;i--){
      const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-i);
      const iso=isoLocal(d),v=daily[iso]||{pages:0,seconds:0};
      seven.push({date:iso,label:d.toLocaleDateString(undefined,{weekday:'short'}).slice(0,1),pages:v.pages,seconds:v.seconds});
    }
    const maxPages=Math.max(1,...seven.map(x=>x.pages));
    if($('homeActivityBars'))$('homeActivityBars').innerHTML=seven.map(x=>{
      const h=Math.max(4,Math.round((x.pages/maxPages)*72));
      return '<div class="activity-day '+(x.pages?'':'zero')+'"><div class="activity-track"><div class="activity-fill" style="height:'+h+'px"></div></div><div class="activity-value">'+(x.pages||'')+'</div><div class="activity-label">'+x.label+'</div></div>';
    }).join('');
    const sevenPages=seven.reduce((n,x)=>n+x.pages,0);
    const sevenMin=Math.floor(seven.reduce((n,x)=>n+x.seconds,0)/60);
    if($('sevenDayTotal'))$('sevenDayTotal').textContent=sevenPages+' XTE pages';
    if($('sevenDayMinutes'))$('sevenDayMinutes').textContent=sevenMin+' min';

    const now=new Date(), y=now.getFullYear(),m=now.getMonth();
    const monthRows=rows.filter(r=>{const d=new Date(r.date+'T12:00:00');return !isNaN(d)&&d.getFullYear()===y&&d.getMonth()===m});
    const monthGrouped=byDate(monthRows);
    const monthDays=Object.keys(monthGrouped);
    const monthPages=monthRows.reduce((n,r)=>n+(Number(r.pages)||0),0);
    const monthMin=Math.floor(monthRows.reduce((n,r)=>n+(Number(r.seconds)||0),0)/60);
    const bestDay=Math.max(0,...Object.values(monthGrouped).map(list=>list.reduce((n,r)=>n+(Number(r.pages)||0),0)));
    if($('homeMonthDays'))$('homeMonthDays').textContent=monthDays.length;
    if($('homeMonthPages'))$('homeMonthPages').textContent=monthPages;
    if($('homeMonthMinutes'))$('homeMonthMinutes').textContent=monthMin;
    if($('homeBestDay'))$('homeBestDay').textContent=bestDay;

    let streak=0,lastRead='';
    const readDates=Object.keys(daily).filter(d=>daily[d].pages>0||daily[d].seconds>0).sort();
    if(readDates.length){
      lastRead=readDates[readDates.length-1];
      let cursor=new Date(lastRead+'T12:00:00');
      while(true){
        const k=isoLocal(cursor);
        if(!(daily[k]&&(daily[k].pages>0||daily[k].seconds>0)))break;
        streak++;cursor.setDate(cursor.getDate()-1);
      }
    }
    if($('homeStreak'))$('homeStreak').textContent=streak;
    if($('homeStreakLabel'))$('homeStreakLabel').textContent=streak===1?'day':'days';
    if($('homeStreakFoot'))$('homeStreakFoot').textContent=lastRead
      ? 'Streak through '+new Date(lastRead+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'})+'.'
      : 'Your reading rhythm will build here.';

    const latest=rows[rows.length-1];
    if(latest&&$('homeLastSession')){
      const same=rows.filter(r=>r.date===latest.date&&r.title===latest.title);
      const xte=same.reduce((n,r)=>n+(Number(r.pages)||0),0);
      const mins=Math.floor(same.reduce((n,r)=>n+(Number(r.seconds)||0),0)/60);
      const book=findLibraryBook(latest.title);
      const print=estimatePrintDelta(same,book);
      const first=same[0],last=same[same.length-1];
      const gain=(Number.isFinite(Number(first?.startPercent))&&Number.isFinite(Number(last?.endPercent)))?Math.max(0,Number(last.endPercent)-Number(first.startPercent)):null;
      $('homeLastSession').textContent='Last session · '+xte+' XTE · ~'+print+' print · '+mins+' min'+(gain!=null?' · +'+gain.toFixed(1)+'%':'');
    }

    const recs=window.READING_HUB_DATA?.recommendations||[];
    const feedback=(()=>{try{return JSON.parse(localStorage.getItem('readingHubFeedbackV1')||'{}')}catch(_){return{}}})();
    const rec=recs.find(r=>!feedback[r.title]||feedback[r.title].interest!=='Skip')||recs[0];
    if(rec){
      if($('homeRecoTitle'))$('homeRecoTitle').textContent=rec.title||'Recommendation';
      if($('homeRecoAuthor'))$('homeRecoAuthor').textContent=[rec.author,rec.series].filter(Boolean).join(' · ');
      if($('homeRecoMatch'))$('homeRecoMatch').textContent=rec.match?Math.round(Number(rec.match)*20)+'% match':'For you';
      if($('homeRecoChips'))$('homeRecoChips').innerHTML=(rec.tropes||[]).slice(0,3).map(t=>'<span>'+esc(t)+'</span>').join('');
      const cover=$('homeRecoCover');
      if(cover&&window.ReadingCovers)window.ReadingCovers.refreshElement(cover,rec.title||'',rec.author||'');
      document.querySelectorAll('[data-home-feedback]').forEach(b=>b.dataset.title=rec.title||'');
    }
  }

  function render() {
    const grid = $('readingCalendarGrid');
    if (!grid) return;

    const year = viewDate.getFullYear(), month = viewDate.getMonth();
    $('calendarMonthLabel').textContent = viewDate.toLocaleDateString(undefined,{month:'long',year:'numeric'});
    const rows = monthRows();
    const grouped = byDate(rows);
    const daysRead = Object.keys(grouped).length;
    const pages = rows.reduce((s,r)=>s+(Number(r.pages)||0),0);
    const minutes = Math.floor(rows.reduce((s,r)=>s+(Number(r.seconds)||0),0)/60);
    const books = new Set(rows.map(r=>String(r.title||'').trim()).filter(Boolean)).size;
    $('calendarDaysRead').textContent = daysRead;
    $('calendarPages').textContent = pages;
    $('calendarMinutes').textContent = minutes;
    $('calendarBooks').textContent = books;

    const first = new Date(year,month,1);
    const last = new Date(year,month+1,0);
    const cells = [];
    for(let i=0;i<first.getDay();i++) cells.push('<button class="cal-day blank" disabled></button>');
    const today = isoLocal(new Date());
    for(let day=1;day<=last.getDate();day++) {
      const date = isoLocal(new Date(year,month,day));
      const dayRows = grouped[date] || [];
      const titles = [...new Set(dayRows.map(r=>r.title).filter(Boolean))];
      const totalPages = dayRows.reduce((s,r)=>s+(Number(r.pages)||0),0);
      const coverLabel = titles[0] ? titles[0].split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase() : '';
      const coverBook = titles[0] ? findLibraryBook(titles[0]) : null;
      const coverAuthor = coverBook?.author || '';
      cells.push(
        '<button class="cal-day '+(date===today?'today ':'')+(dayRows.length?'has-reading':'')+'" data-cal-date="'+date+'">'+
          '<span class="cal-num">'+day+'</span>'+
          (dayRows.length ? '<span class="cal-cover book-cover-slot" data-book-cover data-cover-title="'+esc(titles[0]||'')+'" data-cover-author="'+esc(coverAuthor)+'" data-cover-size="S">'+esc(coverLabel||'📖')+'</span>' : '')+
          (titles.length>1 ? '<span class="cal-plus">+'+(titles.length-1)+'</span>' : '')+
          (totalPages ? '<span class="cal-pages">'+totalPages+'p</span>' : '')+
        '</button>'
      );
    }
    grid.innerHTML = cells.join('');
    if (window.ReadingCovers) requestAnimationFrame(()=>window.ReadingCovers.hydrate(grid));
  }

  function openDay(date) {
    const rows = readLogs().filter(r=>r.date===date);
    if (!rows.length) return;
    const panel = $('calendarDayBody');
    const grouped = {};
    rows.forEach(r => {
      const k = r.title || 'Unknown book';
      (grouped[k] ||= []).push(r);
    });
    panel.innerHTML = Object.entries(grouped).map(([title,list]) => {
      const pages = list.reduce((s,r)=>s+(Number(r.pages)||0),0);
      const seconds = list.reduce((s,r)=>s+(Number(r.seconds)||0),0);
      const sessionValues = list.map(r=>Number(r.sessions)||0);
      const sessionsKnown = sessionValues.every(n=>n>0);
      const sessions = sessionValues.reduce((s,n)=>s+n,0);
      const sessionText = sessionsKnown
        ? sessions+' '+(sessions===1?'session':'sessions')
        : 'sessions --';
      const first = list[0], last = list[list.length-1];
      const pct = Number.isFinite(Number(first.startPercent)) && Number.isFinite(Number(last.endPercent))
        ? Number(first.startPercent).toFixed(1)+'% → '+Number(last.endPercent).toFixed(1)+'%'
        : '';
      const xte = Number(first.startXte)>0 && Number(last.endXte)>0 ? 'XTE '+first.startXte+' → '+last.endXte : '';
      const coverBook = findLibraryBook(title);
      const coverAuthor = coverBook?.author || '';
      return '<div class="cal-detail-book"><div class="cal-detail-cover book-cover-slot" data-book-cover data-cover-title="'+esc(title)+'" data-cover-author="'+esc(coverAuthor)+'" data-cover-size="M">📖</div><div><b>'+esc(title)+'</b><div>'+pages+' XTE pages · '+Math.floor(seconds/60)+' min · '+sessionText+'</div>'+(pct?'<small>'+esc(pct)+'</small>':'')+(xte?'<small>'+esc(xte)+'</small>':'')+'<span class="calendar-source">X4 Pro diary</span></div></div>';
    }).join('');
    const totalPages = rows.reduce((s,r)=>s+(Number(r.pages)||0),0);
    const totalSeconds = rows.reduce((s,r)=>s+(Number(r.seconds)||0),0);
    const totalMin = Math.floor(totalSeconds/60);
    const sessionValues = rows.map(r=>Number(r.sessions)||0);
    const knownSessions = sessionValues.filter(n=>n>0);
    const totalSessions = knownSessions.reduce((s,n)=>s+n,0);
    const bookCount = Object.keys(grouped).length;
    $('calendarDayTitle').textContent = new Date(date+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    $('calendarDayTotals').textContent = bookCount+' '+(bookCount===1?'book':'books')+' · synced reading day';
    const summary = $('calendarDaySummary');
    if (summary) summary.innerHTML =
      '<div class="day-stat"><b>'+totalPages+'</b>XTE pages</div>'+
      '<div class="day-stat"><b>'+totalMin+'</b>minutes</div>'+
      '<div class="day-stat"><b>'+(knownSessions.length?totalSessions:'—')+'</b>sessions</div>'+
      '<div class="day-stat"><b>'+bookCount+'</b>books</div>';

    const progressRows = rows.filter(r=>Number.isFinite(Number(r.startPercent)) && Number.isFinite(Number(r.endPercent)));
    const progress = $('calendarDayProgress');
    if (progress) {
      if (progressRows.length) {
        const firstPct = Number(progressRows[0].startPercent);
        const lastPct = Number(progressRows[progressRows.length-1].endPercent);
        const gain = Math.max(0,lastPct-firstPct);
        progress.innerHTML =
          '<div class="day-progress-card"><div class="day-progress-title">'+esc(progressRows[progressRows.length-1].title||'Reading progress')+'</div>'+
          '<div class="day-progress-sub">'+firstPct.toFixed(1)+'% → '+lastPct.toFixed(1)+'% · +'+gain.toFixed(1)+'% today</div>'+
          '<div class="day-progress-track"><span style="width:'+Math.max(0,Math.min(100,lastPct))+'%"></span></div></div>';
      } else progress.innerHTML = '';
    }
    $('calendarDayModal').classList.add('show');
    if (window.ReadingCovers) requestAnimationFrame(()=>window.ReadingCovers.hydrate($('calendarDayModal')));
  }

  function normalizeEntry(e, fallbackDate) {
    return {
      date: String(e.date || fallbackDate || isoLocal(new Date())).slice(0,10),
      title: String(e.title || '').trim() || 'Unknown book',
      pages: Math.max(0, Number(e.pages ?? e.pg) || 0),
      seconds: Math.max(0, Number(e.seconds ?? e.sec) || 0),
      sessions: Math.max(0, Number(e.sessions) || 0),
      startPercent: e.startPercent ?? e.spct ?? null,
      endPercent: e.endPercent ?? e.epct ?? null,
      startXte: e.startXte ?? e.sp ?? null,
      endXte: e.endXte ?? e.ep ?? null,
      source: 'x4pro'
    };
  }

  function normalizeCompactV5(row, books) {
    if (!Array.isArray(row) || row.length < 9) throw new Error('Malformed X4 Pro range entry');
    const bookIndex = Number(row[1]);
    const startPermille = Number(row[5]);
    const endPermille = Number(row[6]);
    const rawDate = String(row[0] || '');
    const date = /^\d{8}$/.test(rawDate)
      ? rawDate.slice(0,4)+'-'+rawDate.slice(4,6)+'-'+rawDate.slice(6,8)
      : rawDate;
    return normalizeEntry({
      date,
      title: books[bookIndex] || 'Unknown book',
      pages: row[2],
      seconds: row[3],
      sessions: row[4],
      startPercent: startPermille >= 0 ? startPermille / 10 : null,
      endPercent: endPermille >= 0 ? endPermille / 10 : null,
      startXte: row[7] || null,
      endXte: row[8] || null
    }, row[0]);
  }

  function entryFingerprint(e) {
    return 'x4:'+[
      e.date,e.title,e.pages,e.seconds,e.sessions,
      e.startPercent ?? '',e.endPercent ?? '',e.startXte ?? '',e.endXte ?? ''
    ].join('|');
  }

  function importPayload(payload) {
    let entries = [];
    if (Number(payload.p) === 5) {
      if (Number(payload.none) === 1) return {none:true,count:0,duplicates:0};
      const booksRaw = Array.isArray(payload.b) ? payload.b : payload.books;
      const entriesRaw = Array.isArray(payload.e) ? payload.e : payload.entries;
      const books = Array.isArray(booksRaw) ? booksRaw.map(x=>String(x||'')) : [];
      if (!Array.isArray(entriesRaw)) throw new Error('Malformed X4 Pro range payload');
      entries = entriesRaw.map(row=>normalizeCompactV5(row,books));
    } else if (Number(payload.p) === 4) {
      if (Number(payload.none) === 1) return {none:true,count:0,duplicates:0};
      entries = Array.isArray(payload.entries) ? payload.entries.map(e=>normalizeEntry(e,payload.date)) : [normalizeEntry(payload,payload.date)];
    } else if (Number(payload.p) === 2 || Number(payload.p) === 3) {
      if (Number(payload.none) === 1) return {none:true,count:0,duplicates:0};
      entries = [normalizeEntry(payload, isoLocal(new Date()))];
    } else {
      throw new Error('Unsupported reader protocol '+String(payload.p));
    }

    const known = new Set(importedIds());
    const rows = readLogs();
    const addedIds = [];
    let duplicates = 0;
    entries.forEach(e => {
      const id = entryFingerprint(e);
      if (known.has(id)) { duplicates++; return; }
      known.add(id);
      addedIds.push(id);
      rows.push({...e, importId:id, importedAt:new Date().toISOString()});
    });
    if (addedIds.length) {
      writeLogs(rows);
      rememberImports(addedIds);
      render();
    }
    return {count:addedIds.length,duplicates,duplicate:addedIds.length===0 && duplicates>0};
  }

  function setSyncStatus(msg, kind='') {
    const el = $('x4SyncStatus');
    if (!el) return;
    el.textContent = msg;
    el.className = 'x4-sync-status '+kind;
  }

  async function syncX4Pro() {
    const btn = $('x4SyncButton');
    if (btn) btn.disabled = true;
    let device;
    try {
      if (!navigator.bluetooth?.requestDevice) throw new Error('Web Bluetooth is unavailable here. Open the installed app/Chrome version on Android.');
      setSyncStatus('Scanning for X4 Pro…');
      device = await navigator.bluetooth.requestDevice({filters:[{services:[SERVICE_UUID]}], optionalServices:[SERVICE_UUID]});
      setSyncStatus('Connecting…');
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
      setSyncStatus('Reading selected X4 Pro diary…');
      const value = await characteristic.readValue();
      const raw = new TextDecoder().decode(value.buffer).replace(/\0+$/g,'').trim();
      const payload = JSON.parse(raw);
      const result = importPayload(payload);
      if (result.none) setSyncStatus('Connected ✓ No reading is stored for that selection.','ok');
      else if (result.duplicate) setSyncStatus('Already synced ✓ Nothing counted twice.','ok');
      else {
        const dup = result.duplicates ? ' · '+result.duplicates+' duplicate'+(result.duplicates===1?'':'s')+' skipped' : '';
        setSyncStatus('Synced ✓ '+result.count+' '+(result.count===1?'reading-day entry':'reading-day entries')+' imported'+dup+'.','ok');
      }
      updateHomeFromDiary();
      renderHomeDashboard();
    } catch (err) {
      console.error(err);
      const msg = err?.message || String(err);
      if (err?.name === 'NotFoundError' || /cancelled|canceled|chooser/i.test(msg)) {
        setSyncStatus('Bluetooth chooser closed — nothing changed.','neutral');
      } else {
        setSyncStatus('Sync failed: '+msg,'bad');
      }
    } finally {
      try { if (device?.gatt?.connected) device.gatt.disconnect(); } catch (_) {}
      if (btn) btn.disabled = false;
    }
  }

  function boot() {
    $('calendarPrev')?.addEventListener('click',()=>{viewDate.setMonth(viewDate.getMonth()-1);render();});
    $('calendarNext')?.addEventListener('click',()=>{viewDate.setMonth(viewDate.getMonth()+1);render();});
    $('readingCalendarGrid')?.addEventListener('click',e=>{const b=e.target.closest('[data-cal-date]'); if(b) openDay(b.dataset.calDate);});
    $('calendarDayClose')?.addEventListener('click',()=>$('calendarDayModal')?.classList.remove('show'));
    $('calendarDayModal')?.addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.classList.remove('show');});
    $('x4SyncButton')?.addEventListener('click',syncX4Pro);
    render();
    updateHomeFromDiary();
    renderHomeDashboard();
    window.ReadingCalendar = {render, importPayload, readLogs, updateHomeFromDiary, renderHomeDashboard};
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();