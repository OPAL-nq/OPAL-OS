'use client';

import React, { useActionState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { login } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const [state, formAction, isPending] = useActionState(login, undefined);

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-white tracking-tight">Connexion</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Accédez à votre espace de trading
        </p>
      </div>

      {state?.error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300" htmlFor="email">
            Adresse email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="trader@opal.app"
            required
            autoComplete="email"
            className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-[#39FF14] h-10"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-neutral-300" htmlFor="password">
              Mot de passe
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-neutral-400 hover:text-[#39FF14] transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-[#39FF14] h-10"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-10 bg-[#39FF14] text-black font-semibold hover:bg-[#39FF14]/90 transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)] disabled:opacity-50 mt-2"
        >
          {isPending ? 'Connexion en cours...' : 'Se connecter'}
        </Button>
      </form>

      <div className="mt-6 space-y-3 text-center text-xs">
        <div className="text-neutral-400">
          Pas encore de compte ?{' '}
          <Link href="/signup" className="text-[#39FF14] hover:underline font-semibold">
            Créer un compte
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
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-xs text-neutral-500 py-8">Chargement...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
