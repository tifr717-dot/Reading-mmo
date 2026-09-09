const CACHE='reading-mmo-v5.10.43-approved-real-z';
const FORCE_VERSION='51043z';
const CORE=[
 './','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
 './reading-journal-v51032.js','./reading-journal-mockup-v51043.js','./reading-journal-unified-v51043.js',
 './reading-journal-canvas-composite-v51043v.js','./reading-journal-layered-v51043v.js',
 './journal-mockup-top-exact-v1.webp','./journal-mockup-selector-strip-blank-v1.webp',
 './archive-parchment-texture.png','./journal-flourish-v51041.svg','./journal-layer-footer-v51043t.svg',
 './journal-approved-stats-v51043z.webp','./journal-approved-highlights-v51043z.webp','./journal-approved-timeline-v51043z.webp',
 './journal-approved-slip1-v51043z.webp','./journal-approved-slip2-v51043z.webp','./journal-approved-slip3-v51043z.webp'
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('reading-mmo-')&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();const cs=await self.clients.matchAll({type:'window',includeUncontrolled:true});await Promise.all(cs.map(c=>{try{const u=new URL(c.url);if(u.origin!==self.location.origin||u.searchParams.get('appv')===FORCE_VERSION)return Promise.resolve();u.searchParams.set('appv',FORCE_VERSION);return c.navigate(u.href).catch(()=>undefined)}catch(_){return Promise.resolve()}}))})())});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;if(r.mode==='navigate'){e.respondWith(fetch(r,{cache:'no-store'}).then(x=>{const y=x.clone();caches.open(CACHE).then(c=>c.put('./index.html',y));return x}).catch(()=>caches.match('./index.html')));return}const u=new URL(r.url),network=r.destination==='script'||r.destination==='style'||u.searchParams.has('v');if(network){e.respondWith(fetch(r,{cache:'no-store'}).then(x=>{const y=x.clone();caches.open(CACHE).then(c=>c.put(r,y));return x}).catch(()=>caches.match(r)));return}e.respondWith(caches.match(r).then(x=>x||fetch(r).then(y=>{const z=y.clone();caches.open(CACHE).then(c=>c.put(r,z));return y})))});