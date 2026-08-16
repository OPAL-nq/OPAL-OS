'use client';

import React from 'react';
import { CommunityChannel } from '@/types/community';
import { Hash, Lock, ShieldAlert, Sparkles, MessageSquare, Info } from 'lucide-react';

interface ChannelHeaderProps {
  channel: CommunityChannel;
  allChannels?: CommunityChannel[];
}

export function ChannelHeader({ channel }: ChannelHeaderProps) {
  const isLocked = channel.slug === 'annonces';
  const isPrivateSupport = channel.slug === 'support';

  return (
    <div className="h-14 border-b border-white/5 bg-[#0C0C0C] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 select-none">
      {/* Left: Channel Title & Topic */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          {isLocked || isPrivateSupport ? (
            <Lock className="w-4 h-4 text-[#39FF14]" />
          ) : (
            <Hash className="w-4 h-4 text-neutral-400" />
          )}
          <span className="text-sm font-bold text-white tracking-wide">
            {channel.name}
          </span>
        </div>

        {channel.description && (
          <>
            <span className="hidden md:inline-block text-neutral-700 font-light">|</span>
            <p className="hidden md:inline-block text-xs text-neutral-400 truncate max-w-lg lg:max-w-xl">
              {channel.description}
            </p>
          </>
        )}
      </div>

      {/* Right: Badges */}
      <div className="flex items-center gap-3 shrink-0">
        {isLocked && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-neutral-400">
            <Lock className="w-2.5 h-2.5" />
            Annonces Admin
          </span>
        )}

        {isPrivateSupport && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#39FF14]/15 border border-[#39FF14]/30 text-[#39FF14]">
            <Lock className="w-2.5 h-2.5" />
            Confidentiel 1-on-1
          </span>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-[#39FF14] font-medium bg-[#39FF14]/10 px-2.5 py-1 rounded-full border border-[#39FF14]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
          <span>En direct</span>
        </div>
      </div>
    </div>
  );
}
