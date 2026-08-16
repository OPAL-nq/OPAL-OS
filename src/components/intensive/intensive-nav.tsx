'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, LineChart, Target, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/intensive', label: 'Cockpit', icon: LayoutDashboard, exact: true },
  { href: '/intensive/coaching', label: 'Coachings', icon: Calendar },
  { href: '/intensive/follow-up', label: 'Suivi Individuel', icon: LineChart },
  { href: '/intensive/objectives', label: 'Objectifs', icon: Target },
  { href: '/intensive/reports', label: 'Comptes Rendus', icon: FileText },
];

export function IntensiveNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-white/5">
      {TABS.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0',
              isActive
                ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30 shadow-[0_0_12px_rgba(57,255,20,0.15)]'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04] border-transparent'
            )}
          >
            <Icon className={cn('w-4 h-4', isActive ? 'text-[#39FF14]' : 'text-neutral-400')} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
