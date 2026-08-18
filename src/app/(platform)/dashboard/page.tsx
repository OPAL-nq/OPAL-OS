import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  TrendingUp,
  Radio,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  PlayCircle,
  Activity,
  Target,
  Flame,
  Calendar,
  ArrowRight,
  MessageSquare,
  Bell,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import type { Profile, Module, Lesson, Trade } from '@/types';
import { getTodayProtocol } from '@/app/actions/protocol';
import { DailyProtocolWidget } from '@/components/trading/protocol/daily-protocol-widget';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Trader';

  // ----------------------------------------------------
  // 1. Dynamic Academy Progress Calculation
  // ----------------------------------------------------
  const { data: modulesData } = await supabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('published', true)
    .order('position', { ascending: true });

  let progressMap = new Set<string>();
  if (user) {
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('lesson_id, completed')
      .eq('user_id', user.id)
      .eq('completed', true);

    if (progressData) {
      progressData.forEach((p) => progressMap.add(p.lesson_id));
    }
  }

  const rawModules = (modulesData || []) as (Module & { lessons: Lesson[] })[];
  const allPublishedLessons: (Lesson & { moduleTitle: string })[] = [];

  rawModules.forEach((m) => {
    const pubLessons = (m.lessons || [])
      .filter((l) => l.published)
      .sort((a, b) => a.position - b.position);
    pubLessons.forEach((l) => {
      allPublishedLessons.push({ ...l, moduleTitle: m.title });
    });
  });

  const totalLessons = allPublishedLessons.length;
  const completedLessons = allPublishedLessons.filter((l) =>
    progressMap.has(l.id)
  ).length;

  const academyProgressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // First non-completed lesson to resume
  const nextLessonToWatch = allPublishedLessons.find(
    (l) => !progressMap.has(l.id)
  );

  const isAcademyFinished =
    totalLessons > 0 && completedLessons === totalLessons;

  // ----------------------------------------------------
  // 2. Dynamic Trading Performance Stats & Last Trade
  // ----------------------------------------------------
  let totalTrades = 0;
  let winRate = 0;
  let totalR = 0;
  let totalPnl = 0;
  let lastTrade: any = null;

  if (user) {
    const [tradesRes, lastTradeRes] = await Promise.all([
      supabase
        .from('trades')
        .select('pnl_r, pnl_dollars')
        .eq('user_id', user.id),
      supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('trade_date', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (tradesRes.data && tradesRes.data.length > 0) {
      totalTrades = tradesRes.data.length;
      const winCount = tradesRes.data.filter((t) => Number(t.pnl_r) > 0).length;
      winRate = Math.round((winCount / totalTrades) * 100);
      totalR = tradesRes.data.reduce((acc, t) => acc + (Number(t.pnl_r) || 0), 0);
      totalPnl = tradesRes.data.reduce((acc, t) => acc + (Number(t.pnl_dollars) || 0), 0);
    }

    lastTrade = lastTradeRes.data || null;
  }

  // ----------------------------------------------------
  // 3. Dynamic Live Sessions Query
  // ----------------------------------------------------
  let nextLive: any = null;
  const { data: activeLiveData } = await supabase
    .from('lives')
    .select('*')
    .eq('status', 'live')
    .eq('published', true)
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (activeLiveData) {
    nextLive = activeLiveData;
  } else {
    const { data: upcomingLiveData } = await supabase
      .from('lives')
      .select('*')
      .eq('status', 'scheduled')
      .eq('published', true)
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (upcomingLiveData) {
      nextLive = upcomingLiveData;
    }
  }

  // ----------------------------------------------------
  // 4. Dynamic Community & Notifications Preview
  // ----------------------------------------------------
  let unreadNotifsCount = 0;
  let recentMessages: any[] = [];

  if (user) {
    const [notifRes, msgRes] = await Promise.all([
      supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false),
      supabase
        .from('community_messages')
        .select('id, content, created_at, user_id, profiles:user_id(full_name), community_channels:channel_id(name, slug)')
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

    unreadNotifsCount = notifRes.count || 0;
    recentMessages = (msgRes.data || []) as any[];
  }

  // ----------------------------------------------------
  // 5. Dynamic Intensive Data Query (ONLY for Intensive members)
  // ----------------------------------------------------
  let intensiveData: {
    nextSession: any;
    followUp: any;
  } | null = null;

  if (profile?.plan === 'intensive' && user) {
    const now = new Date().toISOString();
    const [sessRes, fupRes] = await Promise.all([
      supabase
        .from('coaching_sessions')
        .select('*')
        .eq('client_id', user.id)
        .eq('status', 'scheduled')
        .gte('scheduled_at', now)
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('intensive_follow_ups')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
    ]);
    intensiveData = {
      nextSession: sessRes.data || null,
      followUp: fupRes.data || null,
    };
  }

  // ----------------------------------------------------
  // 6. Dynamic Daily Protocol & Streaks Query
  // ----------------------------------------------------
  const todayProtocolData = await getTodayProtocol();

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#141414] via-[#141414] to-[#1e1e1e] border border-white/10 p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#39FF14]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/20 text-[#39FF14] text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Centre de Contrôle OPAL</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Bienvenue, {firstName}
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-xl">
              Préparez votre session, appliquez votre méthodologie et améliorez vos ratios d'exécution.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              className="bg-[#39FF14] text-black font-semibold hover:bg-[#39FF14]/90 shadow-[0_0_15px_rgba(57,255,20,0.2)] text-xs h-10 px-4"
            >
              <Link href="/trading">
                <span>Préparer le Trading</span>
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Daily Protocol & Streaks Interactive Widget */}
      <DailyProtocolWidget
        initialProtocol={todayProtocolData.protocol}
        initialStreak={todayProtocolData.streak}
        recentDays={todayProtocolData.recentDays}
      />

      {/* SECTION 5: OPAL Intensive Widget (For Intensive members only) */}
      {intensiveData && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#181818] via-[#141414] to-[#121212] border border-[#39FF14]/30 relative overflow-hidden shadow-[0_0_20px_rgba(57,255,20,0.06)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#39FF14]/15 border border-[#39FF14]/30 text-[#39FF14] text-[10px] font-black uppercase tracking-wider">
                  <Flame className="w-3 h-3" />
                  <span>OPAL Intensive</span>
                </div>
                {intensiveData.nextSession && (
                  <span className="text-xs text-neutral-400">
                    Prochain coaching :{' '}
                    <strong className="text-white capitalize">
                      {new Date(intensiveData.nextSession.scheduled_at).toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </strong>
                  </span>
                )}
              </div>

              <p className="text-sm font-bold text-white leading-relaxed">
                Objectif actuel : « {intensiveData.followUp?.current_objective || 'Construire une exécution disciplinée et respecter votre Risk Policy.'} »
              </p>

              {intensiveData.followUp?.next_step && (
                <p className="text-xs text-[#39FF14] font-medium">
                  → Prochaine action : {intensiveData.followUp.next_step}
                </p>
              )}
            </div>

            <Button
              asChild
              className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold text-xs shrink-0 h-10 px-5 shadow-[0_0_15px_rgba(57,255,20,0.2)]"
            >
              <Link href="/intensive">
                <span>Ouvrir mon Intensive</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid: Formation / Trading / Live */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Progression Academy */}
        <Card className="bg-[#141414] border-white/5 shadow-lg flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Formation
              </span>
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[#39FF14]">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <CardTitle className="text-base text-white">OPAL Academy</CardTitle>
            <CardDescription className="text-xs text-neutral-400">
              Progression dans le cursus de formation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Progression globale</span>
                <span className="font-semibold text-[#39FF14]">
                  {academyProgressPercent}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-[#39FF14] rounded-full transition-all duration-500 shadow-[0_0_8px_#39FF14]"
                  style={{ width: `${academyProgressPercent}%` }}
                />
              </div>
              <span className="text-[11px] text-neutral-500 block">
                {completedLessons} sur {totalLessons} leçons terminées
              </span>
            </div>

            {isAcademyFinished ? (
              <div className="p-3 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0" />
                <span className="text-xs text-[#39FF14] font-medium">
                  Cursus terminé ! Félicitations.
                </span>
              </div>
            ) : nextLessonToWatch ? (
              <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 min-w-0">
                  <PlayCircle className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                  <span className="text-xs text-neutral-300 font-medium truncate">
                    {nextLessonToWatch.title}
                  </span>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="w-full text-xs border-white/10 hover:bg-white/5 text-[#39FF14] h-8"
                >
                  <Link
                    href={`/academy/${nextLessonToWatch.module_id}/${nextLessonToWatch.id}`}
                  >
                    Reprendre la formation
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/5 text-center">
                <span className="text-xs text-neutral-400">
                  Votre formation commence ici.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Journal de Trading */}
        <Card className="bg-[#141414] border-white/5 shadow-lg flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Performance
              </span>
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[#39FF14]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <CardTitle className="text-base text-white">Journal & Trades</CardTitle>
            <CardDescription className="text-xs text-neutral-400">
              Statistiques réelles de trading
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/5">
                <span className="text-[11px] text-neutral-400 block">Total Trades</span>
                <span className="text-lg font-bold text-white">{totalTrades}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/5">
                <span className="text-[11px] text-neutral-400 block">Win Rate</span>
                <span className="text-lg font-bold text-[#39FF14]">
                  {totalTrades > 0 ? `${winRate}%` : '—'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-[#0A0A0A] border border-white/5">
                <span className="text-[10px] text-neutral-500 block">Total R</span>
                <span className={`text-xs font-bold font-mono ${totalR >= 0 ? 'text-[#39FF14]' : 'text-red-400'}`}>
                  {totalR > 0 ? `+${totalR.toFixed(1)}R` : `${totalR.toFixed(1)}R`}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0A0A0A] border border-white/5">
                <span className="text-[10px] text-neutral-500 block">Total P&L</span>
                <span className={`text-xs font-bold font-mono ${totalPnl >= 0 ? 'text-[#39FF14]' : 'text-red-400'}`}>
                  {totalPnl >= 0 ? `+$${totalPnl.toFixed(0)}` : `-$${Math.abs(totalPnl).toFixed(0)}`}
                </span>
              </div>
            </div>

            {lastTrade ? (
              <div className="p-2 rounded-lg bg-[#0A0A0A] border border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">
                  Dernier trade ({lastTrade.instrument})
                </span>
                <span className={`font-mono font-bold ${Number(lastTrade.pnl_r) >= 0 ? 'text-[#39FF14]' : 'text-red-400'}`}>
                  {Number(lastTrade.pnl_r) >= 0 ? `+${lastTrade.pnl_r}R` : `${lastTrade.pnl_r}R`} (${Number(lastTrade.pnl_dollars) >= 0 ? `+${lastTrade.pnl_dollars}` : lastTrade.pnl_dollars}$)
                </span>
              </div>
            ) : null}

            <Button
              asChild
              variant="outline"
              className="w-full text-xs border-white/10 hover:bg-white/5 text-neutral-300 h-9"
            >
              <Link href="/trading">Ouvrir le Journal</Link>
            </Button>
          </CardContent>
        </Card>

        {/* 3. Live Sessions */}
        <Card
          className={`bg-[#141414] border shadow-lg flex flex-col justify-between ${
            nextLive?.status === 'live'
              ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] bg-gradient-to-b from-red-950/20 to-transparent'
              : 'border-white/5'
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Live Sessions
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  nextLive?.status === 'live'
                    ? 'bg-red-500/20 text-red-400 animate-pulse'
                    : 'bg-white/5 text-[#39FF14]'
                }`}
              >
                <Radio className="w-4 h-4" />
              </div>
            </div>
            <CardTitle className="text-base text-white">OPAL Live</CardTitle>
            <CardDescription className="text-xs text-neutral-400">
              Sessions de live trading & masterclasses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {nextLive ? (
              <div
                className={`p-3 rounded-lg border space-y-2 ${
                  nextLive.status === 'live'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-[#0A0A0A] border-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Clock className="w-3.5 h-3.5 text-[#39FF14]" />
                    <span>{nextLive.status === 'live' ? 'En direct' : 'Prochaine session'}</span>
                  </div>
                  {nextLive.status === 'live' && (
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-wider bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/40 animate-pulse">
                      Live
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-white line-clamp-1">
                  {nextLive.title}
                </p>
                <span className="text-[11px] text-[#39FF14] font-mono block">
                  {new Date(nextLive.scheduled_at).toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })} CET
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/5 space-y-1 text-center">
                <p className="text-xs font-medium text-white">
                  Aucun live programmé pour le moment
                </p>
                <span className="text-[11px] text-neutral-500 block">
                  Consultez les replays archivés
                </span>
              </div>
            )}

            <Button
              asChild
              variant="outline"
              className={`w-full text-xs h-9 transition-all ${
                nextLive?.status === 'live'
                  ? 'bg-red-500 text-white hover:bg-red-600 border-red-500'
                  : 'border-white/10 hover:bg-white/5 text-neutral-300'
              }`}
            >
              <Link href={nextLive ? `/live/${nextLive.id}` : '/live/replays'}>
                {nextLive?.status === 'live' ? 'Rejoindre le Live' : 'Accéder au Live Hub'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 4: Community & Notifications Activity Banner */}
      <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Activité Communauté</h3>
              {unreadNotifsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#39FF14] text-black">
                  {unreadNotifsCount} notification{unreadNotifsCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {recentMessages.length > 0
                ? `Dernier message dans #${recentMessages[0]?.community_channels?.name || 'Général'} par ${recentMessages[0]?.profiles?.full_name || 'un membre'}`
                : 'Échangez avec les autres membres et posez vos questions.'}
            </p>
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          className="border-white/10 hover:bg-white/5 text-neutral-200 text-xs h-9 px-4 shrink-0"
        >
          <Link href="/community">
            <span>Voir la communauté</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
