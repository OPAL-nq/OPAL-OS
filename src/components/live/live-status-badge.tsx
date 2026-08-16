import React from 'react';
import { LiveStatus } from '@/types/live';
import { Radio, Calendar, CheckCircle2, XCircle } from 'lucide-react';

interface LiveStatusBadgeProps {
  status: LiveStatus;
  className?: string;
}

export function LiveStatusBadge({ status, className = '' }: LiveStatusBadgeProps) {
  switch (status) {
    case 'live':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.35)] animate-pulse ${className}`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>EN DIRECT</span>
        </span>
      );

    case 'scheduled':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 ${className}`}
        >
          <Calendar className="w-3 h-3 text-[#39FF14]" />
          <span>Programmé</span>
        </span>
      );

    case 'ended':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider bg-white/5 text-neutral-400 border border-white/10 ${className}`}
        >
          <CheckCircle2 className="w-3 h-3 text-neutral-500" />
          <span>Terminé</span>
        </span>
      );

    case 'cancelled':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider bg-neutral-800 text-neutral-500 border border-white/5 ${className}`}
        >
          <XCircle className="w-3 h-3 text-neutral-600" />
          <span>Annulé</span>
        </span>
      );

    default:
      return null;
  }
}
