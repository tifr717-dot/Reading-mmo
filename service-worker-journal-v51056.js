const CACHE='reading-journal-v51056';
const CORE=[
  './manifest.webmanifest','./icon-192.png','./icon-512.png',
  './reading-hub/','./reading-hub/index.html',
  './reading-hub/data.js','./reading-hub/library-data.js','./reading-hub/isbn-index.js',
  './reading-hub/reading-calendar-x4pro-v1.js','./reading-hub/cover-service.js',
  './reading-hub/cover-manager.js','./reading-hub/cover-manager.css',
  './reading-hub/cover-rescue.js','./reading-hub/cover-rescue.css'
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>(k.startsWith('reading-mmo-')||k.startsWith('reading-journal-'))&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==self.location.origin)return;

  if(r.mode==='navigate'){
    e.respondWith((async()=>{
      try{
        const live=await fetch(r,{cache:'no-store'});
        const copy=live.clone();
        const key=u.pathname.includes('/reading-hub/')?'./reading-hub/index.html':'./index.html';
        caches.open(CACHE).then(c=>c.put(key,copy));
        return live;
      }catch(_){
        if(u.pathname.includes('/reading-hub/')){
          return (await caches.match('./reading-hub/index.html')) || Response.error();
        }
        return (await caches.match('./index.html')) || (await caches.match('./reading-hub/index.html')) || Response.error();
      }
    })());
    return;
  }

  const networkFirst=r.destination==='script'||r.destination==='style'||u.searchParams.has('v');
  if(networkFirst){
    e.respondWith(fetch(r,{cache:'no-store'}).then(x=>{
      const y=x.clone();caches.open(CACHE).then(c=>c.put(r,y));return x;
    }).catch(()=>caches.match(r)));
    return;
  }
  e.respondWith(caches.match(r).then(x=>x||fetch(r).then(y=>{
    const z=y.clone();caches.open(CACHE).then(c=>c.put(r,z));return y;
  })));
});
