import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LiveSession, LiveReplay } from '@/types/live';
import { AdminLiveManager } from '@/components/admin/admin-live-manager';
import { Radio, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminLivePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch all lives and replays
  const { data: livesData } = await supabase
    .from('lives')
    .select('*')
    .order('scheduled_at', { ascending: false });

  const { data: replaysData } = await supabase
    .from('live_replays')
    .select('*, live:live_id(*)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div>
        <Link
          href="/live"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voir l'espace Live public</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#39FF14] uppercase tracking-wider mb-1">
          <Radio className="w-4 h-4" />
          <span>Administration OPAL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Gestion des Lives & Replays
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Programmez de nouvelles sessions en direct, changez les statuts et ajoutez les replays.
        </p>
      </div>

      <AdminLiveManager
        lives={(livesData || []) as LiveSession[]}
        replays={(replaysData || []) as LiveReplay[]}
      />
    </div>
  );
}
