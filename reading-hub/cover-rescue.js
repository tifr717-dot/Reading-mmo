(function(){
  'use strict';

  const STATE_KEY='readingJournalCoverRescueV1';
  const BATCH_SIZE=8;
  const GAPS={inventaire:1100,openLibrary:1300,google:1400};
  const lastRequest={inventaire:0,openLibrary:0,google:0};
  let busy=false,paused=false,reviewOpen=false,reviewPage=0;
  let googleBackoff=0,inventaireBackoff=0;
  const $=id=>document.getElementById(id);
  const covers=()=>window.ReadingCovers;
  const norm=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  const bookId=book=>String(book.goodreadsId||norm(book.title)+'|'+norm(book.author));
  const isbnValues=book=>[...new Set([book.isbn13,book.isbn].map(x=>
    String(x||'').replace(/[^0-9X]/gi,'').toUpperCase()
  ).filter(x=>/^(?:[0-9]{13}|[0-9]{9}[0-9X])$/.test(x)))];
  function books(){
    const ids=new Set();
    return (window.READING_LIBRARY_DATA||[]).filter(book=>{
      if(!book.title||!book.author)return false;
      const id=bookId(book);if(ids.has(id))return false;ids.add(id);return true;
    });
  }
  function unresolved(book){return !['found','manual'].includes(covers().coverStatus(book.title,book.author))}
  function read(){
    let state;
    try{state=JSON.parse(localStorage.getItem(STATE_KEY)||'{}')}catch(_){}
    if(!state||typeof state!=='object')state={};
    if(!state.scanned||typeof state.scanned!=='object')state.scanned={};
    if(!state.suggestions||typeof state.suggestions!=='object')state.suggestions={};
    if(!Number.isFinite(state.autoFound))state.autoFound=0;
    if(!Number.isFinite(state.approved))state.approved=0;
    return state;
  }
  function save(state){localStorage.setItem(STATE_KEY,JSON.stringify(state))}
  function escapeHtml(value){
    return String(value==null?'':value).replace(/[&<>"']/g,c=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
  function titleVariants(value){
    const title=String(value||'').trim();
    const short=title.replace(/\([^)]*\)/g,' ').replace(/\s+/g,' ').trim();
    const colon=short.split(/\s*[:–—]\s*/)[0].trim();
    const variants=[short,title];
    if(colon.length>=8)variants.push(colon);
    return [...new Set(variants.filter(Boolean))].slice(0,3);
  }
  function titleScore(wanted,found){
    const variants=titleVariants(wanted).map(norm);
    const actual=norm(found);
    if(!actual)return 0;
    for(const v of variants){
      if(v===actual)return 16;
      if(v.length>=8&&(actual.startsWith(v+' ')||v.startsWith(actual+' ')))return 13;
    }
    const base=variants[0]||'';
    const a=new Set(base.split(' ').filter(x=>x.length>2));
    const b=new Set(actual.split(' ').filter(x=>x.length>2));
    if(!a.size||!b.size)return 0;
    let overlap=0;for(const word of a)if(b.has(word))overlap++;
    const fraction=overlap/Math.max(a.size,b.size);
    return overlap>=2&&fraction>=.82?10:overlap>=2&&fraction>=.65?7:0;
  }
  function authorScore(wanted,found,description){
    const a=norm(wanted),b=norm(found),desc=norm(description);
    if(!a)return 0;
    if(b===a||desc.includes(a))return 8;
    const words=a.split(' ').filter(Boolean),surname=words[words.length-1];
    if(surname&&surname.length>2&&(b.split(' ').includes(surname)||desc.split(' ').includes(surname)))return 5;
    return 0;
  }
  function candidateScore(book,candidate){
    const title=titleScore(book.title,candidate.title);
    const author=authorScore(book.author,candidate.author,candidate.description);
    if(candidate.isbnMatch)return 40+title+author;
    if(!title)return 0;
    return title+author;
  }
  function imageURL(ref){
    if(!ref)return '';
    if(ref.url){
      try{const u=new URL(ref.url);return u.protocol==='https:'?u.href:''}catch(_){return ''}
    }
    return covers().refUrl(ref,'M');
  }
  function inventaireURL(image){
    const value=typeof image==='string'?image:image&&image.url;
    return typeof value==='string'&&/^\/img\/entities\/[0-9a-f]+$/i.test(value)
      ?'https://inventaire.io'+value:'';
  }
  function makeCandidate(book,details){
    const candidate=Object.assign({},details);
    candidate.score=candidateScore(book,candidate);
    return imageURL(candidate.ref)&&candidate.score>=11?candidate:null;
  }
  async function requestJSON(url,provider){
    const delay=Math.max(0,GAPS[provider]-(Date.now()-lastRequest[provider]));
    if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
    lastRequest[provider]=Date.now();
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),12000);
    try{
      const res=await fetch(url,{mode:'cors',signal:controller.signal});
      if(!res.ok)throw new Error(provider+' '+res.status);
      return await res.json();
    }finally{clearTimeout(timeout)}
  }
  function isbnEditionOptions(booksInBatch,data){
    const matched=new Map();
    for(const entity of Object.values(data.entities||{})){
      const url=inventaireURL(entity.image);
      if(!url)continue;
      const claims=entity.claims||{};
      const ids=[...(claims['wdt:P212']||[]),...(claims['wdt:P957']||[])].map(x=>
        String(x).replace(/[^0-9X]/gi,'').toUpperCase()
      );
      for(const book of booksInBatch){
        if(!isbnValues(book).some(id=>ids.includes(id)))continue;
        const id=bookId(book),options=matched.get(id)||[];
        const title=(claims['wdt:P1476']||[])[0]||entity.labels?.fromclaims||book.title;
        options.push({ref:{url},title,author:book.author,source:'Inventaire · exact ISBN',isbnMatch:true});
        matched.set(id,options);
      }
    }
    return matched;
  }
  async function searchInventaire(book){
    if(Date.now()<inventaireBackoff)return null;
    const title=titleVariants(book.title)[0];
    const params=new URLSearchParams({search:title,types:'works'});
    try{
      const data=await requestJSON('https://inventaire.io/api/search?'+params,'inventaire');
      return (data.results||[]).filter(r=>r.image).slice(0,12).map(r=>({
        ref:{url:inventaireURL(r.image)},title:r.label||'',author:'',
        description:r.description||'',source:'Inventaire · work'
      })).filter(c=>imageURL(c.ref));
    }catch(err){
      if(/(?:429|403)/.test(String(err.message)))inventaireBackoff=Date.now()+15*60*1000;
      console.warn('Inventaire cover rescue unavailable',err);
      return null;
    }
  }
  async function searchOpenLibrary(book){
    const title=titleVariants(book.title).slice(-1)[0];
    const params=new URLSearchParams({
      title:titleVariants(book.title)[0]||title,
      fields:'title,author_name,cover_i,first_publish_year,isbn',limit:'35'
    });
    try{
      const data=await requestJSON('https://openlibrary.org/search.json?'+params,'openLibrary');
      return (data.docs||[]).filter(d=>d.cover_i).map(d=>({
        ref:{coverId:d.cover_i},title:d.title||'',
        author:(d.author_name||[]).join(', '),source:'Open Library · alternate edition',
        isbnMatch:isbnValues(book).some(id=>(d.isbn||[]).includes(id)),
        year:d.first_publish_year||''
      }));
    }catch(err){
      console.warn('Open Library alternate cover lookup failed',err);
      return null;
    }
  }
  async function searchGoogle(book){
    if(Date.now()<googleBackoff)return null;
    // Plain-text searches also work when field-restricted searches return no results.
    const query=titleVariants(book.title)[0]+' '+String(book.author||'').trim();
    const params=new URLSearchParams({q:query,maxResults:'20',printType:'books'});
    try{
      const data=await requestJSON('https://www.googleapis.com/books/v1/volumes?'+params,'google');
      return (data.items||[]).map(item=>{
        const info=item.volumeInfo||{},links=info.imageLinks||{};
        const url=links.thumbnail||links.smallThumbnail||'';
        const ids=(info.industryIdentifiers||[]).map(x=>x.identifier);
        return {ref:{url:String(url).replace(/^http:/,'https:').replace('&edge=curl','')},
          title:info.title||'',author:(info.authors||[]).join(', '),
          source:'Google Books',year:(info.publishedDate||'').slice(0,4),
          isbnMatch:isbnValues(book).some(id=>ids.includes(id))};
      }).filter(x=>imageURL(x.ref));
    }catch(err){
      if(/(?:429|403)/.test(String(err.message)))googleBackoff=Date.now()+15*60*1000;
      console.warn('Google Books rescue unavailable',err);
      return null;
    }
  }
  async function imageLoads(ref){
    const src=imageURL(ref);if(!src)return false;
    return new Promise(resolve=>{
      const img=new Image();
      const timer=setTimeout(()=>{img.onload=img.onerror=null;resolve(false)},9000);
      img.onload=()=>{clearTimeout(timer);resolve(true)};
      img.onerror=()=>{clearTimeout(timer);resolve(false)};
      img.src=src;
    });
  }
  function bestOptions(book,options){
    const seen=new Set();
    return options.map(option=>makeCandidate(book,option)).filter(Boolean)
      .sort((a,b)=>b.score-a.score)
      .filter(option=>{
        const url=imageURL(option.ref);
        if(seen.has(url))return false;seen.add(url);return true;
      }).slice(0,4);
  }
  async function recover(book,exactOptions){
    if(!unresolved(book))return {kind:'saved'};
    let responses=0;
    const options=exactOptions||[];
    if(options.length)responses++;
    // An exact ISBN cover is safer and saves extra requests.
    if(options.length){
      const exact=bestOptions(book,options)[0];
      if(exact&&await imageLoads(exact.ref)&&covers().saveAuto(book.title,book.author,exact.ref)){
        return {kind:'auto'};
      }
    }
    const inv=await searchInventaire(book);
    if(inv!==null){responses++;options.push(...inv)}
    const ol=await searchOpenLibrary(book);
    if(ol!==null){responses++;options.push(...ol)}
    const goog=await searchGoogle(book);
    if(goog!==null){responses++;options.push(...goog)}
    if(responses===0)throw new Error('Book databases are temporarily unavailable. Try again later.');
    const candidates=bestOptions(book,options);
    if(!candidates.length)return {kind:'none'};
    const best=candidates[0],next=candidates[1];
    const confident=best.score>=24&&(!next||best.score-next.score>=4);
    if(confident&&await imageLoads(best.ref)&&covers().saveAuto(book.title,book.author,best.ref)){
      return {kind:'auto'};
    }
    return {kind:'review',candidates};
  }
  function pendingReviews(state){
    return books().filter(book=>unresolved(book)&&(state.suggestions[bookId(book)]||[]).length);
  }
  function renderReview(state){
    const pane=$('coverRescueReviewPane');if(!pane)return;
    const needs=pendingReviews(state);
    if(!reviewOpen){pane.hidden=true;return}
    pane.hidden=false;
    const pages=Math.max(1,Math.ceil(needs.length/3));
    reviewPage=Math.max(0,Math.min(reviewPage,pages-1));
    const selection=needs.slice(reviewPage*3,reviewPage*3+3);
    if(!selection.length){
      pane.innerHTML='<p class="cover-rescue-empty">No covers waiting for your approval yet. ♡</p>';
      return;
    }
    pane.innerHTML='<div class="cover-rescue-review-heading">Choose the right covers <span>Page '+(reviewPage+1)+' of '+pages+'</span></div>'+
      selection.map(book=>{
        const id=bookId(book),list=state.suggestions[id]||[];
        return '<div class="cover-rescue-book">'+
          '<div class="cover-rescue-book-title">'+escapeHtml(book.title)+'</div>'+
          '<div class="cover-rescue-book-author">'+escapeHtml(book.author)+'</div>'+
          '<div class="cover-rescue-choices">'+list.map((choice,index)=>
            '<button type="button" class="cover-rescue-choice" data-rescue-pick="'+escapeHtml(id)+'" data-rescue-index="'+index+'" aria-label="Save '+escapeHtml(choice.title)+' from '+escapeHtml(choice.source)+'">'+
            '<img src="'+escapeHtml(imageURL(choice.ref))+'" alt="Potential cover" loading="lazy" referrerpolicy="no-referrer">'+
            '<span>'+escapeHtml(choice.source)+'</span></button>'
          ).join('')+'</div>'+
          '<div class="cover-rescue-review-tip">Tap the cover that matches your edition. Or open this book for upload/link options.</div>'+
        '</div>';
      }).join('')+
      '<div class="cover-rescue-pages">'+
        '<button type="button" id="coverRescuePrevious"'+(reviewPage===0?' disabled':'')+'>← Previous</button>'+
        '<button type="button" id="coverRescueNext"'+(reviewPage>=pages-1?' disabled':'')+'>Next →</button>'+
      '</div>';
  }
  function render(message){
    const state=read(),missing=books().filter(unresolved);
    const remaining=missing.filter(book=>!state.scanned[bookId(book)]&&!state.suggestions[bookId(book)]).length;
    const reviews=pendingReviews(state).length;
    $('coverRescueCount').textContent=remaining+' left to search · '+reviews+' to review';
    $('coverRescueProgress').textContent=state.autoFound+' found automatically · '+state.approved+' approved by you';
    $('coverRescueStart').textContent=busy?'Searching…':remaining?'✧ Rescue next '+Math.min(BATCH_SIZE,remaining)+' books':'✓ Rescue search complete';
    $('coverRescueStart').disabled=busy||!remaining;
    $('coverRescuePause').disabled=!busy;
    $('coverRescueReview').textContent=reviewOpen?'Hide choices':'Review possible covers ('+reviews+')';
    $('coverRescueReview').disabled=!reviews&&!reviewOpen;
    $('coverRescueRetry').disabled=busy;
    if(message)$('coverRescueStatus').textContent=message;
    else if(!remaining)$('coverRescueStatus').textContent=reviews?
      'Search complete. Review the possible covers below.':
      'All currently unresolved books have had a second search.';
    else $('coverRescueStatus').textContent='Ready for another small, resumable batch.';
    renderReview(state);
  }
  async function run(){
    if(busy)return;
    const state=read();
    const queue=books().filter(book=>unresolved(book)&&!state.scanned[bookId(book)]&&!state.suggestions[bookId(book)]).slice(0,BATCH_SIZE);
    if(!queue.length){render();return}
    busy=true;paused=false;
    let auto=0,review=0,noMatch=0,attempts=0,error=null;
    const requested=[...new Set(queue.flatMap(isbnValues))];
    let exact=new Map();
    if(requested.length&&Date.now()>=inventaireBackoff){
      try{
        const params=new URLSearchParams({uris:requested.map(isbn=>'isbn:'+isbn).join('|'),
          attributes:'info|labels|claims|image'});
        const data=await requestJSON('https://inventaire.io/api/entities/by-uris?'+params,'inventaire');
        exact=isbnEditionOptions(queue,data);
      }catch(err){
        if(/(?:429|403)/.test(String(err.message)))inventaireBackoff=Date.now()+15*60*1000;
        console.warn('Inventaire edition rescue unavailable',err);
      }
    }
    for(const book of queue){
      if(paused)break;
      render('Checking '+(attempts+1)+' of '+queue.length+': '+book.title+'…');
      let result;
      try{result=await recover(book,exact.get(bookId(book))||[])}
      catch(err){error=err;console.warn('Cover rescue paused',err);break}
      const id=bookId(book);
      if(result.kind==='review'){state.suggestions[id]=result.candidates;review++}
      if(result.kind==='auto'){state.autoFound++;auto++}
      if(result.kind==='none')noMatch++;
      state.scanned[id]=Date.now();
      try{save(state)}catch(err){error=err;break}
      attempts++;
    }
    busy=false;
    if(error)render('Search paused ('+(error.message||'storage error')+'). Progress so far is saved.');
    else if(paused)render('Paused. '+auto+' new covers saved; '+review+' ready for review.');
    else render('Finished '+attempts+' books: '+auto+' covers saved · '+review+' to review · '+noMatch+' with no matches. Tap again to continue.');
  }
  function choose(id,index){
    const state=read(),book=books().find(x=>bookId(x)===id);
    const choice=state.suggestions[id]?.[index];
    if(!book||!choice||!unresolved(book))return;
    try{
      covers().saveManual(book.title,book.author,choice.ref);
      delete state.suggestions[id];state.approved++;
      save(state);
      render('♡ '+book.title+' cover saved on this device!');
    }catch(err){render('Could not save this cover: '+(err.message||'storage error'))}
  }
  function reset(){
    if(busy)return;
    const state=read();
    // Deliberately retain all suggestions and chosen covers.
    state.scanned={};save(state);
    render('No-match books are ready for another try. Saved covers and review choices are safe.');
  }
  function init(){
    if(!$('coverRescuePanel')||!window.ReadingCovers)return;
    $('coverRescueStart').addEventListener('click',run);
    $('coverRescuePause').addEventListener('click',()=>{paused=true;$('coverRescueStatus').textContent='Pausing after this book…'});
    $('coverRescueReview').addEventListener('click',()=>{
      reviewOpen=!reviewOpen;reviewPage=0;render();
    });
    $('coverRescueRetry').addEventListener('click',reset);
    $('coverRescueReviewPane').addEventListener('click',event=>{
      const choice=event.target.closest('[data-rescue-pick]');
      if(choice){choose(choice.dataset.rescuePick,Number(choice.dataset.rescueIndex));return}
      if(event.target.closest('#coverRescuePrevious')){reviewPage--;render();return}
      if(event.target.closest('#coverRescueNext')){reviewPage++;render()}
    });
    window.addEventListener('reading-covers-changed',()=>render());
    render();
  }
  document.addEventListener('DOMContentLoaded',init);
  window.ReadingCoverRescue={run,render};
})();