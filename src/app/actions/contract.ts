'use server';

import { createClient } from '@/utils/supabase/server';
import { ContractDraft, TraderContract } from '@/types/contract';

/**
 * Récupère le contrat actif pour l'utilisateur courant.
 */
export async function getActiveContract(): Promise<{ success: boolean; contract: TraderContract | null; error?: string }> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, contract: null, error: 'Non authentifié' };
    }

    const { data, error } = await supabase
      .from('trader_contracts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('signed_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
      console.error('Error fetching contract:', error);
      return { success: false, contract: null, error: error.message };
    }

    return { success: true, contract: data as TraderContract | null };
  } catch (error: any) {
    console.error('Exception fetching active contract:', error);
    return { success: false, contract: null, error: error.message };
  }
}

/**
 * Crée un nouveau contrat et désactive les précédents.
 */
export async function signNewContract(draft: ContractDraft): Promise<{ success: boolean; contract?: TraderContract; error?: string }> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Non authentifié' };
    }

    // 1. Désactiver les contrats existants
    await supabase
      .from('trader_contracts')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true);

    // 2. Insérer le nouveau contrat
    const { data, error } = await supabase
      .from('trader_contracts')
      .insert([
        {
          user_id: user.id,
          max_daily_loss: draft.max_daily_loss,
          max_trades_per_day: draft.max_trades_per_day,
          allowed_instruments: draft.allowed_instruments,
          allowed_setups: draft.allowed_setups,
          trading_hours_start: draft.trading_hours_start,
          trading_hours_end: draft.trading_hours_end,
          signature_data_url: draft.signature_data_url,
          is_active: true,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting contract:', error);
      return { success: false, error: error.message };
    }

    return { success: true, contract: data as TraderContract };
  } catch (error: any) {
    console.error('Exception signing new contract:', error);
    return { success: false, error: error.message };
  }
}
