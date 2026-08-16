'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  GraduationCap,
  TrendingUp,
  Cpu,
  MessageSquare,
  MessageSquareMore,
  Radio,
  Flame,
  ShieldCheck,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { SidebarItem } from './sidebar-item';
import type { Profile } from '@/types';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { getUnreadDirectMessagesCount } from '@/app/actions/direct-messages';

interface SidebarProps {
  profile: Profile | null;
}

export function Sidebar({ profile }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Sync with localStorage on client mount & load unread messages
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('opal_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }

    if (profile?.id) {
      getUnreadDirectMessagesCount()
        .then((count) => setUnreadMessagesCount(count))
        .catch(() => {});

      const supabase = createClient();
      const channel = supabase
        .channel('sidebar-direct-messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'direct_messages',
          },
          () => {
            getUnreadDirectMessagesCount()
              .then((count) => setUnreadMessagesCount(count))
              .catch(() => {});
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile?.id]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('opal_sidebar_collapsed', String(next));
      return next;
    });
  };

  const isIntensiveLocked = profile?.plan !== 'intensive';
  const isAdmin = profile?.role === 'admin';
  const authorName = profile?.full_name || profile?.email || 'Trader';
  const initials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <aside
      className={cn(
        'hidden md:flex h-screen bg-[#0A0A0A] border-r border-white/5 flex-col shrink-0 select-none transition-all duration-300 ease-in-out relative z-30',
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Brand Header & Toggle */}
      <div
        className={cn(
          'h-16 flex items-center border-b border-white/5 shrink-0 transition-all',
          isCollapsed ? 'px-3 justify-center' : 'px-5 justify-between'
        )}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 min-w-0 group"
          title="OPAL Trading OS"
        >
          <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#39FF14]/30 flex items-center justify-center shrink-0 group-hover:border-[#39FF14] transition-colors">
            <div className="w-2.5 h-2.5 rounded-full bg-[#39FF14] shadow-[0_0_10px_#39FF14]" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0 animate-in fade-in duration-200">
              <span className="text-base font-bold tracking-wider text-white leading-none">
                OPAL
              </span>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 leading-tight mt-0.5">
                Trading OS
              </span>
            </div>
          )}
        </Link>

        {/* Header Toggle Button */}
        {!isCollapsed && (
          <button
            type="button"
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 transition-colors"
            title="Réduire la barre latérale"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className={cn("flex-1 px-2.5 py-4 space-y-5", isCollapsed ? "overflow-visible" : "overflow-y-auto scrollbar-thin scrollbar-thumb-white/5")}>
        {/* 1. Main Menu */}
        <div>
          {!isCollapsed ? (
            <div className="px-3 mb-2 text-[10px] font-black tracking-wider text-neutral-500 uppercase">
              Menu
            </div>
          ) : (
            <div className="h-px bg-white/5 my-2 mx-2" />
          )}

          <nav className="space-y-1">
            <SidebarItem
              href="/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
              isCollapsed={isCollapsed}
            />
            <SidebarItem
              href="/academy"
              icon={GraduationCap}
              label="Academy"
              isCollapsed={isCollapsed}
            />
            <SidebarItem
              href="/trading"
              icon={TrendingUp}
              label="Trading"
              isCollapsed={isCollapsed}
            />
            <SidebarItem
              href="/systems"
              icon={Cpu}
              label="Systems"
              isCollapsed={isCollapsed}
            />
            <SidebarItem
              href="/community"
              icon={MessageSquare}
              label="Community"
              isCollapsed={isCollapsed}
            />
            <SidebarItem
              href="/messages"
              icon={MessageSquareMore}
              label="Messages"
              badge={unreadMessagesCount > 0 ? String(unreadMessagesCount) : undefined}
              isCollapsed={isCollapsed}
            />
            <SidebarItem
              href="/live"
              icon={Radio}
              label="Live"
              isCollapsed={isCollapsed}
            />
          </nav>
        </div>

        {/* 2. Accompagnement */}
        <div>
          {!isCollapsed ? (
            <div className="px-3 mb-2 text-[10px] font-black tracking-wider text-neutral-500 uppercase">
              Accompagnement
            </div>
          ) : (
            <div className="h-px bg-white/5 my-2 mx-2" />
          )}

          <nav className="space-y-1">
            <SidebarItem
              href="/intensive"
              icon={Flame}
              label="Intensive"
              isLocked={isIntensiveLocked}
              badge={profile?.plan === 'intensive' ? 'PRO' : undefined}
              isCollapsed={isCollapsed}
            />
          </nav>
        </div>

        {/* 3. Administration */}
        {isAdmin && (
          <div>
            {!isCollapsed ? (
              <div className="px-3 mb-2 text-[10px] font-black tracking-wider text-[#39FF14]/80 uppercase">
                Administration
              </div>
            ) : (
              <div className="h-px bg-white/5 my-2 mx-2" />
            )}

            <nav className="space-y-1">
              <SidebarItem
                href="/admin"
                icon={ShieldCheck}
                label="Vue d'ensemble"
                badge="ADMIN"
                isCollapsed={isCollapsed}
              />
              <SidebarItem
                href="/admin/students"
                icon={TrendingUp}
                label="Suivi Élèves & Trades"
                isCollapsed={isCollapsed}
              />
              <SidebarItem
                href="/admin/messages"
                icon={MessageSquareMore}
                label="Messagerie Membres"
                badge={unreadMessagesCount > 0 ? String(unreadMessagesCount) : undefined}
                isCollapsed={isCollapsed}
              />
              <SidebarItem
                href="/admin/academy"
                icon={BookOpen}
                label="Admin Academy"
                isCollapsed={isCollapsed}
              />
              <SidebarItem
                href="/admin/live"
                icon={Radio}
                label="Admin Lives & Replays"
                isCollapsed={isCollapsed}
              />
              <SidebarItem
                href="/admin/community"
                icon={MessageSquare}
                label="Admin Community"
                isCollapsed={isCollapsed}
              />
              <SidebarItem
                href="/admin/intensive"
                icon={Flame}
                label="Admin Intensive"
                isCollapsed={isCollapsed}
              />
            </nav>
          </div>
        )}
      </div>

      {/* Collapse / Expand footer toggle (When collapsed) */}
      {isCollapsed && (
        <div className="p-2 border-t border-white/5 flex justify-center shrink-0">
          <button
            type="button"
            onClick={toggleCollapse}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors shadow-sm"
            title="Agrandir la barre latérale"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* User Profile Footer */}
      <div className="p-3 border-t border-white/5 bg-[#0D0D0D] shrink-0">
        {isCollapsed ? (
          <div className="relative group flex justify-center py-1">
            <div className="relative">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={authorName}
                  className="w-8 h-8 rounded-full object-cover border border-white/10"
                />
              ) : (
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border',
                    isAdmin
                      ? 'bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]/40'
                      : 'bg-white/10 text-white border-white/10'
                  )}
                >
                  {initials}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#39FF14] ring-2 ring-[#0A0A0A]" />
            </div>

            {/* Hover tooltip for user info */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col px-3 py-2 bg-[#181818] border border-white/10 rounded-xl shadow-2xl z-50 whitespace-nowrap pointer-events-none animate-in fade-in duration-100 min-w-[140px]">
              <span className="text-xs font-bold text-white truncate max-w-[160px]">
                {authorName}
              </span>
              <span className="text-[10px] text-neutral-400 capitalize">
                Plan {profile?.plan || 'Community'} {isAdmin ? '• Admin' : ''}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={authorName}
                    className="w-7 h-7 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border',
                      isAdmin
                        ? 'bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]/40'
                        : 'bg-white/10 text-white border-white/10'
                    )}
                  >
                    {initials}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#39FF14] ring-2 ring-[#0A0A0A]" />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate max-w-[110px]">
                  {authorName}
                </span>
                <span className="text-[10px] text-neutral-400 capitalize truncate">
                  Plan {profile?.plan || 'Community'}
                </span>
              </div>
            </div>

            <span
              className={cn(
                'px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-md border shrink-0',
                profile?.plan === 'intensive'
                  ? 'bg-[#39FF14]/15 text-[#39FF14] border-[#39FF14]/30'
                  : 'bg-white/5 text-neutral-400 border-white/10'
              )}
            >
              {profile?.plan === 'intensive' ? 'Intensive' : 'Community'}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
