const CACHE = 'reading-mmo-v4-8-hybrid-layered-desk';
const CORE = [
  './','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
  './asset-book.png','./asset-gem.png','./asset-goose.png','./asset-ivy.png','./asset-potion.png','./asset-scroll.png',
  './asset-candle.png','./asset-mug.png','./asset-quill.png','./asset-books-stack.png','./asset-plant.png','./asset-ledger.png','./asset-crystal-lamp.png',
  './nav-home.png','./nav-read.png','./nav-quests.png','./nav-play.png','./nav-me.png',
  './v47-header.png','./v47-quest-board.png','./v47-rank-placard.png','./v47-journal-scene.png','./v47-actions-ledger.png','./v47-wood-tile.png',
  './hyb-header.png',
  './hyb-wood-tile.png',
  './hyb-board-frame.png',
  './hyb-note-hunt.png',
  './hyb-note-gather.png',
  './hyb-note-alchemy.png',
  './hyb-icon-hunt.png',
  './hyb-icon-gather.png',
  './hyb-icon-alchemy.png',
  './hyb-rank-plaque.png',
  './hyb-level-badge.png',
  './hyb-rank-gem.png',
  './hyb-open-book.png',
  './hyb-open-reader-ribbon.png',
  './hyb-xp-fill.png',
  './hyb-read-fill.png',
  './hyb-decor-candle.png',
  './hyb-decor-mug.png',
  './hyb-decor-quill.png',
  './hyb-decor-books.png',
  './hyb-decor-plant.png',
  './hyb-decor-crystal.png',
  './hyb-btn-board.png',
  './hyb-btn-sync.png',
  './hyb-ledger-tab.png',
  './hyb-ledger-open.png',
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
