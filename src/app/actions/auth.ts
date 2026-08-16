'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { syncUserWhopMembership } from '@/lib/whop/sync';

export type AuthState = {
  error?: string;
  success?: string;
};

export async function login(
  prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = (formData.get('redirectTo') as string) || '/dashboard';

  if (!email || !password) {
    return { error: 'Veuillez renseigner votre email et votre mot de passe.' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Identifiants invalides. Vérifiez votre email et mot de passe.' };
    }
    if (error.message.includes('Email not confirmed')) {
      return {
        error:
          "Votre adresse email n'a pas encore été confirmée. Veuillez vérifier votre boîte de réception (et vos spams) pour valider votre compte avant de vous connecter.",
      };
    }
    return { error: error.message };
  }

  if (data?.user) {
    try {
      await syncUserWhopMembership(data.user.id, email);
    } catch (syncErr) {
      console.warn('Background Whop sync warning on login:', syncErr);
    }
  }

  redirect(redirectTo);
}

export async function signup(
  prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!email || !password || !fullName) {
    return { error: 'Tous les champs obligatoires doivent être remplis.' };
  }

  if (password.length < 6) {
    return { error: 'Le mot de passe doit contenir au moins 6 caractères.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Les mots de passe ne correspondent pas.' };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Strict Whop Membership Verification (Option 1)
  // Only users who have purchased on Whop or admins can create an account
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminClient = createAdminClient();

    const [membershipRes, adminRes] = await Promise.all([
      adminClient
        .from('whop_memberships')
        .select('id, status, plan_type')
        .ilike('email', normalizedEmail)
        .in('status', ['active', 'valid', 'completed'])
        .limit(1)
        .maybeSingle(),
      adminClient
        .from('profiles')
        .select('id, role')
        .ilike('email', normalizedEmail)
        .eq('role', 'admin')
        .maybeSingle(),
    ]);

    if (!membershipRes.data && !adminRes.data) {
      return {
        error:
          "Aucun abonnement Whop actif n'est associé à cette adresse email. Veuillez d'abord commander votre accès sur Whop avec cet email pour débloquer la création de votre compte.",
      };
    }
  } catch (checkErr) {
    console.warn('Whop pre-signup verification check skipped or error:', checkErr);
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://opal-os-gamma.vercel.app'}/api/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes('User already registered')) {
      return { error: 'Un compte existe déjà avec cette adresse email. Veuillez vous connecter.' };
    }
    return { error: error.message };
  }

  if (data?.user) {
    try {
      await syncUserWhopMembership(data.user.id, email);
    } catch (syncErr) {
      console.warn('Background Whop sync warning on signup:', syncErr);
    }
  }

  // If email confirmation is required (session is null)
  if (data?.user && !data.session) {
    return {
      success:
        `Votre compte a été créé avec succès ! Un email de confirmation vient d'être envoyé à ${normalizedEmail}. Veuillez cliquer sur le lien reçu pour valider votre compte.`,
    };
  }

  redirect('/dashboard');
}

export async function forgotPassword(
  prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Veuillez saisir votre adresse email.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback?next=/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Un email de réinitialisation vous a été envoyé.' };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function updateProfile(data: { fullName?: string; avatarUrl?: string }) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    throw new Error('Non authentifié.');
  }

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };
  if (data.fullName !== undefined) updateData.full_name = data.fullName.trim();
  if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl.trim();

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
