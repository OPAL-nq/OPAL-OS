import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Calendar, Clock, History } from 'lucide-react';
import { IntensiveNav } from '@/components/intensive/intensive-nav';
import { NextCoachingCard } from '@/components/intensive/next-coaching-card';
import { CoachingSessionCard } from '@/components/intensive/coaching-session-card';
import type { CoachingSession } from '@/types';

export const dynamic = 'force-dynamic';

export default async function IntensiveCoachingPage() {
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

  if (profile?.plan !== 'intensive' && profile?.role !== 'admin') {
    redirect('/intensive');
  }

  const { data: sessionsData } = await supabase
    .from('coaching_sessions')
    .select('*, report:coaching_reports(*), preparation:coaching_preparations(*)')
    .eq('client_id', user.id)
    .order('scheduled_at', { ascending: false });

  const sessions: CoachingSession[] = (sessionsData || []).map((s: any) => ({
    ...s,
    preparation: Array.isArray(s.preparation) ? s.preparation[0] || null : s.preparation || null,
  }));

  const now = new Date().toISOString();
  // Upcoming session
  const nextSession =
    sessions
      .filter((s) => s.status === 'scheduled' && s.scheduled_at >= now)
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0] ||
    sessions.find((s) => s.status === 'scheduled') ||
    null;

  const pastSessions = sessions.filter((s) => s.id !== nextSession?.id);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-semibold uppercase tracking-wider mb-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>Séances Privées</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Planning & Coachings
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Retrouvez vos prochaines séances individuelles avec Maxym et l'historique complet de vos sessions.
        </p>
      </div>

      {/* Navigation Tabs */}
      <IntensiveNav />

      {/* Featured Next Coaching Card */}
      <div className="max-w-2xl">
        <NextCoachingCard session={nextSession} />
      </div>

      {/* Past Sessions History */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
          <History className="w-4 h-4 text-[#39FF14]" />
          <span>Historique des Séances ({pastSessions.length})</span>
        </div>

        {pastSessions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#141414] border border-white/5 text-center text-xs text-neutral-500">
            Aucune séance passée dans l'historique.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {pastSessions.map((session) => (
              <CoachingSessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
