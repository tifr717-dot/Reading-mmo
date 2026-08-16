const CACHE = 'reading-mmo-v5-3-tabbed-widget-home';
const CORE = [
  './','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
  './asset-book.png','./asset-gem.png','./asset-goose.png','./asset-ivy.png','./asset-potion.png','./asset-scroll.png',
  './asset-candle.png','./asset-mug.png','./asset-quill.png','./asset-books-stack.png','./asset-plant.png','./asset-ledger.png','./asset-crystal-lamp.png',
  './nav-home.png','./nav-read.png','./nav-quests.png','./nav-play.png','./nav-me.png',
  './v51-header.png','./v51-wood-tile.png','./v51-quest-widget.png','./v51-reader-widget.png','./v51-xp-frame.png','./v51-fill.png',
  './v51-current-widget-frame.png','./v51-open-book.png','./v51-reader-ribbon.png','./v51-small-button.png','./v51-plaque.png','./v51-ledger-open.png',
  './v52-quest-inner.png','./v52-reader-inner.png','./v52-current-plaque.png','./v52-open-book-scene.png','./v52-rail-left.png','./v52-rail-right.png','./v52-connector.png','./v52-bottom-ornament.png',
  './v53-header.png','./v53-shell.png','./v53-tab-active.png','./v53-tab-inactive.png','./v53-open-book.png','./v53-reader-ribbon.png','./v53-level-panel.png','./v53-quests-panel.png','./v53-xp-frame.png','./v53-fill.png','./v53-small-button.png','./v53-ledger-panel.png','./v53-wood-tile.png','./v53-candle.png','./v53-quill.png','./v53-books.png','./v53-ivy.png'
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
