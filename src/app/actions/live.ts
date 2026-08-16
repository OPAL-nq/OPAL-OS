'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { LiveType, LiveStatus, LiveSession, LiveReplay } from '@/types/live';

/**
 * Ensures the requesting user is an Admin
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
    throw new Error('Action non autorisée. Réservé aux administrateurs.');
  }

  return { supabase, user };
}

// ==========================================
// LIVE SESSIONS (ADMIN)
// ==========================================

export async function createLive(data: {
  title: string;
  description?: string;
  type: LiveType;
  scheduled_at: string;
  stream_url?: string;
  status?: LiveStatus;
  published?: boolean;
}) {
  const { supabase } = await requireAdmin();

  if (!data.title?.trim()) {
    throw new Error('Le titre est requis');
  }

  const { data: newLive, error } = await supabase
    .from('lives')
    .insert({
      title: data.title.trim(),
      description: data.description?.trim() || null,
      type: data.type || 'live_trading',
      scheduled_at: data.scheduled_at,
      stream_url: data.stream_url?.trim() || null,
      status: data.status || 'scheduled',
      published: data.published ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating live:', error);
    throw new Error(error.message);
  }

  revalidatePath('/live');
  revalidatePath('/dashboard');
  revalidatePath('/admin/live');

  return newLive as LiveSession;
}

export async function updateLive(
  id: string,
  data: {
    title?: string;
    description?: string | null;
    type?: LiveType;
    scheduled_at?: string;
    stream_url?: string | null;
    status?: LiveStatus;
    published?: boolean;
  }
) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from('lives')
    .update({
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.description !== undefined && { description: data.description?.trim() || null }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.scheduled_at !== undefined && { scheduled_at: data.scheduled_at }),
      ...(data.stream_url !== undefined && { stream_url: data.stream_url?.trim() || null }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.published !== undefined && { published: data.published }),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating live:', error);
    throw new Error(error.message);
  }

  revalidatePath('/live');
  revalidatePath(`/live/${id}`);
  revalidatePath('/dashboard');
  revalidatePath('/admin/live');

  return { success: true };
}

export async function deleteLive(id: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from('lives').delete().eq('id', id);

  if (error) {
    console.error('Error deleting live:', error);
    throw new Error(error.message);
  }

  revalidatePath('/live');
  revalidatePath('/dashboard');
  revalidatePath('/admin/live');

  return { success: true };
}

export async function togglePublishLive(id: string, published: boolean) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from('lives')
    .update({ published })
    .eq('id', id);

  if (error) {
    console.error('Error toggling live publish:', error);
    throw new Error(error.message);
  }

  revalidatePath('/live');
  revalidatePath(`/live/${id}`);
  revalidatePath('/dashboard');
  revalidatePath('/admin/live');

  return { success: true };
}

// ==========================================
// LIVE REPLAYS (ADMIN)
// ==========================================

export async function createReplay(data: {
  live_id: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  published?: boolean;
}) {
  const { supabase } = await requireAdmin();

  if (!data.title?.trim()) {
    throw new Error('Le titre du replay est requis');
  }
  if (!data.video_url?.trim()) {
    throw new Error("L'URL vidéo du replay est requise");
  }

  const { data: newReplay, error } = await supabase
    .from('live_replays')
    .insert({
      live_id: data.live_id,
      title: data.title.trim(),
      video_url: data.video_url.trim(),
      thumbnail_url: data.thumbnail_url?.trim() || null,
      duration_seconds: data.duration_seconds || 0,
      published: data.published ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating replay:', error);
    throw new Error(error.message);
  }

  revalidatePath('/live/replays');
  revalidatePath('/admin/live');

  return newReplay as LiveReplay;
}

export async function updateReplay(
  id: string,
  data: {
    title?: string;
    video_url?: string;
    thumbnail_url?: string | null;
    duration_seconds?: number;
    published?: boolean;
  }
) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from('live_replays')
    .update({
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.video_url !== undefined && { video_url: data.video_url.trim() }),
      ...(data.thumbnail_url !== undefined && { thumbnail_url: data.thumbnail_url?.trim() || null }),
      ...(data.duration_seconds !== undefined && { duration_seconds: data.duration_seconds }),
      ...(data.published !== undefined && { published: data.published }),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating replay:', error);
    throw new Error(error.message);
  }

  revalidatePath('/live/replays');
  revalidatePath('/admin/live');

  return { success: true };
}

export async function deleteReplay(id: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from('live_replays').delete().eq('id', id);

  if (error) {
    console.error('Error deleting replay:', error);
    throw new Error(error.message);
  }

  revalidatePath('/live/replays');
  revalidatePath('/admin/live');

  return { success: true };
}
