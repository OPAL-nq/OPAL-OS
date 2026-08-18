'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trade } from '@/types/trading';
import { deleteTrade } from '@/app/actions/trades';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Filter,
  Eye,
  Plus,
  UploadCloud,
} from 'lucide-react';

interface TradeListProps {
  trades: Trade[];
}

export function TradeList({ trades }: TradeListProps) {
  const [filterInstrument, setFilterInstrument] = useState<string>('ALL');
  const [filterDirection, setFilterDirection] = useState<string>('ALL');
  const [filterOutcome, setFilterOutcome] = useState<string>('ALL');
  const [filterPlan, setFilterPlan] = useState<string>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredTrades = trades.filter((trade) => {
    if (filterInstrument !== 'ALL' && trade.instrument !== filterInstrument) return false;
    if (filterDirection !== 'ALL' && trade.direction !== filterDirection) return false;
    if (filterPlan !== 'ALL') {
      const planBool = filterPlan === 'YES';
      if (trade.plan_followed !== planBool) return false;
    }
    if (filterOutcome !== 'ALL') {
      if (filterOutcome === 'WIN' && trade.pnl_r <= 0) return false;
      if (filterOutcome === 'LOSS' && trade.pnl_r >= 0) return false;
      if (filterOutcome === 'BE' && trade.pnl_r !== 0) return false;
    }
    return true;
  });

  const handleDelete = async (tradeId: string) => {
    if (!confirm('Supprimer ce trade du journal ?')) return;
    try {
      setDeletingId(tradeId);
      await deleteTrade(tradeId);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="p-4 rounded-xl bg-[#141414] border border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-400 mr-2">
            <Filter className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>Filtres :</span>
          </div>

          {/* Instrument Filter */}
          <select
            value={filterInstrument}
            onChange={(e) => setFilterInstrument(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-none focus:border-[#39FF14]"
          >
            <option value="ALL">Tous les actifs</option>
            <option value="NQ">NQ</option>
            <option value="MNQ">MNQ</option>
            <option value="ES">ES</option>
            <option value="MES">MES</option>
          </select>

          {/* Direction Filter */}
          <select
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-none focus:border-[#39FF14]"
          >
            <option value="ALL">Long & Short</option>
            <option value="Long">Long uniquement</option>
            <option value="Short">Short uniquement</option>
          </select>

          {/* Outcome Filter */}
          <select
            value={filterOutcome}
            onChange={(e) => setFilterOutcome(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-none focus:border-[#39FF14]"
          >
            <option value="ALL">Tous les résultats</option>
            <option value="WIN">Gagnants (&gt; 0R)</option>
            <option value="LOSS">Perdants (&lt; 0R)</option>
            <option value="BE">Breakeven (0R)</option>
          </select>

          {/* Plan Followed */}
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-none focus:border-[#39FF14]"
          >
            <option value="ALL">Plan : Tous</option>
            <option value="YES">Plan respecté (Oui)</option>
            <option value="NO">Plan non respecté (Non)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/trading/import">
            <Button
              size="sm"
              variant="outline"
              className="border-white/10 hover:border-[#39FF14]/40 bg-white/5 hover:bg-white/10 text-white font-medium text-xs h-8"
            >
              <UploadCloud className="w-3.5 h-3.5 mr-1 text-[#39FF14]" />
              Importer CSV
            </Button>
          </Link>

          <Link href="/trading/journal/new">
            <Button size="sm" className="bg-[#39FF14] text-black hover:bg-[#32e012] font-semibold text-xs h-8">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Nouveau Trade
            </Button>
          </Link>
        </div>
      </div>

      {/* Trades List */}
      {filteredTrades.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#141414] border border-white/10 text-neutral-400 space-y-4">
          <p className="text-sm">Aucun trade ne correspond aux filtres sélectionnés.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/trading/import">
              <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/5 text-xs">
                <UploadCloud className="w-3.5 h-3.5 mr-1 text-[#39FF14]" />
                Importer un fichier CSV
              </Button>
            </Link>
            <Link href="/trading/journal/new">
              <Button size="sm" className="bg-[#39FF14] text-black hover:bg-[#32e012] font-semibold text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Saisir un trade manuellement
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10 bg-[#141414]">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/40 border-b border-white/10 text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Actif</th>
                  <th className="p-3.5">Direction</th>
                  <th className="p-3.5">Entrée / SL</th>
                  <th className="p-3.5 text-right">Risque $</th>
                  <th className="p-3.5 text-right">Résultat ($)</th>
                  <th className="p-3.5 text-right">Résultat (R)</th>
                  <th className="p-3.5 text-center">Plan</th>
                  <th className="p-3.5 text-center">Capture</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTrades.map((trade) => {
                  const isWin = trade.pnl_r > 0;
                  const isLoss = trade.pnl_r < 0;
                  const formattedDate = new Date(trade.trade_date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={trade.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 font-mono text-neutral-300">{formattedDate}</td>
                      <td className="p-3.5 font-bold text-white">{trade.instrument}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            trade.direction === 'Long'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {trade.direction === 'Long' ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {trade.direction}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-neutral-300">
                        {trade.entry_price ? trade.entry_price : '—'}
                        {trade.stop_loss && (
                          <span className="text-neutral-500 text-[10px] block">SL: {trade.stop_loss}</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-mono text-neutral-400">
                        ${trade.risk_dollars.toFixed(0)}
                      </td>
                      <td className={`p-3.5 text-right font-mono font-bold ${
                        trade.pnl_dollars > 0
                          ? 'text-[#39FF14]'
                          : trade.pnl_dollars < 0
                          ? 'text-red-400'
                          : 'text-neutral-400'
                      }`}>
                        {trade.pnl_dollars > 0 ? `+$${trade.pnl_dollars.toFixed(0)}` : `$${trade.pnl_dollars.toFixed(0)}`}
                      </td>
                      <td className="p-3.5 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-xs ${
                            isWin
                              ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30'
                              : isLoss
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : 'bg-white/5 text-neutral-400 border border-white/10'
                          }`}
                        >
                          {trade.pnl_r > 0 ? `+${trade.pnl_r.toFixed(2)}R` : `${trade.pnl_r.toFixed(2)}R`}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {trade.plan_followed ? (
                          <span className="inline-flex items-center text-emerald-400" title="Plan respecté">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-amber-400" title="Plan non respecté">
                            <XCircle className="w-4 h-4" />
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        {trade.screenshot_url ? (
                          <a
                            href={trade.screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-400 hover:text-[#39FF14] transition-colors inline-block"
                            title="Voir la capture"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <Link href={`/trading/journal/${trade.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-neutral-400 hover:text-white hover:bg-white/10"
                            title="Voir le détail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(trade.id)}
                          disabled={deletingId === trade.id}
                          className="w-7 h-7 text-neutral-500 hover:text-red-400 hover:bg-red-500/10"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredTrades.map((trade) => {
              const isWin = trade.pnl_r > 0;
              const isLoss = trade.pnl_r < 0;
              const formattedDate = new Date(trade.trade_date).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={trade.id}
                  className="p-4 rounded-xl bg-[#141414] border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{trade.instrument}</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          trade.direction === 'Long'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {trade.direction === 'Long' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {trade.direction}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded font-mono font-bold text-xs ${
                        isWin
                          ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30'
                          : isLoss
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : 'bg-white/5 text-neutral-400'
                      }`}
                    >
                      {trade.pnl_r > 0 ? `+${trade.pnl_r.toFixed(2)}R` : `${trade.pnl_r.toFixed(2)}R`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400 pt-2 border-t border-white/5">
                    <div>Date : <span className="text-neutral-200">{formattedDate}</span></div>
                    <div>P&L : <span className={trade.pnl_dollars >= 0 ? 'text-[#39FF14]' : 'text-red-400'}>${trade.pnl_dollars.toFixed(0)}</span></div>
                    <div>Risque : <span className="text-neutral-200">${trade.risk_dollars.toFixed(0)}</span></div>
                    <div>Plan respecté : <span className={trade.plan_followed ? 'text-emerald-400' : 'text-amber-400'}>{trade.plan_followed ? 'Oui' : 'Non'}</span></div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <Link href={`/trading/journal/${trade.id}`} className="text-xs text-[#39FF14] hover:underline flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      Voir la fiche
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(trade.id)}
                      disabled={deletingId === trade.id}
                      className="h-7 text-xs text-neutral-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Supprimer
                    </Button>
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
