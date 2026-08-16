import { createAdminClient } from '@/lib/supabase/admin';
import { WHOP_PRODUCTS, resolvePlanFromWhopProduct, isMembershipStatusActive } from './constants';
import type { WhopWebhookEvent } from '@/types/whop';

export interface ProcessWebhookResult {
  success: boolean;
  action: string;
  membershipId?: string;
  email?: string;
  plan?: string;
  userMatched: boolean;
  message?: string;
}

/**
 * Core business engine to process and synchronize Whop Webhook events with OPAL OS.
 */
export async function processWhopWebhook(event: WhopWebhookEvent): Promise<ProcessWebhookResult> {
  const action = event.action || event.type || 'unknown';
  const data = event.data || {};

  // Extract membership identifiers
  const membershipId = data.id || data.membership_id || data.membership?.id;
  if (!membershipId) {
    return {
      success: false,
      action,
      userMatched: false,
      message: 'No membership ID found in webhook payload',
    };
  }

  const productId = data.product_id || data.membership?.product_id || data.product?.id || '';
  const planId = data.plan_id || data.membership?.plan_id || data.plan?.id || null;
  const whopUserId = data.user_id || data.user?.id || null;
  
  // Extract & sanitize email
  const rawEmail = data.email || data.user?.email || data.membership?.user?.email || '';
  const email = rawEmail.trim().toLowerCase();

  const targetPlan = resolvePlanFromWhopProduct(productId);

  // Determine if this event grants active access or revokes it
  const isDeactivation = [
    'membership_deactivated',
    'membership.went_invalid',
    'membership.cancelled',
    'membership.deleted',
    'membership.terminated',
    'payment.failed',
    'invoice_past_due',
    'invoice_voided',
    'invoice_marked_uncollectible',
    'entry_denied',
    'entry_deleted',
  ].includes(action);

  const isExplicitActivation = [
    'membership_activated',
    'membership.went_valid',
    'membership.created',
    'invoice_paid',
    'payment.succeeded',
    'entry_approved',
  ].includes(action);

  const rawStatus = data.status || (isDeactivation ? 'inactive' : 'active');
  const isGrantingAccess = isExplicitActivation || (!isDeactivation && isMembershipStatusActive(rawStatus, data.valid));

  // Format dates
  const rawCreatedAt = data.created_at || data.renewal_period_start;
  const startsAt = rawCreatedAt
    ? new Date(typeof rawCreatedAt === 'number' ? rawCreatedAt * 1000 : String(rawCreatedAt)).toISOString()
    : new Date().toISOString();

  const rawExpiresAt = data.expires_at || data.renewal_period_end;
  const expiresAt = rawExpiresAt
    ? new Date(typeof rawExpiresAt === 'number' ? rawExpiresAt * 1000 : String(rawExpiresAt)).toISOString()
    : null;

  const adminClient = createAdminClient();

  // 1. Check if user already exists in profiles
  let matchedUserId: string | null = null;
  if (email) {
    const { data: profile } = await adminClient
      .from('profiles')
      .select('id, email, plan, role')
      .ilike('email', email)
      .maybeSingle();

    if (profile) {
      matchedUserId = profile.id;
    }
  }

  // 2. Upsert Whop Membership record (Idempotent by whop_membership_id)
  const { error: membershipError } = await adminClient
    .from('whop_memberships')
    .upsert(
      {
        whop_membership_id: membershipId,
        user_id: matchedUserId,
        email: email || 'unknown@whop.com',
        whop_user_id: whopUserId,
        whop_product_id: productId,
        whop_plan_id: planId,
        status: isGrantingAccess ? 'active' : 'inactive',
        plan_type: targetPlan,
        starts_at: startsAt,
        expires_at: expiresAt,
        last_event: action,
        raw_data: event,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'whop_membership_id',
      }
    );

  if (membershipError) {
    console.error('Error upserting whop_membership:', membershipError);
  }

  // 3. Update User Profile if matched
  if (matchedUserId) {
    if (isGrantingAccess) {
      // Grant / Upgrade Access
      await adminClient
        .from('profiles')
        .update({
          plan: targetPlan,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', matchedUserId);

      // Create confirmation notification in OPAL OS
      try {
        const notifTitle = targetPlan === 'intensive'
          ? '🔥 Accès OPAL Intensive Activé'
          : '🚀 Accès OPAL Academy Activé';
        const notifMessage = targetPlan === 'intensive'
          ? 'Votre achat OPAL Intensive est confirmé. Votre cockpit personnalisé est maintenant débloqué !'
          : 'Votre abonnement OPAL Academy est actif. Vous avez accès à l\'ensemble de la plateforme et des lives.';
        const notifLink = targetPlan === 'intensive' ? '/intensive' : '/academy';

        await adminClient.from('notifications').insert({
          user_id: matchedUserId,
          title: notifTitle,
          message: notifMessage,
          link: notifLink,
          type: targetPlan === 'intensive' ? 'intensive' : 'announcement',
          read: false,
        });
      } catch (notifErr) {
        console.warn('Failed to insert webhook notification:', notifErr);
      }
    } else {
      // Revocation / Downgrade check:
      // Does user have another active membership?
      const { data: otherMemberships } = await adminClient
        .from('whop_memberships')
        .select('whop_product_id, plan_type')
        .eq('user_id', matchedUserId)
        .neq('whop_membership_id', membershipId)
        .in('status', ['active', 'valid', 'completed']);

      if (otherMemberships && otherMemberships.length > 0) {
        // Find highest tier remaining
        const hasIntensive = otherMemberships.some((m) => m.plan_type === 'intensive');
        const fallbackPlan = hasIntensive ? 'intensive' : 'community';
        await adminClient
          .from('profiles')
          .update({
            plan: fallbackPlan,
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', matchedUserId);
      } else {
        // No remaining active memberships -> set status inactive
        await adminClient
          .from('profiles')
          .update({
            status: 'inactive',
            updated_at: new Date().toISOString(),
          })
          .eq('id', matchedUserId);
      }
    }
  }

  return {
    success: true,
    action,
    membershipId,
    email,
    plan: targetPlan,
    userMatched: !!matchedUserId,
  };
}
