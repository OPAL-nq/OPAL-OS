'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PsychologyMetrics } from '@/types/psychology';
import { ShieldAlert, ShieldCheck, AlertTriangle, Flame, Clock, Radio, Activity } from 'lucide-react';

interface TiltRadarGaugeProps {
  metrics: PsychologyMetrics;
}

export function TiltRadarGauge({ metrics }: TiltRadarGaugeProps) {
  const { tiltRiskLevel, tiltRiskReason, tiltRiskScore, todayStats } = metrics;

  const isGreen = tiltRiskLevel === 'green';
  const isYellow = tiltRiskLevel === 'yellow';
  const isRed = tiltRiskLevel === 'red';

  return (
    <Card className="relative overflow-hidden bg-gradient-to-b from-[#141414] to-black border border-white/10 shadow-2xl">
      {/* Ambient background glow based on risk level */}
      {isGreen && (
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-[#39FF14]/10 rounded-full blur-3xl pointer-events-none" />
      )}
      {isYellow && (
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      )}
      {isRed && (
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
      )}

      <CardContent className="p-6 space-y-6 relative z-10">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#39FF14]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Tilt Radar en Temps Réel</h3>
              <p className="text-[11px] text-neutral-400">Détecteur de fatigue et de risques comportementaux du jour</p>
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
              isGreen
                ? 'bg-[#39FF14]/15 text-[#39FF14] border-[#39FF14]/30 shadow-[0_0_12px_rgba(57,255,20,0.2)]'
                : isYellow
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]'
            }`}
          >
            {isGreen && <ShieldCheck className="w-3.5 h-3.5" />}
            {isYellow && <AlertTriangle className="w-3.5 h-3.5" />}
            {isRed && <ShieldAlert className="w-3.5 h-3.5" />}
            <span>{isGreen ? 'Zen & Focus' : isYellow ? 'Vigilance Émotionnelle' : 'Zone Rouge (Tilt Risk)'}</span>
          </div>
        </div>

        {/* Gauge Visual Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">Niveau de Tension Psychologique</span>
            <span
              className={`font-mono font-bold ${
                isGreen ? 'text-[#39FF14]' : isYellow ? 'text-amber-400' : 'text-red-400'
              }`}
            >
              {tiltRiskScore} / 100
            </span>
          </div>

          <div className="h-3.5 w-full bg-black/70 rounded-full border border-white/10 p-0.5 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isGreen
                  ? 'bg-gradient-to-r from-[#39FF14]/80 to-[#39FF14] shadow-[0_0_10px_#39FF14]'
                  : isYellow
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_#f59e0b]'
                  : 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_15px_#ef4444]'
              }`}
              style={{ width: `${Math.max(5, tiltRiskScore)}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>0 (Calme absolu)</span>
            <span>50 (Vigilance)</span>
            <span>100 (Tilt critique)</span>
          </div>
        </div>

        {/* Reason Alert Banner */}
        <div
          className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
            isGreen
              ? 'bg-[#39FF14]/5 border-[#39FF14]/20 text-neutral-200'
              : isYellow
              ? 'bg-amber-500/10 border-amber-500/25 text-amber-200'
              : 'bg-red-500/15 border-red-500/30 text-red-200'
          }`}
        >
          {isGreen && <Radio className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />}
          {isYellow && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
          {isRed && <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
          <div>
            <span className="font-semibold text-white block mb-0.5">Diagnostic de Session :</span>
            <span>{tiltRiskReason}</span>
          </div>
        </div>

        {/* Real-time Session Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Trades Aujourd'hui</span>
            <div className="text-lg font-bold font-mono text-white flex items-center gap-1.5">
              <span>{todayStats.tradesCount}</span>
              {todayStats.tradesCount >= 5 && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  Élevé
                </span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Pertes d'Affilée</span>
            <div
              className={`text-lg font-bold font-mono ${
                todayStats.consecutiveLosses === 0
                  ? 'text-[#39FF14]'
                  : todayStats.consecutiveLosses >= 2
                  ? 'text-red-400'
                  : 'text-neutral-300'
              }`}
            >
              {todayStats.consecutiveLosses}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">P&L Session (R)</span>
            <div
              className={`text-lg font-bold font-mono ${
                todayStats.totalRToday >= 0 ? 'text-[#39FF14]' : 'text-red-400'
              }`}
            >
              {todayStats.totalRToday >= 0 ? `+${todayStats.totalRToday.toFixed(1)}R` : `${todayStats.totalRToday.toFixed(1)}R`}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Dernier Trade</span>
            <div className="text-xs font-mono text-neutral-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-neutral-500" />
              <span>
                {todayStats.minutesSinceLastTrade !== null
                  ? `Il y a ${todayStats.minutesSinceLastTrade} min`
                  : 'Aucun trade'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
