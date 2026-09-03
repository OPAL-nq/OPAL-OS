import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import type { Module, Lesson, LessonProgress } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AcademyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [modulesRes, progressRes] = await Promise.all([
    supabase
      .from('modules')
      .select('*, lessons(*)')
      .eq('published', true)
      .order('position', { ascending: true }),
    user
      ? supabase
          .from('lesson_progress')
          .select('lesson_id, completed')
          .eq('user_id', user.id)
          .eq('completed', true)
      : Promise.resolve({ data: [] }),
  ]);

  const modulesData = modulesRes.data;
  const progressData = progressRes.data;

  // Fetch current user's lesson progress
  let progressMap = new Set<string>();
  if (progressData) {
    progressData.forEach((p) => progressMap.add(p.lesson_id));
  }

  const rawModules = (modulesData || []) as (Module & { lessons: Lesson[] })[];

  // Filter only published lessons and sort by position
  const modules = rawModules.map((m) => {
    const publishedLessons = (m.lessons || [])
      .filter((l) => l.published)
      .sort((a, b) => a.position - b.position);

    const completedCount = publishedLessons.filter((l) =>
      progressMap.has(l.id)
    ).length;

    const percent =
      publishedLessons.length > 0
        ? Math.round((completedCount / publishedLessons.length) * 100)
        : 0;

    return {
      ...m,
      lessons: publishedLessons,
      totalLessons: publishedLessons.length,
      completedLessons: completedCount,
      progressPercent: percent,
    };
  });

  const totalLessons = modules.reduce((acc, m) => acc + m.totalLessons, 0);
  const totalCompleted = modules.reduce((acc, m) => acc + m.completedLessons, 0);
  const globalProgress =
    totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  // Find first uncompleted lesson to resume
  let resumeLesson: { moduleId: string; lessonId: string; title: string } | null = null;
  for (const mod of modules) {
    for (const les of mod.lessons) {
      if (!progressMap.has(les.id)) {
        resumeLesson = {
          moduleId: mod.id,
          lessonId: les.id,
          title: les.title,
        };
        break;
      }
    }
    if (resumeLesson) break;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Academy Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#141414] via-[#141414] to-[#1e1e1e] border border-white/10 p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#39FF14]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-semibold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Cursus OPAL</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              OPAL Academy
            </h1>
            <p className="text-sm text-neutral-400 max-w-xl">
              Maîtrisez le framework de trading OPAL à travers des modules structurés et orientés exécution.
            </p>
          </div>

          {/* Global Progress Widget */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10 min-w-[260px] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-medium">Progression globale</span>
              <span className="font-bold text-[#39FF14] text-sm">{globalProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-[#39FF14] rounded-full transition-all duration-500 shadow-[0_0_10px_#39FF14]"
                style={{ width: `${globalProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-500">
              <span>{totalCompleted} sur {totalLessons} leçons terminées</span>
              {resumeLesson && (
                <Link
                  href={`/academy/${resumeLesson.moduleId}/${resumeLesson.lessonId}`}
                  className="text-[#39FF14] hover:underline font-medium inline-flex items-center gap-1"
                >
                  <span>Continuer</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-white">Modules de formation</h2>

        {modules.length === 0 ? (
          <Card className="bg-[#141414] border-white/5 p-12 text-center">
            <GraduationCap className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-base font-medium text-white">Aucun module publié</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              Les leçons sont en cours de préparation par l'équipe OPAL. Revenez très vite !
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod) => {
              const isFinished = mod.progressPercent === 100 && mod.totalLessons > 0;
              const firstLessonId = mod.lessons[0]?.id;

              return (
                <Card
                  key={mod.id}
                  className="bg-[#141414] border-white/5 hover:border-white/10 transition-all flex flex-col justify-between shadow-lg"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold tracking-wider text-[#39FF14] uppercase">
                        Module #{mod.position}
                      </span>
                      {isFinished ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Terminé</span>
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400 font-medium">
                          {mod.completedLessons} / {mod.totalLessons} leçons
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-base text-white">{mod.title}</CardTitle>
                    {mod.description && (
                      <CardDescription className="text-xs text-neutral-400 line-clamp-2 mt-1">
                        {mod.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="pt-2 space-y-4">
                    {/* Module Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-[#39FF14] rounded-full transition-all duration-300"
                          style={{ width: `${mod.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        asChild
                        className="w-full bg-white/5 text-white hover:bg-[#39FF14] hover:text-black font-semibold text-xs h-9 transition-colors gap-2"
                      >
                        <Link href={`/academy/${mod.id}`}>
                          <span>Explorer le module</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
