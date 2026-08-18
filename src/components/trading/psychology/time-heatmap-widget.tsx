'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PsychologyMetrics } from '@/types/psychology';
import { Clock, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

interface TimeHeatmapWidgetProps {
  metrics: PsychologyMetrics;
}

export function TimeHeatmapWidget({ metrics }: TimeHeatmapWidgetProps) {
  const { hourlyPerformance, dailyPerformance } = metrics;

  // Filter hours between 9h and 22h for clean display
  const activeHours = hourlyPerformance.filter((h) => h.hour >= 9 && h.hour <= 22);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Daily Performance Breakdown */}
      <Card className="bg-[#141414] border-white/10 overflow-hidden shadow-xl">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#39FF14]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Performance par Jour de Semaine</h3>
              <p className="text-[11px] text-neutral-400">Distribution du PnL et du taux de réussite du Lundi au Vendredi</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {dailyPerformance.map((day) => {
              const isProfit = day.totalR > 0;
              const isLoss = day.totalR < 0;

              return (
                <div
                  key={day.dayIndex}
                  className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-white w-20">{day.dayLabel}</span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {day.count} trade{day.count > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-neutral-300 font-mono block">
                        {day.count > 0 ? `${day.winRate.toFixed(0)}% WR` : '—'}
                      </span>
                    </div>

                    <div className="w-20 text-right">
                      <span
                        className={`text-sm font-bold font-mono ${
                          isProfit ? 'text-[#39FF14]' : isLoss ? 'text-red-400' : 'text-neutral-400'
                        }`}
                      >
                        {day.count > 0
                          ? day.totalR >= 0
                            ? `+${day.totalR.toFixed(1)}R`
                            : `${day.totalR.toFixed(1)}R`
                          : '0.0R'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. Hourly Session Breakdown */}
      <Card className="bg-[#141414] border-white/10 overflow-hidden shadow-xl">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#39FF14]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Tranches Horaires & Sessions CME</h3>
              <p className="text-[11px] text-neutral-400">Repérage des fenêtres de forte lucidité vs fatigue horaire</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {activeHours.map((h) => {
              const isProfit = h.totalR > 0;
              const isLoss = h.totalR < 0;
              const isPrimeOpen = h.hour === 15 || h.hour === 16;

              return (
                <div
                  key={h.hour}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1.5 transition-all ${
                    h.count === 0
                      ? 'bg-black/20 border-white/5 opacity-50'
                      : isProfit
                      ? 'bg-[#39FF14]/5 border-[#39FF14]/20'
                      : isLoss
                      ? 'bg-red-500/5 border-red-500/20'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-white flex items-center gap-1">
                      <span>{h.label}</span>
                      {isPrimeOpen && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
                      )}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">{h.count} tr</span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span
                      className={`text-xs font-black font-mono ${
                        isProfit ? 'text-[#39FF14]' : isLoss ? 'text-red-400' : 'text-neutral-400'
                      }`}
                    >
                      {h.count > 0 ? (h.totalR >= 0 ? `+${h.totalR.toFixed(1)}R` : `${h.totalR.toFixed(1)}R`) : '—'}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {h.count > 0 ? `${h.winRate.toFixed(0)}%` : ''}
                    </span>
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
