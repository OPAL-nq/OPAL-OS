'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Flame,
  ArrowRight,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Sliders,
  DollarSign,
  Layers,
  Scale,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PropFirmAccountModal } from './prop-firm-account-modal';
import { PropFirmQuickBalanceModal } from './prop-firm-quick-balance-modal';
import { deletePropFirmAccount } from '@/app/actions/prop-firm';
import {
  calculateGuardianMetrics,
  calculateSizingComparison,
  calculateConsistencyAnalysis,
} from '@/lib/prop-firm-constants';
import { INSTRUMENTS } from '@/lib/trading-constants';
import { cn } from '@/lib/utils';
import type { PropFirmAccount } from '@/types/prop-firm';

interface PropFirmGuardianViewProps {
  accounts: PropFirmAccount[];
}

export function PropFirmGuardianView({ accounts }: PropFirmGuardianViewProps) {
  // Selected Account State
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    accounts.length > 0 ? accounts[0].id : ''
  );

  const selectedAccount =
    accounts.find((a) => a.id === selectedAccountId) || accounts[0] || null;

  // Simulator Risk Parameters
  const [riskDollars, setRiskDollars] = useState<number>(250);
  const [selectedInstrument, setSelectedInstrument] = useState<'NQ' | 'MNQ' | 'ES' | 'MES'>('MNQ');
  const [stopLossPoints, setStopLossPoints] = useState<number>(20);

  // Trailing Simulation Delta ($)
  const [simulatedPnl, setSimulatedPnl] = useState<number>(0);

  // Consistency Simulator State
  const [consistencyDayProfit, setConsistencyDayProfit] = useState<number>(850);

  // Copy state
  const [copiedSizing, setCopiedSizing] = useState(false);

  // Handle Account Deletion
  const handleDeleteAccount = async (accountId: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce compte Prop Firm ?')) {
      try {
        await deletePropFirmAccount(accountId);
        window.location.reload();
      } catch (err: any) {
        alert(err.message || 'Erreur lors de la suppression.');
      }
    }
  };

  // Base Guardian Metrics
  const metrics = selectedAccount
    ? calculateGuardianMetrics(selectedAccount, riskDollars)
    : null;

  // Simulated Metrics
  const simulatedAccount: PropFirmAccount | null = selectedAccount
    ? {
        ...selectedAccount,
        current_balance: Number(selectedAccount.current_balance) + simulatedPnl,
        high_water_mark: Math.max(
          Number(selectedAccount.high_water_mark),
          Number(selectedAccount.current_balance) + simulatedPnl
        ),
      }
    : null;

  const simulatedMetrics = simulatedAccount
    ? calculateGuardianMetrics(simulatedAccount, riskDollars)
    : null;

  // Sizing Recommendation
  const bufferForSizing = metrics ? metrics.bufferDollars : 2000;
  const sizing = calculateSizingComparison(
    selectedInstrument,
    stopLossPoints,
    riskDollars,
    bufferForSizing
  );

  // Consistency Analysis
  const consistencyPct = selectedAccount?.consistency_rule_pct || 30;
  const totalProfitForConsistency = Math.max(
    0,
    (selectedAccount ? Number(selectedAccount.current_balance) - Number(selectedAccount.starting_balance) : 0) +
      (simulatedPnl > 0 ? simulatedPnl : 0)
  );
  const consistency = calculateConsistencyAnalysis(
    totalProfitForConsistency,
    consistencyDayProfit,
    consistencyPct
  );

  const handleCopySizing = () => {
    const isMicro = sizing.recommendedCategory === 'Micro';
    const text = `${isMicro ? sizing.microContracts : sizing.miniContracts} contrat(s) ${
      isMicro ? (selectedInstrument === 'ES' || selectedInstrument === 'MES' ? 'MES' : 'MNQ') : (selectedInstrument === 'ES' || selectedInstrument === 'MES' ? 'ES' : 'NQ')
    } • SL ${sizing.stopLossPoints} pts (${sizing.stopLossTicks} ticks) • Risque: ~${isMicro ? sizing.microRiskTotal : sizing.miniRiskTotal} $`;
    navigator.clipboard.writeText(text);
    setCopiedSizing(true);
    setTimeout(() => setCopiedSizing(false), 2000);
  };

  if (!selectedAccount || accounts.length === 0) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-6">
        <Card className="bg-[#141414] border-white/10 p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#39FF14]/10 border border-[#39FF14]/30 mx-auto flex items-center justify-center text-[#39FF14]">
            <Shield className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Prop Firm Drawdown Guardian & Simulateur
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Sécurisez vos comptes financés (Topstep, Apex, MFFU, Bulenox, TradeDay).
              Calculez au tick près votre buffer de liquidation, le nombre de Stop Loss tolérables et la taille exacte de position (Micro vs Mini).
            </p>
          </div>

          <div>
            <PropFirmAccountModal
              trigger={
                <Button className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold text-xs h-10 px-6 shadow-[0_0_20px_rgba(57,255,20,0.3)]">
                  <Plus className="w-4 h-4 mr-2" />
                  <span>Configurer mon premier Compte Prop Firm</span>
                </Button>
              }
            />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Accounts Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-2xl bg-[#141414] border border-white/10">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {accounts.map((acc) => {
            const isSelected = acc.id === selectedAccountId;
            const accMetrics = calculateGuardianMetrics(acc, 250);
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => setSelectedAccountId(acc.id)}
                className={cn(
                  'flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0',
                  isSelected
                    ? 'bg-[#39FF14]/15 text-white border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.2)]'
                    : 'bg-black/40 text-neutral-400 border-white/5 hover:border-white/20 hover:text-white'
                )}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: accMetrics.zoneColor }}
                />
                <span className="font-semibold">{acc.account_name}</span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  ${Number(acc.current_balance).toLocaleString('en-US')}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <PropFirmAccountModal
            trigger={
              <Button
                size="sm"
                variant="outline"
                className="border-white/10 text-xs text-neutral-300 hover:bg-white/5 h-8 px-3"
              >
                <Plus className="w-3.5 h-3.5 mr-1 text-[#39FF14]" />
                <span>Nouveau compte</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* Hero Guardian Status & Runway Bar */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Drawdown Runway & Visual Gauge */}
          <Card
            className={cn(
              'lg:col-span-2 relative overflow-hidden transition-all border',
              metrics.zone === 'safe'
                ? 'bg-gradient-to-br from-[#161616] via-[#141414] to-[#101010] border-[#39FF14]/40 shadow-[0_0_30px_rgba(57,255,20,0.08)]'
                : metrics.zone === 'warning'
                ? 'bg-gradient-to-br from-[#1c1810] via-[#141414] to-[#101010] border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.08)]'
                : 'bg-gradient-to-br from-[#201010] via-[#141414] to-[#101010] border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-pulse'
            )}
          >
            <CardContent className="p-6 sm:p-7 space-y-6">
              {/* Header with status badge & actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${metrics.zoneColor}20`,
                      borderColor: `${metrics.zoneColor}50`,
                      color: metrics.zoneColor,
                    }}
                  >
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-white">
                        {selectedAccount.account_name}
                      </h2>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border"
                        style={{
                          backgroundColor: `${metrics.zoneColor}15`,
                          borderColor: `${metrics.zoneColor}40`,
                          color: metrics.zoneColor,
                        }}
                      >
                        {metrics.zoneLabel}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {selectedAccount.is_trailing_eod
                        ? 'Trailing End-of-Day (EOD)'
                        : 'Trailing Intraday Live'}{' '}
                      • Seuil de liquidation dynamique
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <PropFirmQuickBalanceModal account={selectedAccount} />
                  <PropFirmAccountModal
                    accountToEdit={selectedAccount}
                    trigger={
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-neutral-400 hover:text-white"
                        title="Modifier les paramètres"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    }
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteAccount(selectedAccount.id)}
                    className="h-8 px-2 text-neutral-500 hover:text-red-400"
                    title="Supprimer ce compte"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Runway Key Numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-black/50 border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Solde Actuel
                  </span>
                  <span className="text-lg sm:text-xl font-mono font-black text-white">
                    ${metrics.currentBalance.toLocaleString('en-US')}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/50 border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Plus Haut (HWM)
                  </span>
                  <span className="text-lg sm:text-xl font-mono font-black text-neutral-300">
                    ${metrics.highWaterMark.toLocaleString('en-US')}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/50 border border-red-500/20 space-y-1">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                    Seuil Liquidation
                  </span>
                  <span className="text-lg sm:text-xl font-mono font-black text-red-400">
                    ${metrics.liquidationThreshold.toLocaleString('en-US')}
                  </span>
                </div>

                <div
                  className="p-3.5 rounded-xl border space-y-1"
                  style={{
                    backgroundColor: `${metrics.zoneColor}10`,
                    borderColor: `${metrics.zoneColor}40`,
                  }}
                >
                  <span
                    className="text-[10px] font-black uppercase tracking-wider block"
                    style={{ color: metrics.zoneColor }}
                  >
                    Buffer Restant
                  </span>
                  <span
                    className="text-lg sm:text-xl font-mono font-black"
                    style={{ color: metrics.zoneColor }}
                  >
                    +${metrics.bufferDollars.toLocaleString('en-US')}
                  </span>
                </div>
              </div>

              {/* Progress Runway Visualizer */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium">
                    Marge de survie du compte (Drawdown Runway) :
                  </span>
                  <span className="font-mono font-bold" style={{ color: metrics.zoneColor }}>
                    {metrics.bufferPercent}% disponible (${metrics.bufferDollars} / ${selectedAccount.drawdown_limit})
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-black/60 p-0.5 border border-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(3, metrics.bufferPercent)}%`,
                      backgroundColor: metrics.zoneColor,
                      boxShadow: `0 0 12px ${metrics.zoneColor}`,
                    }}
                  />
                </div>
              </div>

              {/* Alert Advice / Recommendation */}
              <div
                className="p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5"
                style={{
                  backgroundColor: `${metrics.zoneColor}10`,
                  borderColor: `${metrics.zoneColor}30`,
                }}
              >
                <div className="mt-0.5">
                  {metrics.zone === 'safe' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="text-neutral-200">
                  {metrics.zone === 'safe' ? (
                    <p>
                      <strong>Capital protégé :</strong> Ton buffer de sécurité ({metrics.bufferDollars} $) est supérieur à 4R. Tu peux exécuter ton plan normalement en respectant ton risk management strict.
                    </p>
                  ) : metrics.zone === 'warning' ? (
                    <p>
                      <strong>Vigilance requise :</strong> Ton buffer est sous tension ({metrics.bufferDollars} $). Il est fortement conseillé de <strong>passer sur des contrats Micro (MNQ / MES)</strong> pour diviser ton exposition par 10 et reconstruire ton buffer en sécurité.
                    </p>
                  ) : (
                    <p>
                      <strong>ALERTE ROUGE :</strong> Risque imminent de perte de compte ({metrics.bufferDollars} $ restants). Moins de 2 Stop Loss te séparent de la liquidation. Réduis immédiatement à 1-2 Micros ou suspends les prises de position.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Stop Loss Survival Engine */}
          <Card className="bg-[#141414] border-white/10 flex flex-col justify-between">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#39FF14]">
                  <Scale className="w-4 h-4" />
                  <span>Simulateur de Survie</span>
                </div>
                <h3 className="text-base font-bold text-white">Résilience aux Séries Noires</h3>
              </div>

              {/* Risk Slider & Input */}
              <div className="space-y-2 p-3.5 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Risque défini par Trade (1R) :</span>
                  <span className="font-mono font-bold text-[#39FF14]">${riskDollars}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={riskDollars}
                    onChange={(e) => setRiskDollars(Math.max(10, Number(e.target.value)))}
                    className="bg-[#0A0A0A] border-white/10 text-white text-xs h-8 font-mono"
                  />
                  <div className="flex gap-1">
                    {[150, 250, 300, 500].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRiskDollars(val)}
                        className={cn(
                          'px-2 py-1 rounded text-[10px] font-mono font-bold border transition-colors',
                          riskDollars === val
                            ? 'bg-[#39FF14]/20 border-[#39FF14] text-[#39FF14]'
                            : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                        )}
                      >
                        ${val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Survivor Output */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-center space-y-1">
                  <span className="text-xs text-neutral-400 block font-medium">
                    Nombre de Stop Loss consécutifs tolérés
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-white flex items-center justify-center gap-2">
                    <span style={{ color: metrics.zoneColor }}>
                      {metrics.tolerableConsecutiveLosses}
                    </span>
                    <span className="text-xs text-neutral-400 font-sans font-normal">
                      trades perdants
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    À {riskDollars} $ / trade, ton compte peut absorber {metrics.tolerableConsecutiveLosses} échecs complets avant liquidation.
                  </p>
                </div>

                {/* Daily Loss Limit check if present */}
                {metrics.dailyLossThreshold && (
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Max SL tolérés aujourd'hui (Daily) :</span>
                    <span className="font-mono font-bold text-amber-300">
                      {metrics.tolerableDailyLosses} SL max
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Module 2: Position Sizing Engine (Mini vs Micro NQ / MNQ / ES / MES) */}
      <Card className="bg-[#141414] border-white/10">
        <CardContent className="p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#39FF14] mb-1">
                <Zap className="w-4 h-4" />
                <span>Calculateur de Taille de Position & Calibrage CME</span>
              </div>
              <h3 className="text-lg font-black text-white">
                Arbitrage Intelligent : Contrats Mini vs Micro
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Calculez le nombre de contrats exact au tick près sans risquer de sur-leveraging destructeur.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleCopySizing}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs h-9 self-start sm:self-auto"
            >
              {copiedSizing ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-[#39FF14]" />
                  <span>Copié dans le presse-papier !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  <span>Copier les paramètres du trade</span>
                </>
              )}
            </Button>
          </div>

          {/* Sizing Parameters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Instrument */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Actif CME Futures
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInstrument('MNQ')}
                  className={cn(
                    'p-2 rounded-lg text-xs font-bold border text-center transition-all',
                    selectedInstrument === 'MNQ' || selectedInstrument === 'NQ'
                      ? 'bg-[#39FF14]/15 border-[#39FF14] text-[#39FF14]'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  )}
                >
                  Nasdaq (NQ / MNQ)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInstrument('MES')}
                  className={cn(
                    'p-2 rounded-lg text-xs font-bold border text-center transition-all',
                    selectedInstrument === 'MES' || selectedInstrument === 'ES'
                      ? 'bg-[#39FF14]/15 border-[#39FF14] text-[#39FF14]'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  )}
                >
                  S&P 500 (ES / MES)
                </button>
              </div>
            </div>

            {/* Stop Loss in Points */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-neutral-300">
                  Distance du Stop Loss (Points)
                </label>
                <span className="font-mono text-neutral-400 text-[11px]">
                  = {sizing.stopLossTicks} ticks
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.25"
                  value={stopLossPoints}
                  onChange={(e) => setStopLossPoints(Math.max(0.25, Number(e.target.value)))}
                  className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9 font-mono"
                />
                <div className="flex gap-1">
                  {[10, 15, 20, 30].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setStopLossPoints(pts)}
                      className={cn(
                        'px-2 py-1 rounded text-[10px] font-mono font-bold border',
                        stopLossPoints === pts
                          ? 'bg-[#39FF14]/20 border-[#39FF14] text-[#39FF14]'
                          : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                      )}
                    >
                      {pts}p
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Risk in Dollars */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Risque Alloué ($)
              </label>
              <Input
                type="number"
                value={riskDollars}
                onChange={(e) => setRiskDollars(Math.max(10, Number(e.target.value)))}
                className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9 font-mono font-bold text-[#39FF14]"
              />
            </div>
          </div>

          {/* Comparison Cards: Mini vs Micro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* MICRO OPTION */}
            <div
              className={cn(
                'p-5 rounded-xl border relative transition-all',
                sizing.recommendedCategory === 'Micro'
                  ? 'bg-gradient-to-br from-[#161616] to-[#0A0A0A] border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.15)]'
                  : 'bg-black/40 border-white/10 opacity-75'
              )}
            >
              {sizing.recommendedCategory === 'Micro' && (
                <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-[#39FF14] text-black text-[10px] font-black uppercase tracking-wider shadow">
                  Recommandé par OPAL
                </span>
              )}

              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <h4 className="text-base font-bold text-white">
                    {selectedInstrument === 'ES' || selectedInstrument === 'MES' ? 'MES (Micro S&P 500)' : 'MNQ (Micro Nasdaq)'}
                  </h4>
                  <span className="text-[11px] text-neutral-400">
                    {selectedInstrument === 'ES' || selectedInstrument === 'MES' ? '5 $ / pt (1.25 $ / tick)' : '2 $ / pt (0.50 $ / tick)'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-[#39FF14]">
                    {sizing.microContracts}
                  </span>
                  <span className="text-xs text-neutral-400 block">contrat(s)</span>
                </div>
              </div>

              <div className="space-y-2 mt-4 text-xs">
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Perte brute au Stop Loss :</span>
                  <span className="font-mono font-bold text-white">
                    ${(sizing.microRiskTotal - sizing.microCommissions).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Frais & commissions CME estimés :</span>
                  <span className="font-mono text-neutral-300">
                    +${sizing.microCommissions.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5 font-semibold text-white">
                  <span>Risque Total Réel :</span>
                  <span className="font-mono font-bold text-[#39FF14]">
                    ${sizing.microRiskTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* MINI OPTION */}
            <div
              className={cn(
                'p-5 rounded-xl border relative transition-all',
                sizing.recommendedCategory === 'Mini'
                  ? 'bg-gradient-to-br from-[#161616] to-[#0A0A0A] border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.15)]'
                  : 'bg-black/40 border-white/10 opacity-75'
              )}
            >
              {sizing.recommendedCategory === 'Mini' && (
                <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-[#39FF14] text-black text-[10px] font-black uppercase tracking-wider shadow">
                  Recommandé par OPAL
                </span>
              )}

              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <h4 className="text-base font-bold text-white">
                    {selectedInstrument === 'ES' || selectedInstrument === 'MES' ? 'ES (E-mini S&P 500)' : 'NQ (E-mini Nasdaq)'}
                  </h4>
                  <span className="text-[11px] text-neutral-400">
                    {selectedInstrument === 'ES' || selectedInstrument === 'MES' ? '50 $ / pt (12.50 $ / tick)' : '20 $ / pt (5.00 $ / tick)'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-white">
                    {sizing.miniContracts}
                  </span>
                  <span className="text-xs text-neutral-400 block">contrat(s)</span>
                </div>
              </div>

              <div className="space-y-2 mt-4 text-xs">
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Perte brute au Stop Loss :</span>
                  <span className="font-mono font-bold text-white">
                    ${(sizing.miniRiskTotal - sizing.miniCommissions).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Frais & commissions CME estimés :</span>
                  <span className="font-mono text-neutral-300">
                    +${sizing.miniCommissions.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5 font-semibold text-white">
                  <span>Risque Total Réel :</span>
                  <span className="font-mono font-bold text-neutral-200">
                    ${sizing.miniRiskTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sizing Rationale Banner */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-neutral-300 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#39FF14] shrink-0" />
            <p>{sizing.recommendationReason}</p>
          </div>
        </CardContent>
      </Card>

      {/* Module 3: Trailing Simulation & Consistency Rule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulator: Interactive Trailing Drawdown Slider */}
        <Card className="bg-[#141414] border-white/10 flex flex-col justify-between">
          <CardContent className="p-6 space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#39FF14]">
                <Sliders className="w-4 h-4" />
                <span>Simulateur Trailing Drawdown</span>
              </div>
              <h3 className="text-base font-bold text-white">
                « Et si je fais +X $ ou -X $ sur ma séance ? »
              </h3>
              <p className="text-xs text-neutral-400">
                Visualisez comment votre seuil de liquidation se déplace avec le High Water Mark.
              </p>
            </div>

            {/* Slider */}
            <div className="space-y-2 p-4 rounded-xl bg-black/40 border border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Gain / Perte simulé :</span>
                <span
                  className={cn(
                    'font-mono font-bold text-sm',
                    simulatedPnl > 0
                      ? 'text-[#39FF14]'
                      : simulatedPnl < 0
                      ? 'text-red-400'
                      : 'text-neutral-300'
                  )}
                >
                  {simulatedPnl > 0 ? `+${simulatedPnl} $` : `${simulatedPnl} $`}
                </span>
              </div>

              <input
                type="range"
                min="-1500"
                max="3000"
                step="50"
                value={simulatedPnl}
                onChange={(e) => setSimulatedPnl(Number(e.target.value))}
                className="w-full accent-[#39FF14] cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>-1 500 $ (SL)</span>
                <button
                  type="button"
                  onClick={() => setSimulatedPnl(0)}
                  className="hover:text-white"
                >
                  Reset (0$)
                </button>
                <span>+3 000 $ (TP)</span>
              </div>
            </div>

            {/* Projected Impact */}
            {simulatedMetrics && (
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-lg bg-black/60 border border-white/5 space-y-1">
                  <span className="text-[10px] text-neutral-500 font-semibold uppercase block">
                    Nouveau Solde
                  </span>
                  <span className="font-mono font-bold text-white">
                    ${simulatedMetrics.currentBalance.toLocaleString('en-US')}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-black/60 border border-white/5 space-y-1">
                  <span className="text-[10px] text-red-400/80 font-semibold uppercase block">
                    Nouveau Seuil
                  </span>
                  <span className="font-mono font-bold text-red-400">
                    ${simulatedMetrics.liquidationThreshold.toLocaleString('en-US')}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-black/60 border border-white/5 space-y-1">
                  <span className="text-[10px] text-[#39FF14]/80 font-semibold uppercase block">
                    Nouveau Buffer
                  </span>
                  <span className="font-mono font-bold text-[#39FF14]">
                    +${simulatedMetrics.bufferDollars.toLocaleString('en-US')}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Simulator: Consistency Rule Validator */}
        <Card className="bg-[#141414] border-white/10 flex flex-col justify-between">
          <CardContent className="p-6 space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                <Scale className="w-4 h-4" />
                <span>Règle de Cohérence (Consistency Rule)</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Vérificateur de Validation & Payout
              </h3>
              <p className="text-xs text-neutral-400">
                Évitez le refus de paiement causé par un jour représentant plus de {consistencyPct}% de votre profit total.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Gain de votre meilleure séance ($) :</span>
                  <span className="font-mono font-bold text-purple-300">
                    ${consistencyDayProfit}
                  </span>
                </div>
                <Input
                  type="number"
                  value={consistencyDayProfit}
                  onChange={(e) => setConsistencyDayProfit(Math.max(0, Number(e.target.value)))}
                  className="bg-[#0A0A0A] border-white/10 text-white text-xs h-8 font-mono"
                />
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Part de cette séance dans le profit total :</span>
                  <span
                    className={cn(
                      'font-mono font-bold text-sm',
                      consistency.isViolating ? 'text-amber-400' : 'text-[#39FF14]'
                    )}
                  >
                    {consistency.currentBestDayShare}% / {consistencyPct}% max
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      consistency.isViolating ? 'bg-amber-400' : 'bg-[#39FF14]'
                    )}
                    style={{ width: `${Math.min(100, (consistency.currentBestDayShare / consistencyPct) * 100)}%` }}
                  />
                </div>

                {consistency.isViolating ? (
                  <p className="text-[11px] text-amber-300 pt-1">
                    ⚠️ <strong>Attention règle de cohérence :</strong> Pour valider votre paiement avec cette journée à {consistencyDayProfit} $, vous devez atteindre un profit total cumulé de <strong>{consistency.requiredTotalProfit} $</strong> (soit encore +{consistency.additionalProfitNeeded} $ de gains répartis sur d'autres séances).
                  </p>
                ) : (
                  <p className="text-[11px] text-[#39FF14] pt-1">
                    ✓ <strong>Règle respectée :</strong> Cette séance reste sous la limite des {consistencyPct}% du gain total requis.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
