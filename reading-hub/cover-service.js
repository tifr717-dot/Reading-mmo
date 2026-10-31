(function(){
  'use strict';

  const CACHE_KEY='readingJournalCoverCacheV3';
  const MANUAL_KEY='readingJournalManualCoversV1';
  const RETRY_MS=7*24*60*60*1000;
  const uploadUrls=new Map();
  const MAX_LOOKUPS_PER_SESSION=80;
  const LOOKUP_GAP_MS=1200;
  let lookups=0, lastLookup=0;
  let lookupQueue=Promise.resolve();
  let googleLimitedUntil=0;
  let cacheState=null,manualState=null;
  async function paceLookup(){
    const turn=lookupQueue.then(async()=>{
      if(lookups>=MAX_LOOKUPS_PER_SESSION)return false;
      const delay=Math.max(0,LOOKUP_GAP_MS-(Date.now()-lastLookup));
      if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
      if(lookups>=MAX_LOOKUPS_PER_SESSION)return false;
      lookups++;lastLookup=Date.now();
      return true;
    });
    lookupQueue=turn.then(()=>{},()=>{});
    return turn;
  }
  const pending=new Map();

  const exact={
    'false gods|graham mcneill':{olid:'OL8953799M'}
  };

  function norm(v){
    return String(v||'').toLowerCase()
      .replace(/\([^)]*\)/g,' ')
      .replace(/[^a-z0-9]+/g,' ')
      .trim();
  }
  function cleanTitle(v){
    return String(v||'').replace(/\s*\([^)]*\)\s*$/,'').trim();
  }
  function cacheRead(){
    if(cacheState)return cacheState;
    try{return cacheState=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}')||{}}catch(_){return cacheState={}}
  }
  function cacheWrite(map){
    cacheState=map;
    try{localStorage.setItem(CACHE_KEY,JSON.stringify(map))}catch(_){}
  }
  function key(title,author){return norm(cleanTitle(title))+'|'+norm(author)}
  function manualRead(){
    if(manualState)return manualState;
    try{return manualState=JSON.parse(localStorage.getItem(MANUAL_KEY)||'{}')||{}}catch(_){return manualState={}}
  }
  function manualRef(title,author){return manualRead()[key(title,author)]||null}
  function manualWrite(title,author,ref){
    const map=manualRead(),k=key(title,author);
    if(ref)map[k]=ref;else delete map[k];
    manualState=map;
    localStorage.setItem(MANUAL_KEY,JSON.stringify(map));
    refreshAll(title,author);
    window.dispatchEvent(new CustomEvent('reading-covers-changed',{detail:{title,author}}));
  }
  function refUrl(ref,size){
    size=size||'M';
    if(!ref)return'';
    if(ref.localKey)return '';
    if(ref.olid)return 'https://covers.openlibrary.org/b/olid/'+encodeURIComponent(ref.olid)+'-'+size+'.jpg?default=false';
    if(ref.coverId)return 'https://covers.openlibrary.org/b/id/'+encodeURIComponent(ref.coverId)+'-'+size+'.jpg?default=false';
    if(ref.isbn)return 'https://covers.openlibrary.org/b/isbn/'+encodeURIComponent(ref.isbn)+'-'+size+'.jpg?default=false';
    if(ref.url)return String(ref.url).replace(/^http:/,'https:');
    return'';
  }
  function cachedRef(title,author){
    const k=key(title,author);
    const chosen=manualRef(title,author);
    if(chosen)return chosen;
    const row=cacheRead()[k];
    return (row&&row.ref)||exact[k]||null;
  }
  function setRef(title,author,ref){
    const map=cacheRead(),k=key(title,author);
    map[k]={ref:ref||null,checkedAt:Date.now()};
    cacheWrite(map);
  }
  function hasChecked(title,author){
    const row=cacheRead()[key(title,author)];
    return !!(row&&row.checkedAt&&Date.now()-row.checkedAt<RETRY_MS);
  }
  function scoreDoc(doc,title,author){
    let s=0;
    const t=norm(cleanTitle(title)),dt=norm(doc.title||'');
    if(dt===t)s+=8;else if(dt.includes(t)||t.includes(dt))s+=4;
    const a=norm(author),authors=(doc.author_name||[]).map(norm);
    if(authors.some(x=>x===a))s+=6;
    else if(authors.some(x=>x.includes(a)||a.includes(x)))s+=3;
    if(doc.cover_i)s+=2;
    return s;
  }

  function scoreGoogle(item,title,author){
    const info=item&&item.volumeInfo||{};
    let s=0;
    const t=norm(cleanTitle(title)),dt=norm(info.title||'');
    if(dt===t)s+=8;else if(dt.includes(t)||t.includes(dt))s+=4;
    const a=norm(author),authors=(info.authors||[]).map(norm);
    if(authors.some(x=>x===a))s+=6;
    else if(authors.some(x=>x.includes(a)||a.includes(x)))s+=3;
    if(info.imageLinks?.thumbnail||info.imageLinks?.smallThumbnail)s+=2;
    return s;
  }

  async function lookupGoogle(title,author){
    if(Date.now()<googleLimitedUntil)return null;
    async function runQuery(qText){
      const q=new URLSearchParams({q:qText,maxResults:'8',printType:'books'});
      const res=await fetch('https://www.googleapis.com/books/v1/volumes?'+q.toString(),{mode:'cors'});
      if(!res.ok)throw new Error('google cover lookup '+res.status);
      const data=await res.json();
      return (data.items||[]).filter(x=>{
        const links=x?.volumeInfo?.imageLinks||{};
        return links.thumbnail||links.smallThumbnail;
      });
    }
    try{
      const safeTitle=cleanTitle(title).replace(/"/g,'');
      const safeAuthor=String(author||'').replace(/"/g,'');
      let items=await runQuery('intitle:"'+safeTitle+'"'+(safeAuthor?' inauthor:"'+safeAuthor+'"':''));
      if(!items.length){
        items=await runQuery([safeTitle,safeAuthor].filter(Boolean).join(' '));
      }
      items.sort((a,b)=>scoreGoogle(b,title,author)-scoreGoogle(a,title,author));
      const best=items[0],links=best?.volumeInfo?.imageLinks||{};
      const url=links.thumbnail||links.smallThumbnail||'';
      return url&&scoreGoogle(best,title,author)>=10?{url:String(url).replace(/^http:/,'https:').replace('&edge=curl','')}:null;
    }catch(err){
      if(/(?:^|\D)429(?:\D|$)/.test(String(err.message||'')))googleLimitedUntil=Date.now()+15*60*1000;
      console.warn('Reading Journal Google cover fallback failed',title,err);
      return null;
    }
  }
  async function lookup(title,author,options){
    const k=key(title,author);
    options=options||{};
    if(exact[k])return exact[k];
    const c=cachedRef(title,author);
    if(c)return c;
    if(hasChecked(title,author)&&!options.force)return null;
    if(pending.has(k))return pending.get(k);
    if(lookups>=MAX_LOOKUPS_PER_SESSION)return null;

    const p=(async()=>{
      if(!await paceLookup()){pending.delete(k);return null}
      try{
        if(options.googleOnly){
          const google=await lookupGoogle(title,author);
          if(!rateLimited())setRef(title,author,google);
          return google;
        }
        const q=new URLSearchParams({
          title:cleanTitle(title),
          author:String(author||''),
          limit:'5',
          fields:'title,author_name,cover_i,edition_key,isbn'
        });
        const res=await fetch('https://openlibrary.org/search.json?'+q.toString(),{mode:'cors'});
        if(!res.ok)throw new Error('cover lookup '+res.status);
        const data=await res.json();
        const docs=(data.docs||[]).filter(d=>d.cover_i);
        docs.sort((a,b)=>scoreDoc(b,title,author)-scoreDoc(a,title,author));
        const best=docs[0];
        const bestScore=best?scoreDoc(best,title,author):0;
        let ref=best&&best.cover_i&&bestScore>=10?{coverId:best.cover_i}:null;
        if(!ref) ref=await lookupGoogle(title,author);
        setRef(title,author,ref);
        return ref;
      }catch(err){
        console.warn('Reading Journal Open Library cover lookup failed',title,err);
        const ref=await lookupGoogle(title,author);
        setRef(title,author,ref);
        return ref;
      }finally{pending.delete(k)}
    })();
    pending.set(k,p);
    return p;
  }
  function fallbackText(title){
    return cleanTitle(title).split(/\s+/).slice(0,3).join(' ').toUpperCase();
  }

  function openUploadDB(){
    return new Promise((resolve,reject)=>{
      if(!('indexedDB' in window)){reject(new Error('Image storage is not supported on this device'));return}
      const req=indexedDB.open('readingJournalCoverImagesV1',1);
      req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('images'))req.result.createObjectStore('images')};
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||new Error('Cannot open image storage'));
    });
  }
  async function uploadedUrl(localKey){
    if(uploadUrls.has(localKey))return uploadUrls.get(localKey);
    const db=await openUploadDB();
    const blob=await new Promise((resolve,reject)=>{
      const req=db.transaction('images','readonly').objectStore('images').get(localKey);
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
    });
    db.close();
    if(!blob)throw new Error('Uploaded image is missing from device storage');
    const url=URL.createObjectURL(blob);
    uploadUrls.set(localKey,url);
    return url;
  }
  async function imageUrl(ref,size){
    return ref&&ref.localKey?uploadedUrl(ref.localKey):refUrl(ref,size);
  }
  async function paint(el,ref){
    if(!el||!ref)return;
    let url='';
    try{url=await imageUrl(ref,el.dataset.coverSize||'M')}catch(err){console.warn('Reading Journal saved cover unavailable',err);return}
    if(!url)return;
    const img=new Image();
    img.onload=()=>{
      if(!el.isConnected)return;
      const fresh=cachedRef(el.dataset.coverTitle||'',el.dataset.coverAuthor||'');
      if(JSON.stringify(fresh)!==JSON.stringify(ref))return;
      el.style.backgroundImage='url("'+url.replace(/"/g,'%22')+'")';
      el.classList.add('has-cover');
      el.textContent='';
    };
    img.onerror=async()=>{
      const title=el.dataset.coverTitle||'',author=el.dataset.coverAuthor||'';
      if(ref.url&&!manualRef(title,author)){setRef(title,author,null);return}
      if(ref.url||ref.localKey||manualRef(title,author)||el.dataset.coverFallbackTried==='1')return;
      el.dataset.coverFallbackTried='1';
      const fallback=await lookupGoogle(title,author);
      if(fallback){setRef(title,author,fallback);paint(el,fallback)}
    };
    img.src=url;
  }
  async function resolveElement(el){
    if(!el||el.dataset.coverResolved==='1')return;
    el.dataset.coverResolved='1';
    const title=el.dataset.coverTitle||'';
    const author=el.dataset.coverAuthor||'';
    if(!el.textContent.trim())el.textContent=fallbackText(title);
    const direct=cachedRef(title,author);
    if(direct){paint(el,direct);return}
    const ref=await lookup(title,author);
    if(ref)paint(el,ref);
  }

  let observer=null;
  function getObserver(){
    if(observer||!('IntersectionObserver'in window))return observer;
    observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          observer.unobserve(entry.target);
          resolveElement(entry.target);
        }
      });
    },{rootMargin:'180px 0px'});
    return observer;
  }
  function hydrate(root){
    const scope=root||document;
    const els=[...scope.querySelectorAll('[data-book-cover]')];
    const io=getObserver();
    els.forEach(el=>{
      if(el.dataset.coverResolved==='1')return;
      const direct=cachedRef(el.dataset.coverTitle,el.dataset.coverAuthor);
      if(direct){el.dataset.coverResolved='1';paint(el,direct);return}
      if(io)io.observe(el);else resolveElement(el);
    });
  }
  function refreshElement(el,title,author){
    if(!el)return;
    el.dataset.bookCover='';
    el.dataset.coverTitle=title||'';
    el.dataset.coverAuthor=author||'';
    el.dataset.coverResolved='0';
    el.dataset.coverFallbackTried='0';
    el.style.backgroundImage='';
    el.classList.remove('has-cover');
    el.textContent=fallbackText(title);
    hydrate(el.parentElement||document);
  }


  function refreshAll(title,author){
    const k=key(title,author);
    document.querySelectorAll('[data-book-cover]').forEach(el=>{
      if(key(el.dataset.coverTitle,el.dataset.coverAuthor)===k)
        refreshElement(el,title,author);
    });
  }
  function coverStatus(title,author){
    if(manualRef(title,author))return 'manual';
    if(exact[key(title,author)])return 'found';
    const row=cacheRead()[key(title,author)];
    if(row&&row.ref)return 'found';
    if(row&&row.checkedAt)return 'missing';
    return 'unsearched';
  }

  function bookISBNs(book){
    return [...new Set([book.isbn13,book.isbn].map(value=>
      String(value||'').replace(/[^0-9X]/gi,'').toUpperCase()
    ).filter(value=>/^(?:[0-9]{13}|[0-9]{9}[0-9X])$/.test(value)))];
  }

  async function searchBatch(query){
    if(!await paceLookup())return null;
    const params=new URLSearchParams({
      q:query,
      fields:'title,author_name,cover_i,isbn',
      limit:'150'
    });
    const res=await fetch('https://openlibrary.org/search.json?'+params.toString(),{mode:'cors'});
    if(!res.ok)throw new Error('Open Library cover search '+res.status);
    const data=await res.json();
    return (data.docs||[]).filter(doc=>doc.cover_i);
  }

  async function batchLookup(books){
    const items=(books||[]).filter(b=>b&&b.title&&b.author).slice(0,5);
    if(!items.length)return {results:[],limited:false};
    const pending=items.filter(b=>!cachedRef(b.title,b.author));
    const matches=new Map();
    const isbnTerms=[...new Set(pending.flatMap(bookISBNs))];

    // An ISBN identifies an edition even when subtitles and author names vary.
    if(isbnTerms.length){
      const docs=await searchBatch('isbn:('+isbnTerms.join(' OR ')+')');
      if(docs===null)return {results:[],limited:true};
      for(const book of pending){
        const requested=new Set(bookISBNs(book));
        if(!requested.size)continue;
        let best=null,bestScore=-1;
        for(const doc of docs){
          if(!(doc.isbn||[]).some(value=>requested.has(String(value).toUpperCase())))continue;
          const score=scoreDoc(doc,book.title,book.author);
          if(score>bestScore){best=doc;bestScore=score}
        }
        if(best)matches.set(key(book.title,book.author),{ref:{coverId:best.cover_i},score:bestScore+20,source:'isbn'});
      }
    }

    // Fall back to the multi-title query for books without a confirmed ISBN cover.
    const unmatched=pending.filter(book=>!matches.has(key(book.title,book.author)));
    if(unmatched.length){
      const terms=[...new Set(unmatched.map(book=>
        'title:"'+cleanTitle(book.title).replace(/["\\]/g,' ').slice(0,100).trim()+'"'
      ))];
      const docs=await searchBatch(terms.join(' OR '));
      if(docs===null)return {results:[],limited:true};
      for(const book of unmatched){
        let best=null,bestScore=0;
        for(const doc of docs){
          const score=scoreDoc(doc,book.title,book.author);
          if(score>bestScore){best=doc;bestScore=score}
        }
        if(best&&bestScore>=12){
          matches.set(key(book.title,book.author),{ref:{coverId:best.cover_i},score:bestScore,source:'title'});
        }
      }
    }

    const results=items.map(book=>{
      const k=key(book.title,book.author),match=matches.get(k);
      // Re-read before writing: manual choices or existing covers always win.
      const saved=cachedRef(book.title,book.author);
      if(!saved)setRef(book.title,book.author,match?.ref||null);
      return {title:book.title,author:book.author,ref:saved||match?.ref||null,
        score:match?.score||0,source:match?.source||''};
    });
    return {results,limited:false};
  }

  function remainingLookups(){return Math.max(0,MAX_LOOKUPS_PER_SESSION-lookups)}
  function rateLimited(){return Date.now()<googleLimitedUntil}
  async function saveUpload(title,author,file){
    if(!file||!String(file.type||'').startsWith('image/'))throw new Error('Choose a JPG, PNG, or WebP image');
    if(file.size>12*1024*1024)throw new Error('Please choose an image under 12 MB');
    const src=URL.createObjectURL(file);
    let img;
    try{
      img=await new Promise((resolve,reject)=>{
        const node=new Image();
        node.onload=()=>resolve(node);
        node.onerror=()=>reject(new Error('Could not read that image'));
        node.src=src;
      });
      const scale=Math.min(1,900/Math.max(img.naturalWidth,img.naturalHeight));
      const canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
      canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
      canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
      const blob=await new Promise((resolve,reject)=>{
        canvas.toBlob(x=>x?resolve(x):reject(new Error('Could not resize that image')),'image/jpeg',.84);
      });
      const k=key(title,author),db=await openUploadDB();
      try{
        await new Promise((resolve,reject)=>{
          const tx=db.transaction('images','readwrite');
          tx.objectStore('images').put(blob,k);
          tx.oncomplete=resolve;
          tx.onerror=()=>reject(tx.error||new Error('Unable to save image'));
          tx.onabort=()=>reject(tx.error||new Error('Image saving stopped'));
        });
      }finally{db.close()}
      if(uploadUrls.has(k)){URL.revokeObjectURL(uploadUrls.get(k));uploadUrls.delete(k)}
      manualWrite(title,author,{localKey:k});
      return true;
    }finally{URL.revokeObjectURL(src)}
  }
  function saveAuto(title,author,ref){
    if(!ref||!(ref.coverId||ref.olid||ref.isbn||ref.url))return false;
    // Never replace a manual selection, a found cover, or a built-in exact match.
    if(manualRef(title,author)||cachedRef(title,author))return false;
    if(ref.url){
      let parsed;
      try{parsed=new URL(ref.url)}catch(_){return false}
      if(parsed.protocol!=='https:')return false;
      ref={url:parsed.href};
    }
    setRef(title,author,ref);
    refreshAll(title,author);
    window.dispatchEvent(new CustomEvent('reading-covers-changed',{detail:{title,author}}));
    return true;
  }
  function saveManual(title,author,ref){
    if(!ref||!(ref.coverId||ref.olid||ref.isbn||ref.url))throw new Error('Choose a valid cover');
    if(ref.url){
      let u;
      try{u=new URL(ref.url)}catch(_){throw new Error('Enter a full HTTPS image URL')}
      if(u.protocol!=='https:')throw new Error('Please use an HTTPS image URL');
      ref={url:u.href};
    }
    manualWrite(title,author,ref);
  }
  function clearManual(title,author){manualWrite(title,author,null)}
  async function findCandidates(title,author,isbn13,isbn10){
    const out=[];
    const cleaned=cleanTitle(title);
    if(!cleaned)return [];
    const q=new URLSearchParams({title:cleaned,author:String(author||''),limit:'12',fields:'title,author_name,cover_i,first_publish_year'});
    const gq=new URLSearchParams({q:'intitle:"'+cleaned.replace(/"/g,'')+'"'+(author?' inauthor:"'+String(author).replace(/"/g,'')+'"':''),maxResults:'12',printType:'books'});
    await Promise.all([
      (async()=>{
        try{
          const res=await fetch('https://openlibrary.org/search.json?'+q,{mode:'cors'});
          if(!res.ok)throw new Error('Open Library '+res.status);
          const data=await res.json();
          for(const d of data.docs||[]){
            if(!d.cover_i||scoreDoc(d,title,author)<7)continue;
            out.push({ref:{coverId:d.cover_i},title:d.title||title,author:(d.author_name||[]).join(', '),year:d.first_publish_year||'',source:'Open Library',score:scoreDoc(d,title,author)});
          }
        }catch(err){console.warn('Cover choices from Open Library unavailable',err)}
      })(),
      (async()=>{
        try{
          const res=await fetch('https://www.googleapis.com/books/v1/volumes?'+gq,{mode:'cors'});
          if(!res.ok)throw new Error('Google Books '+res.status);
          const data=await res.json();
          for(const item of data.items||[]){
            const info=item.volumeInfo||{},links=info.imageLinks||{},url=links.thumbnail||links.smallThumbnail;
            if(!url||scoreGoogle(item,title,author)<7)continue;
            out.push({ref:{url:String(url).replace(/^http:/,'https:').replace('&edge=curl','')},title:info.title||title,author:(info.authors||[]).join(', '),year:(info.publishedDate||'').slice(0,4),source:'Google Books',score:scoreGoogle(item,title,author)});
          }
        }catch(err){
          if(/(?:^|\D)429(?:\D|$)/.test(String(err.message||'')))googleLimitedUntil=Date.now()+15*60*1000;
          console.warn('Cover choices from Google Books unavailable',err)
        }
      })()
    ]);
    const isbnTerms=bookISBNs({isbn13,isbn:isbn10});
    if(isbnTerms.length){
      try{
        const docs=await searchBatch('isbn:('+isbnTerms.join(' OR ')+')');
        if(docs){
          for(const doc of docs){
            if(!(doc.isbn||[]).some(value=>isbnTerms.includes(String(value).toUpperCase())))continue;
            out.push({ref:{coverId:doc.cover_i},title:doc.title||title,
              author:(doc.author_name||[]).join(', '),year:doc.first_publish_year||'',
              source:'Open Library · exact ISBN',score:scoreDoc(doc,title,author)+20});
          }
        }
      }catch(err){console.warn('Exact ISBN cover choices unavailable',err)}
    }
    const seen=new Set();
    return out.sort((a,b)=>b.score-a.score).filter(item=>{
      const u=refUrl(item.ref,'M');
      if(seen.has(u))return false;
      seen.add(u);return true;
    }).slice(0,18);
  }

  window.addEventListener('storage',event=>{
    if(event.key===CACHE_KEY)cacheState=null;
    if(event.key===MANUAL_KEY){manualState=null;document.querySelectorAll('[data-book-cover]').forEach(el=>refreshElement(el,el.dataset.coverTitle,el.dataset.coverAuthor))}
  });
  window.ReadingCovers={hydrate,lookup,refUrl,cachedRef,refreshElement,refreshAll,coverStatus,remainingLookups,rateLimited,batchLookup,saveUpload,saveManual,clearManual,manualRef,findCandidates,saveAuto};
})();