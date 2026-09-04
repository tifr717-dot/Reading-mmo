const CACHE='reading-mmo-v5.10.43-storybook-journal';
const FORCE_VERSION='51043';
const CORE=[
 './','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
 './nav-home.png','./nav-me.png','./nav-play.png','./nav-quests.png','./nav-read.png',
 './asset-book.png','./asset-books-stack.png','./asset-crystal-lamp.png','./asset-gem.png','./asset-goose.png','./asset-ivy.png','./asset-ledger.png','./asset-potion.png','./asset-scroll.png',
 './hyb-header.png','./hyb-wood-tile.png','./v47-header.png','./v47-wood-tile.png','./v50-header.png','./v50-wood.png','./v51-header.png','./v51-wood-tile.png',
 './v53-books.png','./v53-candle.png','./v53-fill.png','./v53-header.png','./v53-ledger-panel.png','./v53-open-book.png','./v53-quests-panel.png','./v53-quill.png','./v53-reader-ribbon.png','./v53-small-button.png','./v53-tab-active.png','./v53-tab-inactive.png','./v53-wood-tile.png','./v53-xp-frame.png',
 './v54-desk-base.png','./v54-level-panel-tall.png','./v54-shell.png','./v56-level-panel-tall.png','./v56-open-book-scene.png','./v57-footer-fill.png','./v58-home-frame.png','./v58-home-frame-v582.png','./v584-dense-library-footer.png','./v585-library-footer.png','./v586-seamless-library-footer.png','./v587-clean-cabinet-footer.png','./v588-built-in-cabinet-footer.png','./v5810-quiet-panel-footer.png',
 './archive-approved-controls.jpg','./archive-v51011.css','./archive-v51011.js','./archive-v51012.css','./archive-v51013.css','./archive-v51013.js','./archive-v51014.css','./archive-v51014.js','./archive-v51016.css','./archive-v51016.js','./archive-v51018.css','./archive-v51018.js','./archive-v51022.css','./archive-v51022.js','./archive-v51025.css','./archive-v51025.js',
 './archive-proto-legion.svg','./archive-proto-angels.svg','./archive-proto-stage.svg','./archive-proto-legion-art.svg','./archive-proto-angels-art.svg','./archive-proto-stage-art.svg',
 './archive-pixel-shelf-v51022.svg','./archive-pixel-spine-6-v51022.svg','./archive-pixel-spine-5-v51022.svg','./archive-pixel-spine-4-v51022.svg','./archive-pixel-spine-3-v51022.svg','./archive-pixel-spine-2-v51022.svg','./archive-pixel-spine-1-v51022.svg','./archive-pixel-spine-standalone-v51022.svg',
 './archive-spine-standalone.svg','./archive-spine-1.svg','./archive-spine-2.svg','./archive-spine-3.svg','./archive-spine-4.svg','./archive-spine-5.svg','./archive-spine-6.svg',
 './archive-concept-v51023-part01.b64','./archive-concept-v51023-part02.b64','./archive-concept-v51023-part03.b64','./archive-concept-v51023-part04.b64','./archive-concept-v51023-part05.b64','./archive-concept-v51023-part06.b64','./archive-concept-v51023-part07.b64','./archive-concept-v51023-part08.b64',
 './reading-shelf-v51019.js','./reading-shelf-v51021.js','./reading-progress-v51027.js','./reading-time-v51028.js','./reading-flow-v51029.js','./reading-ble-v51033.js','./reading-history-v51031.js',
 './reading-journal-v51032.js','./reading-journal-mobile-v51035.js','./reading-journal-cascade-v51038.js','./reading-journal-polish-v51039.js','./reading-journal-visual-v51040.js','./reading-journal-art-v51041.js','./reading-journal-fix-v51042.js',
 './reading-journal-mockup-v51043.js','./reading-journal-mockup-stats-v51043.js','./reading-journal-mockup-lower-v51043.js','./reading-journal-mockup-final-v51043.js',
 './journal-botanical-corner-v51041.svg','./journal-flourish-v51041.svg','./journal-icon-sessions-v51041.svg','./journal-icon-pages-v51041.svg','./journal-icon-time-v51041.svg','./journal-icon-longest-v51041.svg',
 './journal-mockup-top-exact-v1.webp','./journal-mockup-selector-strip-blank-v1.webp','./journal-mockup-stats-blank-v1.webp',
 './journal-mockup-lower-pack-tiny-01.b64','./journal-mockup-lower-pack-tiny-02.b64','./journal-mockup-lower-pack-tiny-03.b64','./journal-mockup-lower-pack-tiny-04.b64','./journal-mockup-lower-pack-tiny-05.b64','./journal-mockup-lower-pack-tiny-06.b64','./journal-mockup-lower-pack-tiny-07.b64'
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
 const req=event.request; if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 if(req.mode==='navigate'){
  event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return res}).catch(()=>caches.match('./index.html')));return;
 }
 const u=new URL(req.url); const preferNetwork=req.destination==='script'||req.destination==='style'||u.searchParams.has('v');
 if(preferNetwork){event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));return res}).catch(()=>caches.match(req)));return;}
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));return res})));
});