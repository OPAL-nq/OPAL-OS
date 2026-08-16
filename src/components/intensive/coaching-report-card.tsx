'use client';

import React from 'react';
import { Calendar, FileText, CheckCircle2, ArrowRight, Target, AlertTriangle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CoachingReport } from '@/types';

interface CoachingReportCardProps {
  report: CoachingReport;
}

export function CoachingReportCard({ report }: CoachingReportCardProps) {
  const sessionDate = report.session?.scheduled_at || report.created_at;
  const date = new Date(sessionDate);
  const formattedDate = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card className="bg-[#141414] border-white/5 overflow-hidden">
      <CardHeader className="pb-4 border-b border-white/5 bg-[#171717]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
                Compte Rendu de Coaching
              </CardTitle>
              <p className="text-xs text-[#39FF14] capitalize font-medium">
                {formattedDate}
              </p>
            </div>
          </div>

          <span className="text-[11px] text-neutral-400 self-start sm:self-center">
            Accompagnement Maxym
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* 1. Key Points */}
        {report.key_points && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
              <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
              <span>Points Clés & Débrief</span>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
              {report.key_points}
            </div>
          </div>
        )}

        {/* 2. Work Assigned */}
        {report.work_assigned && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              <span>Travail à Effectuer</span>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-500/[0.04] border border-blue-500/20 text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
              {report.work_assigned}
            </div>
          </div>
        )}

        {/* 3. Next Steps */}
        {report.next_steps && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
              <ArrowRight className="w-3.5 h-3.5 text-[#39FF14]" />
              <span>Prochaines Étapes</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#39FF14]/[0.04] border border-[#39FF14]/20 text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
              {report.next_steps}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
