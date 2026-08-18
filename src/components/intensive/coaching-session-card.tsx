'use client';

import React from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, FileText, FileEdit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { CoachingSession } from '@/types';
import { cn } from '@/lib/utils';

interface CoachingSessionCardProps {
  session: CoachingSession;
}

export function CoachingSessionCard({ session }: CoachingSessionCardProps) {
  const date = new Date(session.scheduled_at);
  const formattedDate = date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const startTime = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isCompleted = session.status === 'completed';
  const isCancelled = session.status === 'cancelled';
  const isScheduled = session.status === 'scheduled';
  const prep = session.preparation;

  return (
    <Card className="bg-[#141414] border-white/5 hover:border-white/10 transition-colors">
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
              isCompleted
                ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30'
                : isCancelled
                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            )}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isCancelled ? (
              <XCircle className="w-5 h-5" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white capitalize">
                {formattedDate}
              </span>
              <span className="text-xs text-neutral-400">à {startTime}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
              <span>{session.type === 'private' ? 'Coaching privé' : 'Session groupe'}</span>
              <span>•</span>
              <span>{session.duration_minutes} min</span>
              {session.notes && (
                <>
                  <span>•</span>
                  <span className="italic truncate max-w-[200px]">« {session.notes} »</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          <span
            className={cn(
              'px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border',
              isCompleted
                ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30'
                : isCancelled
                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            )}
          >
            {isCompleted ? 'Terminé' : isCancelled ? 'Annulé' : 'Planifié'}
          </span>

          {isScheduled && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className={cn(
                'h-8 text-xs font-semibold border',
                prep?.status === 'submitted'
                  ? 'border-[#39FF14]/30 text-[#39FF14] bg-[#39FF14]/10'
                  : 'border-white/10 text-neutral-300 hover:bg-white/5'
              )}
            >
              <Link href={`/intensive/coaching/prepare/${session.id}`}>
                <FileEdit className="w-3.5 h-3.5 mr-1" />
                <span>{prep?.status === 'submitted' ? 'Fiche prête ✓' : 'Préparer'}</span>
              </Link>
            </Button>
          )}

          {session.report && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-white/5 text-xs text-neutral-300 h-8"
            >
              <Link href="/intensive/reports">
                <FileText className="w-3.5 h-3.5 mr-1 text-[#39FF14]" />
                <span>Compte rendu</span>
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
