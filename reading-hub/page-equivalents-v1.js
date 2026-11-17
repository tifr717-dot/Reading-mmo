/* Reading Journal — daily print and ebook equivalents, separate from XTE pages. */
(()=>{
'use strict';
const DAILY='readingMmoPageEquivalentsByDayV1', EDITIONS='readingMmoPageEditionOverridesV1', CHOSEN='readingMmoEditionChoicesV1';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=key=>{try{const x=JSON.parse(localStorage.getItem(key)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch(_){return {}}};
const clean=v=>String(v||'').toLowerCase().replace(/\s*\((?:a novel|[^)]*#\d+)[^)]*\)\s*$/i,'').replace(/[^a-z0-9]+/g,' ').trim();
const valid=v=>v!==''&&v!==null&&v!==undefined&&Number.isSafeInteger(Number(v))&&Number(v)>=0;
const key=(date,title)=>date+'|'+clean(title);
function edition(title){
 const custom=read(EDITIONS)[clean(title)]||{},choices=read(CHOSEN),match=clean(title);
 const selected=Object.entries(choices).find(([id,item])=>item&&typeof item==='object'&&
  (clean(item.title)===match||clean(id.replace(/^book-/,'').replace(/-ml-wang$/,'').replace(/-/g,' '))===match));
 const picked=selected?.[1]||{};
 const books=window.READING_LIBRARY_DATA||[];
 const lib=books.find(b=>clean(b.title)===match);
 const positive=(...values)=>{for(const x of values)if(Number.isSafeInteger(Number(x))&&Number(x)>0)return Number(x);return 0};
 return {printTotal:positive(custom.printTotal,picked.printPages,lib?.pages),
  ebookTotal:positive(custom.ebookTotal,picked.ebookPages),custom};
}
function metric(rows,field,total,override){
 if(valid(override))return {value:Number(override),source:'entered'};
 let value=0,known=0,approx=false;
 rows.forEach(r=>{
  const direct=r[field+'Pages'];
  if(valid(direct)){value+=Number(direct);known++;return}
  const a=r.startPercent,b=r.endPercent;
  if(total>0&&a!==''&&a!=null&&b!==''&&b!=null&&Number.isFinite(Number(a))&&Number.isFinite(Number(b))&&Number(b)>=Number(a)){
   value+=Math.max(0,Math.round(total*Number(b)/100)-Math.round(total*Number(a)/100));known++;approx=true;
  }else approx=true;
 });
 return known?{value,source:approx?'estimate':'entered'}:{value:null,source:'unknown'};
}
function forBook(date,title,rows){
 const override=read(DAILY)[key(date,title)]||{},ed=edition(title);
 return {print:metric(rows,'print',ed.printTotal,override.printPages),
  ebook:metric(rows,'ebook',ed.ebookTotal,override.ebookPages),
  printTotal:ed.printTotal,ebookTotal:ed.ebookTotal};
}
function aggregateRows(rows){
 const groups={};rows.forEach(r=>{(groups[key(r.date||'',r.title||'')]||=[]).push(r)});
 const output={print:{value:null,source:'unknown'},ebook:{value:null,source:'unknown'}};
 Object.values(groups).forEach(group=>{
  const r=group[0],value=forBook(r.date,r.title,group);
  ['print','ebook'].forEach(field=>{
   const to=value[field],from=output[field];
   if(to.value!==null)from.value=(from.value??0)+to.value;
   if(to.source==='estimate'||to.value===null)from.source='estimate';
   else if(from.source==='unknown')from.source='entered';
  });
 });
 return output;
}
function label(stats){return ['print','ebook'].filter(field=>stats[field]?.value!==null&&stats[field]?.value!==undefined)
 .map(field=>(stats[field].source==='estimate'?'≈':'')+stats[field].value+' '+field).join(' · ')}
const dailyValues=(date,title)=>read(DAILY)[key(date,title)]||{};
function saveDaily(date,title,values){
 const all=read(DAILY),id=key(date,title),next={};
 ['printPages','ebookPages'].forEach(field=>{if(valid(values[field]))next[field]=Number(values[field])});
 if(Object.keys(next).length)all[id]=next;else delete all[id];
 localStorage.setItem(DAILY,JSON.stringify(all));
}
function saveEdition(title,values){
 const all=read(EDITIONS),id=clean(title),next={};
 ['printTotal','ebookTotal'].forEach(field=>{if(valid(values[field])&&Number(values[field])>0)next[field]=Number(values[field])});
 if(Object.keys(next).length)all[id]=next;else delete all[id];
 localStorage.setItem(EDITIONS,JSON.stringify(all));
}
function edit(date,title){
 const host=$('calendarDayEquivalentEditor');if(!host)return;
 const prior=dailyValues(date,title),book=edition(title);
 const logs=window.ReadingCalendar?.readLogs?.()||[];
 const rows=logs.filter(r=>r.date===date&&r.title===title);
 const metrics=forBook(date,title,rows);
 const val=x=>valid(prior[x])?prior[x]:'';
 host.dataset.date=date;host.dataset.title=title;
 host.innerHTML='<form class="page-eq-editor" id="pageEqForm">'+
  '<h3>♡ '+esc(title)+'</h3>'+
  '<p>Enter pages read <b>on this day</b>, not the total book length. Leave blank for an estimated equivalent.</p>'+
  '<div class="page-eq-inputs"><label>Print pages read<input name="printPages" type="number" min="0" step="1" value="'+esc(val('printPages'))+'" placeholder="'+esc(metrics.print.value===null?'Not known':'≈ '+metrics.print.value)+'"></label>'+
  '<label>Ebook pages read<input name="ebookPages" type="number" min="0" step="1" value="'+esc(val('ebookPages'))+'" placeholder="'+esc(metrics.ebook.value===null?'Not known':'≈ '+metrics.ebook.value)+'"></label></div>'+
  '<details><summary>Set your edition’s length (for estimates)</summary><p>Optional total pages for the whole book. Future daily estimates use the percentage you read.</p>'+
  '<div class="page-eq-inputs"><label>Total print pages<input name="printTotal" type="number" min="1" step="1" value="'+esc(book.custom.printTotal||'')+'" placeholder="'+esc(book.printTotal||'Unknown')+'"></label>'+
  '<label>Total ebook pages<input name="ebookTotal" type="number" min="1" step="1" value="'+esc(book.custom.ebookTotal||'')+'" placeholder="'+esc(book.ebookTotal||'Unknown')+'"></label></div></details>'+
  '<div class="page-eq-actions"><button type="submit">♡ Save page counts</button><button type="button" data-page-eq-cancel>Cancel</button></div>'+
  '<small>XTE pages and original diary sessions remain unchanged.</small></form>';
 host.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function boot(){
 $('calendarDayBody')?.addEventListener('click',event=>{
  const button=event.target.closest('[data-page-eq-edit]');if(!button)return;
  const title=button.dataset.pageEqEdit,date=button.dataset.pageEqDate;
  if(title&&date)edit(date,title);
 });
 $('calendarDayEquivalentEditor')?.addEventListener('click',event=>{
  if(event.target.closest('[data-page-eq-cancel]'))event.currentTarget.innerHTML='';
 });
 $('calendarDayEquivalentEditor')?.addEventListener('submit',event=>{
  if(event.target.id!=='pageEqForm')return;event.preventDefault();
  const host=event.currentTarget,form=event.target,date=host.dataset.date,title=host.dataset.title;
  const value=name=>String(form.elements[name]?.value||'').trim();
  const fields=['printPages','ebookPages','printTotal','ebookTotal'];
  for(const field of fields){
   const x=value(field);
   if(x!==''&&(!/^\d+$/.test(x)||!Number.isSafeInteger(Number(x))||(field.endsWith('Total')&&Number(x)<1))){
    alert('Please use whole numbers. Daily pages can be zero; book totals must be at least 1.');return;
   }
  }
  try{
   saveDaily(date,title,{printPages:value('printPages'),ebookPages:value('ebookPages')});
   saveEdition(title,{printTotal:value('printTotal'),ebookTotal:value('ebookTotal')});
   window.dispatchEvent(new Event('reading-mmo-log-changed'));
   window.ReadingCalendar?.openDay?.(date);
   window.ReadingCalendar?.render?.();
   window.ReadingCalendar?.renderHomeDashboard?.();
   edit(date,title);
   const note=$('pageEqForm')?.querySelector('small');
   if(note)note.textContent='♡ Saved on this device. Your XTE readings are unchanged.';
  }catch(error){alert('Unable to save page counts: '+error.message)}
 });
}
window.ReadingPageEquivalents={edition,forBook,aggregateRows,label,dailyValues,saveDaily,saveEdition,valid,edit};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
