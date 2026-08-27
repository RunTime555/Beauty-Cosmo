'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Only register in production. In dev, a cached service worker fights
    // Next.js's hot-reloading — it can serve a stale JS bundle alongside
    // freshly server-rendered HTML, causing hydration mismatches every
    // time you edit a file. Production builds do not have this problem
    // since there is no HMR to conflict with.
    if (process.env.NODE_ENV !== 'production') {
      // Also proactively unregister any service worker left over from a
      // previous production build/test on localhost, so dev stays clean.
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      return;
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Service worker registration failed:', err);
      });
    });
  }, []);

  return null;
}
