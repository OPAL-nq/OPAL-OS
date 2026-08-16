'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShieldCheck, AlertTriangle, Crosshair, DollarSign, Activity } from 'lucide-react';

export function PropFirmCalculator() {
  const [accountSize, setAccountSize] = useState<number>(50000);
  const [maxDrawdown, setMaxDrawdown] = useState<number>(2500); // in $
  const [riskPerTrade, setRiskPerTrade] = useState<number>(250); // in $
  const [dailyLossLimit, setDailyLossLimit] = useState<number>(1000); // in $

  // Calculations
  const consecutiveLossesBeforeBreach = riskPerTrade > 0 ? Math.floor(maxDrawdown / riskPerTrade) : 0;
  const consecutiveLossesDaily = riskPerTrade > 0 && dailyLossLimit > 0 ? Math.floor(dailyLossLimit / riskPerTrade) : 0;
  const riskPercentOfAccount = accountSize > 0 ? (riskPerTrade / accountSize) * 100 : 0;
  const riskPercentOfDrawdown = maxDrawdown > 0 ? (riskPerTrade / maxDrawdown) * 100 : 0;

  // Preset buttons
  const presets = [
    { name: '50K ($2.5K DD)', size: 50000, dd: 2500, daily: 1000, risk: 250 },
    { name: '100K ($3K DD)', size: 100000, dd: 3000, daily: 1500, risk: 300 },
    { name: '150K ($4.5K DD)', size: 150000, dd: 4500, daily: 2500, risk: 450 },
  ];

  return (
    <Card className="bg-[#141414] border-white/10 shadow-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-white">Prop Firm Drawdown & Buffer</CardTitle>
            <CardDescription className="text-xs text-neutral-400">
              Contrôlez votre buffer de survie et le nombre de pertes consécutives autorisées
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Presets */}
        <div>
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-2">
            Configurations courantes
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {presets.map((p) => {
              const isSelected = accountSize === p.size && maxDrawdown === p.dd;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setAccountSize(p.size);
                    setMaxDrawdown(p.dd);
                    setDailyLossLimit(p.daily);
                    setRiskPerTrade(p.risk);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#39FF14]/10 border-[#39FF14] text-white shadow-[0_0_15px_rgba(57,255,20,0.15)]'
                      : 'bg-black/40 border-white/10 text-neutral-300 hover:border-white/20 hover:bg-black/60'
                  }`}
                >
                  <div className={`text-xs font-bold ${isSelected ? 'text-[#39FF14]' : 'text-white'}`}>
                    {p.name}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                    Risque: ${p.risk}/trade
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1.5">
              Capital du compte ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs pointer-events-none">$</span>
              <Input
                type="number"
                min="1000"
                step="5000"
                value={accountSize}
                onChange={(e) => setAccountSize(Math.max(0, Number(e.target.value)))}
                className="bg-black/50 border-white/10 pl-9 text-white font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1.5">
              Drawdown Max Total ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs pointer-events-none">$</span>
              <Input
                type="number"
                min="100"
                step="250"
                value={maxDrawdown}
                onChange={(e) => setMaxDrawdown(Math.max(0, Number(e.target.value)))}
                className="bg-black/50 border-white/10 pl-9 text-white font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1.5">
              Perte Max Journalière ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs pointer-events-none">$</span>
              <Input
                type="number"
                min="0"
                step="100"
                value={dailyLossLimit}
                onChange={(e) => setDailyLossLimit(Math.max(0, Number(e.target.value)))}
                className="bg-black/50 border-white/10 pl-9 text-white font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1.5">
              Risque par Trade ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs pointer-events-none">$</span>
              <Input
                type="number"
                min="10"
                step="25"
                value={riskPerTrade}
                onChange={(e) => setRiskPerTrade(Math.max(0, Number(e.target.value)))}
                className="bg-black/50 border-white/10 pl-9 text-white font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Crosshair className="w-3.5 h-3.5 text-[#39FF14]" />
              <span>Pertes avant breach compte</span>
            </div>
            <div className="text-2xl font-black text-[#39FF14] mt-1">
              {consecutiveLossesBeforeBreach}{' '}
              <span className="text-xs font-normal text-neutral-400">trades perdants</span>
            </div>
            <div className="text-[11px] text-neutral-500">
              Soit {riskPercentOfDrawdown.toFixed(1)}% du drawdown par trade
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Pertes avant stop journalier</span>
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {consecutiveLossesDaily}{' '}
              <span className="text-xs font-normal text-neutral-400">trades max / jour</span>
            </div>
            <div className="text-[11px] text-neutral-500">
              Limite stricte de perte par session
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <DollarSign className="w-3.5 h-3.5 text-blue-400" />
              <span>Risque / Capital total</span>
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {riskPercentOfAccount.toFixed(2)}%
            </div>
            <div className="text-[11px] text-neutral-500">
              Gestion de risque conservatrice
            </div>
          </div>
        </div>

        {/* Safety Recommendation */}
        {consecutiveLossesBeforeBreach < 5 && (
          <div className="flex items-center gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>
              <strong>Risque élevé :</strong> Votre risque par trade (${riskPerTrade}) ne vous laisse que {consecutiveLossesBeforeBreach} essais avant d'échouer le compte. Il est recommandé de viser au moins 8 à 10 trades de buffer.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
