'use client';

import React from 'react';
import { Flame, Trophy, Shield } from 'lucide-react';
import { UserStreak } from '@/types/protocol';

interface StreakBadgeProps {
  streak: UserStreak;
  className?: string;
  onClick?: () => void;
}

export function StreakBadge({ streak, className = '', onClick }: StreakBadgeProps) {
  const count = streak.current_streak || 0;
  const isHot = count >= 3;
  const isSuperHot = count >= 7;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-200 group ${
        isSuperHot
          ? 'bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-red-500/20 border-orange-500/40 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.25)] hover:border-orange-500/60'
          : isHot
          ? 'bg-gradient-to-r from-[#39FF14]/15 to-amber-500/15 border-[#39FF14]/30 text-[#39FF14] shadow-[0_0_12px_rgba(57,255,20,0.15)] hover:border-[#39FF14]/50'
          : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
      } ${className}`}
      title={`Série de discipline : ${count} jour(s) consécutifs. Record : ${streak.longest_streak || count}j`}
    >
      <div className="relative">
        <Flame
          className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
            isSuperHot
              ? 'text-orange-400 fill-orange-400 animate-pulse'
              : isHot
              ? 'text-[#39FF14] fill-[#39FF14]/60 animate-pulse'
              : 'text-neutral-400'
          }`}
        />
        {isSuperHot && (
          <span className="absolute -top-1 -right-1 flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
          </span>
        )}
      </div>

      <span className="text-xs font-black font-mono tracking-tight">
        {count} {count > 1 ? 'Jours' : 'Jour'}
      </span>

      <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline group-hover:text-neutral-300">
        • Max {streak.longest_streak || count}j
      </span>
    </button>
  );
}
