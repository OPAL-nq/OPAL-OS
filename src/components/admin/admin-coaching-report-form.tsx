'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileText, Loader2, Sparkles } from 'lucide-react';
import { createCoachingReport, updateCoachingReport } from '@/app/actions/intensive';
import type { CoachingReport } from '@/types';

interface AdminCoachingReportFormProps {
  sessionId: string;
  clientId: string;
  reportToEdit?: CoachingReport | null;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AdminCoachingReportForm({
  sessionId,
  clientId,
  reportToEdit,
  trigger,
  onSuccess,
}: AdminCoachingReportFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [keyPoints, setKeyPoints] = useState(reportToEdit?.key_points || '');
  const [workAssigned, setWorkAssigned] = useState(reportToEdit?.work_assigned || '');
  const [nextSteps, setNextSteps] = useState(reportToEdit?.next_steps || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (reportToEdit) {
        await updateCoachingReport(reportToEdit.id, {
          keyPoints,
          workAssigned,
          nextSteps,
        });
      } else {
        await createCoachingReport({
          sessionId,
          clientId,
          keyPoints,
          workAssigned,
          nextSteps,
        });
      }

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
            variant="outline"
            className="border-white/10 hover:bg-white/5 text-xs text-neutral-300"
          >
            <FileText className="w-3.5 h-3.5 mr-1 text-[#39FF14]" />
            <span>{reportToEdit ? 'Modifier compte rendu' : 'Rédiger compte rendu'}</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-[#141414] border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#39FF14]" />
            <span>
              {reportToEdit ? 'Modifier le Compte Rendu' : 'Rédiger le Compte Rendu de Séance'}
            </span>
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
              1. Points Clés & Débrief de Séance
            </label>
            <Textarea
              placeholder="- Respect du Risk Policy&#10;- Attente des confirmations de clôture&#10;- Réduction des entrées impulsives"
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              rows={4}
              className="bg-[#0A0A0A] border-white/10 text-white text-xs leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              2. Travail à Effectuer / Exercices
            </label>
            <Textarea
              placeholder="- Préparer le scénario avant 15h&#10;- Ne prendre qu'une décision EXECUTE / WAIT / ABSTAIN"
              value={workAssigned}
              onChange={(e) => setWorkAssigned(e.target.value)}
              rows={3}
              className="bg-[#0A0A0A] border-white/10 text-white text-xs leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              3. Prochaines Étapes
            </label>
            <Textarea
              placeholder="Travailler la patience pendant les 5 prochaines sessions."
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              rows={2}
              className="bg-[#0A0A0A] border-white/10 text-white text-xs leading-relaxed"
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
                  <span>Publication...</span>
                </>
              ) : (
                <span>Publier le compte rendu</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
