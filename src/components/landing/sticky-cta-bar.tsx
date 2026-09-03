'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, ArrowRight, ShieldCheck } from 'lucide-react';
import { trackInitiateCheckout } from '@/components/tracking/pixel-tracker';

export function StickyCtaBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Reveal bar after scrolling down past initial hero screen
      if (window.scrollY > 480) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  const handleCtaClick = () => {
    trackInitiateCheckout('Sticky Bar CTA - Rejoindre le Mentorat', 1998, 'EUR');
  };

  return (
    <aside
      aria-label="Barre d'action rapide d'inscription"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-xl border-t border-[#39FF14]/30 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] px-3 sm:px-6 shadow-[0_-10px_35px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-300"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Left info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#39FF14]/20 text-[#39FF14] flex items-center justify-center shrink-0 hidden sm:flex">
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-black text-white truncate">
                OPAL Intensive <span className="text-[#39FF14]">(1 998 €)</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14]/30 px-1.5 sm:px-2 py-0.5 rounded uppercase hidden md:inline">
                2 Calls / Semaine
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 truncate hidden xs:block">
              Mentorat privé 1-on-1 + Accès intégral logiciel OPAL OS
            </p>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="text-xs text-neutral-400 font-semibold hidden lg:inline">
            Suivi direct avec Maxym
          </span>
          <Link
            href="/checkout"
            onClick={handleCtaClick}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#32e612] text-black font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(57,255,20,0.4)] flex items-center gap-1.5 sm:gap-2 transition-all active:scale-95 shrink-0"
          >
            <span>Rejoindre</span>
            <span className="hidden xs:inline">le Mentorat</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
