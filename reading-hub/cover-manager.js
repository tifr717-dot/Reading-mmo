(function(){
  'use strict';
  const BATCH_KEY='readingJournalCoverBatchV1';
  const BATCH_SIZE=30;
  let current=null, choices=[],busy=false,paused=false;
  const $=id=>document.getElementById(id);
  const covers=()=>window.ReadingCovers;
  function escapeHtml(value){
    return String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function bookId(b){return String(b.goodreadsId||String(b.title||'').toLowerCase()+'|'+String(b.author||'').toLowerCase())}
  function books(){
    const seen=new Set();
    return (window.READING_LIBRARY_DATA||[]).filter(b=>{
      if(!b.title||!b.author)return false;
      const k=bookId(b);if(seen.has(k))return false;seen.add(k);return true;
    });
  }
  function batchRead(){
    try{
      const obj=JSON.parse(localStorage.getItem(BATCH_KEY)||'{}');
      return obj&&typeof obj==='object'&&obj.scanned&&typeof obj.scanned==='object'?obj:{scanned:{}};
    }catch(_){return {scanned:{}}}
  }
  function batchWrite(s){localStorage.setItem(BATCH_KEY,JSON.stringify(s))}
  function setNote(message,kind){
    const el=$('coverPickerNote');if(!el)return;
    el.textContent=message;el.dataset.kind=kind||'';
  }
  function updatePreview(){
    if(!current)return;
    const slot=$('editCoverPreview');
    slot.dataset.coverSize='L';
    covers().refreshElement(slot,current.title,current.author);
    const status=covers().coverStatus(current.title,current.author);
    $('coverPickerCurrent').textContent=status==='manual'?'✓ Your chosen cover (saved on this device)':status==='found'?'✓ Automatically matched cover':'No cover saved yet';
    $('coverReset').disabled=status!=='manual';
  }
  function open(book){
    current={title:book.title||'',author:book.author||''}; choices=[];
    $('coverResults').replaceChildren();
    $('coverPasteRow').hidden=true;
    $('coverSearch').disabled=false;
    setNote('Find a cover, choose one of the matches, upload from your phone, or paste a link.');
    updatePreview();
  }
  function close(){current=null;choices=[]}
  async function search(){
    if(!current)return;
    const book=current;
    $('coverSearch').disabled=true;
    $('coverResults').textContent='Searching Open Library and Google Books…';
    setNote('Searching for '+current.title+'…');
    try{
      const matches=await covers().findCandidates(book.title,book.author);
      if(current!==book)return;
      choices=matches;
      if(!choices.length){
        $('coverResults').textContent='No reliable matches found. You can still upload a cover or paste a link.';
        setNote('No matching covers found.','bad');
        return;
      }
      $('coverResults').innerHTML=choices.map((c,i)=>
        '<button type="button" class="cover-choice" data-cover-choice="'+i+'" aria-label="Choose '+escapeHtml(c.title)+' from '+escapeHtml(c.source)+'">'+
        '<img src="'+escapeHtml(covers().refUrl(c.ref,'M'))+'" alt="" loading="lazy" referrerpolicy="no-referrer">'+
        '<span class="cover-choice-title">'+escapeHtml(c.title)+'</span>'+
        '<span class="cover-choice-meta">'+escapeHtml(c.source+(c.year?' · '+c.year:''))+'</span>'+
        '</button>'
      ).join('');
      setNote(choices.length+' possible covers found. Tap the exact edition you want.','ok');
    }catch(err){
      $('coverResults').textContent='Cover search is unavailable right now. Try again, upload, or paste a link.';
      setNote(err.message||'Search failed','bad');
    }finally{$('coverSearch').disabled=false}
  }
  async function choose(index){
    if(!current||!choices[index])return;
    const b=current,choice=choices[index];
    setNote('Checking that cover image…');
    try{
      await verifyImage(covers().refUrl(choice.ref,'M'));
      if(current!==b)return;
      covers().saveManual(b.title,b.author,choice.ref);
      updatePreview();setNote('♡ Cover saved! It will be used throughout the Reading Journal.','ok');
    }catch(err){setNote(err.message||'That image could not load','bad')}
  }
  async function upload(file){
    if(!current||!file)return;
    setNote('Saving your image on this device…');
    $('coverUpload').disabled=true;
    try{
      await covers().saveUpload(current.title,current.author,file);
      updatePreview();setNote('♡ Your uploaded cover is saved on this device!','ok');
    }catch(err){setNote(err.message||'Upload failed','bad')}
    finally{$('coverUpload').disabled=false;$('coverFile').value=''}
  }
  function verifyImage(url){
    return new Promise((resolve,reject)=>{
      const img=new Image();
      const timeout=setTimeout(()=>{img.onload=img.onerror=null;reject(new Error('Cover image timed out'))},12000);
      img.onload=()=>{clearTimeout(timeout);resolve()};
      img.onerror=()=>{clearTimeout(timeout);reject(new Error('That link did not load as an image'))};
      img.src=url;
    });
  }
  async function paste(){
    if(!current)return;
    const value=$('coverUrl').value.trim();
    let parsed;
    try{
      parsed=new URL(value);
      if(parsed.protocol!=='https:')throw new Error('Please use a complete HTTPS image URL.');
      $('coverSaveUrl').disabled=true;
      setNote('Checking the image link…');
      await verifyImage(parsed.href);
      covers().saveManual(current.title,current.author,{url:parsed.href});
      $('coverPasteRow').hidden=true;$('coverUrl').value='';
      updatePreview();setNote('♡ Cover link saved!','ok');
    }catch(err){setNote(err.message||'Invalid image link','bad')}
    finally{$('coverSaveUrl').disabled=false}
  }
  function reset(){
    if(!current)return;
    covers().clearManual(current.title,current.author);
    updatePreview();setNote('Back to the automatic cover for this book.','ok');
  }
  function renderBatch(message){
    const all=books(),state=batchRead(),done=all.filter(b=>{
      const status=covers().coverStatus(b.title,b.author);
      return status==='manual'||status==='found'||!!state.scanned[bookId(b)];
    }).length;
    const saved=all.filter(b=>['manual','found'].includes(covers().coverStatus(b.title,b.author))).length;
    const unresolved=all.filter(b=>covers().coverStatus(b.title,b.author)==='missing').length;
    const remaining=all.length-done;
    $('coverBatchCount').textContent=done+' / '+all.length+' checked';
    $('coverBatchBar').style.width=(all.length?Math.round(done/all.length*100):0)+'%';
    $('coverBatchMeta').textContent=saved+' covers found or selected · '+unresolved+' unresolved';
    $('coverBatchStatus').textContent=message||(
      remaining===0?'Scan complete! You can retry unresolved covers anytime.':
      'Ready to search '+remaining+' unchecked books in manageable batches.'
    );
    $('coverBatchStart').textContent=busy?'Importing…':remaining?'♡ Find Missing Covers ('+Math.min(BATCH_SIZE,remaining)+')':'↻ Retry Unresolved Covers';
    $('coverBatchStart').disabled=busy;
    $('coverBatchPause').disabled=!busy;
    $('coverBatchReset').disabled=busy;
  }
  async function runBatch(){
    if(busy)return;
    let state=batchRead(),all=books();
    let queue=all.filter(b=>{
      const status=covers().coverStatus(b.title,b.author);
      return status!=='found'&&status!=='manual'&&!state.scanned[bookId(b)];
    });
    if(!queue.length){
      state={scanned:{}};batchWrite(state);
      queue=all.filter(b=>!['found','manual'].includes(covers().coverStatus(b.title,b.author)));
    }
    if(!queue.length){renderBatch('Every available book already has a cover!');return}
    if(covers().rateLimited()){renderBatch('Google Books is temporarily limiting searches. Please try again in about 15 minutes.');return}
    if(covers().remainingLookups()===0){
      renderBatch('This session’s search limit was reached. Reload the app to continue later; completed progress is saved.');
      return;
    }
    busy=true;paused=false;let attempts=0,found=0,blocked=false;
    queue=queue.slice(0,BATCH_SIZE);
    for(const b of queue){
      if(paused)break;
      if(!covers().remainingLookups())break;
      renderBatch('Searching '+(attempts+1)+' of '+queue.length+': '+b.title);
      let ref=null;
      try{ref=await covers().lookup(b.title,b.author,{force:true,googleOnly:true})}catch(err){console.warn('Batch cover lookup failed for '+b.title,err)}
      if(covers().rateLimited()){blocked=true;break}
      if(ref)found++;
      state.scanned[bookId(b)]=Date.now();
      try{batchWrite(state)}catch(err){console.warn('Cover batch progress could not be saved',err)}
      attempts++;
      renderBatch('Checked '+attempts+' books · '+found+' matches this batch');
    }
    busy=false;
    if(blocked)renderBatch('Google Books temporarily limited searches. Wait about 15 minutes before retrying; your progress is safe.');
    else if(paused)renderBatch('Paused after '+attempts+' books. Tap Find Missing Covers to continue.');
    else if(!covers().remainingLookups())renderBatch('Session lookup limit reached. Reload the app to continue; your progress is saved.');
    else renderBatch('Batch finished: '+found+' covers found in '+attempts+' searches. Tap again to continue.');
    if(window.ReadingCovers)window.ReadingCovers.hydrate(document.getElementById('library'));
  }
  function init(){
    if(!$('coverSearch')||!$('coverBatchStart'))return;
    $('coverSearch').addEventListener('click',search);
    $('coverResults').addEventListener('click',e=>{
      const btn=e.target.closest('[data-cover-choice]');
      if(btn)choose(Number(btn.dataset.coverChoice));
    });
    $('coverUpload').addEventListener('click',()=>$('coverFile').click());
    $('coverFile').addEventListener('change',e=>upload(e.target.files?.[0]));
    $('coverPaste').addEventListener('click',()=>{
      const row=$('coverPasteRow');row.hidden=!row.hidden;
      if(!row.hidden)$('coverUrl').focus();
    });
    $('coverSaveUrl').addEventListener('click',paste);
    $('coverReset').addEventListener('click',reset);
    $('coverBatchStart').addEventListener('click',runBatch);
    $('coverBatchPause').addEventListener('click',()=>{paused=true;$('coverBatchStatus').textContent='Pausing after this book…'});
    $('coverBatchReset').addEventListener('click',()=>{
      batchWrite({scanned:{}});renderBatch('Unresolved books are ready to be searched again. Your saved covers are protected.');
    });
    window.addEventListener('reading-covers-changed',()=>renderBatch());
    renderBatch();
  }
  document.addEventListener('DOMContentLoaded',init);
  window.ReadingCoverManager={open,close,renderBatch};
})();