/* Reading MMO v5.10.13 — final Archive shelf/detail override. */
(function(){
  const BUILD='v5.10.13';
  function apply(){
    if(!document.getElementById('archive-v51013-css')){
      const l=document.createElement('link');
      l.id='archive-v51013-css';
      l.rel='stylesheet';
      l.href='./archive-v51013.css?v=51013';
      document.head.appendChild(l);
    }
    const badge=document.getElementById('headerVersionText');
    if(badge)badge.textContent=BUILD;
    document.querySelectorAll('.health-row').forEach(row=>{
      if(row.querySelector('b')?.textContent.trim()==='Version'){
        const s=row.querySelector('span'); if(s)s.textContent=BUILD;
      }
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
