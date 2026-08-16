import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { VideoPlayer } from '@/components/academy/video-player';
import {
  updateLesson,
  deleteLesson,
  createResource,
  deleteResource,
} from '@/app/actions/admin-academy';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Link as LinkIcon,
  ExternalLink,
  Video,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import type { Lesson, LessonResource, Module } from '@/types';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ lessonId: string }>;
}

export default async function AdminLessonDetailPage({ params }: Props) {
  const { lessonId } = await params;
  const supabase = await createClient();

  // Fetch lesson with module info
  const { data: lessonData } = await supabase
    .from('lessons')
    .select('*, module:modules(*)')
    .eq('id', lessonId)
    .single();

  if (!lessonData) {
    notFound();
  }

  const lesson = lessonData as Lesson & { module: Module };

  // Fetch resources of this lesson
  const { data: resourcesData } = await supabase
    .from('lesson_resources')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('position', { ascending: true });

  const resources = (resourcesData || []) as LessonResource[];

  const updateLessonWithId = updateLesson.bind(null, lessonId);
  const deleteLessonWithId = deleteLesson.bind(null, lessonId, lesson.module_id);
  const createResourceWithLessonId = createResource.bind(null, lessonId);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top breadcrumb navigation */}
      <div>
        <Link
          href={`/admin/academy/modules/${lesson.module_id}`}
          className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-[#39FF14] transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour au module : {lesson.module?.title || 'Module'}</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {lesson.title}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Édition du contenu vidéo, paramètres et ressources complémentaires
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="border-white/10 text-xs gap-1.5 h-9">
              <Link
                href={`/academy/${lesson.module_id}/${lesson.id}`}
                target="_blank"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Voir en tant que membre</span>
              </Link>
            </Button>

            <form action={deleteLessonWithId}>
              <Button
                type="submit"
                variant="outline"
                className="border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs gap-1.5 h-9"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Video Preview & Resources */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Preview */}
          <Card className="bg-[#141414] border-white/5 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-[#39FF14]" />
                <span>Aperçu de la vidéo YouTube</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VideoPlayer url={lesson.video_url} title={lesson.title} />
            </CardContent>
          </Card>

          {/* Resources URL Manager */}
          <Card className="bg-[#141414] border-white/5">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#39FF14]" />
                    <span>Ressources & Liens Complémentaires ({resources.length})</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-400 mt-1">
                    Liens vers des documents Notion, PDF, Google Drive ou templates
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {resources.length === 0 ? (
                <p className="text-xs text-neutral-500 py-3 text-center">
                  Aucune ressource associée à cette leçon.
                </p>
              ) : (
                <div className="space-y-2">
                  {resources.map((res) => {
                    const deleteResourceWithIds = deleteResource.bind(
                      null,
                      res.id,
                      lessonId
                    );
                    return (
                      <div
                        key={res.id}
                        className="p-3 rounded-lg bg-[#0A0A0A] border border-white/5 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#39FF14]/10 text-[#39FF14] uppercase shrink-0">
                            {res.type || 'Lien'}
                          </span>
                          <span className="text-xs font-medium text-white truncate">
                            {res.title}
                          </span>
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-500 hover:text-[#39FF14] transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <form action={deleteResourceWithIds}>
                          <button
                            type="submit"
                            className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                            title="Supprimer la ressource"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Resource Form */}
              <div className="pt-3 border-t border-white/5">
                <form action={createResourceWithLessonId} className="space-y-3">
                  <div className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-[#39FF14]" />
                    <span>Ajouter une ressource URL</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      name="title"
                      placeholder="Titre (ex: Template Notion)"
                      required
                      className="bg-[#0A0A0A] border-white/10 text-white text-xs h-8"
                    />
                    <Input
                      name="url"
                      placeholder="https://..."
                      type="url"
                      required
                      className="bg-[#0A0A0A] border-white/10 text-white text-xs h-8"
                    />
                    <div className="flex gap-2">
                      <Input
                        name="type"
                        placeholder="Type (ex: Notion, PDF)"
                        defaultValue="Lien"
                        className="bg-[#0A0A0A] border-white/10 text-white text-xs h-8"
                      />
                      <Button
                        type="submit"
                        className="bg-[#39FF14] text-black font-semibold hover:bg-[#39FF14]/90 text-xs h-8 px-3 shrink-0"
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Edit Lesson Form */}
        <div>
          <Card className="bg-[#141414] border-white/5 sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm text-white">Paramètres de la leçon</CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Modifier l'URL vidéo, l'ordre et le statut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateLessonWithId} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Titre de la leçon *
                  </label>
                  <Input
                    name="title"
                    defaultValue={lesson.title}
                    required
                    className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    URL Vidéo YouTube *
                  </label>
                  <Input
                    name="video_url"
                    defaultValue={lesson.video_url}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                    className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">
                      Durée estimée
                    </label>
                    <Input
                      name="duration"
                      defaultValue={lesson.duration || ''}
                      placeholder="ex: 18 min"
                      className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">
                      Position
                    </label>
                    <Input
                      name="position"
                      type="number"
                      defaultValue={lesson.position}
                      className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Description / Notes
                  </label>
                  <Textarea
                    name="description"
                    defaultValue={lesson.description || ''}
                    rows={4}
                    className="bg-[#0A0A0A] border-white/10 text-white text-xs resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="lesson_pub_check"
                    name="published"
                    defaultChecked={lesson.published}
                    className="w-4 h-4 rounded bg-[#0A0A0A] border-white/20 text-[#39FF14] accent-[#39FF14]"
                  />
                  <label htmlFor="lesson_pub_check" className="text-xs font-medium text-neutral-300 cursor-pointer">
                    Leçon publiée (visible par les membres)
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="outline"
                  className="w-full border-white/10 hover:bg-white/5 text-white font-medium text-xs h-9"
                >
                  Enregistrer les modifications
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
