import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Target } from 'lucide-react';
import { IntensiveNav } from '@/components/intensive/intensive-nav';
import { ObjectiveList } from '@/components/intensive/objective-list';
import type { IntensiveObjective } from '@/types';

export const dynamic = 'force-dynamic';

export default async function IntensiveObjectivesPage() {
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

  const { data: objectivesData } = await supabase
    .from('intensive_objectives')
    .select('*')
    .eq('user_id', user.id)
    .order('position', { ascending: true })
    .order('created_at', { ascending: false });

  const objectives: IntensiveObjective[] = objectivesData || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-semibold uppercase tracking-wider mb-2">
          <Target className="w-3.5 h-3.5" />
          <span>Objectifs Stratégiques</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Objectifs d'Accompagnement
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Vos cibles de travail et jalons de validation définis avec Maxym pour structurer votre progression.
        </p>
      </div>

      {/* Navigation Tabs */}
      <IntensiveNav />

      {/* Objectives List */}
      <ObjectiveList objectives={objectives} />
    </div>
  );
}
