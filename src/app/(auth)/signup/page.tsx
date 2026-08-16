'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { signup } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, undefined);

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-white tracking-tight">Créer un compte</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Rejoignez l'écosystème OPAL
        </p>
      </div>

      {state?.error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {state.error}
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

      <div className="mt-6 text-center text-xs text-neutral-400">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-[#39FF14] hover:underline font-medium">
          Se connecter
        </Link>
      </div>
    </div>
  );
}
