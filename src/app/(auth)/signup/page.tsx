'use client';

import React, { useActionState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signup } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function SignupForm() {
  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get('email') || '';
  const [state, formAction, isPending] = useActionState(signup, undefined);

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-white tracking-tight">Créer un compte</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Rejoignez l'écosystème OPAL
        </p>
      </div>

      {state?.success ? (
        <div className="p-6 rounded-2xl bg-[#141414] border border-[#39FF14]/30 text-center space-y-4 shadow-[0_0_30px_rgba(57,255,20,0.1)]">
          <div className="w-12 h-12 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center mx-auto text-[#39FF14] text-xl">
            ✉️
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-white">Vérifiez votre boîte mail</h2>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {state.success}
            </p>
          </div>
          <div className="pt-2">
            <Button asChild className="w-full bg-[#39FF14] text-black font-semibold hover:bg-[#39FF14]/90 h-10">
              <Link href="/login">Retourner à la connexion</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {state?.error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs space-y-2">
              <p className="leading-relaxed">{state.error}</p>
              {state.error.includes('Whop') && (
                  <div className="pt-1">
                    <Link
                      href="/checkout"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#39FF14] hover:underline"
                    >
                      Commander mon accès OPAL Intensive sur le Checkout &rarr;
                    </Link>
                  </div>
              )}
            </div>
          )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300" htmlFor="fullName">
            Nom complet
          </label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Maxym"
            required
            className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-[#39FF14] h-10"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300" htmlFor="email">
            Adresse email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={defaultEmail}
            placeholder="trader@opal.app"
            required
            autoComplete="email"
            className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-[#39FF14] h-10"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300" htmlFor="password">
            Mot de passe
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-[#39FF14] h-10"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300" htmlFor="confirmPassword">
            Confirmer le mot de passe
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-[#39FF14] h-10"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-10 bg-[#39FF14] text-black font-semibold hover:bg-[#39FF14]/90 transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)] disabled:opacity-50 mt-2"
        >
          {isPending ? 'Création en cours...' : 'Créer mon compte'}
        </Button>
      </form>

      <div className="mt-6 space-y-3 text-center text-xs">
        <div className="text-neutral-400">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-[#39FF14] hover:underline font-semibold">
            Se connecter
          </Link>
        </div>

        <div className="relative py-2 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative px-3 bg-[#141414] text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
            ou
          </span>
        </div>

        <Link
          href="/checkout"
          className="w-full h-10 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-[#39FF14] border border-white/10 hover:border-[#39FF14]/30 font-semibold flex items-center justify-center gap-2 transition-all group"
        >
          <span>Rejoindre le Programme OPAL Intensive (1 998 €)</span>
          <span className="text-[#39FF14] group-hover:translate-x-0.5 transition-transform">&rarr;</span>
        </Link>
      </div>
    </>
  )}
</div>
);
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-center text-neutral-500 py-10">Chargement...</div>}>
      <SignupForm />
    </Suspense>
  );
}
