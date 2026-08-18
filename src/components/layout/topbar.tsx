'use client';

import React, { useState } from 'react';
import { UserMenu } from './user-menu';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { MobileNav } from './mobile-nav';
import { Menu, Compass } from 'lucide-react';
import Link from 'next/link';
import type { Profile } from '@/types';
import { PlatformTourModal } from '@/components/onboarding/platform-tour-modal';

interface TopbarProps {
  profile: Profile | null;
  title?: string;
}

export function Topbar({ profile, title }: TopbarProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-white/5 bg-[#0A0A0A] px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
        {/* Left: Mobile Hamburger & Logo OR Desktop Title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Brand Logo */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#141414] border border-[#39FF14]/30 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#39FF14] shadow-[0_0_8px_#39FF14]" />
              </div>
              <span className="text-sm font-bold tracking-wider text-white">
                OPAL
              </span>
            </Link>
          </div>

          {/* Desktop Title */}
          <h1 className="hidden md:block text-sm font-semibold text-white tracking-wide truncate">
            {title || 'OPAL OS'}
          </h1>
        </div>

        {/* Right: Tour button, Notifications & Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Guide Tour Trigger */}
          <button
            type="button"
            onClick={() => setIsTourOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-all text-xs font-semibold"
            title="Lancer la visite guidée d'OPAL OS"
          >
            <Compass className="w-4 h-4 text-[#39FF14]" />
            <span className="hidden sm:inline">Guide OS</span>
          </button>

          <NotificationBell />
          <UserMenu profile={profile} />
        </div>
      </header>

      {/* Global Platform Tour Modal */}
      <PlatformTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />

      {/* Mobile Slide-over Drawer */}
      <MobileNav
        profile={profile}
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
    </>
  );
}

