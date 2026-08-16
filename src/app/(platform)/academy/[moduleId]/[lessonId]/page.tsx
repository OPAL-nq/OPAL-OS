import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/academy/video-player';
import { LessonProgressButton } from '@/components/academy/lesson-progress-button';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import type { Lesson, LessonResource, Module } from '@/types';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ moduleId: string; lessonId: string }>;
}

export default async function MemberLessonPage({ params }: Props) {
  const { moduleId, lessonId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch lesson with module info
  const { data: lessonData } = await supabase
    .from('lessons')
    .select('*, module:modules(*)')
    .eq('id', lessonId)
    .eq('published', true)
    .single();

  if (!lessonData) {
    notFound();
  }

  const lesson = lessonData as Lesson & { module: Module };

  // Fetch all published lessons of this module to compute previous/next
  const { data: allLessonsData } = await supabase
    .from('lessons')
    .select('id, title, position')
    .eq('module_id', moduleId)
    .eq('published', true)
    .order('position', { ascending: true });

  const allLessons = allLessonsData || [];
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Fetch resources of this lesson
  const { data: resourcesData } = await supabase
    .from('lesson_resources')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('position', { ascending: true });

  const resources = (resourcesData || []) as LessonResource[];

  // Fetch completion status of this lesson for current user
  let isCompleted = false;
  if (user) {
    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('completed')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .single();

    isCompleted = !!progress?.completed;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumbs & Previous/Next Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href={`/academy/${moduleId}`}
          className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-[#39FF14] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour au module : {lesson.module?.title || 'Module'}</span>
        </Link>

        <div className="flex items-center gap-2">
          {prevLesson ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-white/10 text-xs gap-1.5 h-8 bg-[#141414]"
            >
              <Link href={`/academy/${moduleId}/${prevLesson.id}`}>
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Précédente</span>
              </Link>
            </Button>
          ) : (
            <Button
              disabled
              variant="outline"
              size="sm"
              className="border-white/5 text-neutral-600 text-xs gap-1.5 h-8 bg-[#141414]/50"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Précédente</span>
            </Button>
          )}

          {nextLesson ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-white/10 text-xs gap-1.5 h-8 bg-[#141414]"
            >
              <Link href={`/academy/${moduleId}/${nextLesson.id}`}>
                <span>Suivante</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#39FF14]" />
              </Link>
            </Button>
          ) : (
            <Button
              disabled
              variant="outline"
              size="sm"
              className="border-white/5 text-neutral-600 text-xs gap-1.5 h-8 bg-[#141414]/50"
            >
              <span>Suivante</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Video Player */}
      <VideoPlayer url={lesson.video_url} title={lesson.title} />

      {/* Lesson Meta Header & Progress Button */}
      <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#39FF14]">
                {lesson.module?.title || 'Formation OPAL'}
              </span>
              {lesson.duration && (
                <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 bg-[#0A0A0A] px-2 py-0.5 rounded border border-white/5">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  <span>{lesson.duration}</span>
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {lesson.title}
            </h1>
          </div>

          <div className="shrink-0">
            <LessonProgressButton
              lessonId={lesson.id}
              isCompleted={isCompleted}
            />
          </div>
        </div>

        {lesson.description && (
          <div className="pt-4 border-t border-white/5 text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {lesson.description}
          </div>
        )}
      </div>

      {/* Resources Section (if any) */}
      {resources.length > 0 && (
        <Card className="bg-[#141414] border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#39FF14]" />
              <span>Ressources & Liens de la leçon ({resources.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {resources.map((res) => (
              <a
                key={res.id}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-lg bg-[#0A0A0A] border border-white/5 hover:border-white/20 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20 uppercase">
                    {res.type || 'Lien'}
                  </span>
                  <span className="text-xs font-medium text-white group-hover:text-[#39FF14] transition-colors">
                    {res.title}
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#39FF14] transition-colors" />
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
