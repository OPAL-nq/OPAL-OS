import React from 'react';
import Link from 'next/link';
import { LiveReplay } from '@/types/live';
import { extractYouTubeId } from './live-player';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Calendar, Clock, ArrowRight, Video } from 'lucide-react';
import { formatLiveDate, getLiveTypeLabel } from './live-card';

interface ReplayCardProps {
  replay: LiveReplay;
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) {
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  }
  return `${m} min`;
}

export function ReplayCard({ replay }: ReplayCardProps) {
  const { date } = formatLiveDate(replay.created_at);
  const durationText = formatDuration(replay.duration_seconds);

  // Derive thumbnail from YouTube video ID if not explicitly provided
  const videoId = extractYouTubeId(replay.video_url);
  const thumbnail =
    replay.thumbnail_url ||
    (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);

  const typeInfo = replay.live ? getLiveTypeLabel(replay.live.type) : null;

  return (
    <Card className="bg-[#141414] border-white/10 hover:border-white/20 transition-all flex flex-col justify-between overflow-hidden group shadow-lg">
      <div>
        {/* Thumbnail preview */}
        <div className="relative w-full aspect-video bg-black/60 overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={replay.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5 text-neutral-600">
              <Video className="w-10 h-10" />
            </div>
          )}

          {/* Dark Overlay with Play Icon */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-[#39FF14] shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>

          {/* Duration Badge */}
          {durationText && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-white border border-white/10">
              {durationText}
            </div>
          )}

          {/* Type Badge */}
          {typeInfo && (
            <div className="absolute top-2 left-2">
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border bg-black/80 ${typeInfo.color}`}
              >
                {typeInfo.label}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4 space-y-2">
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#39FF14] transition-colors line-clamp-2">
            {replay.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <span>{date}</span>
          </div>
        </CardContent>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-black/40 border-t border-white/5">
        <Link href={replay.video_url} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs font-bold border-white/10 hover:bg-[#39FF14] hover:text-black hover:border-transparent transition-all"
          >
            <span>Regarder le Replay</span>
            <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
