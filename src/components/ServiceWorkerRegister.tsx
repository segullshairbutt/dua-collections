'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Registers the service worker and handles updates:
 *  - a new version downloads in the background and WAITS (it never swaps under a running page)
 *  - a small non-modal <dialog> offers "Update"; tapping it activates the new version and reloads once
 *  - if the user taps "Later", the new version activates by itself the next time the app is opened
 */
export default function ServiceWorkerRegister() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const toastRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // In dev, chunk filenames are not hashed: a cache-first service worker breaks webpack.
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
      if ('caches' in window) caches.keys().then(ks => ks.forEach(k => caches.delete(k)));
      return;
    }

    let registration: ServiceWorkerRegistration | undefined;
    const hadController = !!navigator.serviceWorker.controller;
    let reloading = false;

    // Reload once the new worker takes over (skip the very first install, which also fires this)
    const onControllerChange = () => {
      if (!hadController || reloading) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => {
        registration = reg;
        if (reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) setWaiting(worker);
          });
        });
      })
      .catch(() => {});

    // Installed PWAs can stay alive for days: re-check when the app returns to the foreground and hourly
    const check = () => registration?.update().catch(() => {});
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisible);
    const interval = setInterval(check, 60 * 60 * 1000);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (waiting && !toastRef.current?.open) toastRef.current?.show(); // show() = non-modal
  }, [waiting]);

  return (
    <dialog
      ref={toastRef}
      aria-live="polite"
      className="fixed left-1/2 -translate-x-1/2 bottom-[max(1rem,env(safe-area-inset-bottom))] m-0 w-[calc(100%-2rem)] max-w-sm z-50 rounded-2xl border-0 bg-indigo-600 p-0 text-white shadow-xl"
    >
      <div className="flex items-center gap-3 p-3.5">
        <p className="flex-1 text-sm font-semibold">A new version is available</p>
        <button
          type="button"
          onClick={() => toastRef.current?.close()}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-100 hover:bg-white/10"
        >
          Later
        </button>
        <button
          type="button"
          onClick={() => waiting?.postMessage({ type: 'SKIP_WAITING' })}
          className="rounded-lg bg-orange-400 px-3.5 py-2 text-sm font-bold text-gray-900 hover:bg-orange-300 active:scale-95 transition"
        >
          Update
        </button>
      </div>
    </dialog>
  );
}
