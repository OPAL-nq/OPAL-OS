import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Trade, WorkspaceSession } from '@/types/trading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Calendar,
  Layers,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ tradeId: string }>;
}

export default async function TradeDetailPage({ params }: Props) {
  const { tradeId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tradeData } = await supabase
    .from('trades')
    .select('*')
    .eq('id', tradeId)
    .eq('user_id', user?.id || '')
    .single();

  if (!tradeData) {
    notFound();
  }

  const trade = tradeData as Trade;
  const isWin = trade.pnl_r > 0;
  const isLoss = trade.pnl_r < 0;
  const formattedDate = new Date(trade.trade_date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <Link href="/trading">
          <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Retour à Mes Trades
          </Button>
        </Link>
      </div>

      {/* Main Trade Summary Card */}
      <Card className="bg-[#141414] border-white/10 shadow-2xl">
        <CardHeader className="pb-4 border-b border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-white">{trade.instrument}</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    trade.direction === 'Long'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
                >
                  {trade.direction === 'Long' ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {trade.direction}
                </span>
              </div>
              <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>{formattedDate}</span>
              </div>
            </div>

            {/* Big PnL Badge */}
            <div className="text-right">
              <div
                className={`text-3xl font-black font-mono ${
                  isWin ? 'text-[#39FF14]' : isLoss ? 'text-red-400' : 'text-neutral-300'
                }`}
              >
                {trade.pnl_r > 0 ? `+${trade.pnl_r.toFixed(2)}R` : `${trade.pnl_r.toFixed(2)}R`}
              </div>
              <div className="text-xs text-neutral-400 font-mono">
                {trade.pnl_dollars >= 0 ? `+$${trade.pnl_dollars.toFixed(0)}` : `-$${Math.abs(trade.pnl_dollars).toFixed(0)}`}{' '}
                (Risque: ${trade.risk_dollars.toFixed(0)})
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Price Execution Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="text-[11px] text-neutral-400">Prix d'Entrée</div>
              <div className="text-base font-bold font-mono text-white">
                {trade.entry_price ? trade.entry_price : '—'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="text-[11px] text-neutral-400">Stop Loss</div>
              <div className="text-base font-bold font-mono text-red-400">
                {trade.stop_loss ? trade.stop_loss : '—'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="text-[11px] text-neutral-400">Take Profit / Target</div>
              <div className="text-base font-bold font-mono text-[#39FF14]">
                {trade.take_profit ? trade.take_profit : '—'}
              </div>
            </div>
          </div>

          {/* Plan Discipline Status */}
          <div className="p-4 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
            <span className="text-xs text-neutral-300">Discipline & Plan de Trading :</span>
            {trade.plan_followed ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-4 h-4" />
                Plan 100% Respecté
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                <XCircle className="w-4 h-4" />
                Déviation du Plan
              </span>
            )}
          </div>

          {/* Notes & Mistakes */}
          {(trade.notes || trade.mistakes) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trade.notes && (
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#39FF14]" />
                    <span>Notes & Contexte</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {trade.notes}
                  </p>
                </div>
              )}

              {trade.mistakes && (
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-1.5">
                  <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Erreurs identifiées</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {trade.mistakes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Screenshot Preview */}
          {trade.screenshot_url && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Capture d'écran du trade</span>
                <a
                  href={trade.screenshot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#39FF14] hover:underline flex items-center gap-1"
                >
                  <span>Ouvrir en plein écran</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="rounded-xl overflow-hidden border border-white/10 bg-black max-h-[500px] flex items-center justify-center">
                <img
                  src={trade.screenshot_url}
                  alt={`Capture trade ${trade.instrument}`}
                  className="w-full h-auto object-contain max-h-[500px]"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
