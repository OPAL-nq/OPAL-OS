'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Trash2,
  Layers,
  Sparkles,
  Check,
  RotateCcw,
  CheckSquare,
  Square,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  parseTradingCsv,
  ParsedRawTrade,
  ParseResult,
  DetectedPlatform,
} from '@/lib/parsers/trade-csv-parser';
import { batchCreateTrades, BatchTradeInput } from '@/app/actions/trades';
import type { InstrumentType, TradeDirection } from '@/types/trading';

const OPAL_SETUPS = [
  'Volume Profile (VAH / VAL / POC)',
  'Session VWAP Confluence',
  'Asian / London Extremes',
  'IFVG (Inverse Fair Value Gap)',
  'BPR (Balanced Price Range)',
  'FVG (Fair Value Gap)',
  'Inversion de Tendance / Inefficience',
  'Breakout & Re-test de Niveau Clé',
];

const SESSIONS = [
  'NY AM (09:30 - 12:00)',
  'NY PM (13:00 - 16:00)',
  'London Open (08:00 - 14:00)',
  'Asie / Londres Pré-market',
];

const PSYCHOLOGY_TAGS = [
  'Discipliné / Conforme au Plan',
  'Stress / Hésitation à l’Entrée',
  'Sortie Anticipée (Manque de Confiance)',
  'FOMO (Entrée Trop Tardive)',
  'Revanche / Tilt',
  'Overtrading',
];

const SAMPLE_NINJATRADER_CSV = `Trade #,Instrument,Account,Strategy,Market pos.,Qty,Entry price,Exit price,Entry time,Exit time,Profit/Loss ($),Profit/Loss (ticks)
1,NQ 03-25,Sim101,,Long,1,21450.25,21485.50,2026-03-10 09:42:15,2026-03-10 10:05:30,705.00,141
2,NQ 03-25,Sim101,,Short,1,21510.00,21495.00,2026-03-10 10:35:10,2026-03-10 10:48:22,300.00,60
3,MNQ 03-25,Sim101,,Long,2,21460.50,21445.50,2026-03-10 11:15:00,2026-03-10 11:22:18,-60.00,-60
4,NQ 03-25,Sim101,,Long,1,21480.00,21520.00,2026-03-10 14:32:00,2026-03-10 15:10:45,800.00,160`;

const SAMPLE_TRADOVATE_CSV = `contract,action,orderQty,buyPrice,sellPrice,realizedPnl,fillTime
NQ,Buy,1,21410.50,21448.75,765.00,2026-03-10T14:35:20.000Z
NQ,Sell,1,21465.00,21475.00,-200.00,2026-03-10T15:12:10.000Z
MNQ,Buy,4,21420.00,21455.00,280.00,2026-03-10T15:45:00.000Z`;

export function CsvTradeImporter() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [trades, setTrades] = useState<ParsedRawTrade[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessCount, setSaveSuccessCount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Bulk edit state
  const [bulkSetup, setBulkSetup] = useState<string>('');
  const [bulkSession, setBulkSession] = useState<string>('');

  const handleProcessCsvText = (content: string) => {
    setErrorMessage(null);
    setSaveSuccessCount(null);
    try {
      const res = parseTradingCsv(content);
      setParseResult(res);
      if (res.success && res.trades.length > 0) {
        setTrades(res.trades);
      } else {
        setTrades([]);
        setErrorMessage(res.errors.join(' | ') || 'Format non reconnu.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur inconnue lors du traitement du fichier.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      handleProcessCsvText(text);
    };
    reader.onerror = () => {
      setErrorMessage('Impossible de lire le fichier.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      handleProcessCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Trade selection toggles
  const toggleSelectAll = (selected: boolean) => {
    setTrades((prev) => prev.map((t) => ({ ...t, selected })));
  };

  const toggleSelectTrade = (id: string) => {
    setTrades((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    );
  };

  const updateTradeField = (id: string, field: keyof ParsedRawTrade, value: any) => {
    setTrades((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, [field]: value };

        // Auto recalculate R if pnl or risk changed
        if (field === 'pnl_dollars' || field === 'risk_dollars') {
          const risk = field === 'risk_dollars' ? Number(value) : t.risk_dollars;
          const pnl = field === 'pnl_dollars' ? Number(value) : t.pnl_dollars;
          if (risk > 0) {
            updated.pnl_r = Number((pnl / risk).toFixed(2));
          }
        }
        return updated;
      })
    );
  };

  const removeTrade = (id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
  };

  const applyBulkSetup = () => {
    if (!bulkSetup) return;
    setTrades((prev) =>
      prev.map((t) => (t.selected ? { ...t, technique_tag: bulkSetup } : t))
    );
  };

  const applyBulkSession = () => {
    if (!bulkSession) return;
    setTrades((prev) =>
      prev.map((t) => (t.selected ? { ...t, session_tag: bulkSession } : t))
    );
  };

  // Submit batch to Supabase
  const handleSaveTrades = async () => {
    const selectedTrades = trades.filter((t) => t.selected);
    if (selectedTrades.length === 0) {
      setErrorMessage('Veuillez sélectionner au moins un trade à importer.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const payload: BatchTradeInput[] = selectedTrades.map((t) => ({
        trade_date: t.trade_date,
        instrument: t.instrument,
        direction: t.direction,
        entry_price: t.entry_price,
        stop_loss: t.stop_loss ?? null,
        take_profit: t.take_profit ?? null,
        stop_loss_ticks: t.stop_loss_ticks ?? null,
        take_profit_ticks: t.take_profit_ticks ?? null,
        risk_dollars: t.risk_dollars,
        pnl_dollars: t.pnl_dollars,
        pnl_r: t.pnl_r,
        screenshot_url: null,
        plan_followed: t.plan_followed,
        mistakes: t.mindset ? `Psychologie : ${t.mindset}` : null,
        notes: t.notes || null,
        market_context: `Session : ${t.session_tag || 'NY AM'} | Setup : ${t.technique_tag || 'Volume Profile'}`,
      }));

      const res = await batchCreateTrades(payload);
      setSaveSuccessCount(res.count);
      setIsSaving(false);
    } catch (err: any) {
      setIsSaving(false);
      setErrorMessage(err.message || 'Une erreur est survenue lors de l’importation.');
    }
  };

  // Aggregated preview stats
  const selectedTrades = trades.filter((t) => t.selected);
  const totalSelectedPnl = selectedTrades.reduce((acc, t) => acc + (t.pnl_dollars || 0), 0);
  const totalSelectedR = selectedTrades.reduce((acc, t) => acc + (t.pnl_r || 0), 0);
  const winCount = selectedTrades.filter((t) => (t.pnl_dollars || 0) > 0).length;
  const winRate = selectedTrades.length > 0 ? Math.round((winCount / selectedTrades.length) * 100) : 0;
  const allSelected = trades.length > 0 && trades.every((t) => t.selected);

  return (
    <div className="space-y-8">
      {/* 1. Header Card */}
      <div className="rounded-2xl border border-white/10 bg-[#141414] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zéro Saisie Manuelle</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Importateur Universel CSV de Trades
            </h1>
            <p className="text-sm text-neutral-400">
              Synchronisez vos journaux d’exécution NinjaTrader, Tradovate, TopstepX, Quantower ou TradingView en 2 secondes.
            </p>
          </div>

          {/* Supported platform tags */}
          <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
            <Badge variant="outline" className="border-white/10 text-xs text-neutral-300">
              NinjaTrader 8
            </Badge>
            <Badge variant="outline" className="border-white/10 text-xs text-neutral-300">
              Tradovate
            </Badge>
            <Badge variant="outline" className="border-white/10 text-xs text-neutral-300">
              TopstepX
            </Badge>
            <Badge variant="outline" className="border-white/10 text-xs text-neutral-300">
              Quantower / Rithmic
            </Badge>
            <Badge variant="outline" className="border-white/10 text-xs text-neutral-300">
              TradingView
            </Badge>
          </div>
        </div>
      </div>

      {/* 2. Drag & Drop Upload Zone */}
      <Card
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed transition-all duration-200 cursor-pointer ${
          isDragging
            ? 'border-[#39FF14] bg-[#39FF14]/5 scale-[1.01]'
            : 'border-white/15 bg-black/40 hover:border-white/30 hover:bg-[#141414]'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,text/csv,text/plain"
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300">
            <UploadCloud className="w-8 h-8 text-[#39FF14]" />
          </div>

          <div className="space-y-1">
            <p className="text-base font-bold text-white">
              Glissez et déposez votre fichier CSV ici
            </p>
            <p className="text-xs text-neutral-400">
              ou cliquez pour parcourir vos fichiers (.csv)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs border-white/10 hover:border-white/20 bg-white/5"
              onClick={() => handleProcessCsvText(SAMPLE_NINJATRADER_CSV)}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              Tester Exemple NinjaTrader
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs border-white/10 hover:border-white/20 bg-white/5"
              onClick={() => handleProcessCsvText(SAMPLE_TRADOVATE_CSV)}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Tester Exemple Tradovate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Banner */}
      {saveSuccessCount !== null && (
        <div className="p-6 rounded-2xl bg-[#39FF14]/10 border border-[#39FF14]/30 space-y-4">
          <div className="flex items-center gap-3 text-[#39FF14]">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="font-bold text-base text-white">
                {saveSuccessCount} trade(s) importé(s) avec succès dans votre Journal !
              </h3>
              <p className="text-xs text-neutral-400">
                Vos statistiques de trading et graphiques de performance ont été mis à jour instantanément.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push('/trading')}
              className="bg-[#39FF14] hover:bg-[#32e612] text-black font-bold text-xs"
            >
              Voir mon Journal de Trading
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setTrades([]);
                setParseResult(null);
                setSaveSuccessCount(null);
              }}
              className="border-white/10 text-xs"
            >
              Importer un autre fichier
            </Button>
          </div>
        </div>
      )}

      {/* 3. Trades Preview & Customization Table */}
      {trades.length > 0 && saveSuccessCount === null && (
        <div className="space-y-6">
          {/* Top detected banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#141414] border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-neutral-400">Plateforme détectée :</div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{parseResult?.platformName}</span>
                  <Badge variant="outline" className="text-[10px] border-[#39FF14]/40 text-[#39FF14]">
                    {trades.length} trades identifiés
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="text-neutral-400">Sélectionnés : </span>
                <span className="font-bold text-white">{selectedTrades.length}/{trades.length}</span>
              </div>
              <div>
                <span className="text-neutral-400">Win Rate : </span>
                <span className="font-bold text-[#39FF14]">{winRate}%</span>
              </div>
              <div>
                <span className="text-neutral-400">PnL Total : </span>
                <span
                  className={`font-bold ${
                    totalSelectedPnl >= 0 ? 'text-[#39FF14]' : 'text-red-400'
                  }`}
                >
                  {totalSelectedPnl >= 0 ? `+${totalSelectedPnl.toFixed(2)} $` : `${totalSelectedPnl.toFixed(2)} $`}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Total R : </span>
                <span
                  className={`font-bold ${
                    totalSelectedR >= 0 ? 'text-[#39FF14]' : 'text-red-400'
                  }`}
                >
                  {totalSelectedR >= 0 ? `+${totalSelectedR.toFixed(2)} R` : `${totalSelectedR.toFixed(2)} R`}
                </span>
              </div>
            </div>
          </div>

          {/* Bulk Assign Controls */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2 font-semibold text-neutral-300">
              <Layers className="w-4 h-4 text-[#39FF14]" />
              <span>Actions groupées sur la sélection :</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={bulkSetup}
                onChange={(e) => setBulkSetup(e.target.value)}
                className="bg-[#181818] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#39FF14]"
              >
                <option value="">Sélectionner un Setup OPAL...</option>
                {OPAL_SETUPS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={applyBulkSetup}
                disabled={!bulkSetup}
                className="text-xs border-white/10 hover:border-[#39FF14]"
              >
                Appliquer
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={bulkSession}
                onChange={(e) => setBulkSession(e.target.value)}
                className="bg-[#181818] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#39FF14]"
              >
                <option value="">Sélectionner une Session...</option>
                {SESSIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={applyBulkSession}
                disabled={!bulkSession}
                className="text-xs border-white/10 hover:border-[#39FF14]"
              >
                Appliquer
              </Button>
            </div>
          </div>

          {/* Trades Table */}
          <div className="border border-white/10 rounded-2xl overflow-x-auto bg-[#141414]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/60 text-neutral-400 font-semibold">
                  <th className="p-3.5 w-10 text-center">
                    <button
                      type="button"
                      onClick={() => toggleSelectAll(!allSelected)}
                      className="text-neutral-400 hover:text-white"
                    >
                      {allSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#39FF14]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">Date & Heure</th>
                  <th className="p-3.5">Instrument</th>
                  <th className="p-3.5">Sens</th>
                  <th className="p-3.5">Entrée / Sortie</th>
                  <th className="p-3.5">PnL ($)</th>
                  <th className="p-3.5">R</th>
                  <th className="p-3.5 min-w-[180px]">Setup OPAL</th>
                  <th className="p-3.5 min-w-[150px]">Session</th>
                  <th className="p-3.5 min-w-[160px]">Psychologie / Discipline</th>
                  <th className="p-3.5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {trades.map((trade) => {
                  const isWin = trade.pnl_dollars > 0;
                  const isLoss = trade.pnl_dollars < 0;

                  return (
                    <tr
                      key={trade.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        !trade.selected ? 'opacity-40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectTrade(trade.id)}
                          className="text-neutral-400 hover:text-white"
                        >
                          {trade.selected ? (
                            <CheckSquare className="w-4 h-4 text-[#39FF14]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="p-3.5 font-mono text-neutral-300">
                        {trade.trade_date.replace('T', ' ')}
                      </td>

                      {/* Instrument */}
                      <td className="p-3.5">
                        <select
                          value={trade.instrument}
                          onChange={(e) =>
                            updateTradeField(trade.id, 'instrument', e.target.value as InstrumentType)
                          }
                          className="bg-[#181818] border border-white/10 rounded px-2 py-1 text-white font-bold"
                        >
                          <option value="NQ">NQ</option>
                          <option value="MNQ">MNQ</option>
                          <option value="ES">ES</option>
                          <option value="MES">MES</option>
                        </select>
                      </td>

                      {/* Direction */}
                      <td className="p-3.5">
                        <Badge
                          variant="outline"
                          className={
                            trade.direction === 'Long'
                              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                              : 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                          }
                        >
                          {trade.direction}
                        </Badge>
                      </td>

                      {/* Entry & Exit Price */}
                      <td className="p-3.5 font-mono text-neutral-300">
                        <div>
                          <span className="text-[10px] text-neutral-500">In: </span>
                          {trade.entry_price ? trade.entry_price.toFixed(2) : '-'}
                        </div>
                        {trade.exit_price && (
                          <div>
                            <span className="text-[10px] text-neutral-500">Out: </span>
                            {trade.exit_price.toFixed(2)}
                          </div>
                        )}
                      </td>

                      {/* PnL $ */}
                      <td className="p-3.5 font-bold font-mono">
                        <div className="flex items-center gap-1.5">
                          {isWin ? (
                            <TrendingUp className="w-3.5 h-3.5 text-[#39FF14]" />
                          ) : isLoss ? (
                            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                          ) : null}
                          <span
                            className={
                              isWin
                                ? 'text-[#39FF14]'
                                : isLoss
                                ? 'text-rose-400'
                                : 'text-neutral-400'
                            }
                          >
                            {trade.pnl_dollars >= 0
                              ? `+${trade.pnl_dollars.toFixed(2)} $`
                              : `${trade.pnl_dollars.toFixed(2)} $`}
                          </span>
                        </div>
                      </td>

                      {/* R */}
                      <td className="p-3.5 font-mono font-semibold">
                        <span
                          className={
                            trade.pnl_r >= 0 ? 'text-[#39FF14]' : 'text-rose-400'
                          }
                        >
                          {trade.pnl_r >= 0 ? `+${trade.pnl_r} R` : `${trade.pnl_r} R`}
                        </span>
                      </td>

                      {/* Setup Dropdown */}
                      <td className="p-3.5">
                        <select
                          value={trade.technique_tag || ''}
                          onChange={(e) =>
                            updateTradeField(trade.id, 'technique_tag', e.target.value)
                          }
                          className="w-full bg-[#181818] border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-[#39FF14]"
                        >
                          {OPAL_SETUPS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Session Dropdown */}
                      <td className="p-3.5">
                        <select
                          value={trade.session_tag || ''}
                          onChange={(e) =>
                            updateTradeField(trade.id, 'session_tag', e.target.value)
                          }
                          className="w-full bg-[#181818] border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-[#39FF14]"
                        >
                          {SESSIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Mindset */}
                      <td className="p-3.5">
                        <select
                          value={trade.mindset || ''}
                          onChange={(e) =>
                            updateTradeField(trade.id, 'mindset', e.target.value)
                          }
                          className="w-full bg-[#181818] border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-[#39FF14]"
                        >
                          {PSYCHOLOGY_TAGS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Delete */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => removeTrade(trade.id)}
                          className="text-neutral-500 hover:text-rose-400 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom validation button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-black via-[#141414] to-black border border-[#39FF14]/30">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-sm font-bold text-white">
                Prêt à enregistrer {selectedTrades.length} trade(s) ?
              </div>
              <div className="text-xs text-neutral-400">
                Les positions seront ajoutées immédiatement à votre journal et visibles dans vos statistiques de progression.
              </div>
            </div>

            <Button
              onClick={handleSaveTrades}
              disabled={isSaving || selectedTrades.length === 0}
              size="lg"
              className="w-full sm:w-auto bg-[#39FF14] hover:bg-[#32e612] text-black font-bold text-xs px-8 py-6 rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all"
            >
              {isSaving ? (
                'Enregistrement en cours...'
              ) : (
                <>
                  <span>Importer {selectedTrades.length} trade(s) dans mon Journal</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
