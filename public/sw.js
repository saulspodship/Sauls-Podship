/* ============================================================
   Saul's Podship service worker
   Goals: make the site installable (PWA), open fast on repeat
   visits, and offer a cached shell offline. Deliberately light:
   never precache the 51 hero artworks; cache lazily instead.
   ============================================================ */
// v8 (2026-10-25): purges the pre-fix copies of the non-hashed retrofit
// scripts (seo-aeo.js / companion.js) and the old page shell.
const VERSION = 'sp-pwa-v8';
const SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];
const MAX_ENTRIES = 160;

self.addEventListener('install', (event) => {
  // A single unreachable shell entry must never abort SW installation
  // (an uninstalled SW silently kills Chrome's install prompt).
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await Promise.all(SHELL.map((url) => cache.add(url).catch(() => undefined)));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function trimCache(cache) {
  const keys = await cache.keys();
  if (keys.length > MAX_ENTRIES) {
    await Promise.all(keys.slice(0, keys.length - MAX_ENTRIES).map((r) => cache.delete(r)));
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never touch youtube/social APIs

  const isPageNav = req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html');

  if (isPageNav) {
    // network-first with offline shell fallback
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.status === 200) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => { c.put(req, copy); trimCache(c); });
          }
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match('/index.html')) || (await caches.match('/')))
    );
    return;
  }

  const isAsset = /\.(css|js|mjs|png|jpe?g|webp|svg|ico|woff2?|manifest)$/i.test(url.pathname);
  /* Language dictionaries are small, versioned static files (public/i18n/*.json)
     that the installed app must be able to open offline — otherwise a PWA
     visitor on a train loses Urdu the moment the network drops. They are
     cached search-insensitively, so an older ?v= still resolves. */
  const isI18nDict = url.pathname.startsWith('/i18n/') && url.pathname.endsWith('.json');
  const cacheable = isAsset || isI18nDict;
  const isLocalPage = url.pathname.startsWith('/music-archive/') || url.pathname === '/Pakistanisingersarchive';
  if (cacheable || isLocalPage) {
    // stale-while-revalidate for assets and prerendered archive pages
    event.respondWith(
      caches.open(VERSION).then(async (cache) => {
        let hit = await cache.match(req, { ignoreSearch: cacheable });
        // Never serve a poisoned entry: an image/asset path that was once
        // answered by the SPA HTML fallback (status 200, text/html) must be
        // refetched, not replayed as a broken picture.
        if (hit && isAsset) {
          const ct = hit.headers.get('content-type') || '';
          if (/text\/html/i.test(ct)) { await cache.delete(req); hit = undefined; }
        }
        const refresh = fetch(req)
          .then((res) => {
            const ct = (res && res.headers.get('content-type')) || '';
            const okType = !isAsset || !/text\/html/i.test(ct);
            if (res && res.status === 200 && okType) { cache.put(req, res.clone()); trimCache(cache); }
            return res;
          })
          .catch(() => null);
        return hit || (await refresh) || Response.error();
      })
    );
  }
});
