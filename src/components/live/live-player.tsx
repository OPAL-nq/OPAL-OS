'use client';

import React from 'react';
import { Radio, VideoOff, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const videoId = extractYouTubeId(streamUrl);

  if (!streamUrl) {
    return (
      <div className="relative w-full aspect-video bg-[#141414] rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center p-8 overflow-hidden shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 mb-4">
          <VideoOff className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Flux vidéo non configuré</h3>
        <p className="text-xs text-neutral-400 max-w-md">
          Le lien de diffusion pour cette session sera ajouté sous peu par l'équipe OPAL.
        </p>
      </div>
    );
  }

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

  // If external stream link (Zoom, Meet, Discord, etc.)
  return (
    <div className="relative w-full aspect-video bg-[#141414] rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center p-8 overflow-hidden shadow-2xl">
      <div className="w-16 h-16 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] mb-4">
        <Radio className="w-8 h-8 animate-pulse" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-neutral-400 max-w-md mb-6">
        Cette session est diffusée via une plateforme externe. Cliquez sur le bouton ci-dessous pour rejoindre le direct.
      </p>
      <a href={streamUrl} target="_blank" rel="noopener noreferrer">
        <Button className="bg-[#39FF14] text-black hover:bg-[#32e012] font-black text-xs px-6 h-11 shadow-[0_0_20px_rgba(57,255,20,0.3)]">
          <ExternalLink className="w-4 h-4 mr-2" />
          Rejoindre le Live externe
        </Button>
      </a>
    </div>
  );
}
