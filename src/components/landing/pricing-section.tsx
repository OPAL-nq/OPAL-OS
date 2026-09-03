'use client';

import React from 'react';
import Link from 'next/link';
import {
  Flame,
  Check,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  Award,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { trackInitiateCheckout } from '@/components/tracking/pixel-tracker';

export function PricingSection() {
  const handleCtaClick = () => {
    trackInitiateCheckout('Pricing CTA - Réserver ma place', 1998, 'EUR');
  };

  return (
    <section id="pricing" className="py-20 sm:py-28 relative scroll-mt-20">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#39FF14]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(57,255,20,0.15)]">
            <Flame className="w-4 h-4 fill-current" />
            <span>Tarification Claire • Zéro Frais Caché</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Investissez dans Votre Réussite avec OPAL Intensive
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Un accompagnement d'élite 1-on-1 pour éliminer vos erreurs, valider vos comptes financés
            et rentabiliser votre investissement sur les marchés Futures CME.
          </p>
        </div>

        {/* Big Master Offer Card */}
        <div className="rounded-3xl bg-[#141414] border border-[#39FF14]/50 p-6 sm:p-10 relative overflow-hidden shadow-[0_0_50px_rgba(57,255,20,0.15)] bg-gradient-to-b from-[#141414] via-[#141414] to-[#122212]">
          <div className="absolute top-0 right-0 bg-[#39FF14] text-black text-xs font-black uppercase tracking-wider px-5 py-1.5 rounded-bl-2xl shadow-lg">
            Mentorat 1-on-1 • Accès Complet
          </div>

          <div className="space-y-8">
            {/* Price Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
                    <Flame className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white">
                      OPAL Intensive
                    </h3>
                    <span className="text-xs text-[#39FF14] font-bold uppercase tracking-wider">
                      Mentorat Privé 1-on-1 + Écosystème OS Complet
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-lg leading-relaxed">
                  L'accompagnement individuel sur-mesure avec Maxym et la suite logicielle complète
                  des Futures NQ & ES.
                </p>
              </div>

              <div className="shrink-0 text-left md:text-right space-y-1">
                <div className="flex items-baseline gap-2 md:justify-end">
                  <span className="text-4xl sm:text-6xl font-black text-[#39FF14] tracking-tight">
                    1 998 €
                  </span>
                </div>
                <div className="text-xs font-semibold text-neutral-400">
                  Paiement unique • Accès complet
                </div>
              </div>
            </div>

            {/* Value Stack Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Pillar 1 bullets */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#39FF14]">
                  <Zap className="w-4 h-4" />
                  <span>Accompagnement 1-on-1 Privé</span>
                </div>
                <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-200">
                  {[
                    '2 sessions de coaching privé 1-on-1 par semaine avec Maxym (45-60 min)',
                    'Audit continu de vos sessions de trading et débriefing graphique',
                    'Cockpit Intensive dédié débloqué (objectifs, feuilles de route, comptes-rendus)',
                    'Élaboration de votre Ruleset personnalisé (gestion du risque et setups A+)',
                    'Canal de messagerie privée prioritaire direct avec Maxym',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#39FF14]/20 text-[#39FF14] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pillar 2 bullets */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-300">
                  <Sparkles className="w-4 h-4 text-[#39FF14]" />
                  <span>Suite Logicielle OPAL OS Incluse</span>
                </div>
                <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-200">
                  {[
                    'Dashboard Trading OS & gestionnaire de sessions NQ/ES',
                    'Journal de trading automatique & calcul instantané du PnL / Multiple R',
                    'Calculatrices de risque avancées & simulateur Prop Firms (Apex, Topstep...)',
                    'Academy complète : formations institutionnelles et protocoles',
                    'Live Sessions hebdomadaires en direct & replays illimités 24/7',
                    'Communauté privée d’élite & salons thématiques exclusifs',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-[#39FF14] stroke-[3]" />
                      </div>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-4 space-y-4">
              <Link
                href="/checkout"
                onClick={handleCtaClick}
                className="w-full py-5 px-6 rounded-2xl font-black text-base sm:text-lg bg-[#39FF14] hover:bg-[#32e612] text-black shadow-[0_0_40px_rgba(57,255,20,0.45)] flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-95 group text-center"
              >
                <CreditCard className="w-6 h-6 text-black shrink-0" />
                <span>Réserver ma place au Mentorat — 1 998 €</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <p className="text-center text-xs text-neutral-400">
                Paiement sécurisé partenaire Whop (CB, Apple Pay, Google Pay). Accès immédiat au cockpit.
              </p>
            </div>

            {/* Trust Seals */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#39FF14] shrink-0" />
                <div className="text-[11px]">
                  <div className="font-bold text-white">Chiffrement SSL 256-bit</div>
                  <div className="text-neutral-400">Transactions 100% sécurisées</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
                <Lock className="w-5 h-5 text-white shrink-0" />
                <div className="text-[11px]">
                  <div className="font-bold text-white">Partenaire Whop Officiel</div>
                  <div className="text-neutral-400">Protection acheteur mondiale</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
                <Award className="w-5 h-5 text-[#39FF14] shrink-0" />
                <div className="text-[11px]">
                  <div className="font-bold text-white">Activation Immédiate</div>
                  <div className="text-neutral-400">Réservation directe des créneaux</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
