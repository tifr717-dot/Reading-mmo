(()=>{
  'use strict';
  if(window.__v51045SimplifiedBooted)return;
  window.__v51045SimplifiedBooted=true;

  const $=id=>document.getElementById(id);

  function ensureCss(){
    if($('v51045-simplified-css'))return;
    const s=document.createElement('style');
    s.id='v51045-simplified-css';
    s.textContent=`
      #adventure,#world,#bag{display:none!important}
      .bottomnav button[data-screen="journal"]:before{background-image:url('./nav-read.png')!important}
      .v51045-legacy-hidden{display:none!important}
    `;
    document.head.appendChild(s);
  }

  function openJournal(){
    if(typeof window.openReadingJournal==='function'){
      window.openReadingJournal();
      return;
    }
    const launcher=$('v51034JournalLaunch')||$('v51034LibraryJournalLaunch');
    if(launcher){launcher.click();return;}
    if(typeof window.go==='function')window.go('profile');
  }
  window.openSimplifiedJournal=openJournal;

  function simplifyNav(){
    const nav=document.querySelector('.bottomnav');
    if(!nav)return;
    const play=nav.querySelector('button[data-screen="adventure"]')||nav.querySelector('button[data-screen="journal"]');
    if(play){
      play.dataset.screen='journal';
      play.textContent='Journal';
      play.setAttribute('onclick','openSimplifiedJournal(); return false;');
      play.setAttribute('aria-label','Open Reading Journal');
    }
  }

  function simplifyArchiveLanguage(){
    document.querySelectorAll('button').forEach(btn=>{
      const t=(btn.textContent||'').trim();
      if(t.includes('OPEN THE ENCHANTED ARCHIVE'))btn.textContent='📚 COMPLETED BOOKS';
      if(t.includes('OPEN LIBRARY'))btn.textContent='📚 COMPLETED BOOKS';
      if(t.includes('ARCHIVE FINISHED VOLUME'))btn.textContent='🏁 FINISH + SAVE BOOK';
    });
  }

  function hideLegacyEntrypoints(){
    ['adventure','world','bag'].forEach(id=>{const el=$(id);if(el)el.setAttribute('aria-hidden','true')});
  }

  function apply(){
    ensureCss();
    simplifyNav();
    simplifyArchiveLanguage();
    hideLegacyEntrypoints();
    document.documentElement.dataset.readingMmoStructure='v51045-simplified';
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  window.addEventListener('pageshow',apply);
  [250,900,2200,4500].forEach(ms=>setTimeout(apply,ms));
})();
