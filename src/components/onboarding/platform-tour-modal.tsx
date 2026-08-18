'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  Flame,
  Radio,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  ExternalLink,
  Target,
  UploadCloud,
  BrainCircuit,
  Award,
} from 'lucide-react';

interface PlatformTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
}

export function PlatformTourModal({
  isOpen,
  onClose,
  initialStep = 1,
}: PlatformTourModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(initialStep);

  const steps = [
    {
      id: 1,
      tag: 'Introduction',
      title: 'Bienvenue dans OPAL OS',
      subtitle: "L'écosystème tout-en-un conçu pour les traders de Futures (NQ / ES)",
      icon: Sparkles,
      color: '#39FF14',
      description:
        "OPAL OS n'est pas un simple site, c'est votre terminal de trading complet. Il regroupe votre formation théorique, votre journalisation statistique en Multiple R, la protection de vos capitaux Prop Firm et votre suivi de discipline quotidien.",
      highlights: [
        'Architecture 100% pensée pour le trading CME Futures',
        'Calcul automatique des métriques professionnelles (R-Multiple, Win Rate)',
        'Aucun coût caché ni abonnement tiers requis pour les calculs',
      ],
      actionLabel: 'Démarrer la visite',
      actionRoute: null,
    },
    {
      id: 2,
      tag: 'Formation Institutionnelle',
      title: 'OPAL Academy',
      subtitle: 'Un cursus vidéo structuré pour maîtriser les marchés',
      icon: BookOpen,
      color: '#3B82F6',
      description:
        "Suivez l'intégralité du programme pédagogique vidéo. Validez chaque leçon au fur et à mesure pour débloquer les modules suivants et suivez votre progression en temps réel sur votre tableau de bord.",
      highlights: [
        'Vidéos HD avec chapitrage et suivi automatique de complétion',
        'Fiches de synthèse téléchargeables et ressources associées',
        'Validation méthodique des acquis étape par étape',
      ],
      actionLabel: "Explorer l'Academy",
      actionRoute: '/academy',
    },
    {
      id: 3,
      tag: 'Journal & Analyse',
      title: 'Trading Hub & Performance',
      subtitle: 'Enregistrez, importez et analysez chaque exécution en R',
      icon: TrendingUp,
      color: '#39FF14',
      description:
        'Le cœur opérationnel de votre quotidien. Journalisez vos trades manuellement ou importez vos CSV de brokers en 1 clic (NinjaTrader, Tradovate, TopstepX, Quantower). Suivez votre espérance mathématique en R et consultez le calendrier macro live.',
      highlights: [
        'Importateur universel CSV automatique avec détection de broker',
        'Calcul du R-Multiple, Risk/Reward et respect du plan de trading',
        'Calendrier macroéconomique US en direct (CPI, NFP, FOMC)',
      ],
      actionLabel: 'Ouvrir le Trading Hub',
      actionRoute: '/trading',
    },
    {
      id: 4,
      tag: 'Gestion du Risque',
      title: 'Prop Firm Guardian',
      subtitle: 'Ne cramez plus jamais un compte financé',
      icon: ShieldCheck,
      color: '#10B981',
      description:
        'Le Guardian calcule avec précision chirurgicale votre distance de sécurité par rapport au Trailing Drawdown. Il vous indique le nombre exact de Stop Loss tolérés et simule vos chances de survie en Mini vs Micro contrats.',
      highlights: [
        'Surveillance du seuil de perte max & buffer de sécurité',
        'Simulateur de survie aux séries de pertes (Monte Carlo simplifié)',
        'Calculateur de risque pour calibrer la taille exacte de vos positions',
      ],
      actionLabel: 'Voir le Guardian',
      actionRoute: '/trading/prop-firm-guardian',
    },
    {
      id: 5,
      tag: 'Discipline & Psychologie',
      title: 'Protocole Quotidien & Tilt Radar',
      subtitle: 'Forgez votre rigueur et protégez votre capital émotionnel',
      icon: Flame,
      color: '#F97316',
      description:
        'Le succès en trading repose sur la discipline. Remplissez chaque jour votre checklist de protocole en 4 phases (Pré-session, Session, Post-session, Clôture) et cumulez des jours de streak consécutifs. En cas de dérive, le Tilt Radar analyse vos biais.',
      highlights: [
        'Checklist quotidienne avec validation des journées sans trade (patience)',
        'Compteur de Flammes (Streaks) avec gel automatique le week-end',
        'Tilt Radar & Matrice des erreurs émotionnelles (FOMO, Revenge Trading)',
      ],
      actionLabel: 'Consulter mon Protocole',
      actionRoute: '/trading',
    },
    {
      id: 6,
      tag: 'Accompagnement & Direct',
      title: 'Live, Communauté & Intensive',
      subtitle: 'Tradez en direct et progressez avec la communauté',
      icon: Radio,
      color: '#A855F7',
      description:
        "Participez aux sessions de Live Trading, consultez les replays des meilleures séances et échangez dans les salons communautaires. Pour les membres du programme Intensive, accédez à vos coachings 1-on-1 et fiches d'objectifs personnalisées.",
      highlights: [
        'Diffusion de Live Trading en direct et replay archivé',
        'Salons de discussion thématiques entre traders sérieux',
        'Espace Intensive dédié pour le coaching personnalisé',
      ],
      actionLabel: 'Découvrir la Communauté',
      actionRoute: '/community',
    },
  ];

  const current = steps[currentStep - 1];
  const IconComponent = current.icon;
  const isLastStep = currentStep === steps.length;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleNavigate = (route: string | null) => {
    onClose();
    if (route) {
      router.push(route);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#101116] border border-white/10 text-white max-w-2xl p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl">
        <DialogTitle className="sr-only">Guide de la Plateforme OPAL OS</DialogTitle>

        {/* Top Gradient Header & Progress */}
        <div className="relative border-b border-white/10 bg-gradient-to-r from-black via-[#14161F] to-black p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Stepper Dots & Tag */}
          <div className="flex items-center justify-between mb-4 pr-8">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-neutral-300">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: current.color }}
              />
              <span>{current.tag}</span>
            </div>

            <span className="text-xs font-mono text-neutral-400">
              Étape {currentStep} / {steps.length}
            </span>
          </div>

          {/* Step Title & Icon */}
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg"
              style={{
                backgroundColor: `${current.color}15`,
                borderColor: `${current.color}40`,
                color: current.color,
                boxShadow: `0 0 20px ${current.color}20`,
              }}
            >
              <IconComponent className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {current.title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                {current.subtitle}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${(currentStep / steps.length) * 100}%`,
                backgroundColor: current.color,
                boxShadow: `0 0 10px ${current.color}`,
              }}
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-neutral-300 leading-relaxed">
            {current.description}
          </p>

          {/* Highlights Box */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2.5">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Ce que cet outil vous apporte :
            </h4>
            <div className="space-y-2">
              {current.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-2.5 text-xs text-neutral-300">
                  <CheckCircle2
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: current.color }}
                  />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Tryout Button (if has route) */}
          {current.actionRoute && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate(current.actionRoute)}
                className="border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs h-8"
              >
                <span>{current.actionLabel}</span>
                <ExternalLink className="w-3 h-3 ml-1.5 text-neutral-400" />
              </Button>
            </div>
          )}
        </div>

        {/* Modal Footer Navigation */}
        <div className="p-4 sm:p-6 bg-black/60 border-t border-white/10 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 text-xs h-9"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Précédent</span>
          </Button>

          {/* Step Indicator Bullets */}
          <div className="hidden sm:flex items-center gap-1.5">
            {steps.map((s) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`h-2 rounded-full transition-all ${
                  currentStep === s.id
                    ? 'w-6 bg-[#39FF14]'
                    : 'w-2 bg-white/15 hover:bg-white/30'
                }`}
                aria-label={`Aller à l'étape ${s.id}`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="bg-[#39FF14] text-black hover:bg-[#32e012] font-bold text-xs h-9 shadow-[0_0_15px_rgba(57,255,20,0.25)] px-4"
          >
            <span>{isLastStep ? "J'ai compris, c'est parti !" : 'Suivant'}</span>
            {!isLastStep && <ArrowRight className="w-4 h-4 ml-1.5" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
