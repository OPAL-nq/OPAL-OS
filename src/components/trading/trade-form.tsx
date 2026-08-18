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
    formData.set('plan_followed', planFollowed ? 'true' : 'false');
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

          {/* 5. Plan Discipline */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Respect du Plan de Trading
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPlanFollowed(true)}
                className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  planFollowed
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-black/40 border-white/10 text-neutral-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Plan 100% Respecté (Oui)
              </button>

              <button
                type="button"
                onClick={() => setPlanFollowed(false)}
                className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  !planFollowed
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'bg-black/40 border-white/10 text-neutral-400'
                }`}
              >
                <XCircle className="w-4 h-4" />
                Déviation du Plan (Non)
              </button>
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
