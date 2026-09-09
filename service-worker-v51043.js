const CACHE='reading-mmo-v5.10.43-approved-lower-x';
const FORCE_VERSION='51043x';
const CORE=[
 './','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
 './reading-journal-v51032.js','./reading-journal-mockup-v51043.js','./reading-journal-unified-v51043.js',
 './reading-journal-canvas-composite-v51043v.js','./reading-journal-layered-v51043v.js',
 './journal-mockup-top-exact-v1.webp','./journal-mockup-selector-strip-blank-v1.webp',
 './archive-parchment-texture.png','./journal-flourish-v51041.svg',
 ...Array.from({length:12},(_,i)=>`./journal-approved-lower-v51043q-part${String(i+1).padStart(2,'0')}.b64`)
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(k=>k.startsWith('reading-mmo-')&&k!==CACHE).map(k=>caches.delete(k)));
 await self.clients.claim();
 const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
 await Promise.all(windows.map(client=>{try{const url=new URL(client.url);if(url.origin!==self.location.origin||url.searchParams.get('appv')===FORCE_VERSION)return Promise.resolve();url.searchParams.set('appv',FORCE_VERSION);return client.navigate(url.href).catch(()=>undefined)}catch(_){return Promise.resolve()}}));
})())});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 if(req.mode==='navigate'){
  event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return res}).catch(()=>caches.match('./index.html')));return;
 }
 const u=new URL(req.url);const preferNetwork=req.destination==='script'||req.destination==='style'||u.searchParams.has('v');
 if(preferNetwork){event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));return res}).catch(()=>caches.match(req)));return;}
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));return res})));
});