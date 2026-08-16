'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createWorkspaceSession(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Non authentifié');
  }

  const session_date = formData.get('session_date')?.toString() || new Date().toISOString().split('T')[0];
  const instrument = formData.get('instrument')?.toString() || 'NQ';
  const bias = formData.get('bias')?.toString() || 'Neutral';
  const key_levels = formData.get('key_levels')?.toString() || null;
  const market_context = formData.get('market_context')?.toString() || null;
  const primary_scenario = formData.get('primary_scenario')?.toString() || null;
  const alternative_scenario = formData.get('alternative_scenario')?.toString() || null;
  const execution_conditions = formData.get('execution_conditions')?.toString() || null;
  const invalidation_conditions = formData.get('invalidation_conditions')?.toString() || null;
  const risk_management = formData.get('risk_management')?.toString() || null;
  const mindset = formData.get('mindset')?.toString() || null;
  const decision = formData.get('decision')?.toString() || 'WAIT';

  const { data, error } = await supabase
    .from('workspace_sessions')
    .insert({
      user_id: user.id,
      session_date,
      instrument,
      bias,
      key_levels,
      market_context,
      primary_scenario,
      alternative_scenario,
      execution_conditions,
      invalidation_conditions,
      risk_management,
      mindset,
      decision,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/trading');
  revalidatePath('/dashboard');
  redirect('/trading');
}

export async function updateWorkspaceSession(sessionId: string, formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Non authentifié');
  }

  const session_date = formData.get('session_date')?.toString() || new Date().toISOString().split('T')[0];
  const instrument = formData.get('instrument')?.toString() || 'NQ';
  const bias = formData.get('bias')?.toString() || 'Neutral';
  const key_levels = formData.get('key_levels')?.toString() || null;
  const market_context = formData.get('market_context')?.toString() || null;
  const primary_scenario = formData.get('primary_scenario')?.toString() || null;
  const alternative_scenario = formData.get('alternative_scenario')?.toString() || null;
  const execution_conditions = formData.get('execution_conditions')?.toString() || null;
  const invalidation_conditions = formData.get('invalidation_conditions')?.toString() || null;
  const risk_management = formData.get('risk_management')?.toString() || null;
  const mindset = formData.get('mindset')?.toString() || null;
  const decision = formData.get('decision')?.toString() || 'WAIT';

  const { error } = await supabase
    .from('workspace_sessions')
    .update({
      session_date,
      instrument,
      bias,
      key_levels,
      market_context,
      primary_scenario,
      alternative_scenario,
      execution_conditions,
      invalidation_conditions,
      risk_management,
      mindset,
      decision,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/trading');
  revalidatePath(`/trading/workspace/${sessionId}`);
  redirect('/trading');
}

export async function deleteWorkspaceSession(sessionId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Non authentifié');
  }

  const { error } = await supabase
    .from('workspace_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/trading');
  revalidatePath('/dashboard');
}
