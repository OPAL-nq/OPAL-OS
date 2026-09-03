'use client';

import React, { useState } from 'react';
import { DailyProtocol, UserStreak } from '@/types/protocol';
import { toggleProtocolStep, toggleNoTradeDay } from '@/app/actions/protocol';
import { StreakBadge } from './streak-badge';
import { DisciplineBadgesModal } from './discipline-badges-modal';
import {
  CheckCircle2,
  Circle,
  Flame,
  Sun,
  Zap,
  BookOpen,
  Moon,
  Shield,
  Sparkles,
  Trophy,
  Calendar,
} from 'lucide-react';

interface DailyProtocolWidgetProps {
  initialProtocol: DailyProtocol;
  initialStreak: UserStreak;
  recentDays?: DailyProtocol[];
  className?: string;
}

export function DailyProtocolWidget({
  initialProtocol,
  initialStreak,
  recentDays = [],
  className = '',
}: DailyProtocolWidgetProps) {
  const [protocol, setProtocol] = useState<DailyProtocol>(initialProtocol);
  const [streak, setStreak] = useState<UserStreak>(initialStreak);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const completedStepsCount = [
    protocol.pre_market_done,
    protocol.session_rules_done,
    protocol.journaling_done,
    protocol.mental_close_done,
  ].filter(Boolean).length;

  const progressPercent = protocol.no_trade_day
    ? 100
    : Math.round((completedStepsCount / 4) * 100);

  const isFullyCompleted = protocol.is_completed || progressPercent === 100;

  const handleToggleStep = async (
    stepKey: 'pre_market_done' | 'session_rules_done' | 'journaling_done' | 'mental_close_done'
  ) => {
    const previousProtocol = protocol;
    const previousStreak = streak;
    const nextVal = !protocol[stepKey];

    // Haptic feedback on mobile if supported
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.([15]);
    }

    // Compute optimistic state in 0 ms
    const updated = { ...protocol, [stepKey]: nextVal };
    const allDone = Boolean(
      updated.pre_market_done &&
      updated.session_rules_done &&
      updated.journaling_done &&
      updated.mental_close_done
    );

    setProtocol((prev) => ({
      ...prev,
      [stepKey]: nextVal,
      is_completed: allDone,
    }));

    // Optimistically update streak counter if day becomes fully completed
    if (allDone && !protocol.is_completed) {
      setStreak((prev) => ({
        ...prev,
        current_streak: (prev.current_streak || 0) + 1,
      }));
    } else if (!allDone && protocol.is_completed) {
      setStreak((prev) => ({
        ...prev,
        current_streak: Math.max(0, (prev.current_streak || 0) - 1),
      }));
    }

    // Asynchronous background persistence (non-blocking for UI)
    toggleProtocolStep(stepKey, nextVal)
      .then((res) => {
        if (res.success) {
          setProtocol(res.protocol);
          setStreak(res.streak);
        }
      })
      .catch((err) => {
        console.error('Erreur toggle étape:', err);
        // Rollback gracefully on error
        setProtocol(previousProtocol);
        setStreak(previousStreak);
      });
  };

  const handleToggleNoTrade = async () => {
    const previousProtocol = protocol;
    const previousStreak = streak;
    const nextVal = !protocol.no_trade_day;

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.([15]);
    }

    // 0ms Optimistic update
    setProtocol((prev) => ({
      ...prev,
      no_trade_day: nextVal,
      is_completed: nextVal,
    }));

    if (nextVal && !protocol.is_completed) {
      setStreak((prev) => ({
        ...prev,
        current_streak: (prev.current_streak || 0) + 1,
      }));
    } else if (!nextVal && protocol.is_completed) {
      setStreak((prev) => ({
        ...prev,
        current_streak: Math.max(0, (prev.current_streak || 0) - 1),
      }));
    }

    toggleNoTradeDay(nextVal)
      .then((res) => {
        if (res.success) {
          setProtocol(res.protocol);
          setStreak(res.streak);
        }
      })
      .catch((err) => {
        console.error('Erreur toggle no trade:', err);
        setProtocol(previousProtocol);
        setStreak(previousStreak);
      });
  };

  const todayFormatted = mounted
    ? new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : '';

  const steps = [
    {
      id: 'pre_market_done' as const,
      num: 1,
      title: 'Routine Pré-Marché',
      time: 'Avant 15h30',
      desc: 'Calendrier éco vérifié, Niveaux NQ/ES tracés, Max Loss fixée.',
      icon: Sun,
      color: 'text-amber-400',
      done: protocol.pre_market_done,
    },
    {
      id: 'session_rules_done' as const,
      num: 2,
      title: 'Session de Trading',
      time: '15h30 - 17h30',
      desc: 'Max 2 trades respecté, Zéro revenge trading, Stops stricts.',
      icon: Zap,
      color: 'text-[#39FF14]',
      done: protocol.session_rules_done,
    },
    {
      id: 'journaling_done' as const,
      num: 3,
      title: 'Debrief & Journalisation',
      time: 'Après 17h30',
      desc: 'Positions saisies dans OPAL OS, Tags de psychologie renseignés.',
      icon: BookOpen,
      color: 'text-cyan-400',
      done: protocol.journaling_done,
    },
    {
      id: 'mental_close_done' as const,
      num: 4,
      title: 'Clôture Mentale',
      time: 'Fin de journée',
      desc: 'Écrans coupés, acceptation des résultats et déconnexion.',
      icon: Moon,
      color: 'text-purple-400',
      done: protocol.mental_close_done,
    },
  ];

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-b from-[#14161F] via-[#10121A] to-[#0D0E14] p-5 sm:p-6 shadow-xl transition-all duration-300 ${
        isFullyCompleted
          ? 'border-[#39FF14]/40 shadow-[0_0_30px_rgba(57,255,20,0.1)]'
          : 'border-white/10'
      } ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Protocole Quotidien</span>
            </span>
            <span className="text-xs text-neutral-400 capitalize font-medium">
              {todayFormatted}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Discipline & Routine de Session</span>
          </h2>
        </div>

        {/* Streak & Badges trigger */}
        <div className="flex items-center gap-2">
          <StreakBadge streak={streak} onClick={() => setIsBadgesModalOpen(true)} />
          <button
            type="button"
            onClick={() => setIsBadgesModalOpen(true)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-amber-400 transition-colors"
            title="Voir mes badges et trophées"
          >
            <Trophy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar & Status */}
      <div className="py-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400 font-medium flex items-center gap-1.5">
            {isFullyCompleted ? (
              <span className="text-[#39FF14] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {protocol.no_trade_day ? 'Journée Patience Validée 🔥' : 'Protocole 100% Validé 🔥'}
              </span>
            ) : (
              <span>Progression du jour : <strong className="text-white">{completedStepsCount} sur 4 étapes</strong></span>
            )}
          </span>
          <span className="font-mono font-bold text-[#39FF14]">
            {progressPercent}%
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isFullyCompleted
                ? 'bg-[#39FF14] shadow-[0_0_12px_#39FF14]'
                : 'bg-gradient-to-r from-amber-400 to-[#39FF14]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 4 Steps Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {steps.map((step) => {
          const StepIcon = step.icon;
          const isDone = step.done;

          return (
            <div
              key={step.id}
              onClick={() => !protocol.no_trade_day && handleToggleStep(step.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none group ${
                protocol.no_trade_day
                  ? 'opacity-40 cursor-not-allowed border-white/5 bg-black/20'
                  : isDone
                  ? 'bg-[#39FF14]/10 border-[#39FF14]/40 shadow-[0_0_15px_rgba(57,255,20,0.08)]'
                  : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-black/60'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Step Checkbox */}
                <div className="mt-0.5">
                  {isDone ? (
                    <div className="w-5 h-5 rounded-lg bg-[#39FF14] text-black flex items-center justify-center shadow-[0_0_8px_#39FF14]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-lg border border-white/20 group-hover:border-[#39FF14] flex items-center justify-center transition-colors">
                      <span className="text-[10px] font-mono text-neutral-500 group-hover:text-white">
                        {step.num}
                      </span>
                    </div>
                  )}
                </div>

                {/* Step Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <StepIcon className={`w-3.5 h-3.5 ${step.color}`} />
                      <h4
                        className={`text-xs font-bold transition-colors ${
                          isDone ? 'text-white line-through opacity-90' : 'text-neutral-200 group-hover:text-white'
                        }`}
                      >
                        {step.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">
                      {step.time}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed mt-1">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alternative: Perfect Patience Day (No Trade) */}
      <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleToggleNoTrade}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
            protocol.no_trade_day
              ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
              : 'bg-white/5 border-white/10 hover:border-purple-400/40 text-neutral-300 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span>
            {protocol.no_trade_day
              ? '🛡️ Journée de Patience Validée (0 Trade)'
              : 'Aucun setup valide aujourd’hui (Valider la Patience)'}
          </span>
        </button>

        {/* 7-Day Mini Heatmap */}
        {recentDays.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
            <span className="hidden sm:inline">Régularité :</span>
            <div className="flex items-center gap-1">
              {recentDays.slice(0, 7).reverse().map((d, i) => (
                <div
                  key={d.id || i}
                  className={`w-2.5 h-2.5 rounded-sm transition-all ${
                    d.is_completed
                      ? 'bg-[#39FF14] shadow-[0_0_6px_#39FF14]'
                      : 'bg-white/10'
                  }`}
                  title={`${d.protocol_date} : ${d.is_completed ? 'Validé' : 'Incomplet'}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Badges Modal */}
      <DisciplineBadgesModal
        streak={streak}
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
      />
    </div>
  );
}
