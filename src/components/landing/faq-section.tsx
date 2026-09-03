'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: "Quel niveau d'expérience faut-il avoir pour rejoindre le mentorat ?",
      answer:
        "L'accompagnement s'adapte à votre profil grâce au diagnostic initial. Que vous ayez déjà des bases techniques sans parvenir à la rentabilité, ou que vous soyez en phase de passage de comptes prop firms, Maxym calibre chaque séance pour éliminer vos erreurs spécifiques et vous faire progresser à votre rythme.",
    },
    {
      question: "Comment se planifient les 2 sessions privées 1-on-1 par semaine ?",
      answer:
        "Dès votre inscription, vous débloquez le module de réservation dans votre Cockpit Intensive. Vous pouvez choisir librement vos 2 créneaux hebdomadaires parmi les disponibilités proposées, avec une flexibilité totale pour s'adapter à votre emploi du temps professionnel ou personnel.",
    },
    {
      question: "L'accès au logiciel OPAL OS est-il vraiment inclus sans abonnement supplémentaire ?",
      answer:
        "Oui, à 100%. L'intégralité de l'écosystème OPAL (Cockpit de trading, Journal avec calcul automatique du multiple R, Calculatrices de risque, Academy institutionnelle, Replays et Communauté) est incluse dans les 1 998 €. Aucun abonnement récurrent ni frais caché ne vous sera facturé pour la plateforme.",
    },
    {
      question: "Le mentorat est-il adapté pour réussir les comptes Prop Firms (Apex, Topstep, etc.) ?",
      answer:
        "C'est l'un des piliers majeurs du programme. Nos stratégies et nos calculateurs sont rigoureusement calibrés pour respecter les drawdowns serrés des prop firms CME. Vous apprenez à dimensionner vos positions pour ne jamais mettre votre compte en danger et sécuriser des payouts réguliers.",
    },
    {
      question: "Sur quels marchés financiers le mentorat est-il axé ?",
      answer:
        "Nous nous concentrons exclusivement sur les marchés Futures réglementés du CME (Chicago Mercantile Exchange), principalement le Nasdaq 100 (NQ / MNQ) et le S&P 500 (ES / MES). Ce sont les marchés les plus liquides, transparents et adaptés à une exécution professionnelle sans manipulation.",
    },
    {
      question: "Comment se déroule l'activation après le paiement ?",
      answer:
        "L'activation est instantanée. Dès la confirmation sur notre terminal sécurisé Whop, vous définissez votre mot de passe et accédez immédiatement à votre Cockpit OPAL Intensive pour planifier votre première séance d'audit avec Maxym.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 border-t border-white/5 bg-[#0D0D0D]/30 relative scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>Foire Aux Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Toutes vos Questions sur le Mentorat
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Obtenez des réponses claires et transparentes sur le déroulement de votre accompagnement.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-[#141414] border-[#39FF14]/40 shadow-[0_0_25px_rgba(57,255,20,0.06)]'
                    : 'bg-[#141414]/70 border-white/10 hover:border-white/20'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 select-none"
                >
                  <span className="text-sm sm:text-base font-bold text-white leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'bg-[#39FF14] text-black rotate-180'
                        : 'bg-white/5 text-neutral-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/5 pt-4 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
