(()=>{
  'use strict';
  if(window.__v51044StageBootstrap)return;
  window.__v51044StageBootstrap=true;
  const BUILD='v5.10.44';
  const RUNTIME_PARTS=[
    'reading-journal-v51044-runtime-01.txt',
    'reading-journal-v51044-runtime-02.txt',
    'reading-journal-v51044-runtime-03.txt'
  ];
  function stamp(){
    window.__readingMmoVersionOwner=BUILD;
    const badge=document.getElementById('headerVersionText');
    if(badge&&badge.textContent!==BUILD)badge.textContent=BUILD;
    document.querySelectorAll('.health-row').forEach(row=>{
      if(row.querySelector('b')?.textContent.trim()==='Version'){
        const value=row.querySelector('span');
        if(value&&value.textContent!==BUILD)value.textContent=BUILD;
      }
    });
  }
  async function loadRuntime(){
    try{
      const parts=await Promise.all(RUNTIME_PARTS.map(name=>fetch(`./${name}?v=51044`,{cache:'no-store'}).then(r=>{
        if(!r.ok)throw new Error(`${name} ${r.status}`);
        return r.text();
      })));
      (0,eval)(parts.join('\n'));
      stamp();
      document.documentElement.dataset.readingJournalMockupFinal='51044-v17-stage';
    }catch(err){
      console.error('[journal 51044] staging runtime failed',err);
    }
  }
  function run(){
    stamp();
    loadRuntime();
    [100,500,1500,3500].forEach(ms=>setTimeout(stamp,ms));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('pageshow',stamp);
})();