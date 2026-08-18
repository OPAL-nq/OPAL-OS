'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PsychologyMetrics, EmotionalState, StopDiscipline } from '@/types/psychology';
import { HeartHandshake, ShieldCheck, Flame, Zap, BatteryLow, Smile } from 'lucide-react';

interface EmotionalMatrixChartProps {
  metrics: PsychologyMetrics;
}

const EMOTIONS_CONFIG: Record<
  EmotionalState,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }
> = {
  calm: {
    label: 'Calme & Serein',
    icon: Smile,
    color: 'text-[#39FF14]',
    bg: 'bg-[#39FF14]/10',
    border: 'border-[#39FF14]/25',
  },
  fomo: {
    label: 'Impatient / FOMO',
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
  },
  revenge: {
    label: 'Vengeance / Frustration',
    icon: Flame,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/25',
  },
  fatigued: {
    label: 'Fatigue / Déconcentration',
    icon: BatteryLow,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/25',
  },
};

const STOPS_CONFIG: Record<
  StopDiscipline,
  { label: string; desc: string; color: string; bg: string; border: string }
> = {
  respected: {
    label: 'Stop 100% Respecté',
    desc: 'Intact sans intervention panique',
    color: 'text-[#39FF14]',
    bg: 'bg-[#39FF14]/10',
    border: 'border-[#39FF14]/25',
  },
  moved_early: {
    label: 'Déplacé Trop Tôt',
    desc: 'BE prématuré ou coupure d\'impulsion',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
  },
  widened_or_removed: {
    label: 'Élargi ou Supprimé',
    desc: 'Erreur majeure de gestion du risque',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/25',
  },
};

export function EmotionalMatrixChart({ metrics }: EmotionalMatrixChartProps) {
  const { emotionalBreakdown, stopDisciplineBreakdown } = metrics;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Emotional Matrix */}
      <Card className="bg-[#141414] border-white/10 overflow-hidden shadow-xl">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4 text-[#39FF14]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Matrice Émotionnelle vs Rentabilité</h3>
              <p className="text-[11px] text-neutral-400">Impact de votre état mental sur le Winrate et l'espérance en R</p>
            </div>
          </div>

          <div className="space-y-3">
            {(Object.keys(EMOTIONS_CONFIG) as EmotionalState[]).map((state) => {
              const cfg = EMOTIONS_CONFIG[state];
              const stats = emotionalBreakdown[state];
              const Icon = cfg.icon;

              return (
                <div
                  key={state}
                  className={`p-3.5 rounded-xl border ${cfg.bg} ${cfg.border} flex items-center justify-between gap-3`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-black/40 ${cfg.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{cfg.label}</div>
                      <div className="text-[10px] text-neutral-400">
                        {stats.count} trade{stats.count > 1 ? 's' : ''} ({stats.count > 0 ? `${stats.winRate.toFixed(0)}% Winrate` : '0 trade'})
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-base font-black font-mono ${
                        stats.totalR >= 0 ? 'text-[#39FF14]' : 'text-red-400'
                      }`}
                    >
                      {stats.totalR >= 0 ? `+${stats.totalR.toFixed(1)}R` : `${stats.totalR.toFixed(1)}R`}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      Moy: {stats.avgR >= 0 ? `+${stats.avgR.toFixed(2)}R` : `${stats.avgR.toFixed(2)}R`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stop Loss Discipline Matrix */}
      <Card className="bg-[#141414] border-white/10 overflow-hidden shadow-xl">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#39FF14]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Rigueur d'Inviolabilité des Stops</h3>
              <p className="text-[11px] text-neutral-400">Impact des modifications de Stop Loss en cours de trade</p>
            </div>
          </div>

          <div className="space-y-3">
            {(Object.keys(STOPS_CONFIG) as StopDiscipline[]).map((state) => {
              const cfg = STOPS_CONFIG[state];
              const stats = stopDisciplineBreakdown[state];

              return (
                <div
                  key={state}
                  className={`p-3.5 rounded-xl border ${cfg.bg} ${cfg.border} flex items-center justify-between gap-3`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{cfg.label}</div>
                    <div className="text-[10px] text-neutral-400">{cfg.desc}</div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-base font-black font-mono ${
                        stats.totalR >= 0 ? 'text-[#39FF14]' : 'text-red-400'
                      }`}
                    >
                      {stats.totalR >= 0 ? `+${stats.totalR.toFixed(1)}R` : `${stats.totalR.toFixed(1)}R`}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      {stats.count} trade{stats.count > 1 ? 's' : ''} ({stats.winRate.toFixed(0)}% WR)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
