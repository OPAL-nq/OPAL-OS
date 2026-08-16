'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { UserPlan } from '@/types';

export interface SubscriptionDetails {
  plan: UserPlan;
  status: 'active' | 'inactive' | 'cancelled' | 'trialing' | 'past_due';
  planName: string;
  priceFormatted: string;
  billingPeriod: string;
  isRecurring: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  whopMembershipId: string | null;
  whopPortalUrl: string;
  email: string;
}

/**
 * Returns current user's subscription and billing details
 */
export async function getUserSubscriptionDetails(): Promise<{
  success: boolean;
  data?: SubscriptionDetails;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Non authentifié.' };
    }

    const adminClient = createAdminClient();

    // 1. Fetch user profile
    const { data: profile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const plan: UserPlan = profile?.plan || 'community';
    const profileStatus = profile?.status || 'active';
    const email = profile?.email || user.email || '';

    // 2. Fetch active Whop memberships for this user
    const { data: memberships } = await adminClient
      .from('whop_memberships')
      .select('*')
      .or(`user_id.eq.${user.id},email.ilike.${email}`)
      .order('created_at', { ascending: false });

    const activeMembership = (memberships || []).find((m) =>
      ['active', 'valid', 'completed', 'trialing', 'past_due'].includes(
        (m.status || '').toLowerCase()
      )
    ) || (memberships || [])[0];

    const isIntensive = plan === 'intensive' || activeMembership?.plan_type === 'intensive';

    const planName = isIntensive ? 'OPAL Intensive' : 'OPAL Academy';
    const priceFormatted = isIntensive ? '1 998 €' : '59 € / mois';
    const billingPeriod = isIntensive ? 'Accès à vie / Paiement unique' : 'Mensuel (Sans engagement)';
    const isRecurring = !isIntensive;

    const startsAt = activeMembership?.starts_at || profile?.created_at || null;
    const expiresAt = activeMembership?.expires_at || null;

    let computedStatus: SubscriptionDetails['status'] = 'active';
    if (activeMembership?.status) {
      const s = activeMembership.status.toLowerCase();
      if (s === 'past_due') computedStatus = 'past_due';
      else if (s === 'trialing') computedStatus = 'trialing';
      else if (['inactive', 'cancelled', 'deleted', 'terminated'].includes(s))
        computedStatus = 'cancelled';
      else computedStatus = 'active';
    } else if (profileStatus === 'cancelled' || profileStatus === 'inactive') {
      computedStatus = 'cancelled';
    }

    return {
      success: true,
      data: {
        plan,
        status: computedStatus,
        planName,
        priceFormatted,
        billingPeriod,
        isRecurring,
        startsAt,
        expiresAt,
        whopMembershipId: activeMembership?.whop_membership_id || null,
        whopPortalUrl: 'https://whop.com/hub/',
        email,
      },
    };
  } catch (err: any) {
    console.error('Error fetching subscription details:', err);
    return {
      success: false,
      error: err?.message || 'Impossible de récupérer les informations d’abonnement.',
    };
  }
}
