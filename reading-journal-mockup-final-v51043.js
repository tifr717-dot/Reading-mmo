(()=>{
  'use strict';
  if(window.__v51043JournalMockupFinalClean)return;
  window.__v51043JournalMockupFinalClean=true;
  const BUILD='v5.10.43';
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
  const run=()=>{stamp();document.documentElement.dataset.readingJournalMockupFinal='51043-clean-i';};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('pageshow',run);
})();