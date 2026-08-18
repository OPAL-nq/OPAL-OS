import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CoachingPreparationForm } from '@/components/intensive/coaching-preparation-form';
import type { CoachingSession, CoachingPreparation } from '@/types';
import type { Trade } from '@/types/trading';

export const dynamic = 'force-dynamic';

interface CoachingPreparePageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function CoachingPreparePage({ params }: CoachingPreparePageProps) {
  const { sessionId } = await params;
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

  // Fetch session
  const { data: sessionData, error: sessionErr } = await supabase
    .from('coaching_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionErr || !sessionData) {
    notFound();
  }

  // Verify access
  if (profile.role !== 'admin' && sessionData.client_id !== user.id) {
    redirect('/intensive/coaching');
  }

  // Fetch preparation & recent trades in parallel
  const [prepRes, tradesRes] = await Promise.all([
    supabase
      .from('coaching_preparations')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle(),
    supabase
      .from('trades')
      .select('*')
      .eq('user_id', sessionData.client_id)
      .order('trade_date', { ascending: false })
      .limit(20),
  ]);

  const session = sessionData as CoachingSession;
  const preparation = (prepRes.data || null) as CoachingPreparation | null;
  const recentTrades = (tradesRes.data || []) as Trade[];

  return (
    <div className="max-w-7xl mx-auto py-4">
      <CoachingPreparationForm
        session={session}
        initialPreparation={preparation}
        recentTrades={recentTrades}
      />
    </div>
  );
}
