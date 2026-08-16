'use client';

import React from 'react';
import { Target, CheckCircle2, PauseCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { IntensiveObjective } from '@/types';
import { cn } from '@/lib/utils';

interface ObjectiveCardProps {
  objective: IntensiveObjective;
}

export function ObjectiveCard({ objective }: ObjectiveCardProps) {
  const isActive = objective.status === 'active';
  const isCompleted = objective.status === 'completed';
  const isPaused = objective.status === 'paused';

  return (
    <Card
      className={cn(
        'bg-[#141414] transition-all border',
        isActive
          ? 'border-[#39FF14]/30 shadow-[0_0_15px_rgba(57,255,20,0.05)]'
          : isCompleted
          ? 'border-emerald-500/20 opacity-80'
          : 'border-white/5 opacity-60'
      )}
    >
      <CardContent className="p-5 flex items-start gap-4">
        <div
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5',
            isActive
              ? 'bg-[#39FF14]/15 text-[#39FF14] border-[#39FF14]/30'
              : isCompleted
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-white/5 text-neutral-400 border-white/10'
          )}
        >
          {isActive ? (
            <Target className="w-4 h-4" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <PauseCircle className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-1">
            <h4
              className={cn(
                'text-sm font-bold',
                isCompleted ? 'text-neutral-300 line-through' : 'text-white'
              )}
            >
              {objective.title}
            </h4>

            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0',
                isActive
                  ? 'bg-[#39FF14]/15 text-[#39FF14] border-[#39FF14]/30'
                  : isCompleted
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-white/5 text-neutral-400 border-white/10'
              )}
            >
              {isActive ? '🟢 Actif' : isCompleted ? '✓ Terminé' : '⏸ En pause'}
            </span>
          </div>

          {objective.description && (
            <p className="text-xs text-neutral-400 leading-relaxed mt-1">
              {objective.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
