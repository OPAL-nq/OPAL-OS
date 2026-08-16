'use client';

import React from 'react';
import { Target, CheckCircle2, AlertTriangle, TrendingUp, ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { IntensiveFollowUp } from '@/types';

interface FollowUpCardProps {
  followUp: IntensiveFollowUp | null;
}

export function FollowUpCard({ followUp }: FollowUpCardProps) {
  if (!followUp) {
    return (
      <Card className="bg-[#141414] border-white/5 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-neutral-400">
          <TrendingUp className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">
          Suivi individuel en cours d'initialisation
        </h3>
        <p className="text-xs text-neutral-400 max-w-md mx-auto">
          Maxym rédigera votre première synthèse d'accompagnement suite à votre premier entretien de cadrage.
        </p>
      </Card>
    );
  }

  const updatedDate = new Date(followUp.updated_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Calendar className="w-4 h-4 text-[#39FF14]" />
          <span>Dernière mise à jour : {updatedDate}</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14]/30 px-2.5 py-1 rounded-full">
          Feuille de route active
        </span>
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Objectif Actuel */}
        <Card className="bg-gradient-to-br from-[#161616] to-[#121212] border-[#39FF14]/30 md:col-span-2">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-wider text-[#39FF14] mb-3">
              <Target className="w-4 h-4 text-[#39FF14]" />
              <span>Objectif Actuel Prioritaire</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
              « {followUp.current_objective || 'Construire une exécution disciplinée et respecter votre Risk Policy.'} »
            </p>
          </CardContent>
        </Card>

        {/* 2. Points Travaillés */}
        <Card className="bg-[#141414] border-white/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Points Travaillés</span>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <p className="text-xs sm:text-sm text-neutral-300 whitespace-pre-line leading-relaxed">
              {followUp.points_worked || 'Identification des setups A+, patience avant les horaires clés.'}
            </p>
          </CardContent>
        </Card>

        {/* 3. Erreurs à Corriger */}
        <Card className="bg-[#141414] border-white/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Erreurs à Corriger</span>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <p className="text-xs sm:text-sm text-neutral-300 whitespace-pre-line leading-relaxed">
              {followUp.errors_to_fix || 'Entrées anticipées sans clôture de bougie, sur-trading après perte.'}
            </p>
          </CardContent>
        </Card>

        {/* 4. Progression */}
        <Card className="bg-[#141414] border-white/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Progression Constatée</span>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <p className="text-xs sm:text-sm text-neutral-300 whitespace-pre-line leading-relaxed">
              {followUp.progression || 'Discipline en nette amélioration. R/R moyen stabilisé à 2.5.'}
            </p>
          </CardContent>
        </Card>

        {/* 5. Prochaine Étape */}
        <Card className="bg-[#141414] border-white/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#39FF14]">
              <ArrowRight className="w-4 h-4 text-[#39FF14]" />
              <span>Prochaine Étape Immédiate</span>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <p className="text-xs sm:text-sm text-white font-medium whitespace-pre-line leading-relaxed">
              {followUp.next_step || 'Respecter le scénario préparé avant chaque session sans déviation.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
