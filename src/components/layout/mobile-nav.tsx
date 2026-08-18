'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  X,
  CreditCard,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { Profile } from '@/types';
import { logout } from '@/app/actions/auth';
import { getUnreadDirectMessagesCount } from '@/app/actions/direct-messages';
import { createClient } from '@/lib/supabase/client';
import { SubscriptionModal } from '@/components/billing/subscription-modal';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ profile, isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      getUnreadDirectMessagesCount()
        .then((count) => setUnreadMessagesCount(count))
        .catch(() => {});

      const supabase = createClient();
      const channel = supabase
        .channel('mobilenav-direct-messages')
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

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isIntensiveLocked = profile?.plan !== 'intensive';
  const isAdmin = profile?.role === 'admin';
  const authorName = profile?.full_name || profile?.email || 'Trader';
  const initials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/academy', label: 'Academy', icon: GraduationCap },
    { href: '/trading', label: 'Trading', icon: TrendingUp },
    { href: '/community', label: 'Community', icon: MessageSquare },
    {
      href: '/messages',
      label: 'Messages',
      icon: MessageSquareMore,
      badge: unreadMessagesCount > 0 ? String(unreadMessagesCount) : undefined,
    },
    { href: '/live', label: 'Live Sessions', icon: Radio },
  ];

  const adminItems = [
    { href: '/admin', label: "Vue d'ensemble", icon: ShieldCheck, badge: 'ADMIN' },
    { href: '/admin/students', label: 'Suivi Élèves & Trades', icon: TrendingUp },
    {
      href: '/admin/messages',
      label: 'Messagerie Membres',
      icon: MessageSquareMore,
      badge: unreadMessagesCount > 0 ? String(unreadMessagesCount) : undefined,
    },
    { href: '/admin/academy', label: 'Admin Academy', icon: BookOpen },
    { href: '/admin/live', label: 'Admin Lives & Replays', icon: Radio },
    { href: '/admin/intensive', label: 'Admin Intensive', icon: Flame },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 md:hidden">
        {/* Backdrop Overlay */}
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={onClose}
        />

        {/* Slide-over Drawer Panel */}
        <div className="fixed inset-y-0 left-0 w-[85%] max-w-xs bg-[#0D0D0D] border-r border-white/10 shadow-2xl flex flex-col justify-between z-50 animate-in slide-in-from-left duration-250">
          {/* Header */}
          <div className="h-16 px-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#111111]/50">
            <Link
              href="/dashboard"
              onClick={onClose}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#39FF14]/30 flex items-center justify-center shrink-0 group-hover:border-[#39FF14] transition-colors">
                <div className="w-2.5 h-2.5 rounded-full bg-[#39FF14] shadow-[0_0_10px_#39FF14]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold tracking-wider text-white leading-none">
                  OPAL
                </span>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 leading-tight mt-0.5">
                  Trading OS
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {/* Main Menu */}
            <div className="space-y-1">
              <div className="px-3 mb-2 text-[10px] font-black tracking-wider text-neutral-500 uppercase">
                Menu Principal
              </div>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                      isActive
                        ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 shadow-sm'
                        : 'text-neutral-300 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0',
                          isActive ? 'text-[#39FF14]' : 'text-neutral-400'
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-[#39FF14] text-black">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Accompagnement */}
            <div className="space-y-1">
              <div className="px-3 mb-2 text-[10px] font-black tracking-wider text-neutral-500 uppercase">
                Accompagnement Pro
              </div>
              <Link
                href="/intensive"
                onClick={onClose}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                  pathname.startsWith('/intensive')
                    ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                )}
              >
                <div className="flex items-center gap-3">
                  <Flame
                    className={cn(
                      'w-4 h-4 shrink-0',
                      profile?.plan === 'intensive'
                        ? 'text-[#39FF14] fill-current'
                        : 'text-neutral-500'
                    )}
                  />
                  <span>Intensive</span>
                </div>
                <span
                  className={cn(
                    'px-2 py-0.5 text-[10px] font-black rounded uppercase',
                    profile?.plan === 'intensive'
                      ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30'
                      : 'bg-white/10 text-neutral-400'
                  )}
                >
                  {profile?.plan === 'intensive' ? 'PRO' : 'Verrouillé'}
                </span>
              </Link>
            </div>

            {/* Administration */}
            {isAdmin && (
              <div className="space-y-1">
                <div className="px-3 mb-2 text-[10px] font-black tracking-wider text-[#39FF14]/80 uppercase">
                  Administration
                </div>
                {adminItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors',
                        isActive
                          ? 'bg-white/10 text-white font-semibold'
                          : 'text-neutral-400 hover:text-white hover:bg-white/5'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0 text-neutral-400" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-[#39FF14]/20 text-[#39FF14]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer User & Billing Section */}
          <div className="p-4 border-t border-white/5 bg-[#0A0A0A] space-y-3 shrink-0">
            {/* User Profile Summary */}
            <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-2.5 min-w-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={authorName}
                    className="w-8 h-8 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#141414] border border-white/10 flex items-center justify-center text-[10px] font-bold text-neutral-300">
                    {initials}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">
                    {authorName}
                  </span>
                  <span className="text-[10px] text-neutral-400 truncate">
                    {profile?.email}
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 shrink-0">
                {profile?.plan === 'intensive' ? 'Intensive' : 'Membre'}
              </span>
            </div>

            {/* Quick Trigger: Subscription Management */}
            <button
              type="button"
              onClick={() => {
                setIsBillingModalOpen(true);
              }}
              className="w-full h-10 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-bold flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#39FF14]" />
                <span>Mon Abonnement & Facturation</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </button>

            {/* Logout button */}
            <form action={logout} className="w-full">
              <button
                type="submit"
                className="w-full h-9 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Déconnexion</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* In-App Subscription Modal */}
      <SubscriptionModal
        open={isBillingModalOpen}
        onOpenChange={(isOpenState) => {
          setIsBillingModalOpen(isOpenState);
          if (!isOpenState) {
            onClose();
          }
        }}
      />
    </>
  );
}
