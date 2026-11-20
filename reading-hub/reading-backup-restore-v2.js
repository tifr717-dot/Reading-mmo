/* Reading Journal v5 — local data backup, inspection, and safe restore.
 * Everything runs on-device: no backup data is uploaded by this feature.
 */
(() => {
  'use strict';
  const SPEC = Object.freeze({
    readingMmoGoogleSyncShadowV2:'object',
    readingHubDailyLogV1:'array',
    readingHubX4ProImportsV1:'array',
    readingHubLibraryEditsV1:'object',
    readingHubReadingHistoryV1:'object',
    readingMmoPageEquivalentsByDayV1:'object',
    readingMmoPageEditionOverridesV1:'object',
    readingMmoEditionChoicesV1:'object',
    readingMmoAdditionalBooksV1:'array',
    readingHubFeedbackV1:'object',
    readingJournalManualCoversV1:'object',
    readingJournalCoverCacheV3:'object',
    readingJournalCoverBatchV1:'object',
    readingJournalCoverRescueV1:'object',
    readingMmoFalseGodsCompletionOriginalV1:'array',
    readingMmoCalendarViewV1:'string'
  });
  const OBJECT_TYPES = Object.keys(SPEC);
  const VIEWS = new Set(['calendar','day','book']);
  const $ = id => document.getElementById(id);
  let selected = null;
  let selectedImages = [];
  const clean = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const isObj = x => x!==null && typeof x==='object' && !Array.isArray(x);
  const safeProps = obj => Object.fromEntries(Object.entries(obj).filter(([k]) =>
    !['__proto__','prototype','constructor'].includes(k)));
  const typeOk = (value,type) => {
    if(type==='array')return Array.isArray(value);
    if(type==='object')return isObj(value);
    if(type==='string')return typeof value==='string';
    return false;
  };
  const logIdentity = r => {
    if(!isObj(r))return JSON.stringify(r);
    if(r.importId || r.id)return 'id:' + String(r.importId || r.id);
    return 'content:' + [r.date,r.title,r.pages,r.seconds,r.sessions,r.startPercent,
      r.endPercent,r.startXte,r.endXte,r.source].map(x=>x ?? '').join('|');
  };
  const bookIdentity = b => isObj(b)
    ? String(b.goodreadsId || '') || clean(b.title)
    : JSON.stringify(b);
  const simpleIdentity = x => typeof x === 'string' ? x : JSON.stringify(x);
  const uniqueMerge = (current,imported,identify) => {
    const result=current.slice();
    const seen=new Set(current.map(identify));
    let added=0, conflicts=0;
    const existing=new Map(current.map(v=>[identify(v),JSON.stringify(v)]));
    for(const value of imported){
      const id=identify(value);
      if(!seen.has(id)){result.push(value);seen.add(id);added++;}
      else if(existing.has(id)&&existing.get(id)!==JSON.stringify(value))conflicts++;
    }
    return {value:result,added,conflicts};
  };
  function mergeValue(key,current,imported) {
    if(current===undefined)return {value:imported,added:1,conflicts:0};
    if(key==='readingHubDailyLogV1')return uniqueMerge(current,imported,logIdentity);
    if(key==='readingMmoAdditionalBooksV1')return uniqueMerge(current,imported,bookIdentity);
    if(key==='readingHubX4ProImportsV1' || key==='readingMmoFalseGodsCompletionOriginalV1')
      return uniqueMerge(current,imported,simpleIdentity);
    if(SPEC[key]==='object'){
      let added=0,conflicts=0;
      const result=safeProps(current);
      for(const [item,value] of Object.entries(safeProps(imported))){
        if(key==='readingHubReadingHistoryV1' && Array.isArray(result[item]) && Array.isArray(value)) {
          const merged=uniqueMerge(result[item],value,simpleIdentity);
          result[item]=merged.value;added+=merged.added;conflicts+=merged.conflicts;
        }else if(!Object.prototype.hasOwnProperty.call(result,item)) {
          result[item]=value;added++;
        }else if(JSON.stringify(result[item])!==JSON.stringify(value)) {
          conflicts++;
        }
      }
      return {value:result,added,conflicts};
    }
    return {value:current,added:0,conflicts:current!==imported?1:0};
  }
  function readStored(key) {
    const value=localStorage.getItem(key);
    if(value===null)return undefined;
    if(SPEC[key]==='string')return value;
    const decoded=JSON.parse(value);
    if(!typeOk(decoded,SPEC[key]))throw Error('Existing app data has an unexpected format: '+key);
    return decoded;
  }
  function validateSnapshot(payload){
    if(!isObj(payload)||payload.format!=='reading-mmo-local-backup'
       ||![1,2,3].includes(payload.version)||!isObj(payload.storage))
      throw Error('That file is not a recognized Reading Journal backup.');
    const selectedData={};
    for(const [key,value] of Object.entries(payload.storage)){
      if(!Object.prototype.hasOwnProperty.call(SPEC,key))continue;
      if(!typeOk(value,SPEC[key]))throw Error('Invalid backup section: '+key);
      if(key==='readingHubDailyLogV1' && value.some(row=>!isObj(row)||
           typeof row.date!=='string'||typeof row.title!=='string'))
        throw Error('The reading sessions in this backup are incomplete.');
      if(key==='readingMmoAdditionalBooksV1' && value.some(book=>!isObj(book)||!String(book.title||'').trim()))
        throw Error('The added books section contains an invalid book.');
      if(key==='readingMmoCalendarViewV1' && !VIEWS.has(value))continue;
      selectedData[key]=value;
    }
    if(!Object.keys(selectedData).length)
      throw Error('This backup has no recognized app data.');
    return selectedData;
  }
  function snapshot(){
    const data={};
    for(const key of OBJECT_TYPES){
      const value=readStored(key);
      if(value!==undefined)data[key]=value;
    }
    return {format:'reading-mmo-local-backup',version:2,
      exportedAt:new Date().toISOString(),storage:data};
  }

  // Uploaded cover photos are stored as Blobs in IndexedDB rather than
  // localStorage. Export the bytes, not just their localKey references.
  function coverKeys(data){
    const refs=data.readingJournalManualCoversV1;
    return !isObj(refs)?[]:[...new Set(Object.values(refs).filter(isObj)
      .map(ref=>ref.localKey).filter(key=>typeof key==='string'&&key.length))];
  }
  function openCoverDB(){
    return new Promise((resolve,reject)=>{
      if(!('indexedDB' in window))return reject(new Error('Cover-photo storage is unavailable.'));
      const request=indexedDB.open('readingJournalCoverImagesV1',1);
      request.onupgradeneeded=()=>{
        if(!request.result.objectStoreNames.contains('images'))request.result.createObjectStore('images');
      };
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||new Error('Unable to open saved cover storage.'));
    });
  }
  function photoURL(blob){
    return new Promise((resolve,reject)=>{
      const fr=new FileReader();
      fr.onload=()=>resolve(String(fr.result||''));
      fr.onerror=()=>reject(fr.error||new Error('Cannot read a saved cover photo.'));
      fr.readAsDataURL(blob);
    });
  }
  function getPhoto(db,key){
    return new Promise((resolve,reject)=>{
      const req=db.transaction('images','readonly').objectStore('images').get(key);
      req.onsuccess=()=>resolve(req.result||null);
      req.onerror=()=>reject(req.error||new Error('Cannot read cover photo.'));
    });
  }
  async function readCoverImages(data){
    const keys=coverKeys(data);if(!keys.length)return [];
    const db=await openCoverDB();
    try{
      const images=[];
      for(const key of keys){
        const blob=await getPhoto(db,key);
        if(!(blob instanceof Blob))
          throw new Error('A selected cover photo is missing ('+key+'). Backup not marked complete.');
        const dataUrl=await photoURL(blob);
        if(!/^data:image\/(jpeg|png|webp);base64,/i.test(dataUrl))
          throw new Error('Unsupported cover photo format ('+key+').');
        images.push({key,dataUrl});
      }
      return images;
    }finally{db.close()}
  }
  function validateImages(payload){
    if(payload.version<3)return [];
    if(!Array.isArray(payload.coverImages))throw new Error('Backup is missing its cover-photo section.');
    if(payload.coverImages.length>3000)throw new Error('Unexpected number of cover photos.');
    const seen=new Set();
    return payload.coverImages.map(image=>{
      if(!isObj(image)||typeof image.key!=='string'||!image.key||image.key.length>600||
        seen.has(image.key)||typeof image.dataUrl!=='string'||
        !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(image.dataUrl)||
        image.dataUrl.length>20*1024*1024)
        throw new Error('The backup has an invalid or oversized cover photo.');
      seen.add(image.key);
      return {key:image.key,dataUrl:image.dataUrl};
    });
  }
  function decodePhoto(item){
    const comma=item.dataUrl.indexOf(',');
    const mime=item.dataUrl.slice(5,item.dataUrl.indexOf(';'));
    const raw=atob(item.dataUrl.slice(comma+1));
    const bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    return new Blob([bytes],{type:mime});
  }
  async function restoreCoverImages(items){
    if(!items.length)return {added:0,kept:0};
    const db=await openCoverDB();
    try{
      return await new Promise((resolve,reject)=>{
        const tx=db.transaction('images','readwrite'),store=tx.objectStore('images');
        let added=0,kept=0;
        for(const item of items){
          const request=store.get(item.key);
          request.onsuccess=()=>{
            if(request.result){kept++;return}
            try{store.put(decodePhoto(item),item.key);added++}
            catch(_){tx.abort()}
          };
          request.onerror=()=>tx.abort();
        }
        tx.oncomplete=()=>resolve({added,kept});
        tx.onerror=()=>reject(tx.error||new Error('Unable to restore cover photos.'));
        tx.onabort=()=>reject(tx.error||new Error('Cover-photo restore was interrupted.'));
      });
    }finally{db.close()}
  }
  async function snapshotComplete(){
    const payload=snapshot();
    payload.version=3;
    payload.coverImages=await readCoverImages(payload.storage);
    return payload;
  }

  const stats=data=>({
    sessions:Array.isArray(data.readingHubDailyLogV1)?data.readingHubDailyLogV1.length:0,
    books:Array.isArray(data.readingMmoAdditionalBooksV1)?data.readingMmoAdditionalBooksV1.length:0,
    manualCovers:isObj(data.readingJournalManualCoversV1)
      ?Object.keys(data.readingJournalManualCoversV1).length:0,
    sections:Object.keys(data).length
  });
  function prepareRestore(data){
    const operations=[],summary={newEntries:0,conflicts:0,sections:0};
    for(const [key,incoming] of Object.entries(data)){
      const before=readStored(key);
      const result=mergeValue(key,before,incoming);
      const after=JSON.stringify(result.value);
      const old=before===undefined?null:JSON.stringify(before);
      if(after!==old)operations.push({key,previous:localStorage.getItem(key),
        next:SPEC[key]==='string'?result.value:after});
      summary.newEntries+=result.added;summary.conflicts+=result.conflicts;
      summary.sections++;
    }
    return {operations,summary};
  }
  async function downloadData(){
    const payload=await snapshotComplete();
    if(!Object.keys(payload.storage).length)throw Error('No locally saved data to back up yet.');
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    try{
      const link=document.createElement('a');
      link.href=url;link.download='reading-journal-backup-'+new Date().toISOString().slice(0,10)+'.json';
      document.body.appendChild(link);link.click();link.remove();
    }finally{setTimeout(()=>URL.revokeObjectURL(url),60000)}
    return {...stats(payload.storage),coverImages:payload.coverImages.length};
  }
  function restoreData(data) {
    const plan=prepareRestore(data);
    if(!plan.operations.length)return {...plan.summary,unchanged:true};
    const applied=[];
    try{
      for(const op of plan.operations){
        localStorage.setItem(op.key,op.next);
        applied.push(op);
      }
    }catch(error){
      const failed=[];
      for(const op of applied.reverse()){
        try{if(op.previous===null)localStorage.removeItem(op.key);
            else localStorage.setItem(op.key,op.previous);}
        catch(e){failed.push(op.key)}
      }
      throw Error('Restore could not be completed ('+error.message+').'+
        (failed.length?' Some keys could not be rolled back: '+failed.join(', '):' Existing entries were rolled back.'));
    }
    return plan.summary;
  }
  function boot(){
    const button=$('readingBackupDownload'),notice=$('readingBackupStatus');
    if(!button||!notice)return;
    const panel=button.parentElement;
    const select=document.createElement('input');
    select.type='file';select.accept='.json,application/json';select.hidden=true;select.id='readingRestoreFile';
    const restore=document.createElement('button');
    restore.type='button';restore.textContent='↥ Restore from backup';restore.className='reading-restore-btn';
    const review=document.createElement('div');
    review.id='readingRestoreReview';review.className='reading-restore-review';
    review.hidden=true;
    panel.appendChild(restore);panel.appendChild(select);panel.appendChild(review);
    const say=(message,isError=false)=>{notice.textContent=message;notice.style.color=isError?'#ffb5ad':'#d8c5cf'};
    button.addEventListener('click',async()=>{
      button.disabled=true;
      say('♡ Preparing a full backup, including saved cover photos…');
      try{
        const n=await downloadData();
        say('♡ Full backup downloaded: '+n.sessions+' sessions, '+n.manualCovers+
          ' selected covers, '+n.coverImages+' uploaded cover photos and '+n.books+
          ' additional books. Keep the file somewhere safe.');
      }catch(error){say('Backup failed: '+error.message,true)}
      finally{button.disabled=false}
    });
    restore.addEventListener('click',()=>select.click());
    select.addEventListener('change',async()=>{
      const file=select.files?.[0];if(!file)return;
      selected=null;selectedImages=[];review.hidden=true;review.replaceChildren();
      try{
        if(file.size>200*1024*1024)throw Error('This backup exceeds the 200 MB safety limit.');
        const content=JSON.parse(await file.text());
        const data=validateSnapshot(content);
        const images=validateImages(content);
        const source=stats(data);
        const plan=prepareRestore(data);
        selected=data;
        selectedImages=images;
        const heading=document.createElement('strong');heading.textContent='Review backup before restoring';
        const details=document.createElement('p');
        details.textContent=source.sessions+' sessions · '+source.manualCovers+' chosen covers · '+
          source.books+' added books · '+images.length+' uploaded cover photos · '+source.sections+' sections. '+
          plan.summary.newEntries+' missing items can be added; '+
          plan.summary.conflicts+' differences will keep the copy already on this phone.';
        const warning=document.createElement('p');
        warning.textContent='Safe merge only: current phone data and uploaded cover photos win on conflicts. Download a backup of this phone before continuing.';
        const apply=document.createElement('button');apply.type='button';apply.className='reading-restore-apply';
        apply.textContent='♡ Merge backup into this phone';
        apply.addEventListener('click',async()=>{
          if(!selected)return;
          if(!confirm('Merge the selected backup into this phone? Existing entries will be kept when they differ.'))return;
          apply.disabled=true;
          say('♡ Restoring cover photos and reading history…');
          try{
            const photos=await restoreCoverImages(selectedImages);
            const result=restoreData(selected);
            say('♡ Restore complete: '+result.newEntries+' missing items and '+photos.added+
              ' uploaded photos restored. Reloading…');
            selected=null;selectedImages=[];
            setTimeout(()=>location.reload(),500);
          }catch(error){say('Restore failed: '+error.message,true);apply.disabled=false}
        });
        review.append(heading,details,warning,apply);
        review.hidden=false;
        say('Backup checked. Review its contents below before merging.');
      }catch(error){say('Could not open backup: '+error.message,true)}
      finally{select.value=''}
    });
  }
  window.ReadingBackupTools={snapshot,snapshotComplete,validateSnapshot,validateImages,prepareRestore,restoreData,restoreCoverImages,readCoverImages,stats};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();