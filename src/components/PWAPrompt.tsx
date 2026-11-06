'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { openInstallDialog, setCanInstall, useCanInstall } from '@/lib/pwa';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
type Manual = 'ios' | 'mac-safari' | 'android-firefox';

const SNOOZE_KEY = 'pwa-install-snoozed-until';
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // ask again after a week
const SHOW_DELAY_MS = 8000; // don't interrupt the first seconds

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

/** Browsers with no install event: they need a "how to" instead of a button */
function detectManual(): Manual | null {
  const ua = navigator.userAgent;
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  if (/iphone|ipad|ipod/i.test(ua) || iPadOS) return 'ios'; // every iOS browser installs via the Share menu
  if (/android/i.test(ua) && /firefox/i.test(ua)) return 'android-firefox';
  const safariVersion = Number(/version\/(\d+)/i.exec(ua)?.[1] || 0);
  if (
    /macintosh/i.test(ua) &&
    /safari/i.test(ua) &&
    !/chrome|chromium|edg|opr|firefox/i.test(ua) &&
    safariVersion >= 17
  )
    return 'mac-safari';
  return null; // Chromium: native prompt; desktop Firefox: cannot install PWAs
}

const ShareIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="inline w-4 h-4 -mt-0.5 text-indigo-600"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3v12M8 7l4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
  </svg>
);

const STEPS: Record<Manual, ReactNode[]> = {
  ios: [
    <>
      Tap the <ShareIcon /> <b>Share</b> button in your browser&apos;s toolbar
    </>,
    <>
      Scroll down and choose <b>Add to Home Screen</b>
    </>,
    <>
      Tap <b>Add</b>
    </>,
  ],
  'mac-safari': [
    <>
      Open the <b>File</b> menu in Safari
    </>,
    <>
      Choose <b>Add to Dock…</b>
    </>,
  ],
  'android-firefox': [
    <>
      Open the browser menu <b>⋮</b>
    </>,
    <>
      Tap <b>Install</b>
    </>,
  ],
};

const BENEFITS = [
  'Opens like a normal app, in one tap',
  'Prayer times and duas work without internet',
  'Always up to date',
];

const snooze = () => {
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
  } catch {}
};
const isSnoozed = () => {
  try {
    return Date.now() < Number(localStorage.getItem(SNOOZE_KEY) || 0);
  } catch {
    return false;
  }
};

/**
 * Custom install dialog (<dialog>.showModal(): focus trap, Esc to close, ::backdrop for free).
 * Open it any time from a button with:  window.dispatchEvent(new Event('pwa:install'))
 */
export default function InstallPrompt() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const deferred = useRef<BeforeInstallPromptEvent | null>(null);
  const manualRef = useRef<Manual | null>(null);
  const shown = useRef(false);
  const [canNative, setCanNative] = useState(false);
  const [manual, setManual] = useState<Manual | null>(null);
  const [installed, setInstalled] = useState(false);

  const open = useCallback(() => {
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
  }, []);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    manualRef.current = detectManual();
    setManual(manualRef.current);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault(); // stop the browser's own mini-infobar; we show our dialog instead
      deferred.current = e as BeforeInstallPromptEvent;
      setCanNative(true);
    };
    const onInstalled = () => {
      deferred.current = null;
      setCanNative(false);
      setInstalled(true);
      dialogRef.current?.close();
    };
    const onOpenRequest = () => {
      if (deferred.current || manualRef.current) open();
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('pwa:install', onOpenRequest);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('pwa:install', onOpenRequest);
    };
  }, [open]);

  // Offer it once, a few seconds in, unless the user snoozed it recently
  const canInstall = !installed && (canNative || manual !== null);
  useEffect(() => {
    setCanInstall(canInstall); // lets <InstallButton /> show/hide itself
  }, [canInstall]);
  useEffect(() => {
    if (!canInstall || shown.current || isSnoozed()) return;
    const t = setTimeout(() => {
      shown.current = true;
      open();
    }, SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, [canInstall, open]);

  const install = async () => {
    const ev = deferred.current;
    if (!ev) return;
    dialogRef.current?.close();
    await ev.prompt();
    const { outcome } = await ev.userChoice;
    deferred.current = null; // the event can only be used once
    setCanNative(false);
    if (outcome === 'dismissed') snooze();
  };

  if (installed) return null;
  const steps = !canNative && manual ? STEPS[manual] : null;

  return (
    <dialog
      ref={dialogRef}
      onClose={snooze}
      onClick={e => {
        if (e.target === dialogRef.current) dialogRef.current?.close(); // click on the backdrop
      }}
      aria-labelledby="install-title"
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border-0 p-0 shadow-2xl backdrop:bg-indigo-950/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-4 bg-white p-5 text-gray-900 sm:p-6">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="" width={48} height={48} className="h-12 w-12 rounded-xl" />
          <div>
            <h2 id="install-title" className="text-lg font-bold leading-tight">
              Install Duas &amp; Prayer Times
            </h2>
            <p className="text-sm text-gray-500">Free • no app store</p>
          </div>
        </div>

        <ul className="flex flex-col gap-2 text-sm text-gray-700">
          {BENEFITS.map(b => (
            <li key={b} className="flex items-start gap-2.5">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-400" />
              {b}
            </li>
          ))}
        </ul>

        {steps && (
          <ol className="flex flex-col gap-2 rounded-xl bg-indigo-50 p-3.5 text-sm text-gray-800">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-400 text-xs font-bold text-gray-900">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="flex gap-2 pt-1">
          {canNative ? (
            <>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Not now
              </button>
              <button
                type="button"
                autoFocus
                onClick={install}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 active:scale-95 transition"
              >
                Install
              </button>
            </>
          ) : (
            <button
              type="button"
              autoFocus
              onClick={() => dialogRef.current?.close()}
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 active:scale-95 transition"
            >
              Got it
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}

/** Renders nothing if the app is already installed or this browser can't install it. */
export function InstallButton({ className = '' }: { className?: string }) {
  const canInstall = useCanInstall();
  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={openInstallDialog}
      className={`rounded-full bg-orange-400 px-4 py-2 text-sm font-bold text-gray-900 shadow-sm transition hover:bg-orange-300 active:scale-95 ${className}`}
    >
      Install app
    </button>
  );
}
