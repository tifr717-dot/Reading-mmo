/* Reading Journal — finish diary books (including books absent from Goodreads export). */
(()=>{
'use strict';
const EXTRA_KEY='readingMmoAdditionalBooksV1';
const EDIT_KEY='readingHubLibraryEditsV1';
const HISTORY_KEY='readingHubReadingHistoryV1';
const LOG_KEY='readingHubDailyLogV1';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=t=>String(t||'').toLowerCase().replace(/\s*\([^)]*\)\s*$/,'').replace(/:\s*a novel$/,'').replace(/[^a-z0-9]+/g,' ').trim();
const knownAuthors={'blood over bright haven':'M. L. Wang','galaxy in flames':'Ben Counter','false gods':'Graham McNeill'};
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch(_){return fallback}};
function findBook(title){const id=norm(title);return (window.READING_LIBRARY_DATA||[]).find(b=>norm(b.title)===id)||null;}
function restoreExtra(){
 const books=read(EXTRA_KEY,[]);
 if(!Array.isArray(books))return;
 if(!window.READING_LIBRARY_DATA)window.READING_LIBRARY_DATA=[];
 books.forEach(b=>{if(b&&typeof b.title==='string'&&b.title.trim()&&!findBook(b.title))window.READING_LIBRARY_DATA.push({...b})});
}
function records(title){
 const book=findBook(title);if(!book)return null;
 const edits=read(EDIT_KEY,{});
 return {...book,...(edits[book.goodreadsId||book.title]||{})};
}
function finished(title){const b=records(title);return b?.status==='Read'&&!!b.finish}
function finishDate(title){const b=records(title);return b?.status==='Read'?String(b.finish||''):''}
function ensureBook(title){
 let book=findBook(title);if(book)return book;
 const value=String(title||'').trim();if(!value)throw Error('A book title is required.');
 const id=norm(value);
 const base=(window.READING_LIBRARY_DATA||[]);
 const raw=read(EXTRA_KEY,[]),arr=Array.isArray(raw)?raw:[];
 book={title:value,status:'Currently Reading',rating:'',author:knownAuthors[id]||'',series:'',pages:'',start:'',finish:'',readCount:'0',format:'Ebook',notes:'Added from Reading Journal reading diary',source:'',goodreadsId:''};
 arr.push(book);
 // Write first, so a page refresh can recover the new title as well as its completion.
 localStorage.setItem(EXTRA_KEY,JSON.stringify(arr));
 base.push(book);window.READING_LIBRARY_DATA=base;
 return book;
}
function validDate(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value)))return false;
 const d=new Date(value+'T12:00:00');
 return !isNaN(d)&&d.getFullYear()===Number(value.slice(0,4))&&d.getMonth()+1===Number(value.slice(5,7))&&d.getDate()===Number(value.slice(8,10));
}
function markFinished(title,date){
 if(!validDate(date))throw Error('Choose a valid finish date.');
 const book=ensureBook(title);
 const key=book.goodreadsId||book.title;
 const all=read(EDIT_KEY,{});
 const prior={...book,...(all[key]||{})};
 const history=read(HISTORY_KEY,{});
 let entries=Array.isArray(history[key])?history[key].slice():[];
 const logs=read(LOG_KEY,[]);
 const matching=Array.isArray(logs)?logs.filter(r=>norm(r.title)===norm(title)&&validDate(r.date)):[];
 const firstDate=matching.map(r=>r.date).sort()[0]||'';
 const start=prior.start||firstDate||'';
 if(!entries.length&&prior.finish){
   entries=[{start:prior.start||'',finish:prior.finish,rating:prior.rating||'',notes:prior.notes||'',source:'imported'}];
 }
 const duplicate=entries.some(e=>String(e.finish||'')===date&&String(e.start||'')===start);
 if(!duplicate)entries.push({start,finish:date,rating:prior.rating||'',notes:'',source:'journal-finish'});
 history[key]=entries;
 const updated={...(all[key]||{}),status:'Read',start,finish:date,readCount:String(Math.max(1,Number(prior.readCount)||0,entries.length)),updatedAt:new Date().toISOString()};
 // Save history and status; never modify XTE diary rows or percentages.
 localStorage.setItem(HISTORY_KEY,JSON.stringify(history));
 all[key]=updated;localStorage.setItem(EDIT_KEY,JSON.stringify(all));
 window.dispatchEvent(new CustomEvent('reading-mmo-book-finished',{detail:{title:book.title,date}}));
 return {...book,...updated};
}
function form(title,preferredDate){
 const host=$('calendarDayFinishEditor');if(!host)return;
 const old=finishDate(title),date=validDate(old)?old:validDate(preferredDate)?preferredDate:(()=>{const x=new Date();return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')})();
 host.dataset.title=title;
 host.dataset.contextDate=preferredDate;
 host.innerHTML='<form id="readingFinishForm" class="reading-finish-form">'+
 '<h3>♡ Finish '+esc(title)+'</h3>'+
 '<p>Choose the day you finished. This updates your library and reading history, but never adds extra XTE pages.</p>'+
 '<label>Finish date<input type="date" name="finishedOn" required value="'+esc(date)+'"></label>'+
 '<div class="reading-finish-actions"><button type="submit">✓ Save as Finished</button>'+
 '<button type="button" data-finish-cancel>Cancel</button></div>'+
 '<small>Your existing reading sessions and page totals stay exactly as recorded.</small></form>';
 host.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function boot(){
 $('calendarDayBody')?.addEventListener('click',event=>{
   const b=event.target.closest('[data-finish-title]');if(!b)return;
   if($('calendarDayEquivalentEditor'))$('calendarDayEquivalentEditor').innerHTML='';
   form(b.dataset.finishTitle,b.dataset.finishDate);
 });
 $('calendarDayFinishEditor')?.addEventListener('click',event=>{
   if(event.target.closest('[data-finish-cancel]'))event.currentTarget.innerHTML='';
 });
 $('calendarDayFinishEditor')?.addEventListener('submit',event=>{
  if(event.target.id!=='readingFinishForm')return;
  event.preventDefault();
  const host=event.currentTarget,title=host.dataset.title;
  const date=event.target.elements.finishedOn.value;
  try{
    markFinished(title,date);
    window.ReadingCalendar?.render?.();
    window.ReadingCalendar?.openDay?.(host.dataset.contextDate||date);
    const banner=$('calendarFinishNotice');
    if(banner){banner.textContent='✓ '+title+' finished on '+date+' and saved in your Library!';banner.hidden=false;}
  }catch(e){const note=event.target.querySelector('small');if(note)note.textContent='Could not save: '+e.message;}
 });
}
restoreExtra();
window.ReadingCompletion={findBook,records,finished,finishDate,ensureBook,markFinished,validDate,restoreExtra,form};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();