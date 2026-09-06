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
  let guard=null;
  function run(){
    stamp();
    document.documentElement.dataset.readingJournalMockupFinal='51043-final-k';
    if(!guard){
      guard=new MutationObserver(()=>stamp());
      guard.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('pageshow',run);
})();