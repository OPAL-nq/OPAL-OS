'use client';

import React from 'react';
import Link from 'next/link';
import {
  Flame,
  ArrowRight,
  ShieldCheck,
  Lock,
  Zap,
  CheckCircle2,
  TrendingUp,
  Award,
  Users,
} from 'lucide-react';
import { trackInitiateCheckout } from '@/components/tracking/pixel-tracker';

export function HeroSection() {
  const handleCtaClick = () => {
    trackInitiateCheckout('Hero CTA - Rejoindre le Mentorat', 1998, 'EUR');
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[350px] sm:h-[450px] bg-[#39FF14]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-8">
        {/* Top Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#141414] border border-[#39FF14]/30 shadow-[0_0_25px_rgba(57,255,20,0.15)] animate-in fade-in duration-500">
          <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
          <Flame className="w-4 h-4 text-[#39FF14] fill-current" />
          <span className="text-xs font-black uppercase tracking-wider text-neutral-200">
            Programme Intensif • Accompagnement 1-on-1 & Écosystème OS
          </span>
        </div>

        {/* Main H1 Headline */}
        <div className="space-y-4 max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
            Dominez les Futures NQ & ES avec un{' '}
            <span className="relative whitespace-nowrap text-[#39FF14] drop-shadow-[0_0_35px_rgba(57,255,20,0.3)]">
              Mentor Dédié
            </span>{' '}
            et le Trading OS des Professionnels.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Cessez de perdre vos comptes financés à cause de l'émotion et du manque de cadre.
            Bénéficiez de <span className="text-white font-bold">2 sessions de coaching privé par semaine avec Maxym</span>,
            d'un audit chirurgical de vos sessions et de l'accès intégral au <span className="text-white font-bold">logiciel OPAL OS</span>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 max-w-md sm:max-w-xl mx-auto">
          <Link
            href="/checkout"
            onClick={handleCtaClick}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#39FF14] hover:bg-[#32e612] text-black font-black text-base tracking-tight shadow-[0_0_35px_rgba(57,255,20,0.4)] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 group"
          >
            <span>Rejoindre le Mentorat (1 998 €)</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#programme"
            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#141414] hover:bg-[#1c1c1c] text-neutral-200 hover:text-white border border-white/10 font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Découvrir le programme</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-neutral-400 font-medium">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>Paiement sécurisé Whop (CB, Apple Pay)</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>Déblocage immédiat de votre espace</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>Accompagnement individuel 1-on-1</span>
          </div>
        </div>

        {/* 4 Feature Highlights Cards */}
        <div className="pt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto text-left">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#141414]/90 border border-white/10 relative overflow-hidden group hover:border-[#39FF14]/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] mb-3">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">2 Calls / Sem</div>
            <p className="text-xs text-neutral-400 mt-1 font-medium leading-relaxed">
              Coaching privé 1-on-1 avec Maxym pour corriger chaque prise de décision.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#141414]/90 border border-white/10 relative overflow-hidden group hover:border-[#39FF14]/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#39FF14]">Audit Continu</div>
            <p className="text-xs text-neutral-400 mt-1 font-medium leading-relaxed">
              Analyse détaillée de vos sessions de trading et débriefing sans filtre de vos graphiques.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#141414]/90 border border-white/10 relative overflow-hidden group hover:border-[#39FF14]/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">OPAL OS Inclus</div>
            <p className="text-xs text-neutral-400 mt-1 font-medium leading-relaxed">
              Cockpit, Journal automatique, Calculatrice de risque & Academy complète.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#141414]/90 border border-white/10 relative overflow-hidden group hover:border-[#39FF14]/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] mb-3">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">NQ & ES</div>
            <p className="text-xs text-neutral-400 mt-1 font-medium leading-relaxed">
              Spécialisation exclusive sur les Futures CME (indices américains à fort volume).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
