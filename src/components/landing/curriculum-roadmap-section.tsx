'use client';

import React from 'react';
import { Target, ShieldCheck, Compass, CheckCircle2 } from 'lucide-react';

export function CurriculumRoadmapSection() {
  const steps = [
    {
      number: '01',
      title: 'Audit & Cadrage Initial',
      desc: 'Analyse sans concession de votre historique, identification chirurgicale de vos biais psychologiques et paramétrage de votre Cockpit personnalisé.',
      details: [
        'Audit de vos sessions de trading passées',
        'Identification de vos fuites de capital (overtrading, stops décalés)',
        'Définition de vos objectifs de gains réalistes et mesurables',
      ],
    },
    {
      number: '02',
      title: 'Ruleset Institutionnel (NQ & ES)',
      desc: 'Mise en place de votre cadre d’exécution strict sur les Futures CME : configurations A+, gestion mathématique du risque et élimination du doute.',
      details: [
        'Protocoles d’entrées et sorties standardisés',
        'Calcul automatique des contrats au tick près',
        'Adaptation exacte aux règles des Prop Firms',
      ],
    },
    {
      number: '03',
      title: 'Accompagnement 1-on-1 & Débriefings',
      desc: '2 sessions privées par semaine avec Maxym pour analyser vos prises de décision, corriger vos dérives et valider chaque étape de progression.',
      details: [
        'Débriefing visio de 45 à 60 minutes deux fois par semaine',
        'Revue détaillée de vos graphiques de trade',
        'Ajustement continu de votre psychologie de marché',
      ],
    },
    {
      number: '04',
      title: 'Validation Prop Firms & Payouts',
      desc: 'Validation sereine de vos comptes financés, protection stricte du buffer de trailing drawdown et encaissement régulier de vos premiers retraits.',
      details: [
        'Validation de comptes financés 50k, 100k ou 150k',
        'Sécurisation des seuils de retrait (payouts)',
        'Passage à l’échelle sur capital personnel & multiples comptes',
      ],
    },
  ];

  return (
    <section id="methode" className="py-16 sm:py-24 border-t border-white/5 bg-[#0D0D0D]/40 relative scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>Feuille de Route Structurée</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Le Protocole en 4 Étapes vers la Régularité
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Une méthode pas à pas, éprouvée sur le terrain des marchés Futures américains,
            pour vous transformer d'un trader émotionnel en un opérateur discipliné.
          </p>
        </div>

        {/* 4 Step Horizontal / Vertical Progression */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-4 relative flex flex-col justify-between hover:border-[#39FF14]/40 transition-colors group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black font-mono text-[#39FF14]">
                    {step.number}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#39FF14]/40 group-hover:bg-[#39FF14] transition-colors" />
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">
                  {step.title}
                </h3>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-2">
                {step.details.map((detail, dIdx) => (
                  <div key={dIdx} className="flex items-start gap-2 text-[11px] text-neutral-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#39FF14] shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
