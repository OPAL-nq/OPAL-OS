import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PropFirmGuardianView } from '@/components/trading/prop-firm-guardian/prop-firm-guardian-view';
import { Shield, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { PropFirmAccount } from '@/types/prop-firm';

export const dynamic = 'force-dynamic';

export default async function PropFirmGuardianPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's prop firm accounts
  const { data: accountsData } = await supabase
    .from('prop_firm_accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const accounts = (accountsData || []) as PropFirmAccount[];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#39FF14] uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Sécurité des Comptes & Risque CME</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Prop Firm Drawdown Guardian
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Simulateur de survie, gestion du Trailing Drawdown et calibrage précis Micro vs Mini.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/trading"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour au Trading Hub</span>
          </Link>
        </div>
      </div>

      {/* Main Interactive Guardian Cockpit */}
      <PropFirmGuardianView accounts={accounts} />
    </div>
  );
}
