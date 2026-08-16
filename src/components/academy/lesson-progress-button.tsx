'use client';

import React, { useTransition } from 'react';
import { toggleLessonProgress } from '@/app/actions/academy';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle } from 'lucide-react';

interface LessonProgressButtonProps {
  lessonId: string;
  isCompleted: boolean;
}

export function LessonProgressButton({
  lessonId,
  isCompleted,
}: LessonProgressButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleLessonProgress(lessonId, !isCompleted);
    });
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={isPending}
      variant={isCompleted ? 'outline' : 'default'}
      className={
        isCompleted
          ? 'border-[#39FF14]/40 text-[#39FF14] hover:bg-[#39FF14]/10 h-10 px-4 gap-2 font-medium text-xs'
          : 'bg-[#39FF14] text-black font-semibold hover:bg-[#39FF14]/90 shadow-[0_0_15px_rgba(57,255,20,0.2)] h-10 px-4 gap-2 text-xs'
      }
    >
      {isCompleted ? (
        <>
          <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
          <span>Leçon terminée (Cliquer pour annuler)</span>
        </>
      ) : (
        <>
          <Circle className="w-4 h-4 text-black" />
          <span>{isPending ? 'Enregistrement...' : 'Marquer comme terminée'}</span>
        </>
      )}
    </Button>
  );
}
