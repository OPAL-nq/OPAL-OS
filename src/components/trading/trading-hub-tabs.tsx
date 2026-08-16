'use client';

import React, { useState } from 'react';
import { WorkspaceSession, Trade, TradeStats } from '@/types/trading';
import { TradeStatsCard } from './trade-stats-card';
import { TradeList } from './trade-list';
import { EconomicCalendarWidget } from './economic-calendar-widget';
import { deleteWorkspaceSession } from '@/app/actions/workspace';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Compass,
  BookOpen,
  Plus,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

interface TradingHubTabsProps {
  sessions: WorkspaceSession[];
  trades: Trade[];
  stats: TradeStats;
}

export function TradingHubTabs({ sessions, trades, stats }: TradingHubTabsProps) {
  const [activeTab, setActiveTab] = useState<'sessions' | 'journal' | 'stats'>('sessions');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Voulez-vous vraiment supprimer ce plan de session ?')) {
      setDeletingId(sessionId);
      try {
        await deleteWorkspaceSession(sessionId);
        window.location.reload();
      } catch (err: any) {
        alert(err.message || 'Erreur lors de la suppression');
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Live Economic Calendar Widget */}
      <EconomicCalendarWidget />

      {/* Tab Navigation Pill Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="inline-flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10 shrink-0 min-w-full sm:min-w-0">
            <button
              type="button"
              onClick={() => setActiveTab('sessions')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'sessions'
                  ? 'bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.25)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>Sessions ({sessions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
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
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.25)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Statistiques ({stats.winRate.toFixed(0)}%)</span>
            </button>
          </div>
        </div>

        {/* Action Button depending on tab */}
        <div className="flex items-center gap-3">
          {activeTab === 'sessions' && (
            <Link href="/trading/workspace/new">
              <Button className="bg-[#39FF14] text-black hover:bg-[#32e012] font-bold text-xs h-9 shadow-[0_0_15px_rgba(57,255,20,0.25)]">
                <Plus className="w-4 h-4 mr-1.5" />
                Préparer ma Session
              </Button>
            </Link>
          )}
          {activeTab === 'journal' && (
            <Link href="/trading/journal/new">
              <Button className="bg-[#39FF14] text-black hover:bg-[#32e012] font-bold text-xs h-9 shadow-[0_0_15px_rgba(57,255,20,0.25)]">
                <Plus className="w-4 h-4 mr-1.5" />
                Nouveau Trade
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* TAB 1: SESSIONS & PRÉPARATION */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Plans de Préparation de Session</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Consultez vos analyses pré-marché, vos scénarios et vos décisions formelles.
            </p>
          </div>

          {sessions.length === 0 ? (
            <Card className="bg-[#141414] border-white/10 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-neutral-400">
                <Compass className="w-6 h-6 text-[#39FF14]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Aucune session préparée</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Préparez votre cadre d'intervention avant chaque ouverture pour trader avec clarté.
                </p>
              </div>
              <Link href="/trading/workspace/new" className="inline-block">
                <Button className="bg-[#39FF14] text-black hover:bg-[#32e012] font-bold text-xs">
                  Préparer ma première session
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((s) => {
                const isExecute = s.decision === 'EXECUTE';
                const isWait = s.decision === 'WAIT';

                return (
                  <Card
                    key={s.id}
                    className="bg-[#141414] border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group overflow-hidden"
                  >
                    <div className="p-5 space-y-4">
                      {/* Top bar with date and decision */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                            {s.session_date}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isExecute
                              ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/40 shadow-[0_0_10px_rgba(57,255,20,0.2)]'
                              : isWait
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                              : 'bg-red-500/15 text-red-400 border border-red-500/40'
                          }`}
                        >
                          {s.decision}
                        </span>
                      </div>

                      {/* Instrument & Bias */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <span className="text-lg font-black text-white">{s.instrument}</span>
                        <span className="text-xs font-medium text-neutral-300 bg-white/5 px-2 py-0.5 rounded">
                          {s.bias}
                        </span>
                      </div>

                      {/* Scenarios / Levels preview */}
                      <div className="space-y-2 text-xs">
                        {s.key_levels && (
                          <div className="text-neutral-400">
                            <span className="text-neutral-500 font-semibold block text-[10px] uppercase">
                              Niveaux Clés
                            </span>
                            <span className="text-neutral-200 line-clamp-1">{s.key_levels}</span>
                          </div>
                        )}

                        {s.primary_scenario && (
                          <div className="text-neutral-400">
                            <span className="text-neutral-500 font-semibold block text-[10px] uppercase">
                              Scénario Principal
                            </span>
                            <span className="text-neutral-300 line-clamp-2">{s.primary_scenario}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer link & delete button */}
                    <div className="p-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-xs">
                      <Link
                        href={`/trading/workspace/${s.id}`}
                        className="text-[#39FF14] hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>Voir / Modifier le plan</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        disabled={deletingId === s.id}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Supprimer ce plan de session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: JOURNAL DE TRADING */}
      {activeTab === 'journal' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Journal des Trades Exécutés</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Historique de vos positions, captures d'écran et débriefings.
            </p>
          </div>

          <TradeList trades={trades} />
        </div>
      )}

      {/* TAB 3: STATISTIQUES */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Performance & Statistiques</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Analyse quantitative de votre rentabilité en R et de votre discipline de trading.
            </p>
          </div>

          <TradeStatsCard stats={stats} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <h3 className="text-sm font-bold text-white">Accéder aux Calculateurs Futures</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Utilisez les calculateurs de risque basés sur les ticks et la gestion du drawdown Prop Firm dans l'onglet Systèmes.
                </p>
              </div>

              <Link href="/systems">
                <Button className="w-full bg-white text-black hover:bg-neutral-200 text-xs font-bold">
                  Ouvrir OPAL Systems
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
