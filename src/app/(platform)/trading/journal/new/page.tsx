import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { TradeForm } from '@/components/trading/trade-form';
import { WorkspaceSession } from '@/types/trading';

export const dynamic = 'force-dynamic';

export default async function NewTradePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch recent sessions for optional association
  const { data: sessionsData } = await supabase
    .from('workspace_sessions')
    .select('*')
    .eq('user_id', user?.id || '')
    .order('session_date', { ascending: false })
    .limit(5);

  const sessions = (sessionsData || []) as WorkspaceSession[];

  return (
    <div className="space-y-6 pb-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-extrabold text-white">Journaliser un Trade</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Enregistrez votre trade, vos niveaux, votre résultat en R et vos enseignements.
        </p>
      </div>

      <TradeForm sessions={sessions} />
    </div>
  );
}
