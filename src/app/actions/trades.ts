'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { InstrumentType, TradeDirection } from '@/types/trading';

export interface BatchTradeInput {
  trade_date: string;
  instrument: InstrumentType;
  direction: TradeDirection;
  entry_price?: number | null;
  stop_loss?: number | null;
  take_profit?: number | null;
  stop_loss_ticks?: number | null;
  take_profit_ticks?: number | null;
  risk_dollars: number;
  pnl_dollars: number;
  pnl_r: number;
  screenshot_url?: string | null;
  plan_followed: boolean;
  emotional_state?: 'calm' | 'fomo' | 'revenge' | 'fatigued' | null;
  plan_compliance?: 'full' | 'minor_deviation' | 'off_plan' | null;
  stop_discipline?: 'respected' | 'moved_early' | 'widened_or_removed' | null;
  mistakes?: string | null;
  notes?: string | null;
  market_context?: string | null;
  workspace_session_id?: string | null;
}

export async function createTrade(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Non authentifié');
  }

  const trade_date = formData.get('trade_date')?.toString() || new Date().toISOString();
  const instrument = (formData.get('instrument')?.toString() || 'NQ') as InstrumentType;
  const direction = (formData.get('direction')?.toString() || 'Long') as TradeDirection;
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
  const emotional_state = formData.get('emotional_state')?.toString() || null;
  const plan_compliance = formData.get('plan_compliance')?.toString() || (plan_followed ? 'full' : 'off_plan');
  const stop_discipline = formData.get('stop_discipline')?.toString() || 'respected';
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
      emotional_state,
      plan_compliance,
      stop_discipline,
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

export async function batchCreateTrades(trades: BatchTradeInput[]): Promise<{ success: boolean; count: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Non authentifié');
  }

  if (!trades || trades.length === 0) {
    return { success: true, count: 0 };
  }

  const payload = trades.map((t) => ({
    user_id: user.id,
    trade_date: t.trade_date,
    instrument: t.instrument,
    direction: t.direction,
    entry_price: t.entry_price ?? null,
    stop_loss: t.stop_loss ?? null,
    take_profit: t.take_profit ?? null,
    stop_loss_ticks: t.stop_loss_ticks ?? null,
    take_profit_ticks: t.take_profit_ticks ?? null,
    risk_dollars: t.risk_dollars || 0,
    pnl_dollars: t.pnl_dollars || 0,
    pnl_r: t.pnl_r || 0,
    screenshot_url: t.screenshot_url ?? null,
    plan_followed: t.plan_followed ?? true,
    emotional_state: t.emotional_state ?? null,
    plan_compliance: t.plan_compliance ?? (t.plan_followed !== false ? 'full' : 'off_plan'),
    stop_discipline: t.stop_discipline ?? 'respected',
    mistakes: t.mistakes ?? null,
    notes: t.notes ?? null,
    market_context: t.market_context ?? null,
    workspace_session_id: t.workspace_session_id || null,
  }));

  const { error } = await supabase.from('trades').insert(payload);

  if (error) {
    throw new Error('Erreur lors de l’enregistrement des trades : ' + error.message);
  }

  revalidatePath('/trading');
  revalidatePath('/dashboard');
  return { success: true, count: payload.length };
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
