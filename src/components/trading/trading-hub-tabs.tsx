'use client';

import React, { useState } from 'react';
import { Trade, TradeStats } from '@/types/trading';
import { TradeStatsCard } from './trade-stats-card';
import { TradeList } from './trade-list';
import { EconomicCalendarWidget } from './economic-calendar-widget';
import { PropFirmSummaryWidget } from './prop-firm-guardian/prop-firm-summary-widget';
import { PropFirmGuardianView } from './prop-firm-guardian/prop-firm-guardian-view';
import { PsychologyTabView } from './psychology/psychology-tab-view';
import { InstitutionalAuditModal } from './audit/institutional-audit-modal';
import { DailyProtocolWidget } from './protocol/daily-protocol-widget';
import { TraderContractTab } from './contract/trader-contract-tab';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  BookOpen,
  Plus,
  BarChart3,
  Shield,
  UploadCloud,
  BrainCircuit,
  Flame,
  FileSignature,
} from 'lucide-react';
import Link from 'next/link';
import type { PropFirmAccount } from '@/types/prop-firm';
import type { DailyProtocol, UserStreak } from '@/types/protocol';

interface TradingHubTabsProps {
  trades: Trade[];
  stats: TradeStats;
  accounts?: PropFirmAccount[];
  protocolData?: {
    protocol: DailyProtocol;
    streak: UserStreak;
    recentDays: DailyProtocol[];
  };
}

export function TradingHubTabs({ trades, stats, accounts = [], protocolData }: TradingHubTabsProps) {
  const [activeTab, setActiveTab] = useState<'journal' | 'stats' | 'psychology' | 'guardian' | 'protocol' | 'contract'>('journal');

  return (
    <div className="space-y-8">
      {/* Live Economic Calendar Widget */}
      <EconomicCalendarWidget />

      {/* Prop Firm Guardian Summary Banner */}
      <PropFirmSummaryWidget accounts={accounts} />

      {/* Tab Navigation Pill Bar */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div className="w-full xl:flex-1">
          <div className="flex flex-wrap items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'journal'
                  ? 'bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.25)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Journal ({trades.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('protocol')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'protocol'
                  ? 'bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.25)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4 shrink-0 text-orange-400" />
              <span>Protocole & Streaks 🔥</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.25)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Statistiques ({stats.winRate.toFixed(0)}%)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('psychology')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'psychology'
                  ? 'bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.25)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BrainCircuit className="w-4 h-4 shrink-0" />
              <span>Psychologie & Tilt</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('guardian')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'guardian'
                  ? 'bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.25)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>Guardian ({accounts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('contract')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'contract'
                  ? 'bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.25)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileSignature className="w-4 h-4 shrink-0 text-cyan-400" />
              <span>Contrat Pro</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap xl:flex-nowrap gap-2.5 shrink-0">
          {/* Institutional PDF Audit Generator Modal */}
          <InstitutionalAuditModal trades={trades} accounts={accounts} />

          {activeTab === 'journal' && (
            <>
              <Link href="/trading/import">
                <Button
                  variant="outline"
                  className="border-white/10 hover:border-[#39FF14]/40 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs h-9"
                >
                  <UploadCloud className="w-4 h-4 mr-1.5 text-[#39FF14]" />
                  Importer CSV
                </Button>
              </Link>
              <Link href="/trading/journal/new">
                <Button className="bg-[#39FF14] text-black hover:bg-[#32e012] font-bold text-xs h-9 shadow-[0_0_15px_rgba(57,255,20,0.25)]">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Nouveau Trade
                </Button>
              </Link>
            </>
          )}
          {activeTab === 'guardian' && (
            <Link href="/trading/prop-firm-guardian">
              <Button className="bg-[#39FF14] text-black hover:bg-[#32e012] font-bold text-xs h-9 shadow-[0_0_15px_rgba(57,255,20,0.25)]">
                <Shield className="w-4 h-4 mr-1.5" />
                Cockpit Plein Écran
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* TAB 1: JOURNAL DE TRADING */}
      {activeTab === 'journal' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Journal des Trades Exécutés</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Historique de vos positions, captures d'écran, tags de setups et débriefings.
            </p>
          </div>

          <TradeList trades={trades} />
        </div>
      )}

      {/* TAB 2: STATISTIQUES */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Performance & Statistiques</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Analyse quantitative de votre rentabilité en R et de votre discipline de trading.
            </p>
          </div>

          <TradeStatsCard stats={stats} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#141414] border-white/10 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Indicateurs Clés de Succès</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
                  <span className="text-neutral-400">Total Gain / Perte Net</span>
                  <span className={`font-mono font-bold ${stats.totalPnlDollars >= 0 ? 'text-[#39FF14]' : 'text-red-400'}`}>
                    {stats.totalPnlDollars >= 0 ? `+$${stats.totalPnlDollars.toFixed(0)}` : `-$${Math.abs(stats.totalPnlDollars).toFixed(0)}`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
                  <span className="text-neutral-400">Espérance par Trade (Avg R)</span>
                  <span className={`font-mono font-bold ${stats.avgR >= 0 ? 'text-[#39FF14]' : 'text-red-400'}`}>
                    {stats.avgR > 0 ? `+${stats.avgR.toFixed(2)}R` : `${stats.avgR.toFixed(2)}R`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
                  <span className="text-neutral-400">Respect du Process (Plan Suivi)</span>
                  <span className="font-mono font-bold text-white">
                    {stats.planFollowedRate.toFixed(0)}%
                  </span>
                </div>
              </div>
            </Card>

            <Card className="bg-[#141414] border-white/10 p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">Prop Firm Drawdown Guardian</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Surveillez votre Trailing Drawdown, testez votre survie aux pertes et calibrez vos contrats Mini vs Micro.
                </p>
              </div>

              <Link href="/trading/prop-firm-guardian">
                <Button className="w-full bg-[#39FF14] text-black hover:bg-[#39FF14]/90 text-xs font-bold shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                  Ouvrir le Guardian & Drawdown
                </Button>
              </Link>
            </Card>

            <Card className="bg-[#141414] border-white/10 p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Audit Institutionnel PDF</h3>
                  <span className="px-1.5 py-0.5 rounded bg-[#39FF14]/10 text-[#39FF14] text-[10px] font-mono font-bold">HD</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Générez votre bilan officiel multi-pages avec courbes d’équité, ratios de Hedge Fund et validation mentor.
                </p>
              </div>

              <InstitutionalAuditModal
                trades={trades}
                accounts={accounts}
                triggerButtonText="Générer mon Rapport PDF"
                className="w-full justify-center py-2.5"
              />
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: PROTOCOLE & STREAKS */}
      {activeTab === 'protocol' && protocolData && (
        <div className="space-y-6">
          <DailyProtocolWidget
            initialProtocol={protocolData.protocol}
            initialStreak={protocolData.streak}
            recentDays={protocolData.recentDays}
          />
        </div>
      )}

      {/* TAB 3: PSYCHOLOGIE & TILT */}
      {activeTab === 'psychology' && (
        <div className="space-y-6">
          <PsychologyTabView trades={trades} />
        </div>
      )}

      {/* TAB 4: GUARDIAN */}
      {activeTab === 'guardian' && (
        <div className="space-y-6">
          <PropFirmGuardianView accounts={accounts} />
        </div>
      )}

      {/* TAB 6: CONTRAT PRO */}
      {activeTab === 'contract' && (
        <div className="space-y-6">
          <TraderContractTab />
        </div>
      )}
    </div>
  );
}
