import React from 'react';
import { UserMenu } from './user-menu';
import { NotificationBell } from '@/components/notifications/notification-bell';
import type { Profile } from '@/types';

interface TopbarProps {
  profile: Profile | null;
  title?: string;
}

export function Topbar({ profile, title }: TopbarProps) {
  return (
    <header className="h-16 border-b border-white/5 bg-[#0A0A0A] px-6 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-sm font-semibold text-white tracking-wide">
          {title || 'OPAL OS'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}
