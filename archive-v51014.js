/* Reading MMO v5.10.14 — final visual/version stamp. */
(function(){
  const BUILD='v5.10.14';
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
    if(document.getElementById('archive-v51014-css'))return;
    const l=document.createElement('link');l.id='archive-v51014-css';l.rel='stylesheet';l.href='./archive-v51014.css?v=51014';document.head.appendChild(l);
  }
  function wrapHealth(){
    const old=window.renderSaveHealth;
    if(typeof old==='function'&&!old.__v51014){
      const wrapped=function(){const r=old.apply(this,arguments);setTimeout(stampVersion,0);return r};
      wrapped.__v51014=true;window.renderSaveHealth=wrapped;
    }
  }
  function apply(){loadCss();wrapHealth();stampVersion();setTimeout(stampVersion,60);setTimeout(stampVersion,400);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
