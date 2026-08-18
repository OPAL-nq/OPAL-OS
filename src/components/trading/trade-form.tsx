'use client';

import React, { useState } from 'react';
import { createTrade } from '@/app/actions/trades';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { INSTRUMENTS, InstrumentSpec } from '@/lib/trading-constants';
import { ScreenshotUploader } from './screenshot-uploader';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Save,
  ArrowLeft,
  DollarSign,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import Link from 'next/link';

export function TradeForm() {
  const [instrument, setInstrument] = useState<string>('NQ');
  const [direction, setDirection] = useState<'Long' | 'Short'>('Long');
  const [stopLossTicks, setStopLossTicks] = useState<string>('');
  const [takeProfitTicks, setTakeProfitTicks] = useState<string>('');
  const [riskDollars, setRiskDollars] = useState<number>(300);
  const [pnlDollars, setPnlDollars] = useState<number>(600);
  const [pnlR, setPnlR] = useState<number>(2);
  const [planFollowed, setPlanFollowed] = useState<boolean>(true);
  const [emotionalState, setEmotionalState] = useState<'calm' | 'fomo' | 'revenge' | 'fatigued'>('calm');
  const [planCompliance, setPlanCompliance] = useState<'full' | 'minor_deviation' | 'off_plan'>('full');
  const [stopDiscipline, setStopDiscipline] = useState<'respected' | 'moved_early' | 'widened_or_removed'>('respected');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const instSpec: InstrumentSpec = INSTRUMENTS[instrument] || INSTRUMENTS.NQ;

  // Auto calculate R when PnL or Risk changes
  const handlePnlChange = (val: number) => {
    setPnlDollars(val);
    if (riskDollars > 0) {
      setPnlR(Number((val / riskDollars).toFixed(2)));
    }
  };

  const handleRiskChange = (val: number) => {
    setRiskDollars(val);
    if (val > 0) {
      setPnlR(Number((pnlDollars / val).toFixed(2)));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set('instrument', instrument);
    formData.set('direction', direction);
    formData.set('risk_dollars', riskDollars.toString());
    formData.set('pnl_dollars', pnlDollars.toString());
    formData.set('pnl_r', pnlR.toString());
    formData.set('plan_followed', (planCompliance === 'full').toString());
    formData.set('emotional_state', emotionalState);
    formData.set('plan_compliance', planCompliance);
    formData.set('stop_discipline', stopDiscipline);
    formData.set('screenshot_url', screenshotUrl);
    if (stopLossTicks) formData.set('stop_loss_ticks', stopLossTicks);
    if (takeProfitTicks) formData.set('take_profit_ticks', takeProfitTicks);

    try {
      await createTrade(formData);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erreur lors de l’enregistrement');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Link href="/trading">
          <Button variant="ghost" size="sm" type="button" className="text-neutral-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Retour à Mes Trades
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#39FF14] text-black hover:bg-[#32e012] font-bold px-6 shadow-[0_0_20px_rgba(57,255,20,0.3)] h-10 text-xs"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Enregistrement...' : 'Enregistrer le Trade'}
        </Button>
      </div>

      <Card className="bg-[#141414] border-white/10 shadow-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.01]">
          <CardTitle className="text-lg font-bold text-white">
            Journaliser une Exécution
          </CardTitle>
          <CardDescription className="text-xs text-neutral-400">
            Renseignez votre trade, vos niveaux en <strong>ticks</strong> et capturez votre graphique.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* 1. Date & Session */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Date & Heure d'Exécution
              </label>
              <Input
                type="datetime-local"
                name="trade_date"
                defaultValue={new Date().toISOString().slice(0, 16)}
                className="bg-black/50 border-white/10 text-white font-mono text-xs max-w-sm"
                required
              />
            </div>
          </div>

          {/* 2. Instrument & Direction */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-300">Instrument</label>
                <span className="text-[10px] text-neutral-500 font-mono">
                  1 Tick = ${instSpec.tickValue}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {Object.keys(INSTRUMENTS).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setInstrument(key)}
                    className={`py-2 px-2 rounded-lg border text-xs font-bold transition-all ${
                      instrument === key
                        ? 'bg-[#39FF14]/10 border-[#39FF14] text-white shadow-[0_0_10px_rgba(57,255,20,0.15)]'
                        : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('Long')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    direction === 'Long'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Long (Achat)
                </button>

                <button
                  type="button"
                  onClick={() => setDirection('Short')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    direction === 'Short'
                      ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  Short (Vente)
                </button>
              </div>
            </div>
          </div>

          {/* 3. Ticks & Prices Inputs */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-4">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
              <span>Niveaux & Spécifications Futures</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Prix d'Entrée
                </label>
                <Input
                  type="number"
                  step="0.25"
                  name="entry_price"
                  placeholder="21350.00"
                  className="bg-black/60 border-white/10 text-white font-mono text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-neutral-300">Stop Loss (Ticks)</label>
                  {stopLossTicks && (
                    <span className="text-[10px] text-neutral-500">
                      {(Number(stopLossTicks) * 0.25).toFixed(1)} pts
                    </span>
                  )}
                </div>
                <Input
                  type="number"
                  step="1"
                  value={stopLossTicks}
                  onChange={(e) => setStopLossTicks(e.target.value)}
                  placeholder="Ex: 40 ticks"
                  className="bg-black/60 border-white/10 text-white font-mono text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-neutral-300">Take Profit (Ticks)</label>
                  {takeProfitTicks && (
                    <span className="text-[10px] text-neutral-500">
                      {(Number(takeProfitTicks) * 0.25).toFixed(1)} pts
                    </span>
                  )}
                </div>
                <Input
                  type="number"
                  step="1"
                  value={takeProfitTicks}
                  onChange={(e) => setTakeProfitTicks(e.target.value)}
                  placeholder="Ex: 80 ticks"
                  className="bg-black/60 border-white/10 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Stop Loss (Prix)
                </label>
                <Input
                  type="number"
                  step="0.25"
                  name="stop_loss"
                  placeholder="21340.00"
                  className="bg-black/60 border-white/10 text-white font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* 4. Financial Performance ($ and R) */}
          <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3">
            <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Résultat Financier du Trade
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1">
                  Risque du trade ($ = 1R)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">$</span>
                  <Input
                    type="number"
                    value={riskDollars}
                    onChange={(e) => handleRiskChange(Number(e.target.value))}
                    className="bg-black/80 border-white/10 pl-6 text-white font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1">
                  P&L Net ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">$</span>
                  <Input
                    type="number"
                    value={pnlDollars}
                    onChange={(e) => handlePnlChange(Number(e.target.value))}
                    className="bg-black/80 border-white/10 pl-6 font-mono text-xs font-bold text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1">
                  Résultat en R
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    value={pnlR}
                    onChange={(e) => {
                      const r = Number(e.target.value);
                      setPnlR(r);
                      setPnlDollars(Number((r * riskDollars).toFixed(2)));
                    }}
                    className={`bg-black/80 border-white/10 font-mono text-xs font-bold ${
                      pnlR > 0 ? 'text-[#39FF14]' : pnlR < 0 ? 'text-red-400' : 'text-neutral-300'
                    }`}
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">R</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Psychologie & Discipline de Session (Tagging en 3 secondes) */}
          <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                Psychologie & Rigueur d'Exécution
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">Tagging instantané</span>
            </div>

            {/* A. Emotional Mindset */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 block">
                État d'esprit & Émotion au moment d'entrer
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setEmotionalState('calm')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                    emotionalState === 'calm'
                      ? 'bg-[#39FF14]/15 border-[#39FF14] text-[#39FF14] shadow-[0_0_12px_rgba(57,255,20,0.2)]'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>🧘</span>
                  <span>Calme & Focus</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEmotionalState('fomo')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                    emotionalState === 'fomo'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>⚡</span>
                  <span>FOMO / Impatient</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEmotionalState('revenge')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                    emotionalState === 'revenge'
                      ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>😡</span>
                  <span>Revenge / Frustré</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEmotionalState('fatigued')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                    emotionalState === 'fatigued'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>🥱</span>
                  <span>Fatigué / Distrait</span>
                </button>
              </div>
            </div>

            {/* B. Plan Compliance */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 block">
                Conformité au Plan & Ruleset
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPlanCompliance('full')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                    planCompliance === 'full'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>100% sur Plan (A+ Setup)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlanCompliance('minor_deviation')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                    planCompliance === 'minor_deviation'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>🟡</span>
                  <span>Déviation Mineure</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlanCompliance('off_plan')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                    planCompliance === 'off_plan'
                      ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Hors Plan / Impulsif</span>
                </button>
              </div>
            </div>

            {/* C. Stop Loss Discipline */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 block">
                Gestion du Stop Loss
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStopDiscipline('respected')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                    stopDiscipline === 'respected'
                      ? 'bg-[#39FF14]/15 border-[#39FF14] text-[#39FF14]'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>✅</span>
                  <span>100% Respecté (Intact)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStopDiscipline('moved_early')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                    stopDiscipline === 'moved_early'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>⚠️</span>
                  <span>Déplacé Trop Tôt / BE</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStopDiscipline('widened_or_removed')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                    stopDiscipline === 'widened_or_removed'
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>❌</span>
                  <span>Élargi ou Supprimé</span>
                </button>
              </div>
            </div>
          </div>

          {/* 6. Screenshot Uploader (Supabase Storage / Drag & Drop) */}
          <ScreenshotUploader value={screenshotUrl} onChange={setScreenshotUrl} />

          {/* 7. Mistakes & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Erreurs identifiées
              </label>
              <Textarea
                name="mistakes"
                placeholder="Ex: Entrée précipitée, SL déplacé sans raison, non-respect de l'invalidation..."
                rows={3}
                className="bg-black/50 border-white/10 text-white text-xs resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Notes & Enseignements
              </label>
              <Textarea
                name="notes"
                placeholder="Ex: Belle patience, target atteinte sur zone de liquidité..."
                rows={3}
                className="bg-black/50 border-white/10 text-white text-xs resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
