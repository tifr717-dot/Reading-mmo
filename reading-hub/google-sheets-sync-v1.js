/* Reading MMO — personal Google Sheets sync. OAuth tokens are memory-only. */
(() => {
'use strict';
const CLIENT_ID='210180634744-19sarih5pvsic9uffa2hs8vjp8l5mbas.apps.googleusercontent.com';
const SHEET_ID='14LSazIkXwh-jzxOu-hdQ1HhQn0RMW1z_fV85c7OD-Go';
const SCOPE='https://www.googleapis.com/auth/spreadsheets';
const LOG_KEY='readingHubDailyLogV1';
let token='',expiresAt=0,tokenClient=null,busy=false;
const $=id=>document.getElementById(id);
const setStatus=(message)=>{if($('readingGoogleStatus'))$('readingGoogleStatus').textContent=message;};
const safeText=x=>String(x==null?'':x);
function getRows(){try{const r=JSON.parse(localStorage.getItem(LOG_KEY)||'[]');return Array.isArray(r)?r:[];}catch(_){return [];}}
function identity(r){return safeText(r.importId||r.id||['manual',r.date,r.title,r.pages,r.seconds,r.importedAt].join('|'));}
const normalize=x=>safeText(x).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function book(r){const title=normalize(r.title);const preset={'false gods':['false-gods-graham-mcneill','Graham McNeill'],'blood over bright haven a novel':['blood-over-bright-haven-ml-wang','M. L. Wang'],'blood over bright haven':['blood-over-bright-haven-ml-wang','M. L. Wang'],'galaxy in flames':['galaxy-in-flames-ben-counter','Ben Counter']};return preset[title]||['book-'+title.replace(/ /g,'-'),''];}
function sheetRow(r){const b=book(r);const suspect=r.source==='manual'&&Number(r.pages)>=1000;
 const pages=suspect?'':Number(r.pages)||0;
 return [identity(r),r.date||'',b[0],r.title||'',b[1],r.startPercent??'',r.endPercent??'',pages,Math.round((Number(r.seconds)||0)/60*100)/100,'','',r.source||'manual',r.importedAt||'',suspect?'Review: total XTE book pages, not daily reading':'Imported from Reading MMO'];
}
async function api(path,options={}){
 if(!token||Date.now()>expiresAt)throw Error('Google authorization expired. Tap Connect Google again.');
 const response=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(SHEET_ID)+path,{
  ...options,headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json',...(options.headers||{})}
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw Error(data.error?.message||'Google Sheets request failed ('+response.status+')');
 return data;
}
async function sync(){
 if(busy||!token)return;
 busy=true;
 try{
  setStatus('Checking Google Sheets for existing sessions…');
  const current=await api('/values/'+encodeURIComponent("'Reading Sessions'!A2:A1000"));
  const known=new Set((current.values||[]).map(row=>safeText(row[0])));
  const missing=getRows().filter(r=>!known.has(identity(r)));
  if(!missing.length){setStatus('♡ Up to date — all local sessions are in Google Sheets.');return;}
  const payload={values:missing.map(sheetRow)};
  await api('/values/'+encodeURIComponent("'Reading Sessions'!A:N")+':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS',{method:'POST',body:JSON.stringify(payload)});
  setStatus('♡ Uploaded '+missing.length+' session'+(missing.length===1?'':'s')+' to Google Sheets!');
 }catch(error){setStatus('Google sync: '+error.message+' Your sessions remain saved on this phone.');}
 finally{busy=false;}
}
function connect(){
 if(!window.google?.accounts?.oauth2){setStatus('Google sign-in is still loading. Try again in a moment.');return;}
 if(!tokenClient)tokenClient=google.accounts.oauth2.initTokenClient({client_id:CLIENT_ID,scope:SCOPE,callback:response=>{
  if(response.error){setStatus('Google authorization failed: '+response.error);return;}
  token=response.access_token;expiresAt=Date.now()+(Number(response.expires_in)||3500)*1000-60000;
  setStatus('Connected to Google. Syncing sessions…');sync();
 }});
 tokenClient.requestAccessToken({prompt:token?'':'consent'});
}

const editionCacheKey='readingMmoEditionChoicesV1';
function selectedEditions(){try{return JSON.parse(localStorage.getItem(editionCacheKey)||'{}')}catch(_){return {}}}
function editionId(r){return book(r)[0]}
function percentPages(row,pages){const a=Number(row[5]),b=Number(row[6]);return Number.isFinite(a)&&Number.isFinite(b)&&row[5]!==''&&row[6]!==''&&b>=a?Math.round((b-a)*pages/100*100)/100:''}
async function updateEdition(bookId,entry){
 const current=await api('/values/'+encodeURIComponent("'Book Editions'!A2:J1000"));
 const rows=current.values||[];const index=rows.findIndex(r=>r[0]===bookId);
 const values=[bookId,entry.title,entry.author,entry.isbn||'',entry.ebookPages||'',entry.printPages||'',entry.source||'',entry.url||'',entry.status||'Confirmed',new Date().toISOString().slice(0,10)];
 const range="'Book Editions'!A"+(index<0?rows.length+2:index+2)+":J"+(index<0?rows.length+2:index+2);
 await api('/values/'+encodeURIComponent(range)+'?valueInputOption=RAW',{method:'PUT',body:JSON.stringify({values:[values]})});
 // Fill book ID, author, and derived page estimates for existing session rows.
 const sessions=await api('/values/'+encodeURIComponent("'Reading Sessions'!A2:N1000"));
 const valuesRows=sessions.values||[];
 const requests=[];
 valuesRows.forEach((row,i)=>{
  if(book({title:row[3]})[0]!==bookId&&row[2]!==bookId)return;
  const x=Array.from({length:14},(_,j)=>row[j]??'');
  x[2]=bookId;x[4]=entry.author;
  x[9]=entry.ebookPages?percentPages(x,Number(entry.ebookPages)):'';
  x[10]=entry.printPages?percentPages(x,Number(entry.printPages)):'';
  requests.push({range:"'Reading Sessions'!A"+(i+2)+":N"+(i+2),values:[x]});
 });
 if(requests.length)await api('/values:batchUpdate',{method:'POST',body:JSON.stringify({valueInputOption:'RAW',data:requests})});
 const choices=selectedEditions();choices[bookId]=entry;localStorage.setItem(editionCacheKey,JSON.stringify(choices));
}
async function lookupBook(title,author){
 const clean=safeText(title).replace(/:\s*(a novel|novel)\s*$/i,'').trim();
 const queries=[{title:clean,author},{title:clean},{q:clean+' '+author},{q:clean}];
 for(const q of queries){
  const params=new URLSearchParams({...q,fields:'key,title,author_name',limit:'12'});
  try{
   const res=await fetch('https://openlibrary.org/search.json?'+params.toString());
   if(!res.ok)continue;
   const data=await res.json();
   const matches=(data.docs||[]).filter(x=>x.key&&x.title);
   if(matches.length)return matches.slice(0,8);
  }catch(_){}
 }
 return [];
}
async function loadEditions(workKey){
 if(!workKey.startsWith('/works/OL')||!workKey.endsWith('W')||!/^OL[0-9]+W$/.test(workKey.slice(7)))throw Error('Invalid book record');
 const res=await fetch('https://openlibrary.org'+workKey+'/editions.json?limit=100');
 if(!res.ok)throw Error('Edition list unavailable');
 const data=await res.json();
 return (data.entries||[]).filter(x=>Number(x.number_of_pages)>0).slice(0,60).map(x=>({
  title:x.title||'',pages:Number(x.number_of_pages),isbn:(x.isbn_13||[])[0]||'',url:'https://openlibrary.org'+x.key,source:'Open Library',status:'Confirmed print edition'
 }));
}
function coverForEdition(title,author,isbn){
 const svc=window.ReadingCovers;
 if(!svc)return {status:'unavailable'};
 const existing=svc.cachedRef(title,author);
 if(existing)return {status:'preserved'};
 const clean=safeText(isbn).replace(/[^0-9X]/gi,'');
 if(!/^(?:[0-9]{13}|[0-9]{9}[0-9X])$/.test(clean))return {status:'no-isbn'};
 const added=svc.saveAuto(title,author,{isbn:clean});
 return {status:added?'linked':'preserved'};
}
function editionCoverPreview(container,title,author,isbn){
 container.replaceChildren();
 const covers=window.ReadingCovers;
 const holder=document.createElement('div');holder.style.cssText='display:flex;align-items:center;gap:12px;margin:8px 0';
 const preview=document.createElement('div');preview.style.cssText='width:80px;height:118px;flex:0 0 80px;border-radius:8px;background:#593747;color:#fff;display:flex;align-items:center;justify-content:center;font:12px Georgia,serif;text-align:center';preview.textContent='BOOK COVER';
 const desc=document.createElement('div');desc.style.cssText='font-size:12px;line-height:1.5';desc.textContent='Search covers separately from editions. Your selected print page count will not change.';holder.append(preview,desc);container.appendChild(holder);
 const status=document.createElement('div');status.style.cssText='font-size:12px;margin:8px 0';container.appendChild(status);
 const choices=document.createElement('div');choices.style.cssText='display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:8px';container.appendChild(choices);
 function show(ref){
  if(!covers||!ref)return;
  const url=covers.refUrl(ref,'M');if(!url)return;
  const img=new Image();
  img.onload=()=>{preview.style.backgroundImage='url("'+url.replace(/"/g,'%22')+'")';preview.style.backgroundSize='cover';preview.style.backgroundPosition='center';preview.textContent=''};
  img.onerror=()=>{preview.style.backgroundImage='none';preview.textContent='BOOK COVER'};
  img.src=url;
 }
 if(covers)show(covers.cachedRef(title,author));
 const button=document.createElement('button');button.type='button';button.textContent='♡ Find / Change Cover';button.style.cssText='padding:10px;border-radius:9px;background:#673b57;color:white;margin:6px 0';container.appendChild(button);
 button.addEventListener('click',async()=>{
  if(!covers){status.textContent='Cover service is unavailable. Try reopening the app.';return}
  button.disabled=true;status.textContent='Searching Open Library and Google Books for covers…';choices.replaceChildren();
  try{
   const normalized=title.replace(/:\\s*(a novel|novel)\\s*$/i,'').trim();
   let found=await covers.findCandidates(normalized,author,isbn);
   if(!found.length&&normalized!==title)found=await covers.findCandidates(title,author,isbn);
   if(!found.length){status.textContent='No cover images found yet. You can still use the Library manual cover picker.';return}
   status.textContent='Tap the cover you want. Your edition and page count stay unchanged.';
   for(const item of found){
    const url=covers.refUrl(item.ref,'M');if(!url)continue;
    const option=document.createElement('button');option.type='button';option.style.cssText='border:1px solid #896078;background:#382733;border-radius:8px;padding:5px;color:white;min-height:112px';
    const img=document.createElement('img');img.alt=item.title+' cover';img.style.cssText='width:100%;height:108px;object-fit:contain';
    img.onerror=()=>option.remove();img.src=url;
    const caption=document.createElement('div');caption.textContent=item.source;caption.style.cssText='font-size:10px';option.append(img,caption);
    option.addEventListener('click',()=>{
     try{
      covers.saveManual(title,author,item.ref);
      // The XTE title can contain a subtitle, while book metadata can omit it.
      if(normalized!==title)covers.saveManual(normalized,author,item.ref);
      show(item.ref);status.textContent='♡ Cover selected! It will be preserved separately from your edition.';choices.replaceChildren();
     }catch(e){status.textContent='Unable to save cover: '+e.message}
    });
    choices.appendChild(option);
   }
  }catch(e){status.textContent='Cover search unavailable: '+e.message}
  finally{button.disabled=false}
 });
}
function makeSelect(options){const el=document.createElement('select');el.style.cssText='width:100%;max-width:100%;padding:10px;border-radius:9px;background:#382733;color:#fff;margin:6px 0';options.forEach((o,i)=>{const op=document.createElement('option');op.value=String(i);op.textContent=o;el.appendChild(op)});return el}
function field(label,value){const wrap=document.createElement('label');wrap.style.cssText='display:block;margin:8px 0;color:#f5e6ee';wrap.textContent=label;const input=document.createElement('input');input.value=value||'';input.style.cssText='display:block;width:100%;box-sizing:border-box;padding:10px;border-radius:9px;background:#382733;color:#fff;border:1px solid #95718a';wrap.appendChild(input);return [wrap,input]}
function createMatcher(container){
 const section=document.createElement('section');section.style.cssText='margin-top:16px;padding:14px;border:1px solid #795568;border-radius:14px';
 const heading=document.createElement('div');heading.textContent='♡ Find Book';heading.style.cssText='font-weight:700;margin-bottom:8px';section.appendChild(heading);
 const help=document.createElement('div');help.textContent='Find a book once to match its cover, author, ISBN and print or ebook page count. Your chosen covers stay protected.';help.style.cssText='font-size:12px;margin-bottom:8px';section.appendChild(help);
 const bookSelect=makeSelect([]);section.appendChild(bookSelect);
 const search=document.createElement('button');search.type='button';search.textContent='♡ Find Book';search.style.cssText='padding:10px;border-radius:10px;background:#673b57;color:white;margin:6px 0';section.appendChild(search);
 const result=document.createElement('div');section.appendChild(result);
 bookSelect.addEventListener('change',()=>{result.replaceChildren();notice.textContent='Tap Find Book to load the selected book.';});
 const notice=document.createElement('div');notice.style.cssText='font-size:12px;margin-top:6px';section.appendChild(notice);
 function refresh(){
  const selected=bookSelect.value;
  const books=[...new Map(getRows().filter(r=>r.title).map(r=>[normalize(r.title),r.title])).values()];
  bookSelect.replaceChildren(...books.map(t=>{const o=document.createElement('option');o.value=t;o.textContent=t+(selectedEditions()[book({title:t})[0]]?' ✓':'');return o}));
  if(books.includes(selected))bookSelect.value=selected;
 }
 async function renderForm(title,author,edition){
  const selectedBook=bookSelect.value;
  result.replaceChildren();
  const [titleWrap,titleInput]=field('Book title',title);result.appendChild(titleWrap);
  const [authorWrap,authorInput]=field('Author',author);result.appendChild(authorWrap);
  const [printWrap,printInput]=field('Print edition pages',edition?.pages||'');printInput.type='number';printInput.min='1';result.appendChild(printWrap);
  const [ebookWrap,ebookInput]=field('Ebook edition pages (optional)', '');ebookInput.type='number';ebookInput.min='1';result.appendChild(ebookWrap);
  const [isbnWrap,isbnInput]=field('ISBN-13 (optional)',edition?.isbn||'');result.appendChild(isbnWrap);
  const coverBox=document.createElement('div');result.appendChild(coverBox);
  const previewCover=()=>editionCoverPreview(coverBox,titleInput.value,authorInput.value,isbnInput.value);
  previewCover();
  isbnInput.addEventListener('change',previewCover);
  authorInput.addEventListener('change',previewCover);
  const save=document.createElement('button');save.type='button';save.textContent='♡ Save Book & Edition';save.style.cssText='padding:12px;border-radius:10px;background:#713e61;color:white;margin-top:8px';result.appendChild(save);
  save.addEventListener('click',async()=>{
   if(bookSelect.value!==selectedBook){notice.textContent='The selected book changed. Tap Find Book again before saving.';return;}
   if(!token){notice.textContent='Connect Google Sheets first.';return;}
   const printPages=Number(printInput.value)||0,ebookPages=Number(ebookInput.value)||0;
   if(!printPages&&!ebookPages){notice.textContent='Enter at least one page count.';return;}
   if((printPages&&!Number.isInteger(printPages))||(ebookPages&&!Number.isInteger(ebookPages))){notice.textContent='Page counts must be whole numbers.';return;}
   save.disabled=true;notice.textContent='Saving edition and calculating page equivalents…';
   try{await updateEdition(book({title:selectedBook})[0],{title:titleInput.value,author:authorInput.value,printPages,ebookPages,isbn:isbnInput.value,source:edition?.source||'Manual',url:edition?.url||'',status:edition?'Confirmed selected edition':'Manually entered edition'});const coverResult=coverForEdition(selectedBook,authorInput.value,isbnInput.value);
   previewCover();
   notice.textContent='♡ Edition saved! Page estimates updated. '+(coverResult.status==='linked'?'Edition cover linked to your existing cover system.':coverResult.status==='preserved'?'Your chosen cover was kept.':'You can still use Find Covers in Library.');refresh()}
   catch(e){notice.textContent='Could not save: '+e.message}
   finally{save.disabled=false}
  });
 }
 search.addEventListener('click',async()=>{
  const title=bookSelect.value;if(!title)return;
  result.replaceChildren();notice.textContent='Searching book records…';
  try{
   const author=book({title})[1];const works=await lookupBook(title,author);
   notice.textContent=works.length?'Choose the matching book record:':'No match found. You can enter the page count manually.';
   const manual=document.createElement('button');manual.type='button';manual.textContent='Enter Manually';manual.addEventListener('click',()=>renderForm(title,author,null));result.appendChild(manual);
   for(const work of works){
    const btn=document.createElement('button');btn.type='button';btn.style.cssText='display:block;padding:8px;margin:6px 0;border:1px solid #896078;border-radius:8px;color:#fff;background:#4b3040';
    btn.textContent=work.title+' — '+(work.author_name||[]).join(', ');
    btn.addEventListener('click',async()=>{
     notice.textContent='Loading editions…';
     try{
      const editions=await loadEditions(work.key);result.replaceChildren();
      if(!editions.length){notice.textContent='No page-count editions found. Enter pages manually.';await renderForm(title,(work.author_name||[])[0]||author,null);return}
      const sel=makeSelect(editions.map(e=>e.title+' · '+e.pages+' pages'+(e.isbn?' · '+e.isbn:'')));result.appendChild(sel);
      const choose=document.createElement('button');choose.type='button';choose.textContent='Use This Edition';choose.addEventListener('click',()=>renderForm(title,(work.author_name||[])[0]||author,editions[Number(sel.value)]));result.appendChild(choose);
      notice.textContent='Select the edition that matches your preferred print page count.';
     }catch(e){notice.textContent=e.message}
    });result.appendChild(btn);
   }
  }catch(e){notice.textContent=e.message+' — you can enter the details manually.';await renderForm(title,book({title})[1],null)}
 });
 refresh();container.appendChild(section);
 window.addEventListener('reading-mmo-log-changed',refresh);
}
function boot(){
 const container=$('x4SyncStatus')?.parentElement;if(!container)return;
 const wrap=document.createElement('div');wrap.style.marginTop='12px';
 const btn=document.createElement('button');btn.type='button';btn.textContent='♡ Connect Google Sheets';btn.style.cssText='padding:11px 14px;border-radius:12px;border:1px solid #a47c94;background:#432a3c;color:#fff;font-weight:700';
 btn.addEventListener('click',connect);wrap.appendChild(btn);
 const syncBtn=document.createElement('button');syncBtn.type='button';syncBtn.textContent='↻ Sync Now';syncBtn.style.cssText='margin-left:8px;padding:11px 14px;border-radius:12px;border:1px solid #a47c94;background:#432a3c;color:#fff';
 syncBtn.addEventListener('click',()=>{if(!token)connect();else sync();});wrap.appendChild(syncBtn);
 const status=document.createElement('div');status.id='readingGoogleStatus';status.setAttribute('role','status');status.style.cssText='margin-top:8px;font-size:12px;color:#d8c5cf';status.textContent='Connect once per authorization session to upload your reading history.';wrap.appendChild(status);
 const toolsPanel=document.createElement('details');
 toolsPanel.style.cssText='margin-top:14px;border:1px solid #795568;border-radius:14px;padding:12px';
 const toolsTitle=document.createElement('summary');toolsTitle.textContent='♡ Reading Tools · Find Book, Google Sheets & Backup';toolsTitle.style.cssText='cursor:pointer;font-weight:700;padding:4px 0';
 toolsPanel.appendChild(toolsTitle);
 const backup=document.getElementById('readingBackupDownload')?.parentElement;
 if(backup)toolsPanel.appendChild(backup);
 toolsPanel.appendChild(wrap);
 createMatcher(toolsPanel);
 container.appendChild(toolsPanel);
 window.addEventListener('reading-mmo-log-changed',()=>{if(token)sync();});
 window.addEventListener('online',()=>{if(token)sync();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&token)sync();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
