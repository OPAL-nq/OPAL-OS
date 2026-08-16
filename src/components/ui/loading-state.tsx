'use client';

import React from 'react';
import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  variant?: 'page' | 'cards' | 'list' | 'table';
  count?: number;
  className?: string;
}

export function LoadingState({
  variant = 'page',
  count = 3,
  className,
}: LoadingStateProps) {
  if (variant === 'cards') {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-[#141414] border border-white/5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 bg-white/5" />
              <Skeleton className="h-6 w-16 rounded-full bg-white/5" />
            </div>
            <Skeleton className="h-5 w-3/4 bg-white/5" />
            <Skeleton className="h-3 w-full bg-white/5" />
            <div className="pt-2 flex items-center justify-between">
              <Skeleton className="h-3 w-20 bg-white/5" />
              <Skeleton className="h-8 w-24 rounded-lg bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-[#141414] border border-white/5 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Skeleton className="w-9 h-9 rounded-lg bg-white/5 shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-4 w-1/3 bg-white/5" />
                <Skeleton className="h-3 w-2/3 bg-white/5" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 rounded-lg bg-white/5 shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={cn('p-4 rounded-2xl bg-[#141414] border border-white/5 space-y-3', className)}>
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <Skeleton className="h-4 w-32 bg-white/5" />
          <Skeleton className="h-4 w-24 bg-white/5" />
        </div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2.5">
            <Skeleton className="h-3 w-1/4 bg-white/5" />
            <Skeleton className="h-3 w-1/6 bg-white/5" />
            <Skeleton className="h-3 w-1/6 bg-white/5" />
            <Skeleton className="h-3 w-1/5 bg-white/5" />
          </div>
        ))}
      </div>
    );
  }

  // Default 'page' variant
  return (
    <div className={cn('space-y-6 max-w-7xl mx-auto', className)}>
      <div className="p-6 rounded-2xl bg-[#141414] border border-white/5 space-y-3">
        <Skeleton className="h-7 w-48 bg-white/5" />
        <Skeleton className="h-4 w-72 bg-white/5" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32 rounded-2xl bg-[#141414] border border-white/5" />
        <Skeleton className="h-32 rounded-2xl bg-[#141414] border border-white/5" />
        <Skeleton className="h-32 rounded-2xl bg-[#141414] border border-white/5" />
      </div>
    </div>
  );
}
