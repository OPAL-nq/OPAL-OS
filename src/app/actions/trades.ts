'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createTrade(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Non authentifié');
  }

  const trade_date = formData.get('trade_date')?.toString() || new Date().toISOString();
  const instrument = formData.get('instrument')?.toString() || 'NQ';
  const direction = formData.get('direction')?.toString() || 'Long';
  const entry_price = formData.get('entry_price') ? Number(formData.get('entry_price')) : null;
  const stop_loss = formData.get('stop_loss') ? Number(formData.get('stop_loss')) : null;
  const take_profit = formData.get('take_profit') ? Number(formData.get('take_profit')) : null;
  const stop_loss_ticks = formData.get('stop_loss_ticks') ? Number(formData.get('stop_loss_ticks')) : null;
  const take_profit_ticks = formData.get('take_profit_ticks') ? Number(formData.get('take_profit_ticks')) : null;
  const risk_dollars = formData.get('risk_dollars') ? Number(formData.get('risk_dollars')) : 0;
  const pnl_dollars = formData.get('pnl_dollars') ? Number(formData.get('pnl_dollars')) : 0;
  const pnl_r = formData.get('pnl_r') ? Number(formData.get('pnl_r')) : 0;
  const screenshot_url = formData.get('screenshot_url')?.toString() || null;
  const plan_followed = formData.get('plan_followed') === 'true';
  const mistakes = formData.get('mistakes')?.toString() || null;
  const notes = formData.get('notes')?.toString() || null;
  const market_context = formData.get('market_context')?.toString() || null;
  const workspace_session_id = formData.get('workspace_session_id')?.toString() || null;

  const { error } = await supabase
    .from('trades')
    .insert({
      user_id: user.id,
      trade_date,
      instrument,
      direction,
      entry_price,
      stop_loss,
      take_profit,
      stop_loss_ticks,
      take_profit_ticks,
      risk_dollars,
      pnl_dollars,
      pnl_r,
      screenshot_url,
      plan_followed,
      mistakes,
      notes,
      market_context,
      workspace_session_id: workspace_session_id || null,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/trading');
  revalidatePath('/dashboard');
  redirect('/trading');
}

export async function deleteTrade(tradeId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Non authentifié');
  }

  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', tradeId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/trading');
  revalidatePath('/dashboard');
}
