import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { LiveSession } from '@/types/live';
import { LivePlayer } from '@/components/live/live-player';
import { LiveStatusBadge } from '@/components/live/live-status-badge';
import { formatLiveDate, getLiveTypeLabel } from '@/components/live/live-card';
import { LiveCountdown } from '@/components/live/live-countdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, Radio, Edit, PlaySquare } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface LiveRoomPageProps {
  params: Promise<{
    liveId: string;
  }>;
}

export default async function LiveRoomPage({ params }: LiveRoomPageProps) {
  const { liveId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .single();

  const isAdmin = profile?.role === 'admin';

  let query = supabase.from('lives').select('*').eq('id', liveId).single();

  const { data: liveData, error } = await query;

  if (error || !liveData) {
    notFound();
  }

  const live = liveData as LiveSession;

  // Non-admins cannot see unpublished lives
  if (!live.published && !isAdmin) {
    notFound();
  }

  const { date, time } = formatLiveDate(live.scheduled_at);
  const typeInfo = getLiveTypeLabel(live.type);
  const isLive = live.status === 'live';

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/live"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au Live Hub</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/live/replays">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-white/10 text-neutral-300 hover:text-white"
            >
              <PlaySquare className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
              Replays
            </Button>
          </Link>
          {isAdmin && (
            <Link href={`/admin/live/${live.id}`}>
              <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold">
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                Modifier ce Live
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* VIDEO PLAYER SECTION */}
      <div className="space-y-4">
        <LivePlayer
          streamUrl={live.stream_url}
          title={live.title}
          isLive={isLive}
        />

        {/* Dynamic Countdown if scheduled and not yet live */}
        {live.status === 'scheduled' && (
          <Card className="bg-[#141414] border-[#39FF14]/20 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                  La session commence bientôt
                </span>
                <p className="text-xs text-neutral-300">
                  Préparez votre espace de trading. Le flux vidéo se lancera dès que le direct débutera.
                </p>
              </div>
              <LiveCountdown scheduledAt={live.scheduled_at} />
            </div>
          </Card>
        )}
      </div>

      {/* SESSION METADATA CARD */}
      <Card className="bg-[#141414] border-white/10">
        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Tags & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${typeInfo.color}`}
              >
                {typeInfo.label}
              </span>
              <LiveStatusBadge status={live.status} />
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-300 font-mono">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#39FF14] font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{time}</span>
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              {live.title}
            </h1>
            {live.description ? (
              <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line bg-black/40 p-4 rounded-xl border border-white/5">
                {live.description}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 italic">Aucune description détaillée fournie.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
