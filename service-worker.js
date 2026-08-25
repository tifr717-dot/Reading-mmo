const CACHE = 'reading-mmo-v5.10.19-shelved-volumes-hotfix';
const FORCE_VERSION = '51019';
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
  './v54-level-panel-tall.png',
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
  './archive-approved-controls.jpg',
  './archive-v51011.css',
  './archive-v51011.js',
  './archive-v51012.css',
  './archive-v51013.css',
  './archive-v51013.js',
  './archive-v51014.css',
  './archive-v51014.js',
  './archive-v51016.css',
  './archive-v51016.js',
  './archive-proto-legion.svg',
  './archive-proto-angels.svg',
  './archive-proto-stage.svg',
  './archive-v51018.css',
  './archive-v51018.js',
  './reading-shelf-v51019.js',
  './archive-proto-legion-art.svg',
  './archive-proto-angels-art.svg',
  './archive-proto-stage-art.svg',
  './archive-spine-standalone.svg',
  './archive-spine-1.svg',
  './archive-spine-2.svg',
  './archive-spine-3.svg',
  './archive-spine-4.svg',
  './archive-spine-5.svg',
  './archive-spine-6.svg',
  './v5810-quiet-panel-footer.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();

    // Force every open installed-app window onto the current Reading MMO build.
    // This avoids Android continuing to display an older cached document after
    // the worker itself has already updated successfully.
    const windows = await self.clients.matchAll({type:'window', includeUncontrolled:true});
    await Promise.all(windows.map(client => {
      try {
        const url = new URL(client.url);
        if (url.origin !== self.location.origin) return Promise.resolve();
        if (url.searchParams.get('appv') === FORCE_VERSION) return Promise.resolve();
        url.searchParams.set('appv', FORCE_VERSION);
        return client.navigate(url.href).catch(() => undefined);
      } catch (_) {
        return Promise.resolve();
      }
    }));
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req, {cache:'no-store'}).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy));
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }))
  );
});
