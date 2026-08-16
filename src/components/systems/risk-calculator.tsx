'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { INSTRUMENTS, InstrumentSpec } from '@/lib/trading-constants';
import { Calculator, AlertTriangle, ShieldCheck, DollarSign, Info } from 'lucide-react';

export function RiskCalculator() {
  const [instrumentKey, setInstrumentKey] = useState<string>('NQ');
  const [accountSize, setAccountSize] = useState<number>(50000);
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [stopLossTicks, setStopLossTicks] = useState<number>(40); // 40 ticks = 10 pts
  const [targetTicks, setTargetTicks] = useState<number>(80);    // 80 ticks = 20 pts (2R)

  const currentInstrument: InstrumentSpec = INSTRUMENTS[instrumentKey] || INSTRUMENTS.NQ;

  // Dollar amount the user is willing to risk (1R)
  const riskAmountDollars = (accountSize * riskPercent) / 100;

  // Dollar risk per 1 contract = Stop Loss in ticks * Dollar value per tick
  const dollarRiskPerContract = stopLossTicks * currentInstrument.tickValue;

  // Max contracts allowed within the risk tolerance
  const rawContracts = dollarRiskPerContract > 0 ? riskAmountDollars / dollarRiskPerContract : 0;
  const recommendedContracts = Math.floor(rawContracts);

  // Actual total dollar risk with the recommended contracts
  const actualRiskDollars = recommendedContracts * dollarRiskPerContract;

  // Target dollar return & Risk-to-Reward ratio (R:R)
  const targetDollarReturnPerContract = targetTicks * currentInstrument.tickValue;
  const totalTargetReturnDollars = recommendedContracts * targetDollarReturnPerContract;
  const rewardRiskRatio = stopLossTicks > 0 ? targetTicks / stopLossTicks : 0;

  // Points equivalence
  const stopLossPoints = (stopLossTicks * currentInstrument.tickSize).toFixed(2);
  const targetPoints = (targetTicks * currentInstrument.tickSize).toFixed(2);

  return (
    <Card className="bg-[#141414] border-white/10 shadow-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center text-[#39FF14]">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">
                Calculateur de Risque & Taille de Position (Futures)
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Calcul de position exact basé sur les <strong>TICKS</strong> et les spécifications CME.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Step 1: Instrument Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
            <span>1. Sélectionner l'Instrument</span>
            <span className="text-neutral-500 font-mono text-[11px]">
              1 Tick = ${currentInstrument.tickValue.toFixed(2)} | 1 Pt = ${currentInstrument.pointValue.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Object.keys(INSTRUMENTS).map((key) => {
              const inst = INSTRUMENTS[key];
              const isSelected = instrumentKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setInstrumentKey(key)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#39FF14]/10 border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.15)]'
                      : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-black/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-black ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                      {inst.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-neutral-400">
                      {inst.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    ${inst.tickValue.toFixed(2)} / tick
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-300 font-medium">Capital du Compte ($)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs pointer-events-none">$</span>
              <Input
                type="number"
                step="1000"
                value={accountSize}
                onChange={(e) => setAccountSize(Math.max(0, Number(e.target.value)))}
                className="bg-black/50 border-white/10 pl-9 text-white font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-300 font-medium">Risque par Trade (%)</Label>
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                value={riskPercent}
                onChange={(e) => setRiskPercent(Math.max(0.1, Number(e.target.value)))}
                className="bg-black/50 border-white/10 pr-8 text-white font-mono text-xs"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs pointer-events-none">%</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-neutral-300 font-medium">Stop Loss (Ticks)</Label>
              <span className="text-[10px] text-neutral-400 font-mono">
                {stopLossPoints} pts
              </span>
            </div>
            <div className="relative">
              <Input
                type="number"
                step="1"
                min="1"
                value={stopLossTicks}
                onChange={(e) => setStopLossTicks(Math.max(1, Number(e.target.value)))}
                className="bg-black/50 border-white/10 pr-14 text-white font-mono text-xs"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs pointer-events-none">ticks</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-neutral-300 font-medium">Take Profit (Ticks)</Label>
              <span className="text-[10px] text-neutral-400 font-mono">
                {targetPoints} pts
              </span>
            </div>
            <div className="relative">
              <Input
                type="number"
                step="1"
                min="1"
                value={targetTicks}
                onChange={(e) => setTargetTicks(Math.max(1, Number(e.target.value)))}
                className="bg-black/50 border-white/10 pr-14 text-white font-mono text-xs"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs pointer-events-none">ticks</span>
            </div>
          </div>
        </div>

        {/* Step 3: Calculation Results Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-black/80 via-[#111] to-black/80 border border-[#39FF14]/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Taille de Position Recommandée
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black font-mono text-[#39FF14]">
                  {recommendedContracts}
                </span>
                <span className="text-sm font-bold text-white">
                  contrat{recommendedContracts > 1 ? 's' : ''} {currentInstrument.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <span className="text-[11px] text-neutral-400 block">Risque Cible (1R)</span>
                <span className="text-base font-bold font-mono text-white">
                  ${riskAmountDollars.toFixed(0)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 block">Risque Réel</span>
                <span className="text-base font-bold font-mono text-[#39FF14]">
                  ${actualRiskDollars.toFixed(0)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 block">Ratio R:R</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  1:{rewardRiskRatio.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Warnings & Suggestions */}
          {recommendedContracts === 0 && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Le risque de 1 contrat ({dollarRiskPerContract.toFixed(0)}$) dépasse votre tolérance (${riskAmountDollars.toFixed(0)}$). 
                {currentInstrument.category === 'E-mini' ? (
                  <strong className="ml-1 text-white">
                    Passez sur le Micro {currentInstrument.name === 'NQ' ? 'MNQ' : 'MES'} pour respecter votre risque !
                  </strong>
                ) : (
                  ' Réduisez votre Stop Loss en ticks ou augmentez le capital alloué.'
                )}
              </span>
            </div>
          )}

          {recommendedContracts > 0 && (
            <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#39FF14]" />
                <span>
                  Gain potentiel au TP ({targetTicks} ticks / {targetPoints} pts) :{' '}
                  <strong className="text-white font-mono">+${totalTargetReturnDollars.toFixed(0)}</strong>
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono">
                Risque par contrat : ${dollarRiskPerContract.toFixed(0)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
