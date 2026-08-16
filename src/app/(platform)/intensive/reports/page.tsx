import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FileText } from 'lucide-react';
import { IntensiveNav } from '@/components/intensive/intensive-nav';
import { CoachingReportCard } from '@/components/intensive/coaching-report-card';
import type { CoachingReport } from '@/types';

export const dynamic = 'force-dynamic';

export default async function IntensiveReportsPage() {
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

  const { data: reportsData } = await supabase
    .from('coaching_reports')
    .select('*, session:coaching_sessions(*)')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  const reports: CoachingReport[] = reportsData || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-semibold uppercase tracking-wider mb-2">
          <FileText className="w-3.5 h-3.5" />
          <span>Comptes Rendus & Débriefs</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Comptes Rendus de Coaching
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Retrouvez l'ensemble des synthèses écrites, points clés et exercices de travail assignés par Maxym.
        </p>
      </div>

      {/* Navigation Tabs */}
      <IntensiveNav />

      {/* Reports Feed */}
      {reports.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#141414] border border-white/5 text-center">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-neutral-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">
            Aucun compte rendu rédigé
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Vos comptes rendus apparaîtront ici dès que Maxym aura rédigé la synthèse de votre première séance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {reports.map((report) => (
            <CoachingReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
