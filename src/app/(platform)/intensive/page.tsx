import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Flame,
  Target,
  FileText,
  Calendar,
  LineChart,
  ArrowRight,
  CheckCircle2,
  Lock,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { IntensiveNav } from '@/components/intensive/intensive-nav';
import { NextCoachingCard } from '@/components/intensive/next-coaching-card';
import { ObjectiveCard } from '@/components/intensive/objective-card';
import { CoachingReportCard } from '@/components/intensive/coaching-report-card';
import type {
  Profile,
  CoachingSession,
  CoachingReport,
  IntensiveObjective,
  IntensiveFollowUp,
} from '@/types';

export const dynamic = 'force-dynamic';

export default async function IntensiveCockpitPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const isIntensive = profile?.plan === 'intensive' || profile?.role === 'admin';

  // 1. LOCKED VIEW FOR COMMUNITY MEMBERS
  if (!isIntensive) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/80 border border-neutral-700 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Espace Réservé aux Membres Intensive</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            OPAL Intensive
          </h1>
          <p className="text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
            L'accompagnement individuel sur-mesure pour accélérer votre progression, éliminer vos biais et structurer votre exécution de marché.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
              <span>2 coachings privés par semaine</span>
            </div>
            <p className="text-xs text-neutral-400 pl-6 leading-relaxed">
              Séances individuelles en 1-on-1 avec Maxym pour analyser vos sessions, vos graphiques et corriger vos erreurs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
              <span>Suivi personnalisé & Objectifs</span>
            </div>
            <p className="text-xs text-neutral-400 pl-6 leading-relaxed">
              Feuille de route individualisée mise à jour en continu pour mesurer votre constance et votre discipline.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
              <span>Comptes-rendus détaillés</span>
            </div>
            <p className="text-xs text-neutral-400 pl-6 leading-relaxed">
              Accès permanent à l'historique complet de vos sessions, points clés et exercices de travail assignés.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
              <span>Tout OPAL Community inclus</span>
            </div>
            <p className="text-xs text-neutral-400 pl-6 leading-relaxed">
              Accès illimité à l'Academy complète, Workspace, Journal de trading, Systems et Lives collectifs.
            </p>
          </div>
        </div>

        {/* CTA Box */}
        <div className="p-8 rounded-2xl bg-gradient-to-b from-[#141414] to-[#1a1a1a] border border-[#39FF14]/20 text-center space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-white">
            Intéressé par l'accompagnement individuel ?
          </h2>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
            Les places en accompagnement Intensive sont strictement limitées afin de garantir une qualité de suivi individualisée.
          </p>
          <Button
            asChild
            className="bg-[#39FF14] text-black font-bold hover:bg-[#39FF14]/90 shadow-[0_0_20px_rgba(57,255,20,0.25)] h-11 px-8"
          >
            <a
              href="mailto:contact@opal.app?subject=Candidature%20OPAL%20Intensive"
              className="inline-flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>CONTACTER MAXYM</span>
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // 2. FETCH INTENSIVE DATA FOR AUTHENTICATED INTENSIVE MEMBER
  const [sessionsRes, followUpRes, objectivesRes, reportsRes] = await Promise.all([
    supabase
      .from('coaching_sessions')
      .select('*')
      .eq('client_id', user.id)
      .order('scheduled_at', { ascending: true }),
    supabase
      .from('intensive_follow_ups')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('intensive_objectives')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true }),
    supabase
      .from('coaching_reports')
      .select('*, session:coaching_sessions(*)')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const sessions: CoachingSession[] = sessionsRes.data || [];
  const followUp: IntensiveFollowUp | null = followUpRes.data || null;
  const objectives: IntensiveObjective[] = objectivesRes.data || [];
  const reports: CoachingReport[] = reportsRes.data || [];

  // Next scheduled session
  const now = new Date().toISOString();
  const nextSession = sessions.find(
    (s) => s.status === 'scheduled' && s.scheduled_at >= now
  ) || sessions.find((s) => s.status === 'scheduled') || null;

  const activeObjectives = objectives.filter((o) => o.status === 'active');
  const latestReport = reports[0] || null;

  const firstName = profile?.full_name?.split(' ')[0] || profile?.email?.split('@')[0] || 'Trader';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-semibold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>Cockpit Accompagnement Individuel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Bonjour {firstName}.
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Voici l'état d'avancement de votre accompagnement et vos prochaines priorités.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-white/10 text-xs text-neutral-300 hover:bg-white/5"
          >
            <Link href="/trading/workspace/new">
              <span>Préparer une session</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <IntensiveNav />

      {/* Top Priority Banner (Current Objective) */}
      <Card className="bg-gradient-to-r from-[#181818] via-[#141414] to-[#101010] border-[#39FF14]/30 overflow-hidden relative shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#39FF14]/5 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#39FF14]">
                <Target className="w-4 h-4 text-[#39FF14]" />
                <span>Ton Objectif Actuel Prioritaire</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                « {followUp?.current_objective || 'Construire une exécution disciplinée et respecter votre Risk Policy sans déviation.'} »
              </p>
            </div>

            {/* Next Action Box */}
            <div className="lg:w-80 p-4 rounded-xl bg-black/60 border border-[#39FF14]/20 space-y-1.5 shrink-0">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#39FF14]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Prochaine Action Immédiate</span>
              </div>
              <p className="text-xs text-white font-medium leading-relaxed">
                → {followUp?.next_step || 'Respecter le scénario préparé avant chaque session de trading.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Next Coaching & Last Follow-up Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Coaching Card */}
        <div className="lg:col-span-1">
          <NextCoachingCard session={nextSession} />
        </div>

        {/* Synthetic Follow-Up Card */}
        <div className="lg:col-span-2">
          <Card className="bg-[#141414] border-white/5 h-full flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-white/5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <LineChart className="w-4 h-4 text-[#39FF14]" />
                <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">
                  Dernier Suivi & Progression
                </CardTitle>
              </div>
              <Link
                href="/intensive/follow-up"
                className="text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Voir tout →
              </Link>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    Points Travaillés
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {followUp?.points_worked || 'Identification des setups A+, patience et cadrage horaire.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Erreurs à Corriger
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {followUp?.errors_to_fix || 'Entrées anticipées avant clôture de bougie.'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                  Progression Constatée
                </span>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {followUp?.progression || 'Discipline en progression constante. R/R moyen et gestion du risque stabilisés.'}
                </p>
              </div>
            </CardContent>

            <div className="p-4 border-t border-white/5 bg-[#111111] flex items-center justify-between">
              <span className="text-[11px] text-neutral-500">
                {followUp ? (
                  `Mis à jour le ${new Date(followUp.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
                ) : (
                  'Suivi initialisé'
                )}
              </span>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-xs text-[#39FF14] hover:text-[#39FF14]/80 p-0 h-auto font-semibold"
              >
                <Link href="/intensive/follow-up">
                  <span>Consulter la feuille de route</span>
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Secondary Grid: Active Objectives & Last Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Objectives */}
        <Card className="bg-[#141414] border-white/5">
          <CardHeader className="pb-3 border-b border-white/5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#39FF14]" />
              <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">
                Objectifs Actifs ({activeObjectives.length})
              </CardTitle>
            </div>
            <Link
              href="/intensive/objectives"
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Tous les objectifs →
            </Link>
          </CardHeader>

          <CardContent className="p-5 space-y-3">
            {activeObjectives.length === 0 ? (
              <p className="text-xs text-neutral-500 text-center py-4">
                Aucun objectif actif défini pour le moment.
              </p>
            ) : (
              activeObjectives.slice(0, 3).map((obj) => (
                <ObjectiveCard key={obj.id} objective={obj} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Latest Report */}
        <Card className="bg-[#141414] border-white/5">
          <CardHeader className="pb-3 border-b border-white/5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">
                Dernier Compte Rendu
              </CardTitle>
            </div>
            <Link
              href="/intensive/reports"
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Historique des comptes rendus →
            </Link>
          </CardHeader>

          <CardContent className="p-5">
            {latestReport ? (
              <CoachingReportCard report={latestReport} />
            ) : (
              <div className="p-6 text-center text-xs text-neutral-500">
                Aucun compte rendu rédigé pour le moment. Votre premier compte rendu apparaîtra après votre première séance de coaching.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
