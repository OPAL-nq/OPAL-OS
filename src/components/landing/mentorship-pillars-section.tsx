'use client';

import React from 'react';
import {
  Zap,
  Sparkles,
  Check,
  Video,
  Target,
  FileText,
  MessageSquare,
  BarChart3,
  BookOpen,
  Radio,
  Users2,
  Calculator,
  Shield,
} from 'lucide-react';

export function MentorshipPillarsSection() {
  return (
    <section id="programme" className="py-12 sm:py-24 relative scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-[11px] sm:text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>L'Offre la plus complète du marché</span>
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Les 2 Piliers Majeurs d'OPAL Intensive
          </h2>
          <p className="text-xs sm:text-base text-neutral-400 leading-relaxed">
            Vous ne payez pas seulement une formation. Vous investissez dans un{' '}
            <span className="text-white font-semibold">suivi 1-on-1 impitoyable</span> combiné à{' '}
            <span className="text-white font-semibold">l'infrastructure technologique complète</span>{' '}
            pour exécuter comme un fonds quantitatif.
          </p>
        </div>

        {/* 2 Big Pillars Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Pillar 1: Private 1-on-1 Mentoring */}
          <div className="rounded-3xl bg-[#141414] border border-[#39FF14]/40 p-5 sm:p-9 relative overflow-hidden shadow-[0_0_35px_rgba(57,255,20,0.12)] space-y-5 sm:space-y-7 group hover:border-[#39FF14] transition-colors">
            <div className="absolute top-0 right-0 bg-[#39FF14] text-black text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-3 sm:px-4 py-1.5 rounded-bl-2xl">
              Pilier Central
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.25)]">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  1. Mentorat Privé 1-on-1 avec Maxym
                </h3>
                <p className="text-xs text-[#39FF14] font-semibold">
                  Accompagnement individuel direct, chirurgical et sans filtre
                </p>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Maxym se connecte directement avec vous chaque semaine pour disséquer votre exécution,
                sécuriser votre capital et adapter votre stratégie à vos horaires et votre profil.
              </p>
            </div>

            <div className="space-y-2.5 sm:space-y-3.5 pt-1 sm:pt-2">
              {[
                {
                  icon: Video,
                  title: '2 sessions privées 1-on-1 par semaine',
                  desc: 'Coaching individuel approfondi de 45 à 60 min avec Maxym via votre calendrier réservé.',
                },
                {
                  icon: Target,
                  title: 'Audit continu de vos graphiques & trades',
                  desc: 'Analyse sans concession de vos entrées, sorties, gestion des stops et respect du plan.',
                },
                {
                  icon: Shield,
                  title: 'Ruleset personnalisé CME (NQ/ES)',
                  desc: 'Plan de risque institutionnel, verrouillage des pertes maximales et élimination du tilt.',
                },
                {
                  icon: MessageSquare,
                  title: 'Ligne directe prioritaire avec Maxym',
                  desc: 'Canal privé pour poser vos questions, valider des zones de prix et recevoir des retours.',
                },
                {
                  icon: FileText,
                  title: 'Cockpit dédié & comptes-rendus après séance',
                  desc: 'Objectifs clairs, feuilles de route personnalisées et synthèses archivées dans votre espace.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 sm:p-4 rounded-xl bg-black/40 border border-white/5 space-y-1 hover:border-[#39FF14]/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[#39FF14]/20 text-[#39FF14] flex items-center justify-center shrink-0">
                      <item.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-400 pl-8 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pillar 2: The OPAL Trading OS Ecosystem */}
          <div className="rounded-3xl bg-[#141414] border border-white/10 p-5 sm:p-9 relative overflow-hidden space-y-5 sm:space-y-7 hover:border-white/20 transition-colors">
            <div className="absolute top-0 right-0 bg-white/10 text-neutral-300 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-3 sm:px-4 py-1.5 rounded-bl-2xl">
              Technologie & Logiciel
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#39FF14]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  2. Tout l'Écosystème OPAL OS Inclus
                </h3>
                <p className="text-xs text-neutral-400 font-semibold">
                  Accès illimité à l'intégralité du logiciel de trading professionnel
                </p>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Aucun coût supplémentaire ni abonnement caché. En intégrant le mentorat, vous débloquez
                l'ensemble des outils technologiques développés sur-mesure pour les marchés Futures.
              </p>
            </div>

            <div className="space-y-2.5 sm:space-y-3.5 pt-1 sm:pt-2">
              {[
                {
                  icon: BarChart3,
                  title: 'Journal de Trading & Analytics Automatique',
                  desc: 'Importation de vos exécutions, calcul du PnL net, multiples R et statistiques en temps réel.',
                },
                {
                  icon: Calculator,
                  title: 'Calculatrices de Risque & Prop Firms',
                  desc: 'Simulateurs de contrats NQ/ES et gestion de trailing drawdown conçus pour Apex, Topstep...',
                },
                {
                  icon: BookOpen,
                  title: 'Academy Complète : Modules Institutionnels',
                  desc: 'Vidéos de formation, protocoles de session, analyse de liquidité et architecture CME.',
                },
                {
                  icon: Radio,
                  title: 'Live Sessions Hebdomadaires & Replays 24/7',
                  desc: 'Trading en direct pendant New York Open et rediffusions illimitées disponibles en HD.',
                },
                {
                  icon: Users2,
                  title: 'Communauté Privée d’Élite & Salons Thématiques',
                  desc: 'Échanges quotidiens, revues de pré-marché et partages de setups entre traders disciplinés.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 sm:p-4 rounded-xl bg-black/40 border border-white/5 space-y-1 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0">
                      <item.icon className="w-3.5 h-3.5 text-[#39FF14]" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-400 pl-8 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
