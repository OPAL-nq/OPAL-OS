'use client';

import React from 'react';
import { XCircle, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

export function ProblemSolutionSection() {
  return (
    <section className="py-12 sm:py-24 border-t border-white/5 bg-[#0D0D0D]/50 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>La réalité sans filtre du marché</span>
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Pourquoi 95% des traders échouent sur les Futures NQ & ES
          </h2>
          <p className="text-xs sm:text-base text-neutral-400 leading-relaxed">
            Le problème n'est pas le marché, ni votre intelligence. C'est l'absence d'un cadre
            systématique et le fait d'opérer seul, sans mentor pour bloquer vos dérives émotionnelles.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-stretch">
          {/* Box 1: The Retail Way (Failure loop) */}
          <div className="p-4 sm:p-8 rounded-2xl bg-[#141414] border border-red-500/20 space-y-5 sm:space-y-6 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Le Trader Retail Isolé</h3>
                <p className="text-[11px] sm:text-xs text-red-400/80 font-medium">
                  Le cycle sans fin de la frustration et des comptes grillés
                </p>
              </div>
            </div>

            <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-neutral-300">
              <li className="flex items-start gap-2.5 sm:gap-3">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Trading impulsif :</strong> Prise de position sans confluence stricte, dictée par la peur de rater le mouvement (FOMO).
                </span>
              </li>
              <li className="flex items-start gap-2.5 sm:gap-3">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Gestion du risque chaotique :</strong> Tailles de lots aléatoires qui dépassent les drawdowns stricts des Prop Firms CME.
                </span>
              </li>
              <li className="flex items-start gap-2.5 sm:gap-3">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Sur-trading & Tilt :</strong> Perte de lucidité après une série négative en tentant de « se refaire » immédiatement.
                </span>
              </li>
              <li className="flex items-start gap-2.5 sm:gap-3">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Solitude totale :</strong> Personne pour analyser objectivement vos sessions, corriger vos biais ou exiger des comptes.
                </span>
              </li>
            </ul>

            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-[10px] sm:text-[11px] text-red-300/80 text-center font-medium leading-relaxed">
              Résultat : Des milliers d'euros perdus en réinitialisations et stagnation.
            </div>
          </div>

          {/* Box 2: The OPAL Intensive Way (Professional & Systematic) */}
          <div className="p-4 sm:p-8 rounded-2xl bg-gradient-to-b from-[#141414] to-[#0f1f11] border border-[#39FF14]/40 space-y-5 sm:space-y-6 relative overflow-hidden shadow-[0_0_35px_rgba(57,255,20,0.1)]">
            <div className="absolute top-0 right-0 bg-[#39FF14] text-black text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-bl-xl shadow-md">
              Méthode OPAL
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">L'Approche OPAL Intensive</h3>
                <p className="text-[11px] sm:text-xs text-[#39FF14] font-medium">
                  Rigueur institutionnelle, exécution millimétrée & mentor dédié
                </p>
              </div>
            </div>

            <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-neutral-200">
              <li className="flex items-start gap-2.5 sm:gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                <span>
                  <strong>Ruleset chirurgical NQ/ES :</strong> Entrées uniquement sur des configurations A+ institutionnelles à haute espérance de gain.
                </span>
              </li>
              <li className="flex items-start gap-2.5 sm:gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                <span>
                  <strong>Risk Management verrouillé :</strong> Calcul automatisé des contrats pour préserver intact le buffer de drawdown de vos comptes.
                </span>
              </li>
              <li className="flex items-start gap-2.5 sm:gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                <span>
                  <strong>Discipline & Débriefing 1-on-1 :</strong> 2 sessions individuelles par semaine avec Maxym pour auditer chaque clic et supprimer vos biais.
                </span>
              </li>
              <li className="flex items-start gap-2.5 sm:gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                <span>
                  <strong>Cockpit Technologique OPAL :</strong> Journal automatique, calcul du multiple R, feuilles de route et communauté privée.
                </span>
              </li>
            </ul>

            <div className="p-3 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/20 text-[10px] sm:text-[11px] text-[#39FF14] text-center font-bold leading-relaxed">
              Résultat : Une régularité mathématique, des comptes prop firms validés et des retraits sécurisés.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
