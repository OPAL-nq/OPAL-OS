'use client';

import React, { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  FileEdit,
  HelpCircle,
  Brain,
  LineChart,
  Target,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Calendar,
  Clock,
  User,
  Sparkles,
} from 'lucide-react';
import { updateCoachNotes } from '@/app/actions/intensive';
import { cn } from '@/lib/utils';
import type { CoachingSession, CoachingPreparation } from '@/types';

interface AdminCoachingPreparationModalProps {
  session: CoachingSession;
  clientName: string;
  trigger?: React.ReactNode;
}

export function AdminCoachingPreparationModal({
  session,
  clientName,
  trigger,
}: AdminCoachingPreparationModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const prep = session.preparation;
  const [coachNotes, setCoachNotes] = useState(prep?.coach_notes || '');

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

  const isSubmitted = prep?.status === 'submitted' || prep?.status === 'reviewed';
  const isDraft = prep?.status === 'draft';
  const hasPrep = !!prep && (prep.questions || prep.difficulties?.psychology?.length || prep.trades_to_review?.length || prep.key_goals);

  const handleSaveCoachNotes = () => {
    if (!prep?.id) return;
    setSaveSuccess(false);
    startTransition(async () => {
      try {
        await updateCoachNotes(prep.id, coachNotes);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
        console.error('Erreur sauvegarde notes coach:', err);
      }
    });
  };

  const handleCopySummary = () => {
    if (!prep) return;
    const summary = `### Préparation Coaching - ${clientName} (${formattedDate} à ${startTime})
**Questions clés :**
${prep.questions || 'Aucune question spécifique'}

**Difficultés :**
- Psycho : ${prep.difficulties?.psychology?.join(', ') || 'N/A'}
- Technique : ${prep.difficulties?.technique?.join(', ') || 'N/A'}
- Risque : ${prep.difficulties?.risk?.join(', ') || 'N/A'}
${prep.difficulties?.notes ? `*Notes :* ${prep.difficulties.notes}` : ''}

**Objectifs du call :**
${prep.key_goals || 'N/A'}
`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="sm"
            variant="outline"
            className={cn(
              'h-7 px-2.5 text-[10px] font-semibold border transition-all',
              isSubmitted
                ? 'border-[#39FF14]/40 text-[#39FF14] bg-[#39FF14]/10 hover:bg-[#39FF14]/20'
                : isDraft
                ? 'border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20'
                : 'border-white/10 text-neutral-400 hover:text-white'
            )}
          >
            <FileEdit className="w-3 h-3 mr-1 text-[#39FF14]" />
            <span>{isSubmitted ? 'Fiche élève ✓' : isDraft ? 'Brouillon fiche' : 'Fiche élève'}</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-[#141414] border-white/10 text-white max-w-3xl max-h-[85vh] overflow-y-auto p-6">
        <DialogHeader className="pb-3 border-b border-white/5 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30">
                Fiche Préparatoire 1-on-1
              </span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                  isSubmitted
                    ? 'bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]/40'
                    : isDraft
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-white/5 text-neutral-400 border-white/10'
                )}
              >
                {isSubmitted
                  ? 'Transmise par l’élève ✓'
                  : isDraft
                  ? 'Brouillon en cours'
                  : 'Non remplie'}
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              className="border-white/10 text-neutral-300 hover:text-white text-xs h-7 px-2.5"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 mr-1 text-[#39FF14]" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  <span>Copier la synthèse</span>
                </>
              )}
            </Button>
          </div>

          <DialogTitle className="text-lg font-extrabold text-white flex items-center gap-2">
            <span>Préparation de session :</span>
            <span className="text-[#39FF14]">{clientName}</span>
          </DialogTitle>

          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <div className="flex items-center gap-1.5 text-white">
              <Calendar className="w-3.5 h-3.5 text-[#39FF14]" />
              <span className="capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>{startTime} ({session.duration_minutes} min)</span>
            </div>
          </div>
        </DialogHeader>

        {!hasPrep ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-neutral-500 mx-auto" />
            <p className="text-sm font-semibold text-neutral-300">
              L'élève n'a pas encore rempli sa fiche de préparation.
            </p>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Dès que l'élève valide sa fiche depuis son cockpit OPAL Intensive, ses questions, difficultés et graphiques s'afficheront ici en direct.
            </p>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* 1. Questions & Points Clés */}
            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>1. Points & Questions à aborder</span>
              </div>
              {prep?.questions ? (
                <p className="text-xs text-neutral-200 whitespace-pre-line leading-relaxed pl-5 bg-black/30 p-3 rounded-lg border border-white/5">
                  {prep.questions}
                </p>
              ) : (
                <p className="text-xs text-neutral-500 italic pl-5">Aucune question spécifique renseignée.</p>
              )}
            </div>

            {/* 2. Difficultés Rencontrées */}
            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/5 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>2. Difficultés signalées cette semaine</span>
              </div>

              {/* Psychology */}
              {prep?.difficulties?.psychology && prep.difficulties.psychology.length > 0 && (
                <div className="space-y-1.5 pl-5">
                  <span className="text-[11px] font-semibold text-purple-300">Psychologie & Discipline :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {prep.difficulties.psychology.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technique */}
              {prep?.difficulties?.technique && prep.difficulties.technique.length > 0 && (
                <div className="space-y-1.5 pl-5">
                  <span className="text-[11px] font-semibold text-blue-300">Technique & Exécution :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {prep.difficulties.technique.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/40"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk */}
              {prep?.difficulties?.risk && prep.difficulties.risk.length > 0 && (
                <div className="space-y-1.5 pl-5">
                  <span className="text-[11px] font-semibold text-amber-300">Risque & Prop Firms :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {prep.difficulties.risk.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {prep?.difficulties?.notes && (
                <div className="pl-5 pt-1">
                  <p className="text-xs text-neutral-300 italic bg-black/30 p-2.5 rounded-lg border border-white/5">
                    « {prep.difficulties.notes} »
                  </p>
                </div>
              )}
            </div>

            {/* 3. Trades & Graphiques à Auditer */}
            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                  <LineChart className="w-3.5 h-3.5 text-blue-400" />
                  <span>3. Trades & Graphiques à auditer ({prep?.trades_to_review?.length || 0})</span>
                </div>
              </div>

              {prep?.trades_to_review && prep.trades_to_review.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-5">
                  {prep.trades_to_review.map((t, idx) => (
                    <div
                      key={t.id || idx}
                      className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{t.symbol}</span>
                          <span
                            className={cn(
                              'text-[10px] font-black uppercase px-1.5 py-0.5 rounded',
                              t.direction === 'Long'
                                ? 'bg-[#39FF14]/15 text-[#39FF14]'
                                : 'bg-red-500/15 text-red-400'
                            )}
                          >
                            {t.direction}
                          </span>
                        </div>
                        {t.pnl_r !== undefined && (
                          <span
                            className={cn(
                              'font-bold',
                              Number(t.pnl_r) > 0 ? 'text-[#39FF14]' : 'text-red-400'
                            )}
                          >
                            {Number(t.pnl_r) > 0 ? `+${t.pnl_r}` : t.pnl_r}R
                          </span>
                        )}
                      </div>

                      {t.screenshot_url && (
                        <a
                          href={t.screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block relative rounded-md overflow-hidden border border-white/10 aspect-video group/img"
                        >
                          <img
                            src={t.screenshot_url}
                            alt="Capture trade"
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-[11px] font-bold text-white gap-1">
                            <ExternalLink className="w-3 h-3" />
                            <span>Voir le graphique HD</span>
                          </div>
                        </a>
                      )}

                      {t.notes && (
                        <p className="text-[11px] text-neutral-300 italic bg-black/60 p-2 rounded border border-white/5">
                          « {t.notes} »
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-500 italic pl-5">Aucun graphique attaché.</p>
              )}
            </div>

            {/* 4. Objectifs du Call */}
            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                <Target className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>4. Objectifs visés par l'élève pour la séance</span>
              </div>
              {prep?.key_goals ? (
                <p className="text-xs text-neutral-200 whitespace-pre-line leading-relaxed pl-5 bg-black/30 p-3 rounded-lg border border-white/5">
                  {prep.key_goals}
                </p>
              ) : (
                <p className="text-xs text-neutral-500 italic pl-5">Aucun objectif renseigné.</p>
              )}
            </div>

            {/* 5. Coach Private Prep Notes (Maxym) */}
            {prep?.id && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#161616] to-[#0d0d0d] border border-[#39FF14]/30 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
                    <span>Notes Privées de Préparation du Coach (Maxym)</span>
                  </div>
                  {saveSuccess && (
                    <span className="text-[11px] text-[#39FF14] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Enregistré</span>
                    </span>
                  )}
                </div>

                <Textarea
                  rows={3}
                  value={coachNotes}
                  onChange={(e) => setCoachNotes(e.target.value)}
                  placeholder="Notes privées visibles uniquement par Maxym (ex : Insister sur l'attente du sweep en M15, faire faire l'exercice de calcul de risque NQ)..."
                  className="bg-black/60 border-white/10 text-white text-xs leading-relaxed placeholder:text-neutral-600 focus:border-[#39FF14]/50"
                />

                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    disabled={isPending}
                    onClick={handleSaveCoachNotes}
                    className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold text-xs h-8 px-3"
                  >
                    <Save className="w-3 h-3 mr-1.5" />
                    <span>Enregistrer mes notes</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
