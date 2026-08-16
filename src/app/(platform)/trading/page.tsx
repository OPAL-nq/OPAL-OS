import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Trade, WorkspaceSession, TradeStats } from '@/types/trading';
import { QuickLinks } from '@/components/trading/quick-links';
import { TradingHubTabs } from '@/components/trading/trading-hub-tabs';
import { TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TradingHubPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch user's workspace sessions
  const { data: sessionsData } = await supabase
    .from('workspace_sessions')
    .select('*')
    .eq('user_id', user?.id || '')
    .order('session_date', { ascending: false });

  const sessions = (sessionsData || []) as WorkspaceSession[];

  // Fetch user's trades
  const { data: tradesData } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user?.id || '')
    .order('trade_date', { ascending: false });

  const trades = (tradesData || []) as Trade[];

  // Compute stats
  const totalTrades = trades.length;
  const winTrades = trades.filter((t) => Number(t.pnl_r) > 0).length;
  const lossTrades = trades.filter((t) => Number(t.pnl_r) < 0).length;
  const beTrades = trades.filter((t) => Number(t.pnl_r) === 0).length;
  const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;
  const totalR = trades.reduce((acc, t) => acc + (Number(t.pnl_r) || 0), 0);
  const totalPnlDollars = trades.reduce((acc, t) => acc + (Number(t.pnl_dollars) || 0), 0);
  const avgR = totalTrades > 0 ? totalR / totalTrades : 0;
  const planFollowedCount = trades.filter((t) => t.plan_followed).length;
  const planFollowedRate = totalTrades > 0 ? (planFollowedCount / totalTrades) * 100 : 0;

  const stats: TradeStats = {
    totalTrades,
    winTrades,
    lossTrades,
    beTrades,
    winRate,
    totalR,
    totalPnlDollars,
    avgR,
    planFollowedRate,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#39FF14] uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>OPAL Trading System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Workspace & Journal de Trading
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Préparez votre session, formalisez votre décision et suivez vos performances R.
          </p>
        </div>
      </div>

      {/* Main Tabs Segment: Sessions, Journal, Stats & Integrated Calendar */}
      <TradingHubTabs sessions={sessions} trades={trades} stats={stats} />
    </div>
  );
}
