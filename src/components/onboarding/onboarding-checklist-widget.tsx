'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  Flame,
  Radio,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Compass,
  Trophy,
  X,
} from 'lucide-react';

interface OnboardingChecklistWidgetProps {
  hasCompletedAcademyLesson: boolean;
  hasConfiguredPropFirm: boolean;
  hasLoggedTrade: boolean;
  hasValidatedProtocol: boolean;
  onOpenTour: () => void;
}

export function OnboardingChecklistWidget({
  hasCompletedAcademyLesson,
  hasConfiguredPropFirm,
  hasLoggedTrade,
  hasValidatedProtocol,
  onOpenTour,
}: OnboardingChecklistWidgetProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const dismissed = localStorage.getItem('opal_onboarding_checklist_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const steps = [
    {
      id: 'academy',
      title: "Suivre votre première leçon à l'Academy",
      description: 'Découvrez la méthodologie institutionnelle et validez votre premier module.',
      completed: hasCompletedAcademyLesson,
      href: '/academy',
      icon: BookOpen,
      color: '#3B82F6',
    },
    {
      id: 'protocol',
      title: 'Valider votre protocole de trading du jour',
      description: 'Initiez votre flamme de streak quotidienne en complétant votre checklist pré-marché.',
      completed: hasValidatedProtocol,
      href: '/trading',
      icon: Flame,
      color: '#F97316',
    },
    {
      id: 'trade',
      title: 'Enregistrer ou importer votre premier trade',
      description: 'Testez le journal de performance CME ou importez vos données broker (CSV).',
      completed: hasLoggedTrade,
      href: '/trading/journal/new',
      icon: TrendingUp,
      color: '#39FF14',
    },
    {
      id: 'guardian',
      title: 'Configurer votre Prop Firm Guardian',
      description: 'Enregistrez votre compte (Topstep, Apex, MFF) pour surveiller votre Trailing Drawdown.',
      completed: hasConfiguredPropFirm,
      href: '/trading/prop-firm-guardian',
      icon: ShieldCheck,
      color: '#10B981',
    },
    {
      id: 'community',
      title: 'Participer au Live & à la Communauté',
      description: 'Rejoignez les salons thématiques et accédez aux replays des séances.',
      completed: false, // interactive step
      href: '/community',
      icon: Radio,
      color: '#A855F7',
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);
  const isAllCompleted = completedCount === steps.length;

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('opal_onboarding_checklist_dismissed', 'true');
  };

  const handleRestore = () => {
    setIsDismissed(false);
    localStorage.removeItem('opal_onboarding_checklist_dismissed');
  };

  if (!isMounted) return null;

  if (isDismissed) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
        <div className="flex items-center gap-2 text-neutral-400">
          <Compass className="w-4 h-4 text-[#39FF14]" />
          <span>Guide de démarrage OPAL OS ({completedCount}/{steps.length} étapes)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTour}
            className="text-xs text-[#39FF14] hover:underline font-semibold"
          >
            Visite guidée
          </button>
          <span className="text-neutral-600">•</span>
          <button
            onClick={handleRestore}
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Afficher la checklist
          </button>
        </div>
      </div>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-[#12131A] via-[#0F1017] to-[#12131A] border-white/10 p-5 sm:p-6 shadow-xl">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#39FF14]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] shrink-0 shadow-[0_0_15px_rgba(57,255,20,0.15)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Guide de Démarrage & Prise en Main
              </h2>
              {isAllCompleted && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#39FF14]/15 border border-[#39FF14]/30 text-[#39FF14] text-[10px] font-bold">
                  <Trophy className="w-3 h-3" />
                  Prêt au Trading
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Complétez ces 5 étapes pour exploiter 100% de la puissance de votre terminal.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenTour}
            className="border-[#39FF14]/30 bg-[#39FF14]/5 hover:bg-[#39FF14]/15 text-[#39FF14] hover:text-[#39FF14] font-bold text-xs h-8"
          >
            <Compass className="w-3.5 h-3.5 mr-1.5" />
            Visite Guidée 360°
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 text-neutral-400 hover:text-white"
            title={isCollapsed ? 'Déplier' : 'Replier'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8 text-neutral-400 hover:text-white"
            title="Masquer la checklist"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 pt-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400 font-medium">Progression globale</span>
          <span className="font-mono font-bold text-white">
            {completedCount} sur {steps.length} étapes ({progressPercent}%)
          </span>
        </div>
        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-[#39FF14]/70 to-[#39FF14] transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(57,255,20,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step List (collapsible) */}
      {!isCollapsed && (
        <div className="relative z-10 pt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <Link
                key={step.id}
                href={step.href}
                className={`group p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  step.completed
                    ? 'bg-black/30 border-white/5 opacity-80 hover:opacity-100 hover:border-white/10'
                    : 'bg-[#151620] border-white/10 hover:border-[#39FF14]/40 hover:bg-[#181a26] shadow-lg'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center border"
                      style={{
                        backgroundColor: `${step.color}15`,
                        borderColor: `${step.color}30`,
                        color: step.color,
                      }}
                    >
                      <StepIcon className="w-3.5 h-3.5" />
                    </div>

                    {step.completed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#39FF14]">
                        <CheckCircle2 className="w-4 h-4" />
                        Validé
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-neutral-500 group-hover:text-neutral-300 transition-colors">
                        Étape {index + 1}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4
                      className={`text-xs font-bold transition-colors ${
                        step.completed
                          ? 'text-neutral-300 line-through'
                          : 'text-white group-hover:text-[#39FF14]'
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end">
                  <span className="text-[11px] font-semibold text-neutral-400 group-hover:text-white flex items-center gap-1 transition-colors">
                    <span>{step.completed ? 'Revoir' : 'Démarrer'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
