'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  CoachingSession,
  CoachingReport,
  IntensiveObjective,
  IntensiveFollowUp,
  Profile,
} from '@/types';

// ==========================================
// 1. AUTH & PERMISSION HELPERS
// ==========================================

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Non authentifié.');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { supabase, user, profile: profile as Profile | null };
}

async function requireAdmin() {
  const { supabase, user, profile } = await requireAuth();
  if (profile?.role !== 'admin') {
    throw new Error('Action réservée aux administrateurs.');
  }
  return { supabase, user, profile };
}

async function requireIntensiveOrAdmin() {
  const { supabase, user, profile } = await requireAuth();
  if (profile?.role !== 'admin' && profile?.plan !== 'intensive') {
    throw new Error('Accès réservé aux membres OPAL Intensive.');
  }
  return { supabase, user, profile };
}

// Notification helper
async function notifyClient(
  supabase: any,
  clientId: string,
  title: string,
  message: string,
  link: string
) {
  try {
    await supabase.from('notifications').insert({
      user_id: clientId,
      title,
      message,
      link,
      type: 'intensive',
      read: false,
    });
  } catch (err) {
    console.error('Erreur création notification intensive:', err);
  }
}

// ==========================================
// 2. COACHING SESSIONS (ADMIN)
// ==========================================

export async function createCoachingSession(data: {
  clientId: string;
  scheduledAt: string;
  durationMinutes?: number;
  type?: 'private' | 'group';
  notes?: string;
}) {
  const { supabase } = await requireAdmin();

  if (!data.clientId || !data.scheduledAt) {
    throw new Error('Paramètres clientId et scheduledAt requis.');
  }

  const { data: session, error } = await supabase
    .from('coaching_sessions')
    .insert({
      client_id: data.clientId,
      scheduled_at: data.scheduledAt,
      duration_minutes: data.durationMinutes || 60,
      type: data.type || 'private',
      status: 'scheduled',
      notes: data.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Erreur createCoachingSession:', error);
    throw new Error(error.message || 'Impossible de planifier le coaching.');
  }

  // Notification
  const formattedDate = new Date(data.scheduledAt).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  await notifyClient(
    supabase,
    data.clientId,
    'Nouveau coaching planifié 🎯',
    `Un coaching privé avec Maxym est planifié le ${formattedDate}.`,
    '/intensive/coaching'
  );

  revalidatePath('/intensive');
  revalidatePath('/intensive/coaching');
  revalidatePath('/admin/intensive');
  revalidatePath(`/admin/intensive/${data.clientId}`);

  return { success: true, session };
}

export async function updateCoachingSession(
  sessionId: string,
  data: {
    scheduledAt?: string;
    durationMinutes?: number;
    status?: 'scheduled' | 'completed' | 'cancelled';
    type?: 'private' | 'group';
    notes?: string;
  }
) {
  const { supabase } = await requireAdmin();

  const { data: existingSession, error: fetchErr } = await supabase
    .from('coaching_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (fetchErr || !existingSession) {
    throw new Error('Séance introuvable.');
  }

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (data.scheduledAt !== undefined) updatePayload.scheduled_at = data.scheduledAt;
  if (data.durationMinutes !== undefined) updatePayload.duration_minutes = data.durationMinutes;
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.type !== undefined) updatePayload.type = data.type;
  if (data.notes !== undefined) updatePayload.notes = data.notes.trim() || null;

  const { data: updated, error } = await supabase
    .from('coaching_sessions')
    .update(updatePayload)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Erreur updateCoachingSession:', error);
    throw new Error(error.message || 'Impossible de mettre à jour la séance.');
  }

  if (data.scheduledAt || data.status) {
    await notifyClient(
      supabase,
      existingSession.client_id,
      'Coaching mis à jour 📅',
      `Les détails de votre séance de coaching ont été mis à jour par Maxym.`,
      '/intensive/coaching'
    );
  }

  revalidatePath('/intensive');
  revalidatePath('/intensive/coaching');
  revalidatePath('/admin/intensive');
  revalidatePath(`/admin/intensive/${existingSession.client_id}`);

  return { success: true, session: updated };
}

export async function completeCoachingSession(sessionId: string) {
  return updateCoachingSession(sessionId, { status: 'completed' });
}

export async function deleteCoachingSession(sessionId: string) {
  const { supabase } = await requireAdmin();

  const { data: session } = await supabase
    .from('coaching_sessions')
    .select('client_id')
    .eq('id', sessionId)
    .single();

  const { error } = await supabase
    .from('coaching_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Erreur deleteCoachingSession:', error);
    throw new Error('Impossible de supprimer la séance.');
  }

  revalidatePath('/intensive');
  revalidatePath('/intensive/coaching');
  revalidatePath('/admin/intensive');
  if (session?.client_id) {
    revalidatePath(`/admin/intensive/${session.client_id}`);
  }

  return { success: true };
}

// ==========================================
// 3. COACHING REPORTS (ADMIN)
// ==========================================

export async function createCoachingReport(data: {
  sessionId: string;
  clientId: string;
  keyPoints?: string;
  workAssigned?: string;
  nextSteps?: string;
}) {
  const { supabase } = await requireAdmin();

  if (!data.sessionId || !data.clientId) {
    throw new Error('Paramètres sessionId et clientId requis.');
  }

  const { data: report, error } = await supabase
    .from('coaching_reports')
    .insert({
      session_id: data.sessionId,
      client_id: data.clientId,
      key_points: data.keyPoints?.trim() || null,
      work_assigned: data.workAssigned?.trim() || null,
      next_steps: data.nextSteps?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Erreur createCoachingReport:', error);
    throw new Error(error.message || 'Impossible de créer le compte rendu.');
  }

  // Also mark session as completed if it wasn't
  await supabase
    .from('coaching_sessions')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', data.sessionId);

  // Notify client
  await notifyClient(
    supabase,
    data.clientId,
    'Nouveau compte rendu de coaching 📝',
    'Maxym a publié le compte rendu de votre dernière séance de coaching.',
    '/intensive/reports'
  );

  revalidatePath('/intensive');
  revalidatePath('/intensive/reports');
  revalidatePath('/admin/intensive');
  revalidatePath(`/admin/intensive/${data.clientId}`);

  return { success: true, report };
}

export async function updateCoachingReport(
  reportId: string,
  data: {
    keyPoints?: string;
    workAssigned?: string;
    nextSteps?: string;
  }
) {
  const { supabase } = await requireAdmin();

  const { data: existingReport, error: fetchErr } = await supabase
    .from('coaching_reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (fetchErr || !existingReport) {
    throw new Error('Compte rendu introuvable.');
  }

  const updatePayload: Record<string, any> = {};
  if (data.keyPoints !== undefined) updatePayload.key_points = data.keyPoints.trim() || null;
  if (data.workAssigned !== undefined) updatePayload.work_assigned = data.workAssigned.trim() || null;
  if (data.nextSteps !== undefined) updatePayload.next_steps = data.nextSteps.trim() || null;

  const { data: updated, error } = await supabase
    .from('coaching_reports')
    .update(updatePayload)
    .eq('id', reportId)
    .select()
    .single();

  if (error) {
    console.error('Erreur updateCoachingReport:', error);
    throw new Error('Impossible de modifier le compte rendu.');
  }

  revalidatePath('/intensive');
  revalidatePath('/intensive/reports');
  revalidatePath(`/admin/intensive/${existingReport.client_id}`);

  return { success: true, report: updated };
}

export async function deleteCoachingReport(reportId: string) {
  const { supabase } = await requireAdmin();

  const { data: report } = await supabase
    .from('coaching_reports')
    .select('client_id')
    .eq('id', reportId)
    .single();

  const { error } = await supabase
    .from('coaching_reports')
    .delete()
    .eq('id', reportId);

  if (error) {
    console.error('Erreur deleteCoachingReport:', error);
    throw new Error('Impossible de supprimer le compte rendu.');
  }

  revalidatePath('/intensive');
  revalidatePath('/intensive/reports');
  if (report?.client_id) {
    revalidatePath(`/admin/intensive/${report.client_id}`);
  }

  return { success: true };
}

// ==========================================
// 4. INTENSIVE OBJECTIVES (ADMIN)
// ==========================================

export async function createObjective(data: {
  userId: string;
  title: string;
  description?: string;
  status?: 'active' | 'completed' | 'paused';
  position?: number;
}) {
  const { supabase } = await requireAdmin();

  if (!data.userId || !data.title?.trim()) {
    throw new Error('Paramètres userId et title requis.');
  }

  const { data: objective, error } = await supabase
    .from('intensive_objectives')
    .insert({
      user_id: data.userId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      status: data.status || 'active',
      position: data.position ?? 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Erreur createObjective:', error);
    throw new Error(error.message || "Impossible d'ajouter l'objectif.");
  }

  await notifyClient(
    supabase,
    data.userId,
    'Nouvel objectif d’accompagnement 🎯',
    `Un nouvel objectif a été défini : "${data.title.trim()}".`,
    '/intensive/objectives'
  );

  revalidatePath('/intensive');
  revalidatePath('/intensive/objectives');
  revalidatePath(`/admin/intensive/${data.userId}`);

  return { success: true, objective };
}

export async function updateObjective(
  objectiveId: string,
  data: {
    title?: string;
    description?: string;
    status?: 'active' | 'completed' | 'paused';
    position?: number;
  }
) {
  const { supabase } = await requireAdmin();

  const { data: existing, error: fetchErr } = await supabase
    .from('intensive_objectives')
    .select('*')
    .eq('id', objectiveId)
    .single();

  if (fetchErr || !existing) {
    throw new Error('Objectif introuvable.');
  }

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (data.title !== undefined) updatePayload.title = data.title.trim();
  if (data.description !== undefined) updatePayload.description = data.description.trim() || null;
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.position !== undefined) updatePayload.position = data.position;

  const { data: updated, error } = await supabase
    .from('intensive_objectives')
    .update(updatePayload)
    .eq('id', objectiveId)
    .select()
    .single();

  if (error) {
    console.error('Erreur updateObjective:', error);
    throw new Error(error.message || "Impossible de modifier l'objectif.");
  }

  revalidatePath('/intensive');
  revalidatePath('/intensive/objectives');
  revalidatePath(`/admin/intensive/${existing.user_id}`);

  return { success: true, objective: updated };
}

export async function updateObjectiveStatus(
  objectiveId: string,
  status: 'active' | 'completed' | 'paused'
) {
  return updateObjective(objectiveId, { status });
}

export async function deleteObjective(objectiveId: string) {
  const { supabase } = await requireAdmin();

  const { data: objective } = await supabase
    .from('intensive_objectives')
    .select('user_id')
    .eq('id', objectiveId)
    .single();

  const { error } = await supabase
    .from('intensive_objectives')
    .delete()
    .eq('id', objectiveId);

  if (error) {
    console.error('Erreur deleteObjective:', error);
    throw new Error(error.message || "Impossible de supprimer l'objectif.");
  }

  revalidatePath('/intensive');
  revalidatePath('/intensive/objectives');
  if (objective?.user_id) {
    revalidatePath(`/admin/intensive/${objective.user_id}`);
  }

  return { success: true };
}

// ==========================================
// 5. INTENSIVE FOLLOW UPS (ADMIN)
// ==========================================

export async function upsertFollowUp(data: {
  userId: string;
  currentObjective?: string;
  pointsWorked?: string;
  errorsToFix?: string;
  progression?: string;
  nextStep?: string;
}) {
  const { supabase } = await requireAdmin();

  if (!data.userId) {
    throw new Error('Paramètre userId requis.');
  }

  const payload = {
    user_id: data.userId,
    current_objective: data.currentObjective?.trim() || null,
    points_worked: data.pointsWorked?.trim() || null,
    errors_to_fix: data.errorsToFix?.trim() || null,
    progression: data.progression?.trim() || null,
    next_step: data.nextStep?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data: followUp, error } = await supabase
    .from('intensive_follow_ups')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('Erreur upsertFollowUp:', error);
    throw new Error(error.message || 'Impossible de mettre à jour le suivi.');
  }

  await notifyClient(
    supabase,
    data.userId,
    'Suivi Intensive mis à jour 📊',
    'Maxym a actualisé votre feuille de route et vos points de progression.',
    '/intensive/follow-up'
  );

  revalidatePath('/intensive');
  revalidatePath('/intensive/follow-up');
  revalidatePath(`/admin/intensive/${data.userId}`);

  return { success: true, followUp };
}
