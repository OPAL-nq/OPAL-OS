import React from 'react';
import Link from 'next/link';
import { LiveSession, LiveType } from '@/types/live';
import { LiveStatusBadge } from './live-status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight, Video, Sparkles, Radio } from 'lucide-react';

interface LiveCardProps {
  session: LiveSession;
  isFeatured?: boolean;
}

export function getLiveTypeLabel(type: LiveType): { label: string; color: string } {
  switch (type) {
    case 'live_trading':
      return { label: 'Live Trading', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    case 'masterclass':
      return { label: 'Masterclass', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
    case 'collective':
      return { label: 'Session Collective', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    default:
      return { label: 'Live', color: 'bg-white/5 text-neutral-300 border-white/10' };
  }
}

export function formatLiveDate(dateString: string): { date: string; time: string } {
  try {
    const d = new Date(dateString);
    const date = d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const time = d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return {
      date: date.charAt(0).toUpperCase() + date.slice(1),
      time: `${time} CET`,
    };
  } catch {
    return { date: dateString, time: '' };
  }
}

export function LiveCard({ session, isFeatured = false }: LiveCardProps) {
  const { date, time } = formatLiveDate(session.scheduled_at);
  const typeInfo = getLiveTypeLabel(session.type);
  const isLive = session.status === 'live';

  return (
    <Card
      className={`bg-[#141414] border transition-all flex flex-col justify-between overflow-hidden group ${
        isLive
          ? 'border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.15)] bg-gradient-to-b from-red-500/5 to-transparent'
          : isFeatured
          ? 'border-[#39FF14]/40 shadow-[0_0_20px_rgba(57,255,20,0.1)]'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${typeInfo.color}`}
          >
            {typeInfo.label}
          </span>
          <LiveStatusBadge status={session.status} />
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#39FF14] transition-colors line-clamp-2">
            {session.title}
          </h3>
          {session.description && (
            <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
              {session.description}
            </p>
          )}
        </div>

        {/* Date & Time info */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-2 border-t border-white/5 text-xs text-neutral-300">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[#39FF14]">
            <Clock className="w-3.5 h-3.5" />
            <span>{time}</span>
          </div>
        </div>
      </CardContent>

      {/* Action Footer */}
      <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
        <Link href={`/live/${session.id}`} className="w-full">
          <Button
            className={`w-full text-xs font-bold h-9 transition-all ${
              isLive
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse'
                : 'bg-white/10 text-white hover:bg-[#39FF14] hover:text-black'
            }`}
          >
            {isLive ? (
              <>
                <Radio className="w-3.5 h-3.5 mr-2 animate-ping" />
                Rejoindre le Live en cours
              </>
            ) : (
              <>
                <Video className="w-3.5 h-3.5 mr-2" />
                Accéder à la session
              </>
            )}
            <ArrowRight className="w-3.5 h-3.5 ml-auto" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
