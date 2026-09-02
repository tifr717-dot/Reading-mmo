(()=>{
  'use strict';
  if(window.__v51038JournalCascadeFix)return;
  window.__v51038JournalCascadeFix=true;

  function installReadableLayer(){
    const base=document.getElementById('v51034-journal-css');
    const source=document.getElementById('v51037-readable-journal-mobile')
      ||document.getElementById('v51035-readable-journal-mobile');
    if(!base||!source)return false;

    let live=document.getElementById('v51038-readable-journal-live');
    if(!live){
      live=document.createElement('style');
      live.id='v51038-readable-journal-live';
    }
    live.textContent=source.textContent;
    document.head.appendChild(live);
    document.documentElement.dataset.readingJournalReadable='51038';
    return true;
  }

  const observer=new MutationObserver(()=>{
    if(installReadableLayer())observer.disconnect();
  });
  observer.observe(document.head,{childList:true});

  const retry=()=>{
    installReadableLayer();
    [0,50,250,1000].forEach(ms=>setTimeout(installReadableLayer,ms));
  };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',retry,{once:true});
  }else{
    retry();
  }

  window.addEventListener('pageshow',retry);
  document.addEventListener('click',e=>{
    if(e.target.closest?.('#v51034JournalLaunch,#v51034LibraryJournalLaunch')){
      setTimeout(installReadableLayer,0);
      setTimeout(installReadableLayer,80);
    }
  },true);
})();
