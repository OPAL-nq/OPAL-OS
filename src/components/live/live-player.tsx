'use client';

import React from 'react';
import { Radio, VideoOff, ExternalLink, Sparkles, Volume2, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEFAULT_DISCORD_LIVE_URL = 'https://discord.gg/T2qKhSgQS';

interface LivePlayerProps {
  streamUrl: string | null;
  title: string;
  isLive?: boolean;
}

/**
 * Helper to extract YouTube Video ID from various YouTube URL formats
 */
export function extractYouTubeId(url: string | null): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /^[a-zA-Z0-9_-]{11}$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
    if (match && match[0] && pattern === patterns[1]) {
      return match[0];
    }
  }

  return null;
}

export function LivePlayer({ streamUrl, title, isLive }: LivePlayerProps) {
  const finalUrl = streamUrl || DEFAULT_DISCORD_LIVE_URL;
  const isDiscord = finalUrl.includes('discord.gg') || finalUrl.includes('discord.com');
  const videoId = extractYouTubeId(streamUrl);

  // If valid YouTube Video ID found, render 16:9 iframe
  if (videoId) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    );
  }

  // If Discord Live Stage (Default & Primary)
  if (isDiscord) {
    return (
      <div className="relative w-full aspect-video bg-gradient-to-b from-[#141414] via-[#0d0d0d] to-black rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center p-6 sm:p-12 overflow-hidden shadow-2xl">
        {/* Glow ambient */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#5865F2]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-60 h-60 bg-[#39FF14]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-6 max-w-xl">
          {/* Discord Live Stage Icon */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#5865F2] to-[#39FF14] rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-500" />
            <div className="relative w-20 h-20 rounded-2xl bg-[#141414] border border-white/15 flex items-center justify-center shadow-2xl p-4">
              <svg
                viewBox="0 0 127.14 96.36"
                className="w-12 h-12 fill-[#5865F2]"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
            </div>
          </div>

          {/* Status Badge */}
          {isLive ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              <span>Direct en cours sur Discord</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#8ea1e1] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
              Salon Conférence & Live Trading Discord
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
              La session de trading et le partage d'écran ont lieu en direct sur le salon conférence Discord OPAL.
            </p>
          </div>

          {/* Main Join Discord Live CTA */}
          <a
            href={finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto pt-1"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs sm:text-sm px-8 py-6 rounded-2xl shadow-[0_0_30px_rgba(88,101,242,0.4)] transition-all hover:scale-105"
            >
              <Radio className="w-4 h-4 mr-2 text-[#39FF14] animate-pulse" />
              <span>Rejoindre le Live sur Discord</span>
              <ExternalLink className="w-4 h-4 ml-2 opacity-80" />
            </Button>
          </a>

          {/* Info Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-neutral-400 pt-2 border-t border-white/5">
            <span className="flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-[#39FF14]" />
              Audio HD Maxym
            </span>
            <span className="flex items-center gap-1">
              <Monitor className="w-3.5 h-3.5 text-blue-400" />
              Partage d'écran CME Futures
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Chat interactif
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for generic external stream
  return (
    <div className="relative w-full aspect-video bg-[#141414] rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center p-8 overflow-hidden shadow-2xl">
      <div className="w-16 h-16 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] mb-4">
        <Radio className="w-8 h-8 animate-pulse" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-neutral-400 max-w-md mb-6">
        Cette session est diffusée via une plateforme externe. Cliquez sur le bouton ci-dessous pour rejoindre le direct.
      </p>
      <a href={finalUrl} target="_blank" rel="noopener noreferrer">
        <Button className="bg-[#39FF14] text-black hover:bg-[#32e012] font-black text-xs px-6 h-11 shadow-[0_0_20px_rgba(57,255,20,0.3)]">
          <ExternalLink className="w-4 h-4 mr-2" />
          Rejoindre le Live
        </Button>
      </a>
    </div>
  );
}
