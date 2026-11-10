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
function book(r){return /false gods/i.test(r.title)?['false-gods-graham-mcneill','Graham McNeill']:/blood over bright haven/i.test(r.title)?['blood-over-bright-haven-ml-wang','M. L. Wang']:['',''];}
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
function boot(){
 const container=$('x4SyncStatus')?.parentElement;if(!container)return;
 const wrap=document.createElement('div');wrap.style.marginTop='12px';
 const btn=document.createElement('button');btn.type='button';btn.textContent='♡ Connect Google Sheets';btn.style.cssText='padding:11px 14px;border-radius:12px;border:1px solid #a47c94;background:#432a3c;color:#fff;font-weight:700';
 btn.addEventListener('click',connect);wrap.appendChild(btn);
 const syncBtn=document.createElement('button');syncBtn.type='button';syncBtn.textContent='↻ Sync Now';syncBtn.style.cssText='margin-left:8px;padding:11px 14px;border-radius:12px;border:1px solid #a47c94;background:#432a3c;color:#fff';
 syncBtn.addEventListener('click',()=>{if(!token)connect();else sync();});wrap.appendChild(syncBtn);
 const status=document.createElement('div');status.id='readingGoogleStatus';status.setAttribute('role','status');status.style.cssText='margin-top:8px;font-size:12px;color:#d8c5cf';status.textContent='Connect once per authorization session to upload your reading history.';wrap.appendChild(status);
 container.appendChild(wrap);
 window.addEventListener('reading-mmo-log-changed',()=>{if(token)sync();});
 window.addEventListener('online',()=>{if(token)sync();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&token)sync();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
