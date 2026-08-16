import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminIntensiveManager } from '@/components/admin/admin-intensive-manager';
import type {
  Profile,
  CoachingSession,
  IntensiveFollowUp,
  IntensiveObjective,
  CoachingReport,
  IntensiveClientSummary,
} from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminIntensivePage() {
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

  // Fetch all Intensive clients
  const { data: clientsData } = await supabase
    .from('profiles')
    .select('*')
    .eq('plan', 'intensive')
    .order('created_at', { ascending: false });

  const clients: Profile[] = clientsData || [];

  // Fetch related data for all intensive clients in parallel
  const clientSummaries: IntensiveClientSummary[] = await Promise.all(
    clients.map(async (client) => {
      const now = new Date().toISOString();
      const [sessionsRes, followUpRes, objectivesRes, reportsRes] = await Promise.all([
        supabase
          .from('coaching_sessions')
          .select('*')
          .eq('client_id', client.id)
          .eq('status', 'scheduled')
          .gte('scheduled_at', now)
          .order('scheduled_at', { ascending: true })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('intensive_follow_ups')
          .select('*')
          .eq('user_id', client.id)
          .maybeSingle(),
        supabase
          .from('intensive_objectives')
          .select('status')
          .eq('user_id', client.id),
        supabase
          .from('coaching_reports')
          .select('*')
          .eq('client_id', client.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const objectives = objectivesRes.data || [];

      return {
        profile: client,
        nextSession: sessionsRes.data || null,
        lastFollowUp: followUpRes.data || null,
        objectivesCount: {
          active: objectives.filter((o) => o.status === 'active').length,
          completed: objectives.filter((o) => o.status === 'completed').length,
          paused: objectives.filter((o) => o.status === 'paused').length,
        },
        lastReport: reportsRes.data || null,
      };
    })
  );

  return <AdminIntensiveManager clients={clientSummaries} />;
}
