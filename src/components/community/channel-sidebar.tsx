'use client';

import React from 'react';
import Link from 'next/link';
import { CommunityChannel } from '@/types/community';
import {
  MessageSquare,
  Settings,
  Hash,
  Lock,
} from 'lucide-react';

interface ChannelSidebarProps {
  channels: CommunityChannel[];
  activeSlug: string;
  isAdmin?: boolean;
}

export function ChannelSidebar({ channels, activeSlug, isAdmin }: ChannelSidebarProps) {
  // Group only existing channels
  const officialChannels = channels.filter((c) => c.slug === 'annonces');
  const tradingChannels = channels.filter((c) =>
    ['general', 'trading', 'questions', 'journal'].includes(c.slug)
  );
  const perfChannels = channels.filter((c) =>
    ['wins', 'motivation', 'replays'].includes(c.slug)
  );
  const supportChannels = channels.filter((c) => c.slug === 'support');
  const customChannels = channels.filter(
    (c) =>
      !['annonces', 'general', 'trading', 'questions', 'journal', 'wins', 'motivation', 'support', 'replays'].includes(
        c.slug
      )
  );

  const renderChannel = (channel: CommunityChannel) => {
    const isActive = channel.slug === activeSlug;
    const isLocked = channel.slug === 'annonces';
    const isPrivate = channel.slug === 'support';

    return (
      <Link
        key={channel.id || channel.slug}
        href={`/community/${channel.slug}`}
        className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
          isActive
            ? 'bg-white/10 text-white font-semibold shadow-inner'
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`text-sm shrink-0 transition-colors ${
              isActive ? 'text-[#39FF14]' : 'text-neutral-500 group-hover:text-neutral-300'
            }`}
          >
            {isLocked || isPrivate ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              <Hash className="w-3.5 h-3.5" />
            )}
          </span>
          <span className="truncate">{channel.name}</span>
        </div>

        {isPrivate && (
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-[#39FF14]/15 text-[#39FF14] shrink-0">
            Privé
          </span>
        )}

        {isLocked && (
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-white/10 text-neutral-400 shrink-0">
            Admin
          </span>
        )}

        {!channel.published && (
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 shrink-0">
            Masqué
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="hidden md:flex w-56 sm:w-60 lg:w-64 bg-[#0E0E0E] border-r border-white/5 flex-col justify-between shrink-0 select-none h-full overflow-hidden">
      {/* Community Server Header */}
      <div className="h-14 px-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#111111]/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] shrink-0 shadow-sm">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-black uppercase tracking-wider text-white truncate block">
              Salons OPAL
            </span>
            <span className="text-[10px] text-[#39FF14] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
              Espace Membres
            </span>
          </div>
        </div>

        {isAdmin && (
          <Link href="/admin/community">
            <button
              type="button"
              className="p-1.5 rounded-md text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
              title="Gérer les salons"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </Link>
        )}
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
        {/* 1. Official */}
        {officialChannels.length > 0 && (
          <div className="space-y-0.5">
            <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-neutral-500 flex items-center justify-between">
              <span>📢 Annonces</span>
            </div>
            {officialChannels.map(renderChannel)}
          </div>
        )}

        {/* 2. Trading */}
        {tradingChannels.length > 0 && (
          <div className="space-y-0.5">
            <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-neutral-500 flex items-center justify-between">
              <span>💬 Trading & Échanges</span>
            </div>
            {tradingChannels.map(renderChannel)}
          </div>
        )}

        {/* 3. Performance & Resources */}
        {perfChannels.length > 0 && (
          <div className="space-y-0.5">
            <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-neutral-500 flex items-center justify-between">
              <span>🏆 Performance</span>
            </div>
            {perfChannels.map(renderChannel)}
          </div>
        )}

        {/* 4. Support */}
        {supportChannels.length > 0 && (
          <div className="space-y-0.5">
            <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-neutral-500 flex items-center justify-between">
              <span>🆘 Support Privé</span>
            </div>
            {supportChannels.map(renderChannel)}
          </div>
        )}

        {/* 5. Custom / Others */}
        {customChannels.length > 0 && (
          <div className="space-y-0.5">
            <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-neutral-500 flex items-center justify-between">
              <span>⚡ Autres Salons</span>
            </div>
            {customChannels.map(renderChannel)}
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="h-11 px-3 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500 bg-[#0C0C0C]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#39FF14]" />
          <span>{channels.length} salons actifs</span>
        </div>
        {isAdmin && (
          <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-[#39FF14]/15 text-[#39FF14]">
            Admin
          </span>
        )}
      </div>
    </aside>
  );
}
