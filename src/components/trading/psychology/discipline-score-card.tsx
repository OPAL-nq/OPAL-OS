'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PsychologyMetrics } from '@/types/psychology';
import { Award, ShieldCheck, Target, Zap, HeartHandshake } from 'lucide-react';

interface DisciplineScoreCardProps {
  metrics: PsychologyMetrics;
}

export function DisciplineScoreCard({ metrics }: DisciplineScoreCardProps) {
  const { disciplineScore, disciplineGrade, pillars } = metrics;

  return (
    <Card className="bg-[#141414] border-white/10 overflow-hidden shadow-2xl">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Award className="w-4 h-4 text-[#39FF14]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Score de Rigueur & Discipline</h3>
              <p className="text-[11px] text-neutral-400">Évaluation quantitative globale du respect des règles</p>
            </div>
          </div>
        </div>

        {/* Big Score Hero Display */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 rounded-2xl bg-gradient-to-r from-black/80 via-[#101010] to-black/80 border border-white/10">
          <div className="flex items-center gap-5">
            {/* Grade Badge */}
            <div className="w-20 h-20 rounded-2xl bg-[#0e0e0e] border border-[#39FF14]/40 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(57,255,20,0.2)] shrink-0">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Grade</span>
              <span className="text-3xl font-black text-[#39FF14] tracking-tight">{disciplineGrade}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                  {disciplineScore}
                </span>
                <span className="text-base font-bold text-neutral-500 font-mono">/ 100</span>
              </div>
              <p className="text-xs text-neutral-300">
                {disciplineScore >= 85
                  ? 'Exécution d\'élite : vous tradez avec la rigueur d\'un compte institutionnel.'
                  : disciplineScore >= 70
                  ? 'Bonne rigueur globale : quelques déviations mineures à corriger.'
                  : 'Zone de danger : les déviations et impulsions dégradent votre rentabilité.'}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Pillars Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pillar 1: Plan Compliance */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-medium flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Conformité au Ruleset</span>
              </span>
              <span className="font-mono font-bold text-white">{pillars.planComplianceScore}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#39FF14] rounded-full transition-all duration-500"
                style={{ width: `${pillars.planComplianceScore}%` }}
              />
            </div>
          </div>

          {/* Pillar 2: Stop Loss Discipline */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Rigueur des Stops</span>
              </span>
              <span className="font-mono font-bold text-white">{pillars.stopDisciplineScore}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#39FF14] rounded-full transition-all duration-500"
                style={{ width: `${pillars.stopDisciplineScore}%` }}
              />
            </div>
          </div>

          {/* Pillar 3: Revenge Avoidance */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-medium flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Anti-Revenge Trading</span>
              </span>
              <span className="font-mono font-bold text-white">{pillars.revengeAvoidanceScore}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#39FF14] rounded-full transition-all duration-500"
                style={{ width: `${pillars.revengeAvoidanceScore}%` }}
              />
            </div>
          </div>

          {/* Pillar 4: Emotional Mastery */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-medium flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Lucidité & Calme</span>
              </span>
              <span className="font-mono font-bold text-white">{pillars.emotionalMasteryScore}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#39FF14] rounded-full transition-all duration-500"
                style={{ width: `${pillars.emotionalMasteryScore}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
