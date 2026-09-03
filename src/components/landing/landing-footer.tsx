'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { trackInitiateCheckout } from '@/components/tracking/pixel-tracker';

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#080808] text-neutral-400 text-xs py-12 pb-24 sm:pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Top brand & navigation row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-white/5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#39FF14]/40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#39FF14]" />
              </div>
              <span className="text-base font-black text-white tracking-wider">
                OPAL <span className="text-[#39FF14]">OS</span>
              </span>
            </div>
            <p className="text-neutral-400 text-xs max-w-sm leading-relaxed">
              Le système d'exploitation et de mentorat d'élite pour les opérateurs de marché Futures CME (NQ & ES).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold">
            <a href="#programme" className="hover:text-white transition-colors">
              Programme 1-on-1
            </a>
            <a href="#cockpit" className="hover:text-white transition-colors">
              Logiciel OS
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Offre 1 998 €
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
            <Link href="/login" className="text-white hover:text-[#39FF14] transition-colors">
              Espace Membre
            </Link>
          </div>
        </div>

        {/* CFTC & Financial Regulatory Disclaimer */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141414]/60 border border-white/5 space-y-2 text-[11px] leading-relaxed text-neutral-400">
          <div className="flex items-center gap-2 text-neutral-300 font-bold uppercase tracking-wider text-[10px]">
            <ShieldAlert className="w-3.5 h-3.5 text-neutral-400" />
            <span>Avertissement sur les risques financiers (Futures CME)</span>
          </div>
          <p>
            Le trading de contrats à terme (Futures CME - NQ, ES) et de produits financiers à effet de levier présente un risque élevé de perte et peut ne pas convenir à tous les investisseurs. Les performances passées ne préjugent pas des résultats futurs.
          </p>
          <p>
            OPAL OS et ses mentors fournissent un accompagnement pédagogique, méthodologique et des outils logiciels d'analyse. Aucun élément partagé ne constitue un conseil en investissement personnalisé ou une incitation à spéculer au sens de la réglementation financière.
          </p>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400 pt-2">
          <div>
            © {new Date().getFullYear()} OPAL OS. Tous droits réservés.
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/checkout"
              onClick={() => trackInitiateCheckout('Footer Link - Accès Inscription Checkout', 1998, 'EUR')}
              className="text-[#39FF14] hover:underline"
            >
              Accès Inscription Checkout
            </Link>
            <span>•</span>
            <Link href="/login" className="hover:text-white transition-colors">
              Connexion Membre
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
