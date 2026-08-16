'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TradeStats } from '@/types/trading';
import { TrendingUp, Target, Award, Percent, DollarSign, Activity } from 'lucide-react';

interface TradeStatsCardProps {
  stats: TradeStats;
}

export function TradeStatsCard({ stats }: TradeStatsCardProps) {
  const isProfitable = stats.totalR >= 0;
  const isPnlPositive = stats.totalPnlDollars >= 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Total Trades */}
      <Card className="bg-[#141414] border-white/10">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Total Trades</span>
            <Activity className="w-3.5 h-3.5 text-neutral-500" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalTrades}</div>
          <div className="text-[10px] text-neutral-500">
            {stats.winTrades}W / {stats.lossTrades}L / {stats.beTrades}BE
          </div>
        </CardContent>
      </Card>

      {/* 2. Win Rate */}
      <Card className="bg-[#141414] border-white/10">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Win Rate</span>
            <Percent className="w-3.5 h-3.5 text-neutral-500" />
          </div>
          <div className="text-2xl font-black text-[#39FF14]">
            {stats.totalTrades > 0 ? `${stats.winRate.toFixed(1)}%` : '—'}
          </div>
          <div className="text-[10px] text-neutral-500">
            {stats.winTrades} gagnants sur {stats.totalTrades}
          </div>
        </CardContent>
      </Card>

      {/* 3. Total R */}
      <Card className="bg-[#141414] border-white/10">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Total R</span>
            <Target className="w-3.5 h-3.5 text-neutral-500" />
          </div>
          <div className={`text-2xl font-black ${isProfitable ? 'text-[#39FF14]' : 'text-red-400'}`}>
            {stats.totalR > 0 ? `+${stats.totalR.toFixed(1)}R` : `${stats.totalR.toFixed(1)}R`}
          </div>
          <div className="text-[10px] text-neutral-500">
            Moyenne : {stats.avgR > 0 ? `+${stats.avgR.toFixed(2)}R` : `${stats.avgR.toFixed(2)}R`} / trade
          </div>
        </CardContent>
      </Card>

      {/* 4. Total P&L $ */}
      <Card className="bg-[#141414] border-white/10">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>P&L Total ($)</span>
            <DollarSign className="w-3.5 h-3.5 text-neutral-500" />
          </div>
          <div className={`text-2xl font-black ${isPnlPositive ? 'text-[#39FF14]' : 'text-red-400'}`}>
            {stats.totalPnlDollars >= 0
              ? `+$${stats.totalPnlDollars.toLocaleString('fr-FR', { minimumFractionDigits: 0 })}`
              : `-$${Math.abs(stats.totalPnlDollars).toLocaleString('fr-FR', { minimumFractionDigits: 0 })}`}
          </div>
          <div className="text-[10px] text-neutral-500">Gains nets cumulés</div>
        </CardContent>
      </Card>

      {/* 5. Respect du plan */}
      <Card className="bg-[#141414] border-white/10">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Plan Respecté</span>
            <Award className="w-3.5 h-3.5 text-neutral-500" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats.totalTrades > 0 ? `${stats.planFollowedRate.toFixed(0)}%` : '—'}
          </div>
          <div className="text-[10px] text-neutral-500">Discipline d'exécution</div>
        </CardContent>
      </Card>

      {/* 6. Ratio Gain/Perte */}
      <Card className="bg-[#141414] border-white/10">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Gagnants vs Perdants</span>
            <TrendingUp className="w-3.5 h-3.5 text-neutral-500" />
          </div>
          <div className="text-xl font-black text-neutral-200">
            <span className="text-[#39FF14]">{stats.winTrades}</span>
            <span className="text-neutral-500 mx-1">/</span>
            <span className="text-red-400">{stats.lossTrades}</span>
          </div>
          <div className="text-[10px] text-neutral-500">Trades clôturés</div>
        </CardContent>
      </Card>
    </div>
  );
}
