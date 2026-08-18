'use client';

import React from 'react';
import { Trophy, Shield, CheckCircle2, Lock, X, Flame, Sparkles } from 'lucide-react';
import { UserStreak, ALL_DISCIPLINE_BADGES } from '@/types/protocol';

interface DisciplineBadgesModalProps {
  streak: UserStreak;
  isOpen: boolean;
  onClose: () => void;
}

export function DisciplineBadgesModal({ streak, isOpen, onClose }: DisciplineBadgesModalProps) {
  if (!isOpen) return null;

  const currentCount = streak.current_streak || 0;
  const userBadges = Array.isArray(streak.badges) ? streak.badges : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#0E1015] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#12141C]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Badges & Trophées de Rigueur
              </h2>
              <p className="text-xs text-neutral-400">
                La discipline est récompensée jour après jour.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Stats Hero */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-black/50 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
                <Flame className="w-5 h-5 fill-[#39FF14]/40" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-neutral-400 block">Série Actuelle</span>
                <span className="text-lg font-black font-mono text-white">{currentCount} Jours</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-neutral-400 block">Record Historique</span>
                <span className="text-lg font-black font-mono text-white">{streak.longest_streak || currentCount} Jours</span>
              </div>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
              <span>Niveaux de Maîtrise & Trophées</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_DISCIPLINE_BADGES.map((badge) => {
                const isUnlocked = userBadges.includes(badge.id) || currentCount >= badge.requiredStreak;
                const progressPct = Math.min(100, Math.round((currentCount / badge.requiredStreak) * 100));

                return (
                  <div
                    key={badge.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-neutral-900 to-[#14181F] border-[#39FF14]/40 shadow-[0_0_15px_rgba(57,255,20,0.08)]'
                        : 'bg-black/30 border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{badge.icon}</span>
                        <div>
                          <h4 className="text-xs font-bold text-white">{badge.name}</h4>
                          <span className="text-[10px] font-mono text-[#39FF14]">
                            {badge.requiredStreak} Jours requis
                          </span>
                        </div>
                      </div>

                      {isUnlocked ? (
                        <div className="w-5 h-5 rounded-full bg-[#39FF14]/20 text-[#39FF14] flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-white/5 text-neutral-500 flex items-center justify-center shrink-0">
                          <Lock className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-relaxed mb-2.5">
                      {badge.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500">
                        <span>{isUnlocked ? 'Débloqué !' : 'Progression'}</span>
                        <span>{currentCount} / {badge.requiredStreak}j</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isUnlocked ? 'bg-[#39FF14]' : 'bg-neutral-600'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#12141C] flex items-center justify-between text-xs text-neutral-400">
          <span>Week-end Freeze activé (les samedis et dimanches ne brisent pas la série).</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
