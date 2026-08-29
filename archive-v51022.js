/* Reading MMO v5.10.23 — literal approved concept shelf runtime.
   IMPORTANT: the shelf visual is reconstructed from the exact approved concept-art crop.
   Do not redraw, simplify, vectorize, or reinterpret it. */
(function(){
  const BUILD=window.__readingMmoVersionOwner||'v5.10.24';
  window.__readingMmoVersionOwner=BUILD;

  const priorShelfRows=window.libraryShelfRowsMarkup;
  const norm=v=>String(v||'').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
  const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const jsq=s=>String(s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");

  const slots=[
    {title:"archangel's legion",left:11.1,width:11.8},
    {title:"archangel's storm",left:22.7,width:11.2},
    {title:"archangel's blade",left:33.9,width:11.1},
    {title:"archangel's consort",left:45.0,width:11.1},
    {title:"archangel's kiss",left:56.0,width:11.0},
    {title:"angels' blood",left:66.9,width:11.1},
    {title:'a stage set for villains',left:77.8,width:11.3}
  ];
  const canonical=new Set(slots.map(s=>s.title));
  const partUrls=Array.from({length:8},(_,i)=>`./archive-concept-v51023-part${String(i+1).padStart(2,'0')}.b64`);
  let conceptUrl='';
  let conceptPromise=null;

  function ensureCss(){
    let l=document.getElementById('archive-v51022-css');
    if(!l){l=document.createElement('link');l.id='archive-v51022-css';l.rel='stylesheet';document.head.appendChild(l);}
    l.href='./archive-v51022.css?v=51024';
  }

  function stamp(){
    window.__readingMmoVersionOwner=BUILD;
    const badge=document.getElementById('headerVersionText');
    if(badge)badge.textContent=BUILD;
    document.querySelectorAll('.health-row').forEach(row=>{
      if(row.querySelector('b')?.textContent.trim()==='Version'){
        const value=row.querySelector('span');
        if(value)value.textContent=BUILD;
      }
    });
  }

  function loadConceptAsset(){
    if(conceptUrl)return Promise.resolve(conceptUrl);
    if(conceptPromise)return conceptPromise;
    conceptPromise=Promise.all(partUrls.map(url=>fetch(url,{cache:'force-cache'}).then(r=>{
      if(!r.ok)throw new Error(`Concept asset part failed: ${url} (${r.status})`);
      return r.text();
    }))).then(parts=>{
      const encoded=parts.join('').replace(/\s+/g,'');
      const binary=atob(encoded);
      const bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
      conceptUrl=URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
      document.querySelectorAll('.v51023-concept-bg').forEach(img=>{img.src=conceptUrl;});
      return conceptUrl;
    }).catch(err=>{
      conceptPromise=null;
      console.error('Approved Archive concept shelf could not load.',err);
      throw err;
    });
    return conceptPromise;
  }

  function conceptMarkup(rows){
    const byTitle=new Map((rows||[]).map(b=>[norm(b.title),b]));
    const hotspots=[];
    const dims=[];

    slots.forEach(slot=>{
      const b=byTitle.get(slot.title);
      const style=`left:${slot.left}%;width:${slot.width}%`;
      if(b){
        const id=jsq(b.id);
        hotspots.push(`<button class="v51023-hotspot" style="${style}" onclick="window.__archiveSelectedId='${id}';openLibraryRecord('${id}')" aria-label="Open library record for ${esc(b.title)} by ${esc(b.author||'Unknown author')}"></button>`);
      }else{
        dims.push(`<span class="v51023-dim" style="${style}" aria-hidden="true"></span>`);
      }
    });

    const src=conceptUrl?` src="${conceptUrl}"`:'';
    return `<div class="v51023-concept-shelf"><img class="v51023-concept-bg"${src} alt="The approved pixel-art Enchanted Archive bookshelf with seven fantasy volumes" aria-hidden="true">${dims.join('')}${hotspots.join('')}</div>`;
  }

  window.libraryShelfRowsMarkup=function(rows,volumeNo){
    const list=Array.isArray(rows)?rows:[];
    const extras=list.filter(b=>!canonical.has(norm(b.title)));
    let html=conceptMarkup(list);
    if(extras.length && typeof priorShelfRows==='function'){
      html+=`<div class="v51023-extra-label">ADDITIONAL ARCHIVED VOLUMES</div>`+priorShelfRows(extras,volumeNo);
    }
    setTimeout(()=>loadConceptAsset().catch(()=>{}),0);
    return html;
  };

  function apply(){
    ensureCss();
    stamp();
    loadConceptAsset().then(()=>{
      if(typeof window.renderLibrary==='function')window.renderLibrary();
    }).catch(()=>{
      if(typeof window.renderLibrary==='function')window.renderLibrary();
    });
    if(typeof window.renderLibrary==='function')window.renderLibrary();
    [80,350,800,1600,3000].forEach(ms=>setTimeout(stamp,ms));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
})();