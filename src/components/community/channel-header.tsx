'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CommunityChannel } from '@/types/community';
import {
  Hash,
  Lock,
  ChevronDown,
  X,
  MessageSquare,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ChannelHeaderProps {
  channel: CommunityChannel;
  allChannels?: CommunityChannel[];
}

export function ChannelHeader({ channel, allChannels = [] }: ChannelHeaderProps) {
  const [isMobileChannelsOpen, setIsMobileChannelsOpen] = useState(false);
  const isLocked = channel.slug === 'annonces';
  const isPrivateSupport = channel.slug === 'support';

  return (
    <>
      <div className="h-14 border-b border-white/5 bg-[#0C0C0C] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 select-none">
        {/* Left: Channel Title & Mobile Switcher Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setIsMobileChannelsOpen(true)}
            className="flex items-center gap-2 group text-left md:pointer-events-none p-1 -m-1 rounded-lg hover:bg-white/5 md:hover:bg-transparent transition-colors"
          >
            <div className="flex items-center gap-1.5 shrink-0">
              {isLocked || isPrivateSupport ? (
                <Lock className="w-4 h-4 text-[#39FF14]" />
              ) : (
                <Hash className="w-4 h-4 text-neutral-400" />
              )}
              <span className="text-sm font-bold text-white tracking-wide">
                {channel.name}
              </span>
            </div>

            {/* Mobile indicator that channels are clickable */}
            <div className="md:hidden flex items-center text-neutral-500 group-hover:text-white transition-colors">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </button>

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
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isLocked && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-neutral-400">
              <Lock className="w-2.5 h-2.5" />
              Annonces Admin
            </span>
          )}

          {isPrivateSupport && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#39FF14]/15 border border-[#39FF14]/30 text-[#39FF14]">
              <Lock className="w-2.5 h-2.5" />
              Confidentiel
            </span>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-[#39FF14] font-medium bg-[#39FF14]/10 px-2.5 py-1 rounded-full border border-[#39FF14]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
            <span className="hidden sm:inline">En direct</span>
            <span className="sm:hidden">Live</span>
          </div>
        </div>
      </div>

      {/* Mobile Channel Switcher Dialog */}
      {allChannels && allChannels.length > 0 && (
        <Dialog
          open={isMobileChannelsOpen}
          onOpenChange={setIsMobileChannelsOpen}
        >
          <DialogContent className="max-w-xs bg-[#0F0F0F] border border-white/10 text-white p-4 rounded-2xl shadow-2xl">
            <DialogHeader className="pb-2 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#39FF14]" />
                <DialogTitle className="text-sm font-bold text-white">
                  Changer de salon
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-1 py-2 max-h-[60vh] overflow-y-auto">
              {allChannels.map((c) => {
                const isActive = c.slug === channel.slug;
                const isItemLocked = c.slug === 'annonces';
                const isItemPrivate = c.slug === 'support';

                return (
                  <Link
                    key={c.id || c.slug}
                    href={`/community/${c.slug}`}
                    onClick={() => setIsMobileChannelsOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30'
                        : 'text-neutral-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isItemLocked || isItemPrivate ? (
                        <Lock className="w-4 h-4 text-[#39FF14] shrink-0" />
                      ) : (
                        <Hash className="w-4 h-4 text-neutral-400 shrink-0" />
                      )}
                      <span className="truncate">{c.name}</span>
                    </div>

                    {isItemPrivate && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#39FF14]/15 text-[#39FF14]">
                        Privé
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

