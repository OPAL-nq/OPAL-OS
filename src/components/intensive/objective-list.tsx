'use client';

import React from 'react';
import { Target, CheckCircle2, PauseCircle } from 'lucide-react';
import { ObjectiveCard } from './objective-card';
import type { IntensiveObjective } from '@/types';

interface ObjectiveListProps {
  objectives: IntensiveObjective[];
}

export function ObjectiveList({ objectives }: ObjectiveListProps) {
  if (objectives.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-[#141414] border border-white/5 text-center">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-neutral-400">
          <Target className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1">
          Aucun objectif défini
        </h3>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Vos objectifs personnalisés apparaîtront ici dès que Maxym les aura créés.
        </p>
      </div>
    );
  }

  const activeObjectives = objectives.filter((o) => o.status === 'active');
  const completedObjectives = objectives.filter((o) => o.status === 'completed');
  const pausedObjectives = objectives.filter((o) => o.status === 'paused');

  return (
    <div className="space-y-6">
      {/* Active Objectives */}
      {activeObjectives.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#39FF14]">
            <Target className="w-3.5 h-3.5" />
            <span>Objectifs Actifs ({activeObjectives.length})</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {activeObjectives.map((obj) => (
              <ObjectiveCard key={obj.id} objective={obj} />
            ))}
          </div>
        </div>
      )}

      {/* Paused Objectives */}
      {pausedObjectives.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
            <PauseCircle className="w-3.5 h-3.5" />
            <span>En Attente / Pause ({pausedObjectives.length})</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {pausedObjectives.map((obj) => (
              <ObjectiveCard key={obj.id} objective={obj} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Objectives */}
      {completedObjectives.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Objectifs Atteints ({completedObjectives.length})</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {completedObjectives.map((obj) => (
              <ObjectiveCard key={obj.id} objective={obj} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
