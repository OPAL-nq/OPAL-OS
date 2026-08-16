'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Checks if current user is admin, throws if not.
 */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Non authentifié');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    throw new Error('Action non autorisée');
  }

  return { supabase, user };
}

// ----------------------------------------------------
// MODULE ACTIONS
// ----------------------------------------------------

export async function createModule(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const position = parseInt((formData.get('position') as string) || '0', 10);
  const published = formData.get('published') === 'on' || formData.get('published') === 'true';

  if (!title) {
    throw new Error('Le titre du module est requis');
  }

  const { data, error } = await supabase
    .from('modules')
    .insert({
      title,
      description,
      position,
      published,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/academy');
  revalidatePath('/academy');
  redirect(`/admin/academy/modules/${data.id}`);
}

export async function updateModule(moduleId: string, formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const position = parseInt((formData.get('position') as string) || '0', 10);
  const published = formData.get('published') === 'on' || formData.get('published') === 'true';

  if (!title) {
    throw new Error('Le titre du module est requis');
  }

  const { error } = await supabase
    .from('modules')
    .update({
      title,
      description,
      position,
      published,
      updated_at: new Date().toISOString(),
    })
    .eq('id', moduleId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/academy');
  revalidatePath(`/admin/academy/modules/${moduleId}`);
  revalidatePath('/academy');
}

export async function deleteModule(moduleId: string): Promise<void> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from('modules').delete().eq('id', moduleId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/academy');
  revalidatePath('/academy');
  redirect('/admin/academy');
}

// ----------------------------------------------------
// LESSON ACTIONS
// ----------------------------------------------------

export async function createLesson(moduleId: string, formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const videoUrl = (formData.get('video_url') as string)?.trim() || '';
  const duration = (formData.get('duration') as string)?.trim() || null;
  const position = parseInt((formData.get('position') as string) || '0', 10);
  const published = formData.get('published') === 'on' || formData.get('published') === 'true';

  if (!title) {
    throw new Error('Le titre de la leçon est requis');
  }

  const { data, error } = await supabase
    .from('lessons')
    .insert({
      module_id: moduleId,
      title,
      description,
      video_url: videoUrl,
      video_provider: 'youtube',
      duration,
      position,
      published,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/academy/modules/${moduleId}`);
  revalidatePath('/academy');
  redirect(`/admin/academy/lessons/${data.id}`);
}

export async function updateLesson(lessonId: string, formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const videoUrl = (formData.get('video_url') as string)?.trim() || '';
  const duration = (formData.get('duration') as string)?.trim() || null;
  const position = parseInt((formData.get('position') as string) || '0', 10);
  const published = formData.get('published') === 'on' || formData.get('published') === 'true';

  if (!title) {
    throw new Error('Le titre de la leçon est requis');
  }

  const { data: lesson, error } = await supabase
    .from('lessons')
    .update({
      title,
      description,
      video_url: videoUrl,
      duration,
      position,
      published,
      updated_at: new Date().toISOString(),
    })
    .eq('id', lessonId)
    .select('module_id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  if (lesson) {
    revalidatePath(`/admin/academy/modules/${lesson.module_id}`);
    revalidatePath(`/academy/${lesson.module_id}/${lessonId}`);
  }
  revalidatePath('/academy');
}

export async function deleteLesson(lessonId: string, moduleId: string): Promise<void> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from('lessons').delete().eq('id', lessonId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/academy/modules/${moduleId}`);
  revalidatePath('/academy');
  redirect(`/admin/academy/modules/${moduleId}`);
}

// ----------------------------------------------------
// RESOURCE ACTIONS
// ----------------------------------------------------

export async function createResource(lessonId: string, formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const title = (formData.get('title') as string)?.trim();
  const url = (formData.get('url') as string)?.trim();
  const type = (formData.get('type') as string)?.trim() || 'Lien';
  const position = parseInt((formData.get('position') as string) || '0', 10);

  if (!title || !url) {
    throw new Error('Le titre et l\'URL sont obligatoires');
  }

  const { error } = await supabase.from('lesson_resources').insert({
    lesson_id: lessonId,
    title,
    url,
    type,
    position,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  revalidatePath('/academy');
}

export async function deleteResource(resourceId: string, lessonId: string): Promise<void> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from('lesson_resources')
    .delete()
    .eq('id', resourceId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  revalidatePath('/academy');
}
