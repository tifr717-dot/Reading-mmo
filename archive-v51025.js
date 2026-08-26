/* Reading MMO v5.10.25 — expanding Archive shelves.
   Shelf 1 remains the exact approved concept artwork.
   Books 8+ grow into matching live shelves in groups of seven. */
(function(){
  const BUILD='v5.10.25';
  window.__readingMmoVersionOwner=BUILD;

  const priorShelfRows=window.libraryShelfRowsMarkup;
  const norm=v=>String(v||'').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
  const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const jsq=s=>String(s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const canonical=new Set([
    "archangel's legion","archangel's storm","archangel's blade",
    "archangel's consort","archangel's kiss","angels' blood",
    'a stage set for villains'
  ]);
  const heights=[94,99,92,97,95,98,93];
  const tilts=[-.45,.2,-.15,.28,-.22,.12,-.32];

  function ensureCss(){
    let l=document.getElementById('archive-v51025-css');
    if(!l){l=document.createElement('link');l.id='archive-v51025-css';l.rel='stylesheet';document.head.appendChild(l);}
    l.href='./archive-v51025.css?v=51025';
  }
  function stamp(){
    window.__readingMmoVersionOwner=BUILD;
    const badge=document.getElementById('headerVersionText');
    if(badge)badge.textContent=BUILD;
    document.querySelectorAll('.health-row').forEach(row=>{
      if(row.querySelector('b')?.textContent.trim()==='Version'){
        const value=row.querySelector('span');if(value)value.textContent=BUILD;
      }
    });
  }
  function seriesShort(b){
    if(typeof window.librarySeriesShort==='function')return window.librarySeriesShort(b.series);
    const raw=String(b.series||'').trim();
    const m=raw.match(/#\s*(\d+)\s*$/);
    return m?`#${m[1]}`:'STANDALONE';
  }
  function entryNo(b,volumeNo,fallback){
    const n=Number(volumeNo?.get?.(String(b.id))||0);
    return n>0?n:fallback;
  }
  function paletteIndex(b,n){
    const c=Number(b.color);
    return Number.isFinite(c)?Math.abs(Math.floor(c))%8:Math.abs(n)%8;
  }
  function artKey(b,n){
    const short=seriesShort(b);
    if(String(short).toUpperCase()==='STANDALONE')return 'standalone';
    const m=String(short).match(/^#(\d+)$/);
    if(m){const v=Number(m[1]);if(v>=1&&v<=6)return String(v);}
    return String(((Math.max(1,n)-1)%6)+1);
  }
  function spineMarkup(b,n,pos){
    const id=jsq(b.id),short=seriesShort(b),palette=paletteIndex(b,n),art=artKey(b,n);
    const selected=String(window.__archiveSelectedId||'')===String(b.id)?' selected':'';
    const titleSize=String(b.title||'').length>31?7:String(b.title||'').length>23?8:9;
    return `<button class="v51025-live-spine p${palette}${selected}" style="grid-column:${7-pos};--book-h:${heights[pos]}%;--book-tilt:${tilts[pos]}deg;--title-size:${titleSize}px" onclick="window.__archiveSelectedId='${id}';openLibraryRecord('${id}')" aria-label="Open library record for ${esc(b.title)} by ${esc(b.author||'Unknown author')}"><img class="v51025-spine-ornament" src="./archive-spine-${art}.svg" alt="" aria-hidden="true"><span class="v51025-spine-title">${esc(b.title)}</span><span class="v51025-spine-series">${esc(short)}</span>${b.favorite?'<span class="v51025-spine-fav">★</span>':''}<span class="v51025-spine-shadow" aria-hidden="true"></span></button>`;
  }
  function shelfMarkup(group,shelfIndex){
    const books=group.slice().sort((a,b)=>a.n-b.n);
    const live=books.map(x=>spineMarkup(x.b,x.n,x.pos)).join('');
    return `<div class="v51025-expanding-shelf" data-archive-shelf="${shelfIndex+2}" aria-label="Archive shelf ${shelfIndex+2}"><img class="v51025-expand-bg" alt="" aria-hidden="true"><span class="v51025-blank-panel" aria-hidden="true"></span><span class="v51025-top-shadow" aria-hidden="true"></span><span class="v51025-shelf-plank" aria-hidden="true"></span><div class="v51025-live-books">${live}</div></div>`;
  }
  function hydrateBackgrounds(){
    const source=[...document.querySelectorAll('.v51023-concept-bg')].find(img=>img.getAttribute('src'));
    const src=source?.getAttribute('src');
    if(!src)return false;
    document.querySelectorAll('.v51025-expand-bg').forEach(img=>{if(img.getAttribute('src')!==src)img.setAttribute('src',src);});
    return true;
  }

  window.libraryShelfRowsMarkup=function(rows,volumeNo){
    const list=Array.isArray(rows)?rows:[];
    const first=list.filter(b=>canonical.has(norm(b.title)));
    let html=typeof priorShelfRows==='function'?priorShelfRows(first,volumeNo):'';
    const extras=list.filter(b=>!canonical.has(norm(b.title)));
    const groups=new Map();
    extras.forEach((b,i)=>{
      let n=entryNo(b,volumeNo,8+i);
      if(n<8)n=8+i;
      const offset=n-8;
      const shelfIndex=Math.floor(offset/7);
      const pos=((offset%7)+7)%7;
      if(!groups.has(shelfIndex))groups.set(shelfIndex,[]);
      groups.get(shelfIndex).push({b,n,pos});
    });
    [...groups.keys()].sort((a,b)=>a-b).forEach(k=>{html+=shelfMarkup(groups.get(k),k);});
    setTimeout(hydrateBackgrounds,0);
    return html;
  };

  function apply(){
    ensureCss();stamp();
    const obs=new MutationObserver(()=>hydrateBackgrounds());
    obs.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
    if(typeof window.renderLibrary==='function')window.renderLibrary();
    [50,160,400,900,1600,3000].forEach(ms=>setTimeout(()=>{hydrateBackgrounds();stamp();},ms));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
