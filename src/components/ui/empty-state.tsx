'use client';

import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-2xl bg-[#141414] border border-white/5',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 mb-4">
        <Icon className="w-6 h-6 text-[#39FF14]" />
      </div>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs text-neutral-400 max-w-sm mt-1.5 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Button
              asChild
              className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold text-xs h-9 px-4 shadow-[0_0_15px_rgba(57,255,20,0.15)]"
            >
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button
              onClick={action.onClick}
              className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold text-xs h-9 px-4 shadow-[0_0_15px_rgba(57,255,20,0.15)]"
            >
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
