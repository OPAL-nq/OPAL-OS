'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isLocked?: boolean;
  badge?: string;
  isCollapsed?: boolean;
}

export function SidebarItem({
  href,
  icon: Icon,
  label,
  isLocked = false,
  badge,
  isCollapsed = false,
}: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  if (isCollapsed) {
    return (
      <div className="relative group flex justify-center py-0.5">
        <Link
          href={href}
          prefetch={true}
          title={label}
          className={cn(
            'w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-150 relative',
            isActive
              ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 shadow-[0_0_12px_rgba(57,255,20,0.2)]'
              : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
          )}
        >
          <Icon className={cn('w-5 h-5 transition-colors', isActive ? 'text-[#39FF14]' : '')} />

          {/* Locked badge corner */}
          {isLocked && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-black/80 border border-neutral-700 flex items-center justify-center text-neutral-400">
              <Lock className="w-2 h-2" />
            </span>
          )}

          {/* Numeric or Text badge in collapsed mode */}
          {badge && !isLocked && (
            /^\d+$/.test(badge) ? (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#39FF14] text-black text-[10px] font-black flex items-center justify-center px-1 shadow-[0_0_8px_rgba(57,255,20,0.6)] animate-pulse">
                {badge}
              </span>
            ) : (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#39FF14] shadow-[0_0_6px_#39FF14]" />
            )
          )}
        </Link>

        {/* Floating Tooltip on Hover */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-2 px-3 py-1.5 bg-[#181818] border border-white/10 text-xs font-semibold text-white rounded-lg shadow-2xl z-50 whitespace-nowrap pointer-events-none animate-in fade-in duration-100">
          <span>{label}</span>
          {badge && (
            <span className={cn(
              "px-1.5 py-0.2 rounded text-[9px] font-black uppercase",
              /^\d+$/.test(badge)
                ? "bg-[#39FF14] text-black font-black"
                : "bg-[#39FF14]/20 text-[#39FF14]"
            )}>
              {badge}
            </span>
          )}
          {isLocked && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-white/10 text-neutral-400">
              Verrouillé
            </span>
          )}
        </div>
      </div>
    );
  }

  const isNumericBadge = badge && /^\d+$/.test(badge);

  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        'group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-white/5 text-white shadow-sm border border-white/10 font-semibold'
          : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03]'
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon
          className={cn(
            'w-4 h-4 shrink-0 transition-colors',
            isActive ? 'text-[#39FF14]' : 'text-neutral-400 group-hover:text-neutral-200'
          )}
        />
        <span className="truncate">{label}</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {badge && (
          isNumericBadge ? (
            <span className="min-w-[20px] h-[20px] px-1.5 rounded-full bg-[#39FF14] text-black text-[10px] font-black flex items-center justify-center shadow-[0_0_8px_rgba(57,255,20,0.4)]">
              {badge}
            </span>
          ) : (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20">
              {badge}
            </span>
          )
        )}
        {isLocked && (
          <Lock className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-400" />
        )}
      </div>
    </Link>
  );
}
