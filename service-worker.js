const CACHE = 'reading-mmo-v5.10.3-archive-art-rebuild';
const CORE = [
  './',
  './asset-book.png',
  './asset-books-stack.png',
  './asset-crystal-lamp.png',
  './asset-gem.png',
  './asset-goose.png',
  './asset-ivy.png',
  './asset-ledger.png',
  './asset-potion.png',
  './asset-scroll.png',
  './archive-title-frame.png',
  './archive-shelf-cubby.png',
  './archive-parchment-texture.png',
  './hyb-header.png',
  './hyb-wood-tile.png',
  './icon-192.png',
  './icon-512.png',
  './index.html',
  './manifest.webmanifest',
  './nav-home.png',
  './nav-me.png',
  './nav-play.png',
  './nav-quests.png',
  './nav-read.png',
  './v47-header.png',
  './v47-wood-tile.png',
  './v50-header.png',
  './v50-wood.png',
  './v51-header.png',
  './v51-wood-tile.png',
  './v53-books.png',
  './v53-candle.png',
  './v53-fill.png',
  './v53-header.png',
  './v53-ledger-panel.png',
  './v53-open-book.png',
  './v53-quests-panel.png',
  './v53-quill.png',
  './v53-reader-ribbon.png',
  './v53-small-button.png',
  './v53-tab-active.png',
  './v53-tab-inactive.png',
  './v53-wood-tile.png',
  './v53-xp-frame.png',
  './v54-desk-base.png',
  './v54-level-panel.png',
  './v54-shell.png',
  './v56-level-panel-tall.png',
  './v56-open-book-scene.png',
  './v57-footer-fill.png',
  './v58-home-frame.png',
  './v58-home-frame-v582.png',
  './v584-dense-library-footer.png',
  './v585-library-footer.png',
  './v586-seamless-library-footer.png',
  './v587-clean-cabinet-footer.png',
  './v588-built-in-cabinet-footer.png',
  './v5810-quiet-panel-footer.png'
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
