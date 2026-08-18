'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PsychologyMetrics } from '@/types/psychology';
import { Sparkles, AlertOctagon, AlertTriangle, CheckCircle, TrendingDown, Clock, Lightbulb } from 'lucide-react';

interface HarshTruthInsightsProps {
  metrics: PsychologyMetrics;
}

export function HarshTruthInsights({ metrics }: HarshTruthInsightsProps) {
  const { harshTruthInsights, complianceImpact, revengeTrades } = metrics;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-[#39FF14]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Vérités Statistiques & Filtres d'Erreurs</h3>
            <p className="text-[11px] text-neutral-400">Analyse comportementale basée sur vos trades réels</p>
          </div>
        </div>
      </div>

      {/* Primary Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Compliance ROI Breakdown */}
        <Card className="bg-[#141414] border-white/10 overflow-hidden shadow-lg flex flex-col justify-between">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#39FF14]" />
                Impact de la Conformité au Plan
              </span>
              {complianceImpact.costOfDeviationsR > 0 && (
                <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                  Fuite: -{complianceImpact.costOfDeviationsR.toFixed(1)}R
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                <div className="text-[10px] text-emerald-400 font-semibold uppercase">Trades 100% sur Plan</div>
                <div className="text-xl font-black font-mono text-white">
                  {complianceImpact.fullCompliance.totalR >= 0
                    ? `+${complianceImpact.fullCompliance.totalR.toFixed(1)}R`
                    : `${complianceImpact.fullCompliance.totalR.toFixed(1)}R`}
                </div>
                <div className="text-[11px] text-neutral-400">
                  WR: {complianceImpact.fullCompliance.winRate.toFixed(0)}% ({complianceImpact.fullCompliance.count} trades)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 space-y-1">
                <div className="text-[10px] text-red-400 font-semibold uppercase">Déviations / Hors Plan</div>
                <div
                  className={`text-xl font-black font-mono ${
                    complianceImpact.deviations.totalR >= 0 ? 'text-[#39FF14]' : 'text-red-400'
                  }`}
                >
                  {complianceImpact.deviations.totalR >= 0
                    ? `+${complianceImpact.deviations.totalR.toFixed(1)}R`
                    : `${complianceImpact.deviations.totalR.toFixed(1)}R`}
                </div>
                <div className="text-[11px] text-neutral-400">
                  WR: {complianceImpact.deviations.winRate.toFixed(0)}% ({complianceImpact.deviations.count} trades)
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {complianceImpact.costOfDeviationsR > 0
                ? `Si vous aviez éliminé vos déviations de règles, votre solde serait supérieur de +${complianceImpact.costOfDeviationsR.toFixed(1)}R.`
                : 'Excellente exécution : vos règles sont parfaitement appliquées sur l\'ensemble de vos positions.'}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Revenge Trading Radar */}
        <Card className="bg-[#141414] border-white/10 overflow-hidden shadow-lg flex flex-col justify-between">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-amber-400" />
                Détecteur de Revenge Trading
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  revengeTrades.count === 0
                    ? 'text-[#39FF14] bg-[#39FF14]/10 border-[#39FF14]/20'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                }`}
              >
                {revengeTrades.count === 0 ? '0 Revenge Trade' : `${revengeTrades.count} Détecté(s)`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1">
                <div className="text-[10px] text-neutral-400 font-semibold uppercase">Winrate Revenge</div>
                <div
                  className={`text-xl font-black font-mono ${
                    revengeTrades.winRate >= 50 ? 'text-[#39FF14]' : 'text-red-400'
                  }`}
                >
                  {revengeTrades.count > 0 ? `${revengeTrades.winRate.toFixed(0)}%` : '—'}
                </div>
                <div className="text-[11px] text-neutral-400">
                  {revengeTrades.count} trade(s) pris en reflex
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1">
                <div className="text-[10px] text-neutral-400 font-semibold uppercase">Espérance Moyenne</div>
                <div
                  className={`text-xl font-black font-mono ${
                    revengeTrades.avgR >= 0 ? 'text-[#39FF14]' : 'text-red-400'
                  }`}
                >
                  {revengeTrades.count > 0
                    ? revengeTrades.avgR >= 0
                      ? `+${revengeTrades.avgR.toFixed(2)}R`
                      : `${revengeTrades.avgR.toFixed(2)}R`
                    : '0.00R'}
                </div>
                <div className="text-[11px] text-neutral-400">Par trade d'impulsion</div>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {revengeTrades.count > 0
                ? 'Les trades repris immédiatement après une perte ont une espérance statistique dégradée. Attendez au moins 10 minutes après un stop.'
                : 'Aucun revenge trading compulsif détecté. Vous respectez votre temps de respiration après une perte.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Behavioral Insights List */}
      {harshTruthInsights.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Alertes Spécifiques</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {harshTruthInsights.map((insight) => {
              const isCrit = insight.type === 'critical';
              const isWarn = insight.type === 'warning';
              const isSucc = insight.type === 'success';

              return (
                <div
                  key={insight.id}
                  className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                    isCrit
                      ? 'bg-red-500/10 border-red-500/25 text-red-200'
                      : isWarn
                      ? 'bg-amber-500/10 border-amber-500/25 text-amber-200'
                      : isSucc
                      ? 'bg-[#39FF14]/10 border-[#39FF14]/25 text-neutral-200'
                      : 'bg-blue-500/10 border-blue-500/25 text-blue-200'
                  }`}
                >
                  {isCrit && <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
                  {isWarn && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
                  {isSucc && <CheckCircle className="w-5 h-5 text-[#39FF14] shrink-0 mt-0.5" />}
                  {!isCrit && !isWarn && !isSucc && <Clock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{insight.title}</span>
                      {insight.metricBadge && (
                        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-black/60 border border-white/10 text-white">
                          {insight.metricBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">{insight.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
