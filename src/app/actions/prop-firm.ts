'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { PropFirmAccount, PropFirmName, PropFirmAccountStatus } from '@/types/prop-firm';

export interface CreatePropFirmAccountInput {
  accountName: string;
  firmName: PropFirmName;
  accountTier: string;
  startingBalance: number;
  currentBalance?: number;
  highWaterMark?: number;
  drawdownLimit: number;
  maxDailyLoss?: number | null;
  consistencyRulePct?: number | null;
  profitTarget?: number | null;
  isTrailingEod?: boolean;
  notes?: string | null;
}

export interface UpdatePropFirmAccountInput {
  accountName?: string;
  firmName?: PropFirmName;
  accountTier?: string;
  startingBalance?: number;
  currentBalance?: number;
  highWaterMark?: number;
  drawdownLimit?: number;
  maxDailyLoss?: number | null;
  consistencyRulePct?: number | null;
  profitTarget?: number | null;
  isTrailingEod?: boolean;
  status?: PropFirmAccountStatus;
  notes?: string | null;
  isActive?: boolean;
}

/**
 * Creates a new Prop Firm account profile for the current authenticated user.
 */
export async function createPropFirmAccount(input: CreatePropFirmAccountInput): Promise<PropFirmAccount> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Non authentifié.');
  }

  const currentBal = input.currentBalance !== undefined ? input.currentBalance : input.startingBalance;
  const hwm = input.highWaterMark !== undefined ? Math.max(input.highWaterMark, currentBal) : Math.max(input.startingBalance, currentBal);

  const { data, error } = await supabase
    .from('prop_firm_accounts')
    .insert({
      user_id: user.id,
      account_name: input.accountName.trim(),
      firm_name: input.firmName,
      account_tier: input.accountTier,
      starting_balance: input.startingBalance,
      current_balance: currentBal,
      high_water_mark: hwm,
      drawdown_limit: input.drawdownLimit,
      max_daily_loss: input.maxDailyLoss ?? null,
      consistency_rule_pct: input.consistencyRulePct ?? null,
      profit_target: input.profitTarget ?? null,
      is_trailing_eod: input.isTrailingEod ?? false,
      is_active: true,
      status: 'active',
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating prop firm account:', error);
    throw new Error(error.message || 'Impossible de créer le compte Prop Firm.');
  }

  revalidatePath('/trading');
  revalidatePath('/trading/prop-firm-guardian');

  return data as PropFirmAccount;
}

/**
 * Updates an existing Prop Firm account.
 */
export async function updatePropFirmAccount(
  accountId: string,
  input: UpdatePropFirmAccountInput
): Promise<PropFirmAccount> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Non authentifié.');
  }

  // Build payload
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (input.accountName !== undefined) updateData.account_name = input.accountName.trim();
  if (input.firmName !== undefined) updateData.firm_name = input.firmName;
  if (input.accountTier !== undefined) updateData.account_tier = input.accountTier;
  if (input.startingBalance !== undefined) updateData.starting_balance = input.startingBalance;
  if (input.drawdownLimit !== undefined) updateData.drawdown_limit = input.drawdownLimit;
  if (input.maxDailyLoss !== undefined) updateData.max_daily_loss = input.maxDailyLoss;
  if (input.consistencyRulePct !== undefined) updateData.consistency_rule_pct = input.consistencyRulePct;
  if (input.profitTarget !== undefined) updateData.profit_target = input.profitTarget;
  if (input.isTrailingEod !== undefined) updateData.is_trailing_eod = input.isTrailingEod;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.notes !== undefined) updateData.notes = input.notes;
  if (input.isActive !== undefined) updateData.is_active = input.isActive;

  if (input.currentBalance !== undefined) {
    updateData.current_balance = input.currentBalance;
    if (input.highWaterMark !== undefined) {
      updateData.high_water_mark = Math.max(input.highWaterMark, input.currentBalance);
    } else {
      // Auto adjust HWM if new balance is higher
      const { data: existing } = await supabase
        .from('prop_firm_accounts')
        .select('high_water_mark')
        .eq('id', accountId)
        .single();

      if (existing) {
        updateData.high_water_mark = Math.max(Number(existing.high_water_mark) || 0, input.currentBalance);
      }
    }
  } else if (input.highWaterMark !== undefined) {
    updateData.high_water_mark = input.highWaterMark;
  }

  const { data, error } = await supabase
    .from('prop_firm_accounts')
    .update(updateData)
    .eq('id', accountId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating prop firm account:', error);
    throw new Error(error.message || 'Impossible de mettre à jour le compte.');
  }

  revalidatePath('/trading');
  revalidatePath('/trading/prop-firm-guardian');

  return data as PropFirmAccount;
}

/**
 * Quick balance update (e.g. after a trading day).
 */
export async function quickUpdateAccountBalance(
  accountId: string,
  newBalance: number
): Promise<PropFirmAccount> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Non authentifié.');
  }

  // Fetch current account to compare HWM
  const { data: existing, error: fetchErr } = await supabase
    .from('prop_firm_accounts')
    .select('*')
    .eq('id', accountId)
    .eq('user_id', user.id)
    .single();

  if (fetchErr || !existing) {
    throw new Error('Compte introuvable.');
  }

  const updatedHwm = Math.max(Number(existing.high_water_mark) || Number(existing.starting_balance), newBalance);

  // Check if blown or passed
  let newStatus: PropFirmAccountStatus = existing.status;
  const startingBal = Number(existing.starting_balance);
  const drawdownLimit = Number(existing.drawdown_limit);
  const profitTarget = existing.profit_target ? Number(existing.profit_target) : null;
  const liquidationThreshold = updatedHwm - drawdownLimit;

  if (newBalance <= liquidationThreshold) {
    newStatus = 'blown';
  } else if (profitTarget && newBalance >= startingBal + profitTarget) {
    newStatus = 'passed';
  } else if (existing.status === 'blown' && newBalance > liquidationThreshold) {
    newStatus = 'active';
  }

  const { data, error } = await supabase
    .from('prop_firm_accounts')
    .update({
      current_balance: newBalance,
      high_water_mark: updatedHwm,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', accountId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Impossible de mettre à jour le solde.');
  }

  revalidatePath('/trading');
  revalidatePath('/trading/prop-firm-guardian');

  return data as PropFirmAccount;
}

/**
 * Deletes a Prop Firm account.
 */
export async function deletePropFirmAccount(accountId: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Non authentifié.');
  }

  const { error } = await supabase
    .from('prop_firm_accounts')
    .delete()
    .eq('id', accountId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message || 'Impossible de supprimer le compte.');
  }

  revalidatePath('/trading');
  revalidatePath('/trading/prop-firm-guardian');
}
