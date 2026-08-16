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
import { Target, Plus, Loader2 } from 'lucide-react';
import { createObjective, updateObjective } from '@/app/actions/intensive';
import type { IntensiveObjective } from '@/types';

interface AdminObjectiveFormProps {
  userId: string;
  objectiveToEdit?: IntensiveObjective | null;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AdminObjectiveForm({
  userId,
  objectiveToEdit,
  trigger,
  onSuccess,
}: AdminObjectiveFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(objectiveToEdit?.title || '');
  const [description, setDescription] = useState(objectiveToEdit?.description || '');
  const [status, setStatus] = useState<'active' | 'completed' | 'paused'>(
    objectiveToEdit?.status || 'active'
  );
  const [position, setPosition] = useState(objectiveToEdit?.position ?? 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Le titre de l’objectif est requis.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (objectiveToEdit) {
        await updateObjective(objectiveToEdit.id, {
          title,
          description,
          status,
          position: Number(position),
        });
      } else {
        await createObjective({
          userId,
          title,
          description,
          status,
          position: Number(position),
        });
      }

      setOpen(false);
      if (!objectiveToEdit) {
        setTitle('');
        setDescription('');
      }
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
            <span>Ajouter un Objectif</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-[#141414] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Target className="w-4 h-4 text-[#39FF14]" />
            <span>{objectiveToEdit ? 'Modifier l’Objectif' : 'Ajouter un Nouvel Objectif'}</span>
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
              Titre de l'objectif
            </label>
            <Input
              placeholder="Ex: Respecter le Risk Policy sur 20 sessions consécutives"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-[#0A0A0A] border-white/10 text-white text-xs h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Description & Modalités
            </label>
            <Textarea
              placeholder="Détails du travail attendu, métriques d'invalidation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-[#0A0A0A] border-white/10 text-white text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-10 px-3 rounded-md bg-[#0A0A0A] border border-white/10 text-white text-xs focus:outline-none focus:border-[#39FF14]"
              >
                <option value="active">🟢 Actif</option>
                <option value="completed">✓ Terminé</option>
                <option value="paused">⏸ En pause</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Ordre d'affichage
              </label>
              <Input
                type="number"
                value={position}
                onChange={(e) => setPosition(Number(e.target.value))}
                className="bg-[#0A0A0A] border-white/10 text-white text-xs h-10"
              />
            </div>
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
                <span>{objectiveToEdit ? 'Enregistrer' : 'Créer l’objectif'}</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
