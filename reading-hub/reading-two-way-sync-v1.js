/* Reading Journal — bidirectional Google Sheets sync.
   Protects conflicting versions: nothing is silently overwritten. */
(()=>{
'use strict';
const TABS={
 sessions:{name:'Reading Sessions',range:'A2:N2500'},
 editions:{name:'Book Editions',range:'A2:J2500'},
 books:{name:'Reading Journal Books',range:'A2:L2500',
  headers:['Book Key','Title','Author','Status','Start Date','Finish Date','Rating','Times Read','Pages','Format','Notes','App Updated At']},
 extras:{name:'Reading Journal Extras',range:'A2:D2500',
  headers:['Category','Entry Key','JSON Data','App Updated At']}
};
const MAP_TYPES={
 history:'readingHubReadingHistoryV1',dailyPages:'readingMmoPageEquivalentsByDayV1',
 editionPages:'readingMmoPageEditionOverridesV1',
 feedback:'readingHubFeedbackV1',coverURL:'readingJournalManualCoversV1'
};
const SHADOW_KEY='readingMmoGoogleSyncShadowV2';
const $=id=>document.getElementById(id);
const clean=v=>String(v??'');
const norm=s=>clean(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const json=x=>JSON.stringify(x);
function read(key,fallback){try{const x=JSON.parse(localStorage.getItem(key)||json(fallback));return x??fallback}catch(_){return fallback}}
const toNumber=x=>x==null||x===''?'':Number.isFinite(Number(x))?Number(x):'';
const field=x=>x==null?'':clean(x);
const compactNumber=x=>x===''?'':Math.round(Number(x)*100)/100;
const identical=(a,b)=>json(a)===json(b);
function safeEntry(k,v){return k!=='__proto__'&&k!=='prototype'&&k!=='constructor'&&v!==undefined}
function sessionCanon(r){
 return [field(r[1]),field(r[3]),compactNumber(toNumber(r[5])),compactNumber(toNumber(r[6])),
  compactNumber(toNumber(r[7])),compactNumber(toNumber(r[8])),
  toNumber(r[9])===''?'':Math.round(Number(r[9])),
  toNumber(r[10])===''?'':Math.round(Number(r[10]))];
}
const sessionCols=[1,3,5,6,7,8,9,10];
function sheetToLocalSession(row){
 const id=field(row[0]),source=field(row[11])||'sheet';
 return {id,importId:id,date:field(row[1]),title:field(row[3]),
  pages:toNumber(row[7])===''?0:Number(row[7]),
  seconds:toNumber(row[8])===''?0:Math.round(Number(row[8])*60),
  sessions:1,
  startPercent:toNumber(row[5])===''?null:Number(row[5]),
  endPercent:toNumber(row[6])===''?null:Number(row[6]),
  ...(toNumber(row[9])!==''?{ebookPages:Math.round(Number(row[9]))}:{}),
  ...(toNumber(row[10])!==''?{printPages:Math.round(Number(row[10]))}:{}),
  source,importedAt:field(row[12])||new Date().toISOString()};
}
function applySessionFromSheet(existing,row){
 const updated={...(existing||{}),...sheetToLocalSession(row)};
 if(existing){
  if(!field(row[9]))delete updated.ebookPages;
  if(!field(row[10]))delete updated.printPages;
  // Preserve on-device X4 Pro details, which have no matching Sheet columns.
  if(existing.importId)updated.importId=existing.importId;
  if(existing.id)updated.id=existing.id;
  if(existing.sessions!==undefined)updated.sessions=existing.sessions;
 }
 return updated;
}
function buildBooks(){
 const edits=read('readingHubLibraryEditsV1',{}),additional=read('readingMmoAdditionalBooksV1',[]);
 const catalog=[...(window.READING_LIBRARY_DATA||[])];
 if(Array.isArray(additional))additional.forEach(b=>{if(object(b)&&!catalog.some(x=>norm(x.title)===norm(b.title)))catalog.push(b)});
 const map=new Map();
 const rowFor=(b,key)=>[clean(key),field(b.title),field(b.author),field(b.status),field(b.start),
  field(b.finish),field(b.rating),field(b.readCount),field(b.pages),field(b.format),
  field(b.notes),field(b.updatedAt)];
 for(const b of catalog){
  const key=clean(b.goodreadsId||b.title);
  if(!key)continue;
  const explicit=object(edits[key])?edits[key]:null;
  const isExtra=Array.isArray(additional)&&additional.some(x=>x.goodreadsId?x.goodreadsId===b.goodreadsId:norm(x.title)===norm(b.title));
  map.set(key,rowFor({...b,...(explicit||{})},key));
 }
 // Edits without a matching catalog record are preserved as long as they have a usable title.
 for(const [key,edit] of Object.entries(edits)){
  if(!safeEntry(key,edit)||map.has(key)||!object(edit)||!edit.title)continue;
  map.set(key,rowFor({...edit,title:edit.title},key));
 }
 return map;
}
function bookCanon(row){return Array.from({length:11},(_,i)=>field(row[i+1]));}
function editionCanon(row){
 return [field(row[1]),field(row[2]),field(row[3]),compactNumber(toNumber(row[4])),
 compactNumber(toNumber(row[5])),field(row[6]),field(row[7]),field(row[8])];
}
function buildEditions(){
 const map=new Map(),choices=read('readingMmoEditionChoicesV1',{});
 if(!object(choices))return map;
 const today=new Date().toISOString().slice(0,10);
 for(const [id,e] of Object.entries(choices)){
  if(!safeEntry(id,e)||!object(e))continue;
  map.set(id,[id,field(e.title),field(e.author),field(e.isbn),
    e.ebookPages||'',e.printPages||'',field(e.source),field(e.url),
    field(e.status)||'Confirmed',today]);
 }
 return map;
}
function applyEdition(choices,row){
 const id=field(row[0]);if(!id)return;
 choices[id]={
  title:field(row[1]),author:field(row[2]),isbn:field(row[3]),
  ebookPages:toNumber(row[4])===''?'':Number(row[4]),
  printPages:toNumber(row[5])===''?'':Number(row[5]),
  source:field(row[6]),url:field(row[7]),status:field(row[8])
 };
}
function applyBookRow(bookEdits,extraBooks,row){
 const key=field(row[0]),title=field(row[1]);
 if(!key||!title)return;
 const catalog=[...(window.READING_LIBRARY_DATA||[]),...(Array.isArray(extraBooks)?extraBooks:[])];
 const original=catalog.find(b=>clean(b.goodreadsId||b.title)===key||norm(b.title)===norm(title));
 if(!original && !extraBooks.some(b=>norm(b.title)===norm(title))){
  extraBooks.push({title,author:field(row[2]),goodreadsId:key===title?'':key,status:'To-Read',
   rating:'',series:'',pages:'',start:'',finish:'',readCount:'0',
   format:'',notes:'Imported from Google Sheets',source:''});
 }
 const editKey=original?clean(original.goodreadsId||original.title):key===title?title:key;
 bookEdits[editKey]={
   ...(object(bookEdits[editKey])?bookEdits[editKey]:{}),
   title,author:field(row[2]),status:field(row[3])||'To-Read',
   start:field(row[4]),finish:field(row[5]),rating:field(row[6]),
   readCount:field(row[7]),pages:field(row[8]),format:field(row[9]),
   notes:field(row[10]),updatedAt:field(row[11])||new Date().toISOString()
 };
}
function extraRecord(type,key,value){
 const data=json(value);
 if(!data||data.length>30000)return null; // Sheets cell text is limited; uploads stay in backup.
 if(type==='coverURL' && (/data:image|base64/i.test(data)||data.length>5000))return null;
 return [type,key,data,''];
}
function buildExtras(){
 const map=new Map();
 for(const [type,storageKey] of Object.entries(MAP_TYPES)){
  const entries=read(storageKey,{});
  if(!object(entries))continue;
  for(const [key,value] of Object.entries(entries)){
   if(!safeEntry(key,value))continue;
   const row=extraRecord(type,key,value);
   if(row)map.set(type+'|'+key,row);
  }
 }
 return map;
}
function extraCanon(row){
 // Canonical JSON, normalize whitespace and property order for simple values.
 let payload;
 try{payload=JSON.parse(clean(row[2]))}catch(_){payload=clean(row[2])}
 return json(payload);
}
function applyExtra(data,row){
 const type=field(row[0]),key=field(row[1]),store=MAP_TYPES[type];
 if(!store||!safeEntry(key,0))return;
 const value=JSON.parse(field(row[2]));
 if(type==='coverURL' && (/data:image|base64/i.test(field(row[2]))||field(row[2]).length>5000))return;
 (data[store] ||= {})[key]=value;
}
function remoteMap(rows,kind){
 const map=new Map(),duplicates=[];
 rows.forEach((row,index)=>{
  const key=kind==='extras'?field(row[0])+'|'+field(row[1]):field(row[0]);
  if(!key||key==='|')return;
  if(map.has(key)){duplicates.push(key);return}
  map.set(key,{row:Array.isArray(row)?row:[],number:index+2});
 });
 return {map,duplicates};
}
function choose(local,remote,shadow,forced){
 if(!local)return'download';
 if(!remote)return'upload';
 if(identical(local,remote))return'equal';
 if(forced==='phone')return'upload';
 if(forced==='google')return'download';
 if(shadow===undefined)return'conflict';
 if(identical(local,shadow)&&!identical(remote,shadow))return'download';
 if(identical(remote,shadow)&&!identical(local,shadow))return'upload';
 return'conflict';
}
function sessionUpdateCells(original,next,rowNumber){
 return sessionCols.filter((index,i)=>!identical(sessionCanon(original)[i],sessionCanon(next)[i])).map(index=>({
  range:"'Reading Sessions'!"+String.fromCharCode(65+index)+rowNumber,
  values:[[next[index]??'']]
 }));
}
function syncPlan(kind,local,remote,prior,forcedChoices){
 const manualBookEdits=kind==='books'?read('readingHubLibraryEditsV1',{}):{};
 const extraBooks=kind==='books'?read('readingMmoAdditionalBooksV1',[]):[];
 const uploads=[],updates=[],downloads=[],confirmed={},conflicts=[];
 const canon=kind==='sessions'?sessionCanon:kind==='books'?bookCanon:kind==='editions'?editionCanon:extraCanon;
 const ids=new Set([...local.keys(),...remote.keys()]);
 for(const id of ids){
  const l=local.get(id),r=remote.get(id);
  const lc=l?canon(l):undefined,rc=r?canon(r.row):undefined;
  const forced=forcedChoices[kind+'|'+id]||'';
  let action=choose(lc,rc,prior[id],forced);
  // Default imported Goodreads rows on a new device aren't local edits.
  if(kind==='books' && action==='conflict' && prior[id]===undefined &&
      !Object.prototype.hasOwnProperty.call(manualBookEdits,id) &&
      !extraBooks.some(b=>field(b.goodreadsId||b.title)===id))action='download';
  if(action==='conflict'){conflicts.push({kind,id,local:l,remote:r.row,localCanon:lc,remoteCanon:rc});continue}
  if(action==='upload'){
    if(r)updates.push({id,remote:r,next:l});else uploads.push({id,next:l});
    confirmed[id]=lc;
  }else if(action==='download'){
    downloads.push({id,row:r.row});
    confirmed[id]=rc;
  }else confirmed[id]=lc;
 }
 return {uploads,updates,downloads,confirmed,conflicts};
}
let running=false,active=null,queuedChoices={},lastSummary=null;
function renderConflicts(conflicts,runAgain){
 const host=$('readingGoogleConflictPanel');if(!host)return;
 host.replaceChildren();
 if(!conflicts.length){host.hidden=true;return}
 host.hidden=false;
 const heading=document.createElement('strong');
 heading.textContent=conflicts.length+' conflicting item'+(conflicts.length===1?'':'s')+' need your choice';
 const intro=document.createElement('p');
 intro.textContent='Changes were found on both sides. Neither copy was overwritten for these items.';
 host.append(heading,intro);
 const labels={sessions:'Reading session',books:'Book details',editions:'Book edition',extras:'Reading preference'};
 for(const conflict of conflicts.slice(0,30)){
  const line=document.createElement('div');line.className='reading-conflict-item';
  const label=document.createElement('div');
  label.textContent=labels[conflict.kind]+' · '+
    (conflict.kind==='sessions'?(conflict.local?.[3]||conflict.remote?.[3]||conflict.id):
     (conflict.kind==='books'||conflict.kind==='editions')?(conflict.local?.[1]||conflict.remote?.[1]||conflict.id):conflict.id);
  const values=document.createElement('div');values.className='reading-conflict-values';
  const brief=row=>{
   if(!row)return 'Not on this side';
   if(conflict.kind==='sessions')return (row[7]??'—')+' XTE · '+(row[8]??'—')+
     ' min · '+(row[6]??'—')+'% · print '+(row[10]??'—');
   if(conflict.kind==='books')return 'Status '+(row[3]??'—')+' · finished '+
     (row[5]??'—')+' · rating '+(row[6]??'—');
   if(conflict.kind==='editions')return 'Print '+(row[5]??'—')+' · ebook '+(row[4]??'—')+' pages';
   return clean(row[2]).slice(0,90);
  };
  const phone=document.createElement('small'),google=document.createElement('small');
  phone.textContent='Phone: '+brief(conflict.local);
  google.textContent='Google: '+brief(conflict.remote);
  values.append(phone,google);
  const buttons=document.createElement('div');buttons.className='reading-conflict-actions';
  for(const [choice,text] of [['phone','Keep phone'],['google','Use Google']]){
   const b=document.createElement('button');b.type='button';b.textContent=text;
   b.addEventListener('click',()=>{queuedChoices[conflict.kind+'|'+conflict.id]=choice;runAgain()});
   buttons.appendChild(b);
  }
  line.append(label,values,buttons);host.append(line);
 }
 if(conflicts.length>30){
  const more=document.createElement('p');more.textContent='Showing the first 30. Resolve these to see more.';host.append(more);
 }
}
async function ensureTabs(api){
 const meta=await api('?fields=sheets(properties(sheetId,title))');
 const names=new Set((meta.sheets||[]).map(x=>x.properties?.title));
 if(!names.has(TABS.sessions.name)||!names.has(TABS.editions.name))throw Error('Reading Sessions or Book Editions tab is missing. No changes were made.');
 const missing=['books','extras'].filter(type=>!names.has(TABS[type].name));
 if(missing.length){
  await api(':batchUpdate',{method:'POST',body:json({requests:missing.map(type=>({
   addSheet:{properties:{title:TABS[type].name,gridProperties:{rowCount:1200,columnCount:type==='books'?12:4,frozenRowCount:1}}}
  }))})});
  await api('/values:batchUpdate',{method:'POST',body:json({valueInputOption:'RAW',data:missing.map(type=>({
   range:"'"+TABS[type].name+"'!A1",values:[TABS[type].headers]
  }))})});
 }
 // Refuse to sync into an unrelated same-named tab or a changed header layout.
 for(const type of ['books','extras']){
  if(missing.includes(type))continue; // headers were just created
  const sheet=TABS[type];
  const header=await api('/values/'+encodeURIComponent("'"+sheet.name+"'!A1:"+(type==='books'?'L':'D')+"1"));
  const row=(header.values||[])[0]||[];
  if(!row.some(x=>field(x).trim())){
   // Recover a tab created during an interrupted first-time setup.
   await api('/values/'+encodeURIComponent("'"+sheet.name+"'!A1")+'?valueInputOption=RAW',{
    method:'PUT',body:json({values:[sheet.headers]})});
   continue;
  }
  if(sheet.headers.some((name,i)=>clean(row[i])!==name))
   throw Error('The '+sheet.name+' columns have changed. No book data was written.');
 }
}
async function readTab(api,type){
 const config=TABS[type];
 const data=await api('/values/'+encodeURIComponent("'"+config.name+"'!"+config.range));
 return data.values||[];
}
async function writeChanges(api,kind,plan){
 const name=TABS[kind].name;
 const updates=[];
 for(const item of plan.updates){
  if(kind==='sessions')updates.push(...sessionUpdateCells(item.remote.row,item.next,item.remote.number));
  else {
   const length=kind==='books'?12:kind==='editions'?9:4;
   updates.push({range:"'"+name+"'!A"+item.remote.number,
    values:[Array.from({length},(_,i)=>item.next[i]??'')]});
  }
 }
 if(updates.length){
  for(let i=0;i<updates.length;i+=200){
   await api('/values:batchUpdate',{method:'POST',body:json({
    valueInputOption:'RAW',data:updates.slice(i,i+200)
   })});
  }
 }
 if(plan.uploads.length){
  for(let i=0;i<plan.uploads.length;i+=120){
   await api('/values/'+encodeURIComponent("'"+name+"'!A:"+(kind==='sessions'?'N':kind==='books'?'L':kind==='editions'?'J':'D'))+
    ':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS',{
     method:'POST',body:json({values:plan.uploads.slice(i,i+120).map(x=>x.next)})
    });
  }
 }
}
function applyDownloads(plans){
 const logs=read('readingHubDailyLogV1',[]),edits=read('readingHubLibraryEditsV1',{}),
  additional=read('readingMmoAdditionalBooksV1',[]),editions=read('readingMmoEditionChoicesV1',{});
 const extraData={};
 for(const key of Object.values(MAP_TYPES))extraData[key]=read(key,{});
 const result=Array.isArray(logs)?logs.slice():[];
 const importIds=new Set(read('readingHubX4ProImportsV1',[]));
 let downloaded=0;
 const byId=new Map(result.map((r,i)=>[clean(r.importId||r.id||['manual',r.date,r.title,r.pages,r.seconds,r.importedAt].join('|')),i]));
 for(const item of plans.sessions.downloads){
  const r=applySessionFromSheet(byId.has(item.id)?result[byId.get(item.id)]:null,item.row);
  if(byId.has(item.id))result[byId.get(item.id)]=r;
  else{result.push(r);byId.set(item.id,result.length-1)}
  if(item.id.startsWith('x4:'))importIds.add(item.id);
  downloaded++;
 }
 for(const item of plans.books.downloads){applyBookRow(edits,additional,item.row);downloaded++}
 for(const item of plans.editions.downloads){applyEdition(editions,item.row);downloaded++}
 for(const item of plans.extras.downloads){applyExtra(extraData,item.row);downloaded++}
 if(!downloaded)return {downloaded:0,changed:[]};
 const values={
  readingHubDailyLogV1:result,readingHubX4ProImportsV1:[...importIds].slice(-2000),readingHubLibraryEditsV1:edits,
  readingMmoAdditionalBooksV1:additional,readingMmoEditionChoicesV1:editions,...extraData
 };
 const changed=Object.entries(values).filter(([k,v])=>!identical(read(k,null),v));
 const saved=[];
 try{
  for(const [key,value] of changed){
   const previous=localStorage.getItem(key);
   localStorage.setItem(key,json(value));saved.push({key,previous});
  }
 }catch(error){
  const errors=[];
  for(const item of saved.reverse()){
   try{if(item.previous===null)localStorage.removeItem(item.key);
       else localStorage.setItem(item.key,item.previous)}
   catch(e){errors.push(item.key)}
  }
  throw Error('Unable to save downloaded data: '+error.message+
    (errors.length?' (rollback incomplete: '+errors.join(', ')+')':''));
 }
 return {downloaded,changed:changed.map(x=>x[0])};
}
function localMaps(toSheetRow,identity){
 const sessions=read('readingHubDailyLogV1',[]);
 const list=Array.isArray(sessions)?sessions:[];
 const sessionMap=new Map(list.map(r=>[clean(identity(r)),toSheetRow(r,list)]).filter(([id])=>id));
 return {sessions:sessionMap,books:buildBooks(),editions:buildEditions(),extras:buildExtras()};
}
async function sync({api,toSheetRow,identity,setStatus}){
 if(running)return lastSummary;
 running=true;
 try{
  active={api,toSheetRow,identity,setStatus};
  setStatus('Checking Google Sheets and comparing changes…');
  await ensureTabs(api);
  const [remoteSessionRows,remoteBookRows,remoteEditionRows,remoteExtraRows]=await Promise.all([
   readTab(api,'sessions'),readTab(api,'books'),readTab(api,'editions'),readTab(api,'extras')]);
  const remote={
   sessions:remoteMap(remoteSessionRows,'sessions'),
   books:remoteMap(remoteBookRows,'books'),editions:remoteMap(remoteEditionRows,'editions'),extras:remoteMap(remoteExtraRows,'extras')
  };
  // Validate cloud JSON before writing anywhere, so malformed manual Sheet
  // edits cannot cause partial sync activity.
  for(const [key,item] of remote.extras.map){
   try{JSON.parse(field(item.row[2]))}
   catch(_){throw Error('Invalid JSON in Reading Journal Extras, row '+item.number+' ('+key+').')}
  }
  const bad=Object.entries(remote).flatMap(([type,item])=>item.duplicates.map(k=>type+': '+k));
  if(bad.length)throw Error('Duplicate IDs were found in Google Sheets: '+bad.slice(0,3).join(', ')+
   '. Please resolve duplicates before syncing.');
  const local=localMaps(toSheetRow,identity);
  const shadow=read(SHADOW_KEY,{sessions:{},books:{},extras:{}});
  const plans={};
  for(const kind of ['sessions','books','editions','extras'])
   plans[kind]=syncPlan(kind,local[kind],remote[kind].map,
    object(shadow[kind])?shadow[kind]:{},queuedChoices);
  for(const kind of ['sessions','books','editions','extras'])await writeChanges(api,kind,plans[kind]);
  const pulled=applyDownloads(plans);
  // Update the comparison baseline only after remote writes and local downloads succeed.
  const next={sessions:{...(shadow.sessions||{})},books:{...(shadow.books||{})},
   editions:{...(shadow.editions||{})},extras:{...(shadow.extras||{})}};
  for(const kind of ['sessions','books','editions','extras'])Object.assign(next[kind],plans[kind].confirmed);
  localStorage.setItem(SHADOW_KEY,json(next));
  const conflicts=['sessions','books','editions','extras'].flatMap(kind=>plans[kind].conflicts);
  queuedChoices={};
  const uploaded=['sessions','books','editions','extras'].reduce((n,k)=>n+plans[k].uploads.length+plans[k].updates.length,0);
  const msg='♡ Two-way sync: '+uploaded+' sent to Google · '+pulled.downloaded+
    ' brought to this phone'+(conflicts.length?' · '+conflicts.length+' need review':' · all clear')+'.';
  setStatus(msg);
  renderConflicts(conflicts,()=>sync(active));
  // The app has already loaded its catalog; hydrate newly imported diary-only books.
  if(pulled.changed.includes('readingMmoAdditionalBooksV1'))
   window.ReadingCompletion?.restoreExtra?.();
  if(pulled.changed.includes('readingHubDailyLogV1')||pulled.changed.includes('readingMmoEditionChoicesV1')){
   window.ReadingCalendar?.render?.();
   window.ReadingCalendar?.updateHomeFromDiary?.();
   window.ReadingCalendar?.renderHomeDashboard?.();
  }
  if(pulled.changed.includes('readingHubLibraryEditsV1')||
     pulled.changed.includes('readingMmoAdditionalBooksV1')){
   window.renderLibrary?.();window.updateLibraryStats?.();
   window.dispatchEvent(new Event('reading-mmo-library-changed'));
  }
  lastSummary={uploaded,downloaded:pulled.downloaded,conflicts:conflicts.length};
  return lastSummary;
 }catch(error){
  setStatus('Two-way sync stopped safely: '+error.message);
  throw error;
 }finally{running=false}
}
function attachConflictPanel(container){
 const panel=document.createElement('div');
 panel.id='readingGoogleConflictPanel';panel.className='reading-google-conflicts';panel.hidden=true;
 container.appendChild(panel);
}
window.ReadingTwoWaySync={sync,attachConflictPanel,
 _test:{choose,sessionCanon,bookCanon,extraCanon,remoteMap,syncPlan,sheetToLocalSession,
 buildBooks,buildExtras,applySessionFromSheet,applyBookRow,applyDownloads}};
})();
