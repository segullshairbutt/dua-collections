const V = 'duas-v1';
const PAGES = ['/', '/Duas', '/PrayerTimes'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => Promise.all(PAGES.map((p) => c.add(p).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== V).map((x) => caches.delete(x)))));
  self.clients.claim();
});
const put = (r, res) => { if (res.ok) { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); } return res; };

self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== self.location.origin) return;
  if (u.pathname.startsWith('/_next/static/')) {
    e.respondWith(caches.match(r).then((h) => h || fetch(r).then((res) => put(r, res))));
    return;
  }
  e.respondWith(
    fetch(r).then((res) => put(r, res)).catch(() =>
      caches.match(r, { ignoreSearch: r.mode === 'navigate' }).then((h) => h || (r.mode === 'navigate' ? caches.match('/') : undefined)),
    ),
  );
});
