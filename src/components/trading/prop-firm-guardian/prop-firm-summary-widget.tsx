'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { calculateGuardianMetrics } from '@/lib/prop-firm-constants';
import type { PropFirmAccount } from '@/types/prop-firm';
import { cn } from '@/lib/utils';

interface PropFirmSummaryWidgetProps {
  accounts: PropFirmAccount[];
}

export function PropFirmSummaryWidget({ accounts }: PropFirmSummaryWidgetProps) {
  const activeAccount = accounts[0] || null;

  if (!activeAccount) {
    return (
      <Card className="bg-gradient-to-r from-[#141414] via-[#101010] to-[#141414] border-white/10 overflow-hidden">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Protégez vos comptes avec le Prop Firm Drawdown Guardian
              </h4>
              <p className="text-[11px] text-neutral-400">
                Calculez votre seuil de liquidation exact, vos tolérances de Stop Loss et la taille idéale Micro vs Mini.
              </p>
            </div>
          </div>

          <Button
            asChild
            size="sm"
            className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold text-xs shrink-0 h-8 shadow-[0_0_15px_rgba(57,255,20,0.2)]"
          >
            <Link href="/trading/prop-firm-guardian">
              <span>Configurer un compte</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const metrics = calculateGuardianMetrics(activeAccount, 250);

  return (
    <Card
      className={cn(
        'border overflow-hidden transition-all',
        metrics.zone === 'safe'
          ? 'bg-gradient-to-r from-[#161616] via-[#121212] to-[#161616] border-[#39FF14]/30'
          : metrics.zone === 'warning'
          ? 'bg-gradient-to-r from-[#1a1710] via-[#121212] to-[#1a1710] border-amber-500/30'
          : 'bg-gradient-to-r from-[#201010] via-[#141414] to-[#201010] border-red-500/40 animate-pulse'
      )}
    >
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: `${metrics.zoneColor}15`,
              borderColor: `${metrics.zoneColor}40`,
              color: metrics.zoneColor,
            }}
          >
            <Shield className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white truncate">
                {activeAccount.account_name}
              </span>
              <span
                className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider border"
                style={{
                  backgroundColor: `${metrics.zoneColor}15`,
                  borderColor: `${metrics.zoneColor}40`,
                  color: metrics.zoneColor,
                }}
              >
                {metrics.zoneLabel}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1 flex-wrap">
              <span>
                Solde : <strong className="text-white font-mono">${metrics.currentBalance.toLocaleString('en-US')}</strong>
              </span>
              <span>•</span>
              <span>
                Seuil : <strong className="text-red-400 font-mono">${metrics.liquidationThreshold.toLocaleString('en-US')}</strong>
              </span>
              <span>•</span>
              <span>
                Buffer : <strong className="font-mono" style={{ color: metrics.zoneColor }}>+${metrics.bufferDollars.toLocaleString('en-US')}</strong> ({metrics.tolerableConsecutiveLosses} SL tolérés)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-white/10 hover:bg-white/5 text-xs text-neutral-300 h-8"
          >
            <Link href="/trading/prop-firm-guardian">
              <span>Ouvrir le Guardian</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#39FF14]" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
