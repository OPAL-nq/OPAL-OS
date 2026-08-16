import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  Clock,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import type { Module, Lesson } from '@/types';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ moduleId: string }>;
}

export default async function MemberModulePage({ params }: Props) {
  const { moduleId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch module
  const { data: moduleData } = await supabase
    .from('modules')
    .select('*')
    .eq('id', moduleId)
    .eq('published', true)
    .single();

  if (!moduleData) {
    notFound();
  }

  const moduleItem = moduleData as Module;

  // Fetch published lessons of this module
  const { data: lessonsData } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .eq('published', true)
    .order('position', { ascending: true });

  const lessons = (lessonsData || []) as Lesson[];

  // Fetch user's completed lessons in this module
  let completedSet = new Set<string>();
  if (user && lessons.length > 0) {
    const lessonIds = lessons.map((l) => l.id);
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('lesson_id, completed')
      .eq('user_id', user.id)
      .in('lesson_id', lessonIds)
      .eq('completed', true);

    if (progressData) {
      progressData.forEach((p) => completedSet.add(p.lesson_id));
    }
  }

  const completedCount = lessons.filter((l) => completedSet.has(l.id)).length;
  const progressPercent =
    lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Navigation */}
      <div>
        <Link
          href="/academy"
          className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-[#39FF14] transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour à l'Academy</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-[#141414] border border-white/10">
          <div className="space-y-1.5">
            <span className="text-xs font-bold tracking-wider text-[#39FF14] uppercase">
              Module #{moduleItem.position}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {moduleItem.title}
            </h1>
            {moduleItem.description && (
              <p className="text-xs text-neutral-400 max-w-xl">
                {moduleItem.description}
              </p>
            )}
          </div>

          <div className="min-w-[200px] p-4 rounded-xl bg-[#0A0A0A] border border-white/5 space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Complétion</span>
              <span className="font-bold text-[#39FF14]">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-[#39FF14] rounded-full transition-all duration-300 shadow-[0_0_10px_#39FF14]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-neutral-500 block text-right">
              {completedCount} / {lessons.length} terminées
            </span>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-[#39FF14]" />
          <span>Leçons ({lessons.length})</span>
        </h2>

        {lessons.length === 0 ? (
          <Card className="bg-[#141414] border-white/5 p-8 text-center">
            <PlayCircle className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">Aucune leçon disponible</p>
            <p className="text-xs text-neutral-400 mt-1">
              Les leçons de ce module seront publiées prochainement.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, idx) => {
              const isCompleted = completedSet.has(lesson.id);

              return (
                <Link
                  key={lesson.id}
                  href={`/academy/${moduleId}/${lesson.id}`}
                  className="group block"
                >
                  <Card className="bg-[#141414] border-white/5 hover:border-white/20 transition-all">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Status Icon */}
                        <div className="shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-[#39FF14]" />
                          ) : (
                            <Circle className="w-5 h-5 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-white group-hover:text-[#39FF14] transition-colors truncate">
                            {lesson.position + 1}. {lesson.title}
                          </h3>
                          {lesson.description && (
                            <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {lesson.duration && (
                          <span className="flex items-center gap-1 text-xs text-neutral-400 bg-[#0A0A0A] px-2 py-1 rounded-md border border-white/5">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            <span>{lesson.duration}</span>
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-[#39FF14] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
