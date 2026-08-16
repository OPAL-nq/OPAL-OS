'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Radio } from 'lucide-react';

interface LiveCountdownProps {
  scheduledAt: string;
  isLive?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export function LiveCountdown({ scheduledAt, isLive }: LiveCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    function calculateTimeLeft(): TimeLeft {
      const targetDate = new Date(scheduledAt).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, isPast: false };
    }

    // Set initial
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [scheduledAt]);

  if (!mounted) {
    return (
      <div className="h-16 flex items-center justify-center text-xs text-neutral-500 font-mono">
        Calcul du compte à rebours...
      </div>
    );
  }

  if (isLive) {
    return (
      <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
        <Radio className="w-5 h-5 text-red-500 animate-pulse" />
        <span className="text-sm font-black uppercase text-red-400 tracking-wider">
          La session est en cours de diffusion
        </span>
      </div>
    );
  }

  if (timeLeft.isPast) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-400 font-medium">
        <Clock className="w-4 h-4 text-neutral-500" />
        <span>Session imminente ou terminée</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Days */}
      {timeLeft.days > 0 && (
        <>
          <div className="flex flex-col items-center justify-center w-14 sm:w-16 h-16 rounded-xl bg-black/60 border border-white/10 shadow-lg">
            <span className="text-xl sm:text-2xl font-black font-mono text-[#39FF14]">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">
              Jours
            </span>
          </div>
          <span className="text-xl font-bold text-neutral-600">:</span>
        </>
      )}

      {/* Hours */}
      <div className="flex flex-col items-center justify-center w-14 sm:w-16 h-16 rounded-xl bg-black/60 border border-white/10 shadow-lg">
        <span className="text-xl sm:text-2xl font-black font-mono text-white">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">
          Heures
        </span>
      </div>
      <span className="text-xl font-bold text-neutral-600">:</span>

      {/* Minutes */}
      <div className="flex flex-col items-center justify-center w-14 sm:w-16 h-16 rounded-xl bg-black/60 border border-white/10 shadow-lg">
        <span className="text-xl sm:text-2xl font-black font-mono text-white">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">
          Min
        </span>
      </div>
      <span className="text-xl font-bold text-neutral-600">:</span>

      {/* Seconds */}
      <div className="flex flex-col items-center justify-center w-14 sm:w-16 h-16 rounded-xl bg-black/60 border border-[#39FF14]/30 shadow-[0_0_15px_rgba(57,255,20,0.15)]">
        <span className="text-xl sm:text-2xl font-black font-mono text-[#39FF14]">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">
          Sec
        </span>
      </div>
    </div>
  );
}
