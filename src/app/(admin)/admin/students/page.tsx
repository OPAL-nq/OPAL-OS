import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  TrendingUp,
  Compass,
  ArrowRight,
  Shield,
  Search,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import type { Profile, Trade, WorkspaceSession } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage() {
  const supabase = await createClient();

  // 1. Fetch all profiles
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const profiles = (profilesData || []) as Profile[];

  // 2. Fetch all trades to aggregate per student
  const { data: allTradesData } = await supabase
    .from('trades')
    .select('user_id, pnl_r, pnl_dollars, plan_followed');

  const allTrades = (allTradesData || []) as Trade[];

  // 3. Fetch all sessions count
  const { data: allSessionsData } = await supabase
    .from('workspace_sessions')
    .select('user_id');

  const allSessions = (allSessionsData || []) as WorkspaceSession[];

  // Map stats per user
  const statsByUser = new Map<string, { tradesCount: number; winRate: number; totalR: number; sessionsCount: number }>();

  profiles.forEach((p) => {
    const userTrades = allTrades.filter((t) => t.user_id === p.id);
    const userSessions = allSessions.filter((s) => s.user_id === p.id);
    const total = userTrades.length;
    const wins = userTrades.filter((t) => Number(t.pnl_r) > 0).length;
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    const totalR = userTrades.reduce((acc, t) => acc + (Number(t.pnl_r) || 0), 0);

    statsByUser.set(p.id, {
      tradesCount: total,
      winRate,
      totalR,
      sessionsCount: userSessions.length,
    });
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-semibold uppercase tracking-wider mb-2">
          <Shield className="w-3.5 h-3.5" />
          <span>Supervision Pédagogique</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          Suivi des Élèves & Journaux de Trading
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Consultez les journaux de trading, plans de session et statistiques de chaque élève.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-[#141414] border-white/5 p-5">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Total Élèves</span>
            <Users className="w-4 h-4 text-[#39FF14]" />
          </div>
          <div className="text-2xl font-bold text-white">{profiles.length}</div>
        </Card>

        <Card className="bg-[#141414] border-white/5 p-5">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Total Trades Enregistrés</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{allTrades.length}</div>
        </Card>

        <Card className="bg-[#141414] border-white/5 p-5">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Total Sessions Préparées</span>
            <Compass className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{allSessions.length}</div>
        </Card>
      </div>

      {/* Students List Table */}
      <Card className="bg-[#141414] border-white/5 overflow-hidden">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-base text-white">Répertoire des Élèves</CardTitle>
          <CardDescription className="text-xs text-neutral-400">
            Cliquez sur un élève pour analyser son journal et ses fiches de préparation
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {profiles.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400">
              Aucun élève inscrit pour l'instant.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-neutral-400 border-b border-white/5 uppercase tracking-wider text-[10px] bg-black/40">
                  <tr>
                    <th className="py-3 px-4">Élève</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4 text-center">Sessions</th>
                    <th className="py-3 px-4 text-center">Trades</th>
                    <th className="py-3 px-4 text-center">Win Rate</th>
                    <th className="py-3 px-4 text-center">Total R</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-neutral-300">
                  {profiles.map((p) => {
                    const st = statsByUser.get(p.id) || { tradesCount: 0, winRate: 0, totalR: 0, sessionsCount: 0 };

                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">
                            {p.full_name || 'Sans nom'}
                          </div>
                          <div className="text-[11px] text-neutral-500">{p.email}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] border ${
                              p.plan === 'intensive'
                                ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/20'
                                : 'bg-white/5 text-neutral-400 border-white/10'
                            }`}
                          >
                            {p.plan}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono font-medium">
                          {st.sessionsCount}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono font-medium">
                          {st.tradesCount}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono">
                          {st.tradesCount > 0 ? (
                            <span className="font-bold text-[#39FF14]">
                              {st.winRate.toFixed(0)}%
                            </span>
                          ) : (
                            <span className="text-neutral-500">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono">
                          {st.tradesCount > 0 ? (
                            <span
                              className={`font-bold ${
                                st.totalR >= 0 ? 'text-[#39FF14]' : 'text-red-400'
                              }`}
                            >
                              {st.totalR > 0 ? `+${st.totalR.toFixed(1)}R` : `${st.totalR.toFixed(1)}R`}
                            </span>
                          ) : (
                            <span className="text-neutral-500">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Link href={`/admin/students/${p.id}`}>
                            <Button
                              size="sm"
                              className="bg-white/10 hover:bg-[#39FF14] hover:text-black text-white text-xs font-semibold h-7 px-3 transition-all"
                            >
                              <span>Voir le Journal</span>
                              <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
