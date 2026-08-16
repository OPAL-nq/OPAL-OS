import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LineChart } from 'lucide-react';
import { IntensiveNav } from '@/components/intensive/intensive-nav';
import { FollowUpCard } from '@/components/intensive/follow-up-card';
import type { IntensiveFollowUp } from '@/types';

export const dynamic = 'force-dynamic';

export default async function IntensiveFollowUpPage() {
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

  const { data: followUp } = await supabase
    .from('intensive_follow_ups')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-semibold uppercase tracking-wider mb-2">
          <LineChart className="w-3.5 h-3.5" />
          <span>Feuille de Route</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Suivi Individuel & Synthèse
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Votre feuille de route stratégique rédigée et actualisée en direct par Maxym après chaque séance.
        </p>
      </div>

      {/* Navigation Tabs */}
      <IntensiveNav />

      {/* Main Follow Up Display */}
      <FollowUpCard followUp={followUp} />
    </div>
  );
}
