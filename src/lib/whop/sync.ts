import { createAdminClient } from '@/lib/supabase/admin';
import type { UserPlan } from '@/types';

/**
 * Synchronizes a user's OPAL profile with their active Whop memberships.
 */
export async function syncUserWhopMembership(userId: string, email: string): Promise<{
  synced: boolean;
  activePlan: UserPlan;
  membershipCount: number;
}> {
  if (!userId || !email) {
    return { synced: false, activePlan: 'community', membershipCount: 0 };
  }

  const adminClient = createAdminClient();
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Fetch all memberships for this email or user_id
  const { data: memberships, error } = await adminClient
    .from('whop_memberships')
    .select('*')
    .or(`user_id.eq.${userId},email.ilike.${normalizedEmail}`)
    .order('created_at', { ascending: false });

  if (error || !memberships || memberships.length === 0) {
    return { synced: false, activePlan: 'community', membershipCount: 0 };
  }

  // 2. Link any unlinked memberships
  const unlinked = memberships.filter((m) => !m.user_id);
  if (unlinked.length > 0) {
    await adminClient
      .from('whop_memberships')
      .update({ user_id: userId })
      .in('id', unlinked.map((m) => m.id));
  }

  // 3. Find highest active tier
  const activeMemberships = memberships.filter((m) =>
    ['active', 'valid', 'completed', 'trialing', 'past_due'].includes(
      (m.status || '').toLowerCase()
    )
  );

  if (activeMemberships.length === 0) {
    return { synced: true, activePlan: 'community', membershipCount: memberships.length };
  }

  const hasIntensive = activeMemberships.some((m) => m.plan_type === 'intensive');
  const targetPlan: UserPlan = hasIntensive ? 'intensive' : 'community';

  // 4. Update profile if plan differs
  await adminClient
    .from('profiles')
    .update({
      plan: targetPlan,
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return {
    synced: true,
    activePlan: targetPlan,
    membershipCount: memberships.length,
  };
}
