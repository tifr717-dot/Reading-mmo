const CACHE='reading-mmo-v5.10.45-home-boot2';
const CORE=[
 './','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
 './reading-journal-layered-v51043v.js',
 './home-v51045-runtime.js',
 './home-v51045-master-clean-level.b64.txt',
 './simplified-redesign-v51045.js',
 './reading-journal-v51044-runtime-01.txt','./reading-journal-v51044-runtime-02.txt','./reading-journal-v51044-runtime-03.txt'
];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE)
      .then(c=>c.addAll(CORE))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('reading-mmo-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',e=>{
  const r=e.request;
  const u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==self.location.origin)return;

  if(r.mode==='navigate'){
    e.respondWith(
      fetch(r,{cache:'no-store'})
        .then(x=>{
          const y=x.clone();
          caches.open(CACHE).then(c=>c.put('./index.html',y));
          return x;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  const networkFirst=
    r.destination==='script'||
    r.destination==='style'||
    u.searchParams.has('v')||
    u.pathname.endsWith('/home-v51045-master-clean-level.b64.txt');

  if(networkFirst){
    e.respondWith(
      fetch(r,{cache:'no-store'})
        .then(x=>{
          const y=x.clone();
          caches.open(CACHE).then(c=>c.put(r,y));
          return x;
        })
        .catch(()=>caches.match(r))
    );
    return;
  }

  e.respondWith(
    caches.match(r).then(x=>x||fetch(r).then(y=>{
      const z=y.clone();
      caches.open(CACHE).then(c=>c.put(r,z));
      return y;
    }))
  );
});