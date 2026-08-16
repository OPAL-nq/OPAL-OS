'use client';

import React from 'react';
import { Video } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title?: string;
}

/**
 * Extracts YouTube Video ID from any standard or unlisted YouTube URL
 */
export function getYouTubeId(url: string): string | null {
  if (!url) return null;

  const cleanUrl = url.trim();

  // 1. Pure 11-character ID (e.g. "3bb4Jmiq3_U")
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  // 2. youtu.be/ID (e.g. "https://youtu.be/3bb4Jmiq3_U?si=...")
  const youtuBeMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/);
  if (youtuBeMatch && youtuBeMatch[1]) {
    return youtuBeMatch[1];
  }

  // 3. youtube.com/watch?v=ID
  const watchMatch = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }

  // 4. Generic fallback
  const genericMatch = cleanUrl.match(/\/([a-zA-Z0-9_-]{11})(?:[?&#]|$)/);
  if (genericMatch && genericMatch[1]) {
    return genericMatch[1];
  }

  return null;
}

export function VideoPlayer({ url, title = 'Vidéo OPAL' }: VideoPlayerProps) {
  const youtubeId = getYouTubeId(url);

  if (!url || !youtubeId) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-[#141414] border border-white/10 flex flex-col items-center justify-center text-neutral-400 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 mb-3">
          <Video className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-white">Vidéo non disponible</p>
        <p className="text-xs text-neutral-400 mt-1 max-w-xs">
          Veuillez renseigner une URL YouTube valide dans l'administration.
        </p>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${youtubeId}?rel=0&playsinline=1&modestbranding=1`;

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
      <iframe
        src={embedUrl}
        title={title}
        className="absolute inset-0 w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
