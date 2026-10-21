(function(){
  'use strict';

  const CACHE_KEY='readingJournalCoverCacheV3';
  const MAX_LOOKUPS_PER_SESSION=80;
  const LOOKUP_GAP_MS=750;
  let lookups=0, lastLookup=0;
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
    try{return JSON.parse(localStorage.getItem(CACHE_KEY)||'{}')||{}}catch(_){return{}}
  }
  function cacheWrite(map){
    try{localStorage.setItem(CACHE_KEY,JSON.stringify(map))}catch(_){}
  }
  function key(title,author){return norm(cleanTitle(title))+'|'+norm(author)}
  function refUrl(ref,size){
    size=size||'M';
    if(!ref)return'';
    if(ref.olid)return 'https://covers.openlibrary.org/b/olid/'+encodeURIComponent(ref.olid)+'-'+size+'.jpg?default=false';
    if(ref.coverId)return 'https://covers.openlibrary.org/b/id/'+encodeURIComponent(ref.coverId)+'-'+size+'.jpg?default=false';
    if(ref.isbn)return 'https://covers.openlibrary.org/b/isbn/'+encodeURIComponent(ref.isbn)+'-'+size+'.jpg?default=false';
    if(ref.url)return String(ref.url).replace(/^http:/,'https:');
    return'';
  }
  function cachedRef(title,author){
    const k=key(title,author);
    if(exact[k])return exact[k];
    const row=cacheRead()[k];
    return row&&row.ref||null;
  }
  function setRef(title,author,ref){
    const map=cacheRead(),k=key(title,author);
    map[k]={ref:ref||null,checkedAt:Date.now()};
    cacheWrite(map);
  }
  function hasChecked(title,author){
    const row=cacheRead()[key(title,author)];
    return !!(row&&row.checkedAt);
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
      return url?{url:String(url).replace(/^http:/,'https:').replace('&edge=curl','')}:null;
    }catch(err){
      console.warn('Reading Journal Google cover fallback failed',title,err);
      return null;
    }
  }
  async function lookup(title,author){
    const k=key(title,author);
    if(exact[k])return exact[k];
    const c=cachedRef(title,author);
    if(c)return c;
    if(hasChecked(title,author))return null;
    if(pending.has(k))return pending.get(k);
    if(lookups>=MAX_LOOKUPS_PER_SESSION)return null;

    const p=(async()=>{
      const wait=Math.max(0,LOOKUP_GAP_MS-(Date.now()-lastLookup));
      if(wait)await new Promise(r=>setTimeout(r,wait));
      lookups++;lastLookup=Date.now();
      try{
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
  function paint(el,ref){
    if(!el||!ref)return;
    const url=refUrl(ref,el.dataset.coverSize||'M');
    if(!url)return;
    const img=new Image();
    img.onload=()=>{
      el.style.backgroundImage='url("'+url.replace(/"/g,'%22')+'")';
      el.classList.add('has-cover');
      el.textContent='';
    };
    img.onerror=async()=>{
      if(ref.url || el.dataset.coverFallbackTried==='1')return;
      el.dataset.coverFallbackTried='1';
      const title=el.dataset.coverTitle||'';
      const author=el.dataset.coverAuthor||'';
      const fallback=await lookupGoogle(title,author);
      if(fallback){
        setRef(title,author,fallback);
        paint(el,fallback);
      }
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

  window.ReadingCovers={hydrate,lookup,refUrl,cachedRef,refreshElement};
})();