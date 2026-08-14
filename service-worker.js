const CACHE = 'reading-mmo-v4-5-crisp-widget-home';
const CORE = [
  './','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
  './asset-book.png','./asset-gem.png','./asset-goose.png','./asset-ivy.png','./asset-potion.png','./asset-scroll.png',
  './asset-candle.png','./asset-quill.png','./asset-books-stack.png','./asset-ledger.png',
  './nav-home.png','./nav-read.png','./nav-quests.png','./nav-play.png','./nav-me.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(res => {
      const copy=res.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy)); return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => {
    const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); return res;
  })));
});
