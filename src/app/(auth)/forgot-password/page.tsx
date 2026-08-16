'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPassword, undefined);

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-white tracking-tight">Mot de passe oublié</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Recevez un lien de réinitialisation par email
        </p>
      </div>

      {state?.error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="mb-4 p-3 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs">
          {state.success}
        </div>
      )}

      <form action={formAction} className="space-y-4">
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

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-10 bg-[#39FF14] text-black font-semibold hover:bg-[#39FF14]/90 transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)] disabled:opacity-50 mt-2"
        >
          {isPending ? 'Envoi en cours...' : 'Envoyer le lien'}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-neutral-400">
        <Link href="/login" className="text-neutral-400 hover:text-[#39FF14] transition-colors">
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
