import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Trade, WorkspaceSession, TradeStats } from '@/types/trading';
import type { Profile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  User,
  TrendingUp,
  TrendingDown,
  Compass,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
  BookOpen,
  Camera,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ studentId: string }>;
}

export default async function AdminStudentDetailPage({ params }: Props) {
  const { studentId } = await params;
  const supabase = await createClient();

  // 1. Fetch Student Profile
  const { data: studentProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', studentId)
    .single();

  if (!studentProfile) {
    notFound();
  }

  const student = studentProfile as Profile;

  // 2. Fetch Student's Sessions
  const { data: sessionsData } = await supabase
    .from('workspace_sessions')
    .select('*')
    .eq('user_id', studentId)
    .order('session_date', { ascending: false });

  const sessions = (sessionsData || []) as WorkspaceSession[];

  // 3. Fetch Student's Trades
  const { data: tradesData } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', studentId)
    .order('trade_date', { ascending: false });

  const trades = (tradesData || []) as Trade[];

  // 4. Fetch Student's Whop Memberships
  const { data: whopMembershipsData } = await supabase
    .from('whop_memberships')
    .select('*')
    .or(`user_id.eq.${studentId},email.ilike.${student.email}`)
    .order('created_at', { ascending: false });

  const whopMemberships = (whopMembershipsData || []) as any[];

  // Compute Stats
  const totalTrades = trades.length;
  const winTrades = trades.filter((t) => Number(t.pnl_r) > 0).length;
  const lossTrades = trades.filter((t) => Number(t.pnl_r) < 0).length;
  const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;
  const totalR = trades.reduce((acc, t) => acc + (Number(t.pnl_r) || 0), 0);
  const totalPnlDollars = trades.reduce((acc, t) => acc + (Number(t.pnl_dollars) || 0), 0);
  const planFollowedCount = trades.filter((t) => t.plan_followed).length;
  const planFollowedRate = totalTrades > 0 ? (planFollowedCount / totalTrades) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/admin/students">
          <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white text-xs">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Retour à la liste des élèves
          </Button>
        </Link>
      </div>

      {/* Student Profile Header Card */}
      <Card className="bg-[#141414] border-white/10 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#39FF14] text-xl font-bold">
              {student.full_name ? student.full_name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">
                  {student.full_name || 'Élève sans nom'}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    student.plan === 'intensive'
                      ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30'
                      : 'bg-white/5 text-neutral-400 border-white/10'
                  }`}
                >
                  Plan {student.plan}
                </span>
                {student.plan === 'intensive' && (
                  <Button
                    asChild
                    size="sm"
                    className="bg-[#39FF14]/15 hover:bg-[#39FF14] text-[#39FF14] hover:text-black font-bold text-[10px] h-6 px-2.5 rounded-full border border-[#39FF14]/30 transition-colors ml-1"
                  >
                    <Link href={`/admin/intensive/${student.id}`}>
                      <span>Cockpit Intensive</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-1" />
                    </Link>
                  </Button>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">{student.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-[11px] text-neutral-500">
                  Inscrit le {new Date(student.created_at).toLocaleDateString('fr-FR')}
                </span>
                {whopMemberships.length > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Whop Synchro ({whopMemberships[0].whop_product_id === 'prod_rWw750hUkKQMm' ? 'Intensive' : 'Academy'})
                  </span>
                ) : (
                  <span className="text-[10px] text-neutral-600 bg-white/5 px-2 py-0.5 rounded-full">
                    Sans Whop lié
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/40 p-3.5 rounded-xl border border-white/5">
            <div className="text-center px-3">
              <span className="text-[10px] uppercase text-neutral-500 font-semibold block">Trades</span>
              <span className="text-lg font-bold text-white">{totalTrades}</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] uppercase text-neutral-500 font-semibold block">Win Rate</span>
              <span className="text-lg font-bold text-[#39FF14]">
                {totalTrades > 0 ? `${winRate.toFixed(0)}%` : '—'}
              </span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] uppercase text-neutral-500 font-semibold block">Total R</span>
              <span className={`text-lg font-bold font-mono ${totalR >= 0 ? 'text-[#39FF14]' : 'text-red-400'}`}>
                {totalTrades > 0 ? (totalR > 0 ? `+${totalR.toFixed(1)}R` : `${totalR.toFixed(1)}R`) : '—'}
              </span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] uppercase text-neutral-500 font-semibold block">Discipline</span>
              <span className="text-lg font-bold text-white">
                {totalTrades > 0 ? `${planFollowedRate.toFixed(0)}%` : '—'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid: 2 Columns (Left: Sessions Plans / Right: Trades Journal) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Sessions Plans */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Compass className="w-4 h-4 text-[#39FF14]" />
              <span>Plans de Session de l'Élève ({sessions.length})</span>
            </div>
          </div>

          {sessions.length === 0 ? (
            <Card className="bg-[#141414] border-white/5 p-8 text-center text-neutral-500 text-xs">
              Cet élève n'a préparé aucune session pour l'instant.
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => {
                const isExecute = s.decision === 'EXECUTE';
                const isWait = s.decision === 'WAIT';

                return (
                  <Card key={s.id} className="bg-[#141414] border-white/10 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="text-xs font-mono text-neutral-300">{s.session_date}</span>
                        <span className="text-xs font-bold text-white ml-2">{s.instrument}</span>
                        <span className="text-[11px] text-neutral-400 bg-white/5 px-2 py-0.5 rounded">
                          {s.bias}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          isExecute
                            ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30'
                            : isWait
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {s.decision}
                      </span>
                    </div>

                    {s.key_levels && (
                      <div className="text-xs">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 block">Niveaux Clés</span>
                        <p className="text-neutral-300">{s.key_levels}</p>
                      </div>
                    )}

                    {s.primary_scenario && (
                      <div className="text-xs">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 block">Scénario Principal</span>
                        <p className="text-neutral-300 whitespace-pre-wrap">{s.primary_scenario}</p>
                      </div>
                    )}

                    {s.mindset && (
                      <div className="text-xs bg-black/40 p-2.5 rounded-lg border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 block">Mindset / État d'esprit</span>
                        <p className="text-neutral-400 italic">{s.mindset}</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Trades Journal */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <BookOpen className="w-4 h-4 text-[#39FF14]" />
              <span>Journal des Trades ({trades.length})</span>
            </div>
          </div>

          {trades.length === 0 ? (
            <Card className="bg-[#141414] border-white/5 p-8 text-center text-neutral-500 text-xs">
              Cet élève n'a enregistré aucun trade pour l'instant.
            </Card>
          ) : (
            <div className="space-y-3">
              {trades.map((t) => {
                const isWin = Number(t.pnl_r) > 0;
                const isLoss = Number(t.pnl_r) < 0;

                return (
                  <Card key={t.id} className="bg-[#141414] border-white/10 p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{t.instrument}</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.direction === 'Long'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {t.direction === 'Long' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {t.direction}
                        </span>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {new Date(t.trade_date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-base font-black font-mono ${
                            isWin ? 'text-[#39FF14]' : isLoss ? 'text-red-400' : 'text-neutral-300'
                          }`}
                        >
                          {t.pnl_r > 0 ? `+${t.pnl_r.toFixed(2)}R` : `${t.pnl_r.toFixed(2)}R`}
                        </span>
                        <span className="text-[11px] text-neutral-500 block font-mono">
                          {t.pnl_dollars >= 0 ? `+$${t.pnl_dollars}` : `-$${Math.abs(t.pnl_dollars)}`}
                        </span>
                      </div>
                    </div>

                    {/* Discipline & Stop Loss */}
                    <div className="flex items-center justify-between text-xs py-1 border-t border-b border-white/5">
                      <div className="flex items-center gap-1.5">
                        {t.plan_followed ? (
                          <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Plan respecté
                          </span>
                        ) : (
                          <span className="text-amber-400 text-[11px] flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Déviation du plan
                          </span>
                        )}
                      </div>
                      {t.stop_loss_ticks && (
                        <span className="text-neutral-400 font-mono text-[11px]">
                          SL: {t.stop_loss_ticks} ticks
                        </span>
                      )}
                    </div>

                    {/* Notes & Mistakes */}
                    {t.notes && (
                      <div className="text-xs text-neutral-300 bg-white/5 p-2.5 rounded-lg space-y-1">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-[#39FF14]" />
                          Notes
                        </span>
                        <p>{t.notes}</p>
                      </div>
                    )}

                    {t.mistakes && (
                      <div className="text-xs text-red-300 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Erreurs notées
                        </span>
                        <p>{t.mistakes}</p>
                      </div>
                    )}

                    {/* Screenshot Preview */}
                    {t.screenshot_url && (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-neutral-400">
                          <span>Graphique</span>
                          <a
                            href={t.screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#39FF14] hover:underline flex items-center gap-1"
                          >
                            <span>Agrandir</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="rounded-lg overflow-hidden border border-white/10 bg-black max-h-48 flex items-center justify-center">
                          <img
                            src={t.screenshot_url}
                            alt="Capture trade"
                            className="w-full h-auto max-h-48 object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
