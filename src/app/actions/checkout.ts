'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { syncUserWhopMembership } from '@/lib/whop/sync';
import { WHOP_PRODUCTS, WHOP_PLANS, resolvePlanFromWhopProduct } from '@/lib/whop/constants';
import type { UserPlan } from '@/types';

export interface VerifyPaymentResult {
  verified: boolean;
  email?: string;
  plan?: UserPlan;
  productId?: string;
  isExistingUser?: boolean;
  message?: string;
}

/**
 * Check if an email is already registered in OPAL OS profiles
 */
export async function checkEmailRegistered(email: string): Promise<{
  exists: boolean;
  fullName?: string | null;
}> {
  if (!email) return { exists: false };

  const adminClient = createAdminClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data: profile } = await adminClient
    .from('profiles')
    .select('id, email, full_name')
    .ilike('email', normalizedEmail)
    .maybeSingle();

  if (profile) {
    return { exists: true, fullName: profile.full_name };
  }

  return { exists: false };
}

/**
 * Server-side verification of Whop membership receipt in whop_memberships table
 * Polling helper that checks if Whop webhook has written the membership for this email.
 */
export async function verifyWhopPaymentStatus(
  email: string,
  targetProductId?: string
): Promise<VerifyPaymentResult> {
  if (!email) {
    return { verified: false, message: 'Email manquant pour la vérification.' };
  }

  const adminClient = createAdminClient();
  const normalizedEmail = email.trim().toLowerCase();

  // Query whop_memberships for active membership with this email
  const { data: memberships, error } = await adminClient
    .from('whop_memberships')
    .select('*')
    .ilike('email', normalizedEmail)
    .order('created_at', { ascending: false });

  if (error || !memberships || memberships.length === 0) {
    return {
      verified: false,
      message: 'En attente de la confirmation du paiement par Whop...',
    };
  }

  const activeMemberships = memberships.filter((m) =>
    ['active', 'valid', 'completed', 'trialing', 'past_due'].includes(
      (m.status || '').toLowerCase()
    )
  );

  if (activeMemberships.length === 0) {
    return {
      verified: false,
      message: 'Aucun paiement actif trouvé pour cette adresse email.',
    };
  }

  // Find membership matching target product or take the most recent active one
  const matched =
    activeMemberships.find((m) => m.whop_product_id === targetProductId) ||
    activeMemberships[0];

  const plan = resolvePlanFromWhopProduct(matched.whop_product_id);

  // Check if this email is already an OPAL user
  const emailCheck = await checkEmailRegistered(normalizedEmail);

  return {
    verified: true,
    email: normalizedEmail,
    plan,
    productId: matched.whop_product_id,
    isExistingUser: emailCheck.exists,
    message: 'Paiement confirmé avec succès !',
  };
}

/**
 * Completes signup after payment directly from checkout flow
 */
export async function completeCheckoutRegistration(formData: {
  email: string;
  password: string;
  fullName: string;
}): Promise<{
  success: boolean;
  error?: string;
  redirectTo?: string;
}> {
  const { email, password, fullName } = formData;

  if (!email || !password || !fullName) {
    return { success: false, error: 'Tous les champs doivent être renseignés.' };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: 'Le mot de passe doit contenir au moins 6 caractères.',
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const adminClient = createAdminClient();

  // 1. Verify that a valid Whop membership exists for this email
  const { data: memberships, error: memErr } = await adminClient
    .from('whop_memberships')
    .select('*')
    .ilike('email', normalizedEmail)
    .in('status', ['active', 'valid', 'completed', 'trialing'])
    .order('created_at', { ascending: false });

  if (memErr || !memberships || memberships.length === 0) {
    return {
      success: false,
      error:
        'Paiement non confirmé. Veuillez vous assurer que le paiement a bien été validé sur Whop avant de créer votre compte.',
    };
  }

  // 2. Determine plan strictly from confirmed database records
  const hasIntensive = memberships.some(
    (m) =>
      m.whop_product_id === WHOP_PRODUCTS.INTENSIVE ||
      m.whop_product_id === WHOP_PLANS.INTENSIVE ||
      m.plan_type === 'intensive'
  );
  const targetPlan: UserPlan = 'intensive';

  // 3. Create Supabase Auth user
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://opal-os-gamma.vercel.app'}/api/auth/callback`,
    },
  });

  if (authError) {
    if (authError.message.includes('User already registered')) {
      return {
        success: false,
        error:
          'Un compte OPAL existe déjà avec cette adresse email. Veuillez vous connecter pour accéder à vos outils.',
        redirectTo: `/login?email=${encodeURIComponent(normalizedEmail)}`,
      };
    }
    return { success: false, error: authError.message };
  }

  if (authData.user) {
    // 4. Sync profile plan & link whop_memberships
    try {
      await syncUserWhopMembership(authData.user.id, normalizedEmail);
    } catch (syncErr) {
      console.error('Error syncing Whop membership on checkout signup:', syncErr);
    }

    // 5. Sign in the user immediately if session was returned
    if (authData.session) {
      return { success: true, redirectTo: '/dashboard' };
    }
  }

  return {
    success: true,
    redirectTo: '/dashboard',
  };
}
