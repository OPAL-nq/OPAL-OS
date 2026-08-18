import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { LiveSession, LiveReplay } from '@/types/live';
import { LiveCard, formatLiveDate, getLiveTypeLabel } from '@/components/live/live-card';
import { LiveCountdown } from '@/components/live/live-countdown';
import { LiveStatusBadge } from '@/components/live/live-status-badge';
import { ReplayCard } from '@/components/live/replay-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Radio,
  Calendar,
  Clock,
  ArrowRight,
  Video,
  PlaySquare,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const DEFAULT_DISCORD_LIVE_URL = 'https://discord.gg/T2qKhSgQS';

export default async function LiveHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .single();

  const isAdmin = profile?.role === 'admin';

  // Query upcoming lives
  let query = supabase
    .from('lives')
    .select('*')
    .order('scheduled_at', { ascending: true });

  if (!isAdmin) {
    query = query.eq('published', true);
  }

  const { data: livesData } = await query;
  const allLives = (livesData || []) as LiveSession[];

  // Find next active live (live in progress or nearest upcoming scheduled)
  const activeLive = allLives.find((l) => l.status === 'live');
  const upcomingLives = allLives.filter((l) => l.status === 'scheduled');
  const nextLive = activeLive || upcomingLives[0] || null;

  // Other upcoming lives excluding the next one
  const remainingUpcoming = allLives.filter(
    (l) => l.id !== nextLive?.id && l.status !== 'ended' && l.status !== 'cancelled'
  );

  // Query recent replays
  let replaysQuery = supabase
    .from('live_replays')
    .select('*, live:live_id(*)')
    .order('created_at', { ascending: false })
    .limit(3);

  if (!isAdmin) {
    replaysQuery = replaysQuery.eq('published', true);
  }

  const { data: replaysData } = await replaysQuery;
  const recentReplays = (replaysData || []) as LiveReplay[];

  const liveDiscordUrl = nextLive?.stream_url || DEFAULT_DISCORD_LIVE_URL;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>OPAL Live Hub • Discord</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sessions en Direct & Masterclasses
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Rejoignez les sessions de live trading sur le salon conférence Discord et retrouvez les replays archivés.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/live/replays">
            <Button
              variant="outline"
              className="border-white/10 text-xs font-bold text-neutral-300 hover:text-white hover:bg-white/5"
            >
              <PlaySquare className="w-4 h-4 mr-1.5 text-purple-400" />
              Replays Archivés
            </Button>
          </Link>
          {isAdmin && (
            <Link href="/admin/live">
              <Button className="bg-[#39FF14] text-black hover:bg-[#32e012] text-xs font-bold shadow-[0_0_15px_rgba(57,255,20,0.25)]">
                Gérer les Lives
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* HERO SECTION : PROCHAIN LIVE / LIVE EN COURS */}
      {nextLive ? (
        <Card
          className={`relative overflow-hidden border ${
            nextLive.status === 'live'
              ? 'bg-gradient-to-br from-red-950/40 via-[#141414] to-black border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)]'
              : 'bg-gradient-to-br from-[#5865F2]/10 via-[#141414] to-black border-[#5865F2]/30 shadow-[0_0_30px_rgba(88,101,242,0.15)]'
          }`}
        >
          <div className="p-6 sm:p-8 lg:p-10 space-y-6">
            {/* Top Bar with Type and Status */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                    getLiveTypeLabel(nextLive.type).color
                  }`}
                >
                  {getLiveTypeLabel(nextLive.type).label}
                </span>
                <LiveStatusBadge status={nextLive.status} />
              </div>

              {/* Date & Hour Tag */}
              <div className="flex items-center gap-2 text-xs text-neutral-300 bg-black/60 border border-white/10 px-3 py-1.5 rounded-xl font-mono">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>{formatLiveDate(nextLive.scheduled_at).date}</span>
                <span className="text-[#39FF14] font-bold">
                  {formatLiveDate(nextLive.scheduled_at).time}
                </span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-3 max-w-3xl">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                {nextLive.title}
              </h2>
              {nextLive.description && (
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {nextLive.description}
                </p>
              )}
            </div>

            {/* Dynamic Countdown & Action Button Banner */}
            <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                  {nextLive.status === 'live' ? 'Statut du direct' : 'Début de la session dans'}
                </span>
                <LiveCountdown
                  scheduledAt={nextLive.scheduled_at}
                  isLive={nextLive.status === 'live'}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={liveDiscordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className={`font-black text-sm px-6 h-12 rounded-xl shadow-2xl transition-all ${
                      nextLive.status === 'live'
                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_25px_rgba(239,68,68,0.4)] animate-pulse'
                        : 'bg-[#5865F2] hover:bg-[#4752c4] text-white shadow-[0_0_20px_rgba(88,101,242,0.3)]'
                    }`}
                  >
                    <Radio className="w-4 h-4 mr-2" />
                    <span>Rejoindre sur Discord</span>
                    <ExternalLink className="w-4 h-4 ml-2 opacity-80" />
                  </Button>
                </a>

                <Link href={`/live/${nextLive.id}`}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/15 hover:bg-white/5 text-neutral-200 text-xs font-bold h-12 px-5 rounded-xl"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Détails de la session
                    <ArrowRight className="w-3.5 h-3.5 ml-2 text-neutral-400" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="bg-[#141414] border-white/10 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-white/5 mx-auto flex items-center justify-center text-neutral-400">
            <Calendar className="w-7 h-7 text-[#39FF14]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Aucun Live programmé pour le moment</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Maxym publiera prochainement les dates des prochaines sessions de live trading et masterclasses sur Discord.
            </p>
          </div>
        </Card>
      )}

      {/* AUTRES PROCHAINS LIVES */}
      {remainingUpcoming.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Prochaines Sessions Planifiées</h2>
            <span className="text-xs text-neutral-400">{remainingUpcoming.length} session(s)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {remainingUpcoming.map((session) => (
              <LiveCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* DERNIERS REPLAYS */}
      {recentReplays.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Derniers Replays Disponibles</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Rattrapez les analyses et les sessions enregistrées à votre rythme.
              </p>
            </div>
            <Link href="/live/replays">
              <Button variant="ghost" size="sm" className="text-xs text-[#39FF14] hover:text-[#32e012]">
                <span>Voir tous les replays</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentReplays.map((replay) => (
              <ReplayCard key={replay.id} replay={replay} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
