'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Une erreur est survenue',
  message = 'Impossible de charger les données pour le moment. Veuillez réessayer.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-[#141414] border border-red-500/20',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      {message && (
        <p className="text-xs text-neutral-400 max-w-sm mt-1.5 leading-relaxed">
          {message}
        </p>
      )}
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="mt-6 border-white/10 text-neutral-200 hover:bg-white/5 text-xs h-9"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          <span>Réessayer</span>
        </Button>
      )}
    </div>
  );
}
