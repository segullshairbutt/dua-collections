// __BUILD_ID__ is replaced at build time by scripts/stamp-sw.mjs, so every deploy produces a
// different sw.js. That byte change is what makes browsers detect an update.
const V = 'duas-__BUILD_ID__';
const PAGES = ['/', '/duas', '/Duas', '/prayer-times']; // list your real routes; missing ones are skipped

self.addEventListener('install', (e) => {
  // No skipWaiting() here: a new version waits until the page asks for it (or the app is closed).
  e.waitUntil(caches.open(V).then((c) => Promise.all(PAGES.map((p) => c.add(p).catch(() => {})))));
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== V).map((x) => caches.delete(x)))));
  self.clients.claim();
});

const put = (r, res) => {
  if (res.ok) {
    const cp = res.clone();
    caches.open(V).then((c) => c.put(r, cp));
  }
  return res;
};

self.addEventListener('fetch', (e) => {
  const r = e.request;
  const u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== self.location.origin) return;
  // Hashed build assets never change: cache-first
  if (u.pathname.startsWith('/_next/static/')) {
    e.respondWith(caches.match(r).then((h) => h || fetch(r).then((res) => put(r, res))));
    return;
  }
  // Everything else: network-first, cache as the offline fallback
  e.respondWith(
    fetch(r)
      .then((res) => put(r, res))
      .catch(() =>
        caches
          .match(r, { ignoreSearch: r.mode === 'navigate' })
          .then((h) => h || (r.mode === 'navigate' ? caches.match('/') : undefined)),
      ),
  );
});