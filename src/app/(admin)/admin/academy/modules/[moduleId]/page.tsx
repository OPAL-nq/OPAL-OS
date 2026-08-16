import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  updateModule,
  deleteModule,
  createLesson,
} from '@/app/actions/admin-academy';
import {
  ArrowLeft,
  Trash2,
  Plus,
  PlayCircle,
  Eye,
  EyeOff,
  Clock,
  ArrowRight,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import type { Module, Lesson } from '@/types';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ moduleId: string }>;
}

export default async function AdminModuleDetailPage({ params }: Props) {
  const { moduleId } = await params;
  const supabase = await createClient();

  const { data: moduleData } = await supabase
    .from('modules')
    .select('*')
    .eq('id', moduleId)
    .single();

  if (!moduleData) {
    notFound();
  }

  const moduleItem = moduleData as Module;

  // Fetch lessons of this module
  const { data: lessonsData } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .order('position', { ascending: true });

  const lessons = (lessonsData || []) as Lesson[];

  const updateModuleWithId = updateModule.bind(null, moduleId);
  const deleteModuleWithId = deleteModule.bind(null, moduleId);
  const createLessonWithModuleId = createLesson.bind(null, moduleId);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Back link */}
      <div>
        <Link
          href="/admin/academy"
          className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-[#39FF14] transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour aux modules</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {moduleItem.title}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Configuration du module et gestion des leçons associées
            </p>
          </div>

          <form action={deleteModuleWithId}>
            <Button
              type="submit"
              variant="outline"
              className="border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs gap-1.5 h-9"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer le module</span>
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Lessons List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-[#39FF14]" />
              <span>Leçons du module ({lessons.length})</span>
            </h2>
          </div>

          {lessons.length === 0 ? (
            <Card className="bg-[#141414] border-white/5 p-8 text-center">
              <Video className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-white">Aucune leçon dans ce module</p>
              <p className="text-xs text-neutral-400 mt-1">
                Remplissez le formulaire ci-dessous pour ajouter votre première leçon vidéo.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <Card
                  key={lesson.id}
                  className="bg-[#141414] border-white/5 hover:border-white/10 transition-all"
                >
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-[#0A0A0A] border border-white/10 flex items-center justify-center text-xs font-bold text-[#39FF14] shrink-0">
                        #{lesson.position}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-white">{lesson.title}</h4>
                          {lesson.published ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#39FF14]/10 text-[#39FF14]">
                              <Eye className="w-2.5 h-2.5" />
                              <span>Publié</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-neutral-500/10 text-neutral-400">
                              <EyeOff className="w-2.5 h-2.5" />
                              <span>Brouillon</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-1">
                          {lesson.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-neutral-400" />
                              <span>{lesson.duration}</span>
                            </span>
                          )}
                          <span className="truncate max-w-xs">{lesson.video_url || 'Pas de vidéo'}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      className="border-white/10 hover:bg-white/5 text-xs gap-1.5 h-8 shrink-0"
                    >
                      <Link href={`/admin/academy/lessons/${lesson.id}`}>
                        <span>Modifier</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#39FF14]" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add Lesson Card */}
          <Card className="bg-[#141414] border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#39FF14]" />
                <span>Ajouter une nouvelle leçon</span>
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Créez une leçon vidéo pour ce module
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createLessonWithModuleId} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Titre de la leçon *
                  </label>
                  <Input
                    name="title"
                    placeholder="ex: Structure de marché & Identification des liquidités"
                    required
                    className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    URL Vidéo YouTube (Non répertoriée) *
                  </label>
                  <Input
                    name="video_url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                    className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">
                      Durée estimée (ex: 22 min)
                    </label>
                    <Input
                      name="duration"
                      placeholder="ex: 15 min"
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
                      defaultValue={lessons.length}
                      className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Description / Notes de la leçon
                  </label>
                  <Textarea
                    name="description"
                    placeholder="Points clés abordés dans cette vidéo..."
                    rows={2}
                    className="bg-[#0A0A0A] border-white/10 text-white text-xs resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="lesson_published"
                      name="published"
                      defaultChecked
                      className="w-4 h-4 rounded bg-[#0A0A0A] border-white/20 text-[#39FF14] accent-[#39FF14]"
                    />
                    <label htmlFor="lesson_published" className="text-xs font-medium text-neutral-300 cursor-pointer">
                      Publier immédiatement
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="bg-[#39FF14] text-black font-semibold hover:bg-[#39FF14]/90 text-xs h-9 px-4"
                  >
                    Créer la leçon
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Edit Module Form */}
        <div>
          <Card className="bg-[#141414] border-white/5 sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm text-white">Paramètres du module</CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Modifier le titre, la description et la visibilité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateModuleWithId} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Titre du module
                  </label>
                  <Input
                    name="title"
                    defaultValue={moduleItem.title}
                    required
                    className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Description
                  </label>
                  <Textarea
                    name="description"
                    defaultValue={moduleItem.description || ''}
                    rows={4}
                    className="bg-[#0A0A0A] border-white/10 text-white text-xs resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">
                      Position
                    </label>
                    <Input
                      name="position"
                      type="number"
                      defaultValue={moduleItem.position}
                      className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="mod_pub"
                      name="published"
                      defaultChecked={moduleItem.published}
                      className="w-4 h-4 rounded bg-[#0A0A0A] border-white/20 text-[#39FF14] accent-[#39FF14]"
                    />
                    <label htmlFor="mod_pub" className="text-xs font-medium text-neutral-300 cursor-pointer">
                      Publié
                    </label>
                  </div>
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
