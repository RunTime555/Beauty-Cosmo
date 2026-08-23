'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 lg:left-auto lg:right-6 lg:translate-x-0 z-40 bg-white border border-[#EAE1DA] shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3 max-w-[92vw]">
      <div className="text-xs">
        <p className="font-bold text-[#2B2627]">Install Beauty Cosmo</p>
        <p className="text-[#8A8183] text-[10px]">Add the app to your home screen for quick access.</p>
      </div>
      <button
        onClick={handleInstall}
        className="bg-[#8C4A5A] hover:bg-[#733A48] text-white px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shrink-0"
      >
        <Download size={13} /> Install
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="text-[#8A8183] hover:text-[#2B2627] shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}
