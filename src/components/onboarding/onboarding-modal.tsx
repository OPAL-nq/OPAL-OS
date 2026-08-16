'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  BookOpen,
  TrendingUp,
  Calculator,
  MessageSquare,
  Flame,
  ArrowRight,
  CheckCircle2,
  User,
  ShieldCheck,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateProfile } from '@/app/actions/auth';

interface OnboardingModalProps {
  userId: string;
  initialFullName?: string | null;
  initialAvatarUrl?: string | null;
  plan?: string | null;
}

export function OnboardingModal({
  userId,
  initialFullName = '',
  initialAvatarUrl = '',
  plan = 'community',
}: OnboardingModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fullName, setFullName] = useState(initialFullName || '');
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && userId) {
      const isCompleted = localStorage.getItem(`opal_onboarding_completed_${userId}`);
      if (!isCompleted) {
        setOpen(true);
      }
    }
  }, [userId]);

  const handleComplete = (targetRoute: string) => {
    if (typeof window !== 'undefined' && userId) {
      localStorage.setItem(`opal_onboarding_completed_${userId}`, 'true');
    }
    setOpen(false);
    router.push(targetRoute);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ fullName, avatarUrl });
    } catch (e) {
      console.error('Erreur sauvegarde profil onboarding:', e);
    } finally {
      setIsSaving(false);
      setStep(4);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-[#141414] border border-white/10 text-white max-w-lg p-0 overflow-hidden shadow-2xl rounded-2xl">
        <DialogTitle className="sr-only">Bienvenue dans OPAL OS</DialogTitle>
        {/* Step Progress Bar */}
        <div className="h-1 bg-white/5 w-full flex">
          <div
            className="h-full bg-[#39FF14] transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* STEP 1: BIENVENUE */}
          {step === 1 && (
            <div className="space-y-6 text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center mx-auto text-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.15)]">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30">
                  Trading OS v1.0
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight pt-1">
                  Bienvenue dans OPAL OS.
                </h2>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                  Votre plateforme centralisée pour la formation, la préparation de session, 
                  le journal de performance CME Futures et l'accompagnement d'élite.
                </p>
              </div>

              <Button
                onClick={() => setStep(2)}
                className="w-full bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold text-xs h-10 shadow-[0_0_20px_rgba(57,255,20,0.2)]"
              >
                <span>Découvrir la plateforme</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          )}

          {/* STEP 2: ENVIRONNEMENT */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Votre écosystème de trading
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Découvrez les piliers d'OPAL OS pensés pour votre rigueur quotidienne.
                </p>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-white/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">OPAL Academy</h3>
                    <p className="text-[11px] text-neutral-400">
                      Cursus vidéo institutionnel et validation pas-à-pas de vos acquis.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-white/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Trading Workspace & Journal</h3>
                    <p className="text-[11px] text-neutral-400">
                      Préparation pré-marché (NQ/ES), journalisation CME en ticks et calcul en Multiple R.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-white/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">OPAL Systems</h3>
                    <p className="text-[11px] text-neutral-400">
                      Calculateurs de risque, dimensionnement de position et buffer prop firms.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-white/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Live & Community</h3>
                    <p className="text-[11px] text-neutral-400">
                      Live trading, replays archivés et échanges thématiques modérés.
                    </p>
                  </div>
                </div>

                {plan === 'intensive' && (
                  <div className="p-3 rounded-xl bg-[#39FF14]/5 border border-[#39FF14]/20 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#39FF14]">OPAL Intensive Actif</h3>
                      <p className="text-[11px] text-neutral-300">
                        2 coachings privés par semaine avec Maxym, suivi individualisé et objectifs.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="border-white/10 text-neutral-300 hover:bg-white/5 text-xs h-9"
                >
                  Précédent
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold text-xs h-9"
                >
                  <span>Configurer mon profil</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: PROFIL */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Personnalisez votre profil
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Ces informations seront visibles lors de vos échanges dans la communauté.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">Nom complet ou Pseudo</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Alex Miller"
                    className="bg-[#0A0A0A] border-white/10 text-white text-xs h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">URL Avatar (optionnel)</label>
                  <Input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-[#0A0A0A] border-white/10 text-white text-xs h-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="border-white/10 text-neutral-300 hover:bg-white/5 text-xs h-9"
                >
                  Précédent
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold text-xs h-9"
                >
                  <span>{isSaving ? 'Enregistrement...' : 'Enregistrer & Continuer'}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: PREMIÈRE ACTION */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center mx-auto text-[#39FF14] mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Prêt à démarrer !
                </h2>
                <p className="text-xs text-neutral-400">
                  Par quelle action souhaitez-vous commencer aujourd'hui ?
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <button
                  onClick={() => handleComplete('/academy')}
                  className="w-full text-left p-4 rounded-xl bg-[#0A0A0A] hover:bg-white/5 border border-white/10 hover:border-[#39FF14]/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#39FF14]/15 text-[#39FF14] flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-[#39FF14] transition-colors">
                        Suivre la formation OPAL Academy
                      </h3>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Recommandé pour démarrer et assimiler la méthodologie.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#39FF14] group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => handleComplete('/trading')}
                  className="w-full text-left p-4 rounded-xl bg-[#0A0A0A] hover:bg-white/5 border border-white/10 hover:border-[#39FF14]/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                        Préparer ma session de trading
                      </h3>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Ouvrir le Workspace pour cadrer votre session du jour.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => handleComplete('/dashboard')}
                  className="text-xs text-neutral-500 hover:text-white transition-colors"
                >
                  Aller directement au Tableau de bord
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
