'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, Video, ArrowRight, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CoachingSession } from '@/types';

interface NextCoachingCardProps {
  session: CoachingSession | null;
}

export function NextCoachingCard({ session }: NextCoachingCardProps) {
  if (!session) {
    return (
      <Card className="bg-[#141414] border-white/5 relative overflow-hidden">
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                Prochain Coaching
              </span>
              <span className="p-1.5 rounded-md bg-white/5 text-neutral-400">
                <Calendar className="w-4 h-4" />
              </span>
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Aucun créneau planifié
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Maxym planifiera votre prochaine séance individuelle très prochainement. Vous recevrez une notification.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-neutral-500">
              Fréquence : 2x / semaine
            </span>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-white/5 text-xs text-neutral-300"
            >
              <Link href="/trading/workspace/new">
                <span>Préparer une session</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const date = new Date(session.scheduled_at);
  const formattedDate = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const startTime = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endDate = new Date(date.getTime() + session.duration_minutes * 60000);
  const endTime = endDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="bg-gradient-to-br from-[#161616] via-[#141414] to-[#101010] border-[#39FF14]/30 relative overflow-hidden shadow-[0_0_25px_rgba(57,255,20,0.06)]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 rounded-full blur-2xl pointer-events-none" />

      <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#39FF14]/15 border border-[#39FF14]/30 text-[#39FF14] text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
              <span>Prochain Coaching</span>
            </div>
            <span className="text-xs text-neutral-400 font-medium">
              {session.duration_minutes} min
            </span>
          </div>

          <h3 className="text-xl font-black text-white capitalize mb-1">
            {formattedDate}
          </h3>

          <div className="flex items-center gap-2 text-sm text-[#39FF14] font-semibold mb-3">
            <Clock className="w-4 h-4 text-[#39FF14]" />
            <span>
              {startTime} → {endTime}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-300">
            <User className="w-3.5 h-3.5 text-neutral-400" />
            <span>Coaching privé 1-on-1 avec Maxym</span>
          </div>

          {session.notes && (
            <p className="mt-3 text-xs text-neutral-400 bg-black/40 p-2.5 rounded-lg border border-white/5 italic">
              « {session.notes} »
            </p>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
          <Link
            href="/intensive/coaching"
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Voir l'historique
          </Link>
          <Button
            asChild
            className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold text-xs h-9 px-4 shadow-[0_0_15px_rgba(57,255,20,0.2)]"
          >
            <Link href="/trading/workspace/new">
              <span>Préparer ma session</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
