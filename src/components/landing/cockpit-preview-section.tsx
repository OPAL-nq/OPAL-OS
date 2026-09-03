'use client';

import React, { useState } from 'react';
import {
  Layers,
  Calendar,
  BarChart3,
  BookOpen,
  Radio,
  CheckCircle2,
  TrendingUp,
  Clock,
  Zap,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export function CockpitPreviewSection() {
  const [activeTab, setActiveTab] = useState<'intensive' | 'journal' | 'academy' | 'live'>('intensive');

  return (
    <section id="cockpit" className="py-16 sm:py-24 border-t border-white/5 bg-[#0A0A0A] relative scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>Immersion Logicielle</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explorez l'Intérieur du Cockpit OPAL
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Dès votre inscription, vous accédez à un environnement sur-mesure spécialement configuré
            pour accélérer votre rentabilité et documenter chaque étape de votre mentorat.
          </p>
        </div>

        {/* Tab Navigation (2x2 grid on mobile, flex on desktop) */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-[#141414] border border-white/10 max-w-2xl mx-auto w-full">
          <button
            type="button"
            onClick={() => setActiveTab('intensive')}
            className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeTab === 'intensive'
                ? 'bg-[#39FF14] text-black shadow-[0_0_20px_rgba(57,255,20,0.3)]'
                : 'text-neutral-400 hover:text-white bg-white/[0.02] sm:bg-transparent'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="truncate">Cockpit 1-on-1</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('journal')}
            className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeTab === 'journal'
                ? 'bg-[#39FF14] text-black shadow-[0_0_20px_rgba(57,255,20,0.3)]'
                : 'text-neutral-400 hover:text-white bg-white/[0.02] sm:bg-transparent'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span className="truncate">Journal & Métriques</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('academy')}
            className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeTab === 'academy'
                ? 'bg-[#39FF14] text-black shadow-[0_0_20px_rgba(57,255,20,0.3)]'
                : 'text-neutral-400 hover:text-white bg-white/[0.02] sm:bg-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="truncate">Academy & Setups</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeTab === 'live'
                ? 'bg-[#39FF14] text-black shadow-[0_0_20px_rgba(57,255,20,0.3)]'
                : 'text-neutral-400 hover:text-white bg-white/[0.02] sm:bg-transparent'
            }`}
          >
            <Radio className="w-4 h-4 shrink-0" />
            <span className="truncate">Live & Replays</span>
          </button>
        </div>

        {/* Tab Content Display Container */}
        <div className="rounded-3xl bg-[#141414] border border-white/10 p-4 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Mock Browser Topbar */}
          <div className="flex items-center justify-between pb-4 sm:pb-6 mb-6 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-[11px] font-mono text-neutral-400 ml-2 hidden sm:inline">
                https://app.opal.trade/{activeTab === 'intensive' ? 'intensive' : activeTab}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#39FF14] bg-[#39FF14]/10 px-2.5 py-1 rounded-md border border-[#39FF14]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
              <span>SYSTÈME EN LIGNE</span>
            </div>
          </div>

          {/* TAB 1: COCKPIT INTENSIVE */}
          {activeTab === 'intensive' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Next Coaching Session */}
                <div className="p-5 rounded-2xl bg-black/60 border border-[#39FF14]/30 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#39FF14]" />
                      Prochain Coaching 1-on-1
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#39FF14]/20 text-[#39FF14] text-[10px] font-bold">
                      Confirmé
                    </span>
                  </div>
                  <div className="text-xl font-black text-white">Jeudi 16:30 CEST</div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Séance #04 avec Maxym : Revue de session NQ, audit de l'exécution et ajustement des seuils de stop loss.
                  </p>
                  <div className="pt-2">
                    <div className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-center text-xs text-neutral-300 font-semibold">
                      Accéder à la salle visio privée
                    </div>
                  </div>
                </div>

                {/* Card 2: Objective Tracker */}
                <div className="p-5 rounded-2xl bg-black/60 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#39FF14]" />
                      Suivi des Objectifs
                    </span>
                    <span className="text-xs font-mono font-bold text-[#39FF14]">Actif</span>
                  </div>
                  <div className="text-lg font-bold text-white">Validation & Paliers de Risque</div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#39FF14] rounded-full shadow-[0_0_10px_#39FF14]" style={{ width: '75%' }} />
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Surveillance continue du drawdown maximal autorisé, respect strict du plan et sécurisation du capital.
                  </p>
                </div>

                {/* Card 3: Direct Mentor Line */}
                <div className="p-5 rounded-2xl bg-black/60 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
                      Canal Privé avec Maxym
                    </span>
                    <span className="text-[10px] text-[#39FF14] font-mono">Messagerie directe</span>
                  </div>
                  <div className="text-xs text-neutral-200 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed">
                    Échangez directement avec Maxym entre vos sessions pour soumettre vos graphiques, poser vos questions et débriefer vos prises de position.
                  </div>
                  <div className="text-[11px] text-[#39FF14] font-semibold flex items-center gap-1">
                    <span>Ligne directe réservée aux élèves Intensive</span>
                  </div>
                </div>
              </div>

              {/* Coaching Report Table Preview */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Synthèses de coaching & plans d'action personnalisés
                </div>
                <div className="divide-y divide-white/5 text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-neutral-400">Séance 1-on-1</span>
                      <span className="text-white font-medium">Revue des exécutions NQ/ES & Cadrage de session</span>
                    </div>
                    <span className="text-[#39FF14] font-mono">Compte-rendu disponible</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-neutral-400">Séance 1-on-1</span>
                      <span className="text-white font-medium">Paramétrage du simulateur et gestion du Drawdown</span>
                    </div>
                    <span className="text-[#39FF14] font-mono">Compte-rendu disponible</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JOURNAL & METRICS */}
          {activeTab === 'journal' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-xl bg-black/50 border border-white/5 space-y-1">
                  <div className="text-[11px] text-neutral-400 font-medium">Calcul du Winrate</div>
                  <div className="text-xl font-black text-[#39FF14]">Automatisé</div>
                  <div className="text-[10px] text-neutral-400">Taux de réussite en %</div>
                </div>
                <div className="p-4 rounded-xl bg-black/50 border border-white/5 space-y-1">
                  <div className="text-[11px] text-neutral-400 font-medium">Multiple R Moyen</div>
                  <div className="text-xl font-black text-white">Calcul en R</div>
                  <div className="text-[10px] text-neutral-400">Ratio Risque / Gain réel</div>
                </div>
                <div className="p-4 rounded-xl bg-black/50 border border-white/5 space-y-1">
                  <div className="text-[11px] text-neutral-400 font-medium">Facteur de Profit</div>
                  <div className="text-xl font-black text-white">Temps réel</div>
                  <div className="text-[10px] text-neutral-400">Gains bruts / Pertes brutes</div>
                </div>
                <div className="p-4 rounded-xl bg-black/50 border border-white/5 space-y-1">
                  <div className="text-[11px] text-neutral-400 font-medium">Max Drawdown</div>
                  <div className="text-xl font-black text-emerald-400">Alerte Seuil</div>
                  <div className="text-[10px] text-neutral-400">Protection du capital</div>
                </div>
              </div>

              {/* Trade Log list */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Journal d'exécution des sessions Futures (Aperçu)
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">Futures Nasdaq (NQ / MNQ)</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">ACHAT</span>
                      <span className="text-neutral-400 hidden sm:inline">Set-up Institutionnel A+</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono font-bold">
                      <span className="text-[#39FF14]">Calcul R automatique</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">Futures S&P 500 (ES / MES)</span>
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">VENTE</span>
                      <span className="text-neutral-400 hidden sm:inline">Break & Retest de niveau</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono font-bold">
                      <span className="text-[#39FF14]">Calcul R automatique</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACADEMY */}
          {activeTab === 'academy' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-black/60 border border-white/5 space-y-2">
                  <div className="text-xs font-mono text-[#39FF14]">MODULE 01</div>
                  <h4 className="text-sm font-bold text-white">Architecture des Marchés CME</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Comprendre le carnet d'ordres, la liquidité institutionnelle et le flux NQ/ES.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-black/60 border border-white/5 space-y-2">
                  <div className="text-xs font-mono text-[#39FF14]">MODULE 02</div>
                  <h4 className="text-sm font-bold text-white">Setups A+ & Entrées Systématiques</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Prises de position millimétrées : critères de validation sans ambiguïté.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-black/60 border border-white/5 space-y-2">
                  <div className="text-xs font-mono text-[#39FF14]">MODULE 03</div>
                  <h4 className="text-sm font-bold text-white">Psychologie & Gestion du Drawdown</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Éliminer le FOMO, survivre aux séries négatives et sécuriser les comptes financés.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE & SALONS */}
          {activeTab === 'live' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-6 rounded-2xl bg-black/60 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-[#39FF14]">
                    <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
                    <span>Salle de Live Trading NQ/ES</span>
                  </div>
                  <h4 className="text-base font-bold text-white">Session New York Open en direct</h4>
                  <p className="text-xs text-neutral-400">
                    Analyse des niveaux en pré-ouverture et prise de position commentée en direct.
                  </p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold text-white shrink-0">
                  Replays illimités disponibles 24/7
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
