'use client';

import React from 'react';
import { logout } from '@/app/actions/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';
import Link from 'next/link';
import type { Profile } from '@/types';

interface UserMenuProps {
  profile: Profile | null;
}

export function UserMenu({ profile }: UserMenuProps) {
  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : profile?.email
    ? profile.email.substring(0, 2).toUpperCase()
    : 'OP';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors text-left outline-none">
          <Avatar className="w-8 h-8 rounded-lg border border-white/10 bg-[#141414]">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-[#141414] text-xs font-semibold text-neutral-300">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 bg-[#141414] border border-white/10 text-white rounded-xl shadow-2xl p-1.5"
      >
        <DropdownMenuLabel className="font-normal px-2 py-1.5">
          <div className="flex flex-col space-y-0.5">
            <p className="text-xs font-medium text-white">
              {profile?.full_name || 'Trader'}
            </p>
            <p className="text-[11px] text-neutral-400 truncate">
              {profile?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-white/5 my-1" />

        <DropdownMenuItem asChild>
          <div className="flex items-center justify-between px-2 py-1.5 text-xs text-neutral-300 rounded-md cursor-default">
            <span className="text-neutral-400">Plan</span>
            <span className="font-semibold text-white capitalize">
              {profile?.plan || 'Community'}
            </span>
          </div>
        </DropdownMenuItem>

        {profile?.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link
              href="/admin"
              className="flex items-center gap-2 px-2 py-1.5 text-xs text-[#39FF14] hover:bg-white/5 rounded-md cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Panneau d'administration</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="bg-white/5 my-1" />

        <DropdownMenuItem asChild>
          <form action={logout} className="w-full">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-md transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
