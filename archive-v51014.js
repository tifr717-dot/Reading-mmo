/* Reading MMO v5.10.15 — Enchanted Archive polish + canonical archive records. */
(function(){
  const BUILD='v5.10.15';
  const CANONICAL=[
    {id:'lib-seed-stage',title:'A Stage Set for Villains',author:'Shannon J. Spann',series:'Standalone',rating:4.5,startDate:'2026-02-19',finishDate:'2026-04-20',pages:0,color:5},
    {id:'lib-seed-angels',title:'Angels’ Blood',author:'Nalini Singh',series:'Guild Hunter #1',rating:5,startDate:'2026-05-06',finishDate:'2026-05-11',pages:0,color:1},
    {id:'lib-seed-kiss',title:'Archangel’s Kiss',author:'Nalini Singh',series:'Guild Hunter #2',rating:5,startDate:'2026-05-11',finishDate:'2026-05-18',pages:0,color:0},
    {id:'lib-seed-consort',title:'Archangel’s Consort',author:'Nalini Singh',series:'Guild Hunter #3',rating:5,startDate:'2026-05-18',finishDate:'2026-05-26',pages:0,color:2},
    {id:'lib-seed-blade',title:'Archangel’s Blade',author:'Nalini Singh',series:'Guild Hunter #4',rating:4.5,startDate:'2026-05-26',finishDate:'2026-06-23',pages:0,color:4},
    {id:'lib-seed-storm',title:'Archangel’s Storm',author:'Nalini Singh',series:'Guild Hunter #5',rating:4.5,startDate:'2026-06-23',finishDate:'2026-06-25',pages:0,color:6},
    {id:'lib-seed-legion',title:'Archangel’s Legion',author:'Nalini Singh',series:'Guild Hunter #6',rating:5,startDate:'2026-06-25',finishDate:'2026-07-08',pages:0,color:3}
  ];

  function stampVersion(){
    const badge=document.getElementById('headerVersionText');
    if(badge)badge.textContent=BUILD;
    document.querySelectorAll('.health-row').forEach(row=>{
      if(row.querySelector('b')?.textContent.trim()==='Version'){
        const s=row.querySelector('span'); if(s)s.textContent=BUILD;
      }
    });
  }

  function loadCss(){
    let l=document.getElementById('archive-v51014-css');
    if(l){
      if(!String(l.href||'').includes('v=51015'))l.href='./archive-v51014.css?v=51015';
      return;
    }
    l=document.createElement('link');
    l.id='archive-v51014-css';
    l.rel='stylesheet';
    l.href='./archive-v51014.css?v=51015';
    document.head.appendChild(l);
  }

  function normText(v){
    return String(v||'').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
  }

  function syncCanonicalArchive(){
    try{
      if(typeof S==='undefined')return;
      if(!Array.isArray(S.library))S.library=[];
      let changed=false;

      CANONICAL.forEach(seed=>{
        let rec=S.library.find(x=>String(x?.id||'')===seed.id);
        if(!rec){
          rec=S.library.find(x=>normText(x?.title)===normText(seed.title)&&normText(x?.author)===normText(seed.author));
        }
        if(!rec){
          const fresh={...seed,favorite:false,notes:'',cover:'',archivedAt:Date.now()};
          S.library.push(typeof normalizeLibraryRecord==='function'?normalizeLibraryRecord(fresh):fresh);
          changed=true;
          return;
        }

        const wanted={
          title:seed.title,
          author:seed.author,
          series:seed.series,
          rating:seed.rating,
          startDate:seed.startDate,
          finishDate:seed.finishDate
        };
        Object.entries(wanted).forEach(([k,v])=>{
          if(rec[k]!==v){rec[k]=v;changed=true;}
        });
        if(!rec.id){rec.id=seed.id;changed=true;}
      });

      if(changed&&typeof persistSilent==='function')persistSilent();
      if(changed&&typeof renderLibrary==='function')renderLibrary();
      if(typeof libraryDetailId!=='undefined'&&libraryDetailId&&typeof renderLibraryDetail==='function')renderLibraryDetail(libraryDetailId);
    }catch(err){
      console.warn('Archive record sync skipped:',err);
    }
  }

  function wrapHealth(){
    const old=window.renderSaveHealth;
    if(typeof old==='function'&&!old.__v51015){
      const wrapped=function(){const r=old.apply(this,arguments);setTimeout(stampVersion,0);return r};
      wrapped.__v51015=true;
      window.renderSaveHealth=wrapped;
    }
  }

  function apply(){
    loadCss();
    wrapHealth();
    syncCanonicalArchive();
    stampVersion();
    setTimeout(stampVersion,60);
    setTimeout(stampVersion,400);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
})();
