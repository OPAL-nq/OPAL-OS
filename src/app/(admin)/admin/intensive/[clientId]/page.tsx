import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminIntensiveClient } from '@/components/admin/admin-intensive-client';
import type {
  Profile,
  CoachingSession,
  CoachingReport,
  IntensiveObjective,
  IntensiveFollowUp,
} from '@/types';

export const dynamic = 'force-dynamic';

interface AdminIntensiveClientPageProps {
  params: Promise<{
    clientId: string;
  }>;
}

export default async function AdminIntensiveClientPage({
  params,
}: AdminIntensiveClientPageProps) {
  const { clientId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (currentProfile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch client profile
  const { data: clientProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', clientId)
    .single();

  if (!clientProfile) {
    notFound();
  }

  // Fetch related intensive data
  const [sessionsRes, reportsRes, objectivesRes, followUpRes] = await Promise.all([
    supabase
      .from('coaching_sessions')
      .select('*')
      .eq('client_id', clientId)
      .order('scheduled_at', { ascending: false }),
    supabase
      .from('coaching_reports')
      .select('*, session:coaching_sessions(*)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false }),
    supabase
      .from('intensive_objectives')
      .select('*')
      .eq('user_id', clientId)
      .order('position', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase
      .from('intensive_follow_ups')
      .select('*')
      .eq('user_id', clientId)
      .maybeSingle(),
  ]);

  const sessions: CoachingSession[] = sessionsRes.data || [];
  const reports: CoachingReport[] = reportsRes.data || [];
  const objectives: IntensiveObjective[] = objectivesRes.data || [];
  const followUp: IntensiveFollowUp | null = followUpRes.data || null;

  return (
    <AdminIntensiveClient
      client={clientProfile}
      sessions={sessions}
      reports={reports}
      objectives={objectives}
      followUp={followUp}
    />
  );
}
