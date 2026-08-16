'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar, Plus, Loader2 } from 'lucide-react';
import { createCoachingSession, updateCoachingSession } from '@/app/actions/intensive';
import type { CoachingSession } from '@/types';

interface AdminCoachingFormProps {
  clientId: string;
  sessionToEdit?: CoachingSession | null;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

function toLocalDatetimeString(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function AdminCoachingForm({
  clientId,
  sessionToEdit,
  trigger,
  onSuccess,
}: AdminCoachingFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDefaultDate = () => {
    if (sessionToEdit) {
      return toLocalDatetimeString(new Date(sessionToEdit.scheduled_at));
    }
    const nextSlot = new Date();
    nextSlot.setDate(nextSlot.getDate() + 1);
    nextSlot.setHours(14, 0, 0, 0);
    return toLocalDatetimeString(nextSlot);
  };

  const [scheduledAt, setScheduledAt] = useState(getDefaultDate());
  const [duration, setDuration] = useState(sessionToEdit?.duration_minutes || 60);
  const [type, setType] = useState<'private' | 'group'>(sessionToEdit?.type || 'private');
  const [notes, setNotes] = useState(sessionToEdit?.notes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) {
      setError('Veuillez sélectionner une date et une heure.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (sessionToEdit) {
        await updateCoachingSession(sessionToEdit.id, {
          scheduledAt: new Date(scheduledAt).toISOString(),
          durationMinutes: Number(duration),
          type,
          notes,
        });
      } else {
        await createCoachingSession({
          clientId,
          scheduledAt: new Date(scheduledAt).toISOString(),
          durationMinutes: Number(duration),
          type,
          notes,
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
            className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold text-xs"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Planifier un Coaching</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-[#141414] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#39FF14]" />
            <span>
              {sessionToEdit ? 'Modifier le Coaching' : 'Planifier un Nouveau Coaching'}
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
              Date & Heure
            </label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              className="bg-[#0A0A0A] border-white/10 text-white text-xs h-10 [color-scheme:dark]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Durée (minutes)
              </label>
              <Input
                type="number"
                min="15"
                step="15"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                required
                className="bg-[#0A0A0A] border-white/10 text-white text-xs h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Type de Séance
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full h-10 px-3 rounded-md bg-[#0A0A0A] border border-white/10 text-white text-xs focus:outline-none focus:border-[#39FF14]"
              >
                <option value="private">Coaching Privé 1-on-1</option>
                <option value="group">Session de Groupe</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Notes & Préparation (visible par l'élève)
            </label>
            <Textarea
              placeholder="Ex: Analyse de la session NQ de mardi, travail sur l'invalidation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="bg-[#0A0A0A] border-white/10 text-white text-xs"
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
                <span>{sessionToEdit ? 'Enregistrer' : 'Planifier la séance'}</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
