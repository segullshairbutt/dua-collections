'use client';

import { useSyncExternalStore } from 'react';

// Tiny shared store: <InstallPrompt /> publishes whether installing is possible right now,
// and any component (a navbar button, a settings row…) can subscribe with useCanInstall().
let canInstall = false;
const listeners = new Set<() => void>();

export function setCanInstall(value: boolean) {
  if (value === canInstall) return;
  canInstall = value;
  listeners.forEach(l => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

/** true only when the app is not installed yet AND this browser can install it (or show install steps) */
export const useCanInstall = () =>
  useSyncExternalStore(
    subscribe,
    () => canInstall,
    () => false // server render: never show, so there is no hydration mismatch
  );

export const openInstallDialog = () => window.dispatchEvent(new Event('pwa:install'));
