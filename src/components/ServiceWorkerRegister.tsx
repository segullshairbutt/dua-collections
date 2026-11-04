'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // In dev, chunk filenames are not hashed, so a cache-first service worker serves stale
    // chunks and breaks webpack. Only run the service worker in production builds.
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
      if ('caches' in window) caches.keys().then(ks => ks.forEach(k => caches.delete(k)));
      return;
    }

    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

  return null;
}
