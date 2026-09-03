'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X, User } from 'lucide-react';
import { trackInitiateCheckout } from '@/components/tracking/pixel-tracker';

export function LandingNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCtaClick = () => {
    trackInitiateCheckout('Nav CTA - Rejoindre le Mentorat', 1998, 'EUR');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0A0A0A]/90 backdrop-blur-xl transition-all">
      {/* Top micro alert banner */}
      <div className="bg-gradient-to-r from-[#141414] via-[#1a2e16] to-[#141414] border-b border-white/5 py-1.5 px-3 sm:px-4 text-center">
        <p className="text-[10px] sm:text-xs font-semibold text-neutral-300 flex items-center justify-center gap-1.5 sm:gap-2 truncate">
          <span className="flex h-2 w-2 shrink-0 rounded-full bg-[#39FF14] animate-pulse" />
          <span className="truncate">Accompagnement 1-on-1 personnalisé avec Maxym</span>
          <span className="text-white/40 hidden sm:inline">•</span>
          <span className="text-[#39FF14] font-bold hidden sm:inline">
            Suivi individuel continu
          </span>
        </p>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#141414] border border-[#39FF14]/40 flex items-center justify-center group-hover:border-[#39FF14] group-hover:shadow-[0_0_15px_rgba(57,255,20,0.25)] transition-all">
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#39FF14] shadow-[0_0_10px_#39FF14]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-lg font-black tracking-wider text-white leading-none">
              OPAL
            </span>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-[#39FF14] font-extrabold leading-tight">
              Intensive OS
            </span>
          </div>
        </Link>

        {/* Center Quick Anchors (desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-neutral-400">
          <a href="#programme" className="hover:text-white transition-colors">
            Le Programme
          </a>
          <a href="#cockpit" className="hover:text-white transition-colors">
            L'Écosystème OS
          </a>
          <a href="#methode" className="hover:text-white transition-colors">
            Méthode
          </a>
          <a href="#pricing" className="hover:text-white transition-colors">
            Tarif & Inscription
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Member Login Button */}
          <Link
            href="/login"
            className="text-xs font-semibold text-neutral-300 hover:text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <User className="w-3.5 h-3.5 text-neutral-400 sm:hidden" />
            <span className="hidden sm:inline">Déjà membre ?</span>
            <span className="text-white font-bold hidden xs:inline">Se connecter</span>
            <span className="text-white font-bold xs:hidden text-[11px]">Connexion</span>
          </Link>

          {/* Checkout CTA */}
          <Link
            href="/checkout"
            onClick={handleCtaClick}
            className="relative group overflow-hidden px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#32e612] text-black font-extrabold text-xs sm:text-sm tracking-tight shadow-[0_0_20px_rgba(57,255,20,0.35)] transition-all active:scale-95 flex items-center gap-1.5 sm:gap-2 shrink-0"
          >
            <span>Rejoindre</span>
            <span className="hidden sm:inline font-black">(1 998 €)</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu mobile"
            className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 text-[#39FF14]" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0E0E0E] px-4 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <a
              href="#programme"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-white/5 border border-white/5 text-neutral-300 hover:text-white hover:border-[#39FF14]/30 transition-all flex items-center justify-between"
            >
              <span>Programme 1-on-1</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#39FF14]" />
            </a>
            <a
              href="#cockpit"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-white/5 border border-white/5 text-neutral-300 hover:text-white hover:border-[#39FF14]/30 transition-all flex items-center justify-between"
            >
              <span>Cockpit OS</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#39FF14]" />
            </a>
            <a
              href="#methode"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-white/5 border border-white/5 text-neutral-300 hover:text-white hover:border-[#39FF14]/30 transition-all flex items-center justify-between"
            >
              <span>Méthode en 4 Étapes</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#39FF14]" />
            </a>
            <a
              href="#pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-white/5 border border-white/5 text-neutral-300 hover:text-white hover:border-[#39FF14]/30 transition-all flex items-center justify-between"
            >
              <span>Tarif 1 998 €</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#39FF14]" />
            </a>
            <a
              href="#faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="col-span-2 p-3 rounded-xl bg-white/5 border border-white/5 text-neutral-300 hover:text-white hover:border-[#39FF14]/30 transition-all flex items-center justify-between"
            >
              <span>Questions Fréquentes (FAQ)</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#39FF14]" />
            </a>
          </div>

          <div className="pt-2">
            <Link
              href="/checkout"
              onClick={handleCtaClick}
              className="w-full py-3.5 rounded-xl bg-[#39FF14] text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(57,255,20,0.3)]"
            >
              <span>Accéder au Checkout du Mentorat (1 998 €)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
