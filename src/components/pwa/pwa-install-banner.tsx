'use client';

import React, { useState, useEffect } from 'react';
import { Download, Share, X, Sparkles, Check } from 'lucide-react';

export function PwaInstallBanner() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return;
    }

    // Check if user previously dismissed prompt
    const dismissedAt = localStorage.getItem('opal_pwa_dismissed');
    if (dismissedAt) {
      const pastDays = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (pastDays < 7) {
        return;
      }
    }

    // Detect device platform
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    if (isIos) {
      setPlatform('ios');
      // Show on mobile after a short delay so user has seen the interface
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    if (isAndroid) {
      setPlatform('android');
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
  }, []);

  const handleInstallClick = async () => {
    if (platform === 'android' && deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('opal_pwa_dismissed', String(Date.now()));
  };

  if (!showPrompt) return null;

  return (
    <aside
      aria-label="Installation de l'application OPAL OS"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-sm rounded-2xl bg-[#141414]/95 backdrop-blur-xl border border-[#39FF14]/40 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1c1c1c] border border-[#39FF14]/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(57,255,20,0.25)]">
            <div className="w-3 h-3 rounded-full bg-[#39FF14] shadow-[0_0_8px_#39FF14]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-white flex items-center gap-1.5 truncate">
              <span>Installer OPAL OS</span>
              <span className="px-1.5 py-0.2 rounded bg-[#39FF14]/20 text-[#39FF14] text-[9px] font-bold">App</span>
            </h4>
            <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">
              Accès plein écran instantané sur votre smartphone
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-neutral-500 hover:text-white p-1 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-neutral-300">
        {platform === 'ios' ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-[#39FF14]">
              <Share className="w-3.5 h-3.5" />
            </div>
            <p className="leading-snug">
              Touchez <strong>Partager</strong> puis <strong>« Sur l'écran d'accueil »</strong> pour installer.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full py-2 px-3 rounded-xl bg-[#39FF14] hover:bg-[#32e612] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.3)] active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ajouter à l'écran d'accueil</span>
          </button>
        )}
      </div>
    </aside>
  );
}
