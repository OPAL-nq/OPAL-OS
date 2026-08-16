import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { createModule } from '@/app/actions/admin-academy';
import {
  GraduationCap,
  Plus,
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import type { Module } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminAcademyPage() {
  const supabase = await createClient();

  // Fetch all modules with count of lessons
  const { data: modulesData } = await supabase
    .from('modules')
    .select('*, lessons(id)')
    .order('position', { ascending: true });

  const modules = (modulesData || []) as (Module & { lessons: { id: string }[] })[];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-semibold uppercase tracking-wider mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Gestion de la formation</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Admin Academy
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Créez, ordonnez et publiez vos modules et leçons sans modifier le code
          </p>
        </div>

        <Button asChild variant="outline" className="border-white/10 text-xs gap-1.5 h-9">
          <Link href="/academy" target="_blank">
            <Eye className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>Voir l'espace membre</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Modules List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#39FF14]" />
              <span>Modules de formation ({modules.length})</span>
            </h2>
          </div>

          {modules.length === 0 ? (
            <Card className="bg-[#141414] border-white/5 p-8 text-center">
              <BookOpen className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-white">Aucun module créé</p>
              <p className="text-xs text-neutral-400 mt-1">
                Utilisez le formulaire à droite pour créer votre premier module.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {modules.map((mod) => (
                <Card
                  key={mod.id}
                  className="bg-[#141414] border-white/5 hover:border-white/10 transition-all"
                >
                  <CardContent className="p-5 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#0A0A0A] border border-white/10 flex items-center justify-center text-xs font-bold text-[#39FF14] shrink-0">
                        #{mod.position}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-sm font-semibold text-white">{mod.title}</h3>
                          {mod.published ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20">
                              <Eye className="w-3 h-3" />
                              <span>Publié</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">
                              <EyeOff className="w-3 h-3" />
                              <span>Brouillon</span>
                            </span>
                          )}
                        </div>
                        {mod.description && (
                          <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                            {mod.description}
                          </p>
                        )}
                        <span className="text-[11px] text-neutral-500 mt-1 block">
                          {mod.lessons?.length || 0} leçon(s)
                        </span>
                      </div>
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      className="border-white/10 hover:bg-white/5 text-xs gap-1.5 h-8 shrink-0"
                    >
                      <Link href={`/admin/academy/modules/${mod.id}`}>
                        <span>Gérer</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#39FF14]" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Create New Module Form */}
        <div>
          <Card className="bg-[#141414] border-white/5 sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#39FF14]" />
                <span>Nouveau Module</span>
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Ajoutez un module au cursus OPAL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createModule} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Titre du module *
                  </label>
                  <Input
                    name="title"
                    placeholder="ex: Module 0 — Fondations & Framework"
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
                    placeholder="Présentation des objectifs du module..."
                    rows={3}
                    className="bg-[#0A0A0A] border-white/10 text-white text-xs resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">
                      Position (Ordre)
                    </label>
                    <Input
                      name="position"
                      type="number"
                      defaultValue={modules.length}
                      className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="published"
                      name="published"
                      defaultChecked
                      className="w-4 h-4 rounded bg-[#0A0A0A] border-white/20 text-[#39FF14] accent-[#39FF14]"
                    />
                    <label htmlFor="published" className="text-xs font-medium text-neutral-300 cursor-pointer">
                      Publier
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#39FF14] text-black font-semibold hover:bg-[#39FF14]/90 shadow-[0_0_15px_rgba(57,255,20,0.2)] text-xs h-9 mt-2"
                >
                  Créer le module
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
