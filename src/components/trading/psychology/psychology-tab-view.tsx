'use client';

import React, { useMemo } from 'react';
import { Trade } from '@/types/trading';
import { calculatePsychologyMetrics } from '@/lib/psychology-engine';
import { TiltRadarGauge } from './tilt-radar-gauge';
import { DisciplineScoreCard } from './discipline-score-card';
import { HarshTruthInsights } from './harsh-truth-insights';
import { EmotionalMatrixChart } from './emotional-matrix-chart';
import { TimeHeatmapWidget } from './time-heatmap-widget';
import { BrainCircuit, Info } from 'lucide-react';

interface PsychologyTabViewProps {
  trades: Trade[];
}

export function PsychologyTabView({ trades }: PsychologyTabViewProps) {
  const metrics = useMemo(() => calculatePsychologyMetrics(trades), [trades]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-black to-emerald-500/5 border border-[#39FF14]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center shrink-0">
            <BrainCircuit className="w-5 h-5 text-[#39FF14]" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">
              Cockpit Psychologique & Radar de Rigueur
            </h2>
            <p className="text-xs text-neutral-300">
              Analyse comportementale 100% statistique pour neutraliser le revenge trading, le FOMO et les pertes évitables.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 shrink-0">
          <Info className="w-3.5 h-3.5 text-[#39FF14]" />
          <span>Calculé sur {trades.length} trade{trades.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Row 1: Tilt Radar (Live) + Discipline Score Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TiltRadarGauge metrics={metrics} />
        <DisciplineScoreCard metrics={metrics} />
      </div>

      {/* Row 2: Harsh Truth Insights & Leaks */}
      <HarshTruthInsights metrics={metrics} />

      {/* Row 3: Emotional Matrix & Stop Inviolability */}
      <EmotionalMatrixChart metrics={metrics} />

      {/* Row 4: Time & Day Heatmap */}
      <TimeHeatmapWidget metrics={metrics} />
    </div>
  );
}
