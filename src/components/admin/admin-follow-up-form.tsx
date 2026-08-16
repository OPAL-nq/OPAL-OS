'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LineChart, Edit, Loader2, Sparkles } from 'lucide-react';
import { upsertFollowUp } from '@/app/actions/intensive';
import type { IntensiveFollowUp } from '@/types';

interface AdminFollowUpFormProps {
  userId: string;
  followUp?: IntensiveFollowUp | null;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AdminFollowUpForm({
  userId,
  followUp,
  trigger,
  onSuccess,
}: AdminFollowUpFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentObjective, setCurrentObjective] = useState(followUp?.current_objective || '');
  const [pointsWorked, setPointsWorked] = useState(followUp?.points_worked || '');
  const [errorsToFix, setErrorsToFix] = useState(followUp?.errors_to_fix || '');
  const [progression, setProgression] = useState(followUp?.progression || '');
  const [nextStep, setNextStep] = useState(followUp?.next_step || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await upsertFollowUp({
        userId,
        currentObjective,
        pointsWorked,
        errorsToFix,
        progression,
        nextStep,
      });

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="sm"
            className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold text-xs"
          >
            <Edit className="w-4 h-4 mr-1.5" />
            <span>Mettre à jour le suivi</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-[#141414] border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <LineChart className="w-4 h-4 text-[#39FF14]" />
            <span>Actualiser le Suivi Individuel</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              1. Objectif Actuel Prioritaire
            </label>
            <Input
              placeholder="Construire une exécution disciplinée et respecter ton Risk Policy."
              value={currentObjective}
              onChange={(e) => setCurrentObjective(e.target.value)}
              className="bg-[#0A0A0A] border-white/10 text-white text-xs h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              2. Points Travaillés
            </label>
            <Textarea
              placeholder="Identification des setups A+, patience avant les horaires clés..."
              value={pointsWorked}
              onChange={(e) => setPointsWorked(e.target.value)}
              rows={2}
              className="bg-[#0A0A0A] border-white/10 text-white text-xs leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              3. Erreurs à Corriger
            </label>
            <Textarea
              placeholder="Entrées anticipées sans clôture, précipitation à l'open..."
              value={errorsToFix}
              onChange={(e) => setErrorsToFix(e.target.value)}
              rows={2}
              className="bg-[#0A0A0A] border-white/10 text-white text-xs leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              4. Progression Constatée
            </label>
            <Textarea
              placeholder="Discipline en progression. Travail prioritaire : attendre les confirmations..."
              value={progression}
              onChange={(e) => setProgression(e.target.value)}
              rows={2}
              className="bg-[#0A0A0A] border-white/10 text-white text-xs leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              5. Prochaine Étape / Action Immédiate
            </label>
            <Input
              placeholder="Respecter le scénario préparé avant chaque session sans déviation."
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              className="bg-[#0A0A0A] border-white/10 text-white text-xs h-10"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold text-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>Enregistrer le suivi</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
