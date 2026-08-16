'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  Flame,
  GraduationCap,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  ExternalLink,
  CreditCard,
  Mail,
  User as UserIcon,
  KeyRound,
} from 'lucide-react';
import { WHOP_PRODUCTS } from '@/lib/whop/constants';
import {
  verifyWhopPaymentStatus,
  completeCheckoutRegistration,
} from '@/app/actions/checkout';
import { cn } from '@/lib/utils';

// Dynamically import WhopCheckoutEmbed for SSR compatibility
const WhopCheckoutEmbed = dynamic(
  () =>
    import('@whop/checkout/react')
      .then((mod) => mod.WhopCheckoutEmbed)
      .catch(() => () => null),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex flex-col items-center justify-center space-y-3 bg-[#141414] rounded-2xl border border-white/10 p-6 text-neutral-400">
        <Loader2 className="w-6 h-6 animate-spin text-[#39FF14]" />
        <p className="text-xs font-mono uppercase tracking-wider">
          Chargement du terminal de paiement sécurisé Whop...
        </p>
      </div>
    ),
  }
);

interface CheckoutFlowProps {
  initialOffer?: 'academy' | 'intensive';
}

export function CheckoutFlow({ initialOffer }: CheckoutFlowProps) {
  const router = useRouter();

  // Step state: 'select' | 'checkout' | 'verifying' | 'confirmed'
  const [currentStep, setCurrentStep] = useState<
    'select' | 'checkout' | 'verifying' | 'confirmed'
  >('select');

  // Selected product
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialOffer === 'intensive'
      ? WHOP_PRODUCTS.INTENSIVE
      : WHOP_PRODUCTS.ACADEMY
  );

  // Buyer & verification state
  const [capturedEmail, setCapturedEmail] = useState<string>('');
  const [verifiedPlan, setVerifiedPlan] = useState<'community' | 'intensive'>(
    initialOffer === 'intensive' ? 'intensive' : 'community'
  );
  const [isExistingAccount, setIsExistingAccount] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isPollingVerification, setIsPollingVerification] = useState<boolean>(false);

  // Account creation form state
  const [fullName, setFullName] = useState<string>('');
  const [accountEmail, setAccountEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isSubmittingSignup, setIsSubmittingSignup] = useState<boolean>(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Keep accountEmail in sync with capturedEmail
  useEffect(() => {
    if (capturedEmail && !accountEmail) {
      setAccountEmail(capturedEmail);
    }
  }, [capturedEmail, accountEmail]);

  const handleProceedToCheckout = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentStep('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const directWhopUrl = `https://whop.com/checkout/${selectedProductId}`;

  // Triggered when Whop payment completes inside embed
  const handleWhopComplete = async (
    planId: string,
    receiptId?: string,
    result?: any
  ) => {
    setCurrentStep('verifying');
    setVerificationError(null);

    const payerEmail =
      result?.email ||
      result?.user_email ||
      capturedEmail ||
      '';

    if (payerEmail) {
      setCapturedEmail(payerEmail);
      setAccountEmail(payerEmail);
    }

    // Verify on server side against whop_memberships table
    let verified = false;
    let attempts = 0;

    while (!verified && attempts < 8) {
      attempts++;
      try {
        if (payerEmail) {
          const check = await verifyWhopPaymentStatus(
            payerEmail,
            selectedProductId
          );
          if (check.verified) {
            verified = true;
            if (check.plan) setVerifiedPlan(check.plan);
            setIsExistingAccount(!!check.isExistingUser);
            break;
          }
        }
      } catch (err) {
        console.warn('Polling check error:', err);
      }
      await new Promise((r) => setTimeout(r, 1500));
    }

    setVerifiedPlan(
      selectedProductId === WHOP_PRODUCTS.INTENSIVE ? 'intensive' : 'community'
    );
    setCurrentStep('confirmed');
  };

  // Manual payment verification check
  const handleManualVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!accountEmail.trim()) {
      setVerificationError('Veuillez renseigner votre adresse email.');
      return;
    }

    setIsPollingVerification(true);
    setVerificationError(null);

    try {
      const check = await verifyWhopPaymentStatus(
        accountEmail.trim(),
        selectedProductId
      );
      if (check.verified) {
        if (check.plan) setVerifiedPlan(check.plan);
        setIsExistingAccount(!!check.isExistingUser);
        setCapturedEmail(accountEmail.trim());
        setCurrentStep('confirmed');
      } else {
        setVerificationError(
          "Paiement non trouvé pour cet email. Si vous venez de payer, attendez quelques secondes puis cliquez à nouveau sur Vérifier."
        );
      }
    } catch (err: any) {
      setVerificationError(err?.message || "Erreur lors de la vérification.");
    } finally {
      setIsPollingVerification(false);
    }
  };

  // Final signup submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!fullName.trim() || !accountEmail.trim() || !password) {
      setSignupError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (password.length < 6) {
      setSignupError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setSignupError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmittingSignup(true);

    try {
      const res = await completeCheckoutRegistration({
        fullName: fullName.trim(),
        email: accountEmail.trim(),
        password,
      });

      if (!res.success) {
        if (res.redirectTo) {
          router.push(res.redirectTo);
          return;
        }
        setSignupError(res.error || 'Erreur lors de la création du compte.');
        setIsSubmittingSignup(false);
        return;
      }

      router.push('/dashboard');
    } catch (err: any) {
      setSignupError(
        err?.message || 'Une erreur inattendue est survenue. Veuillez réessayer.'
      );
      setIsSubmittingSignup(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between selection:bg-[#39FF14] selection:text-black">
      {/* Top Header Navigation */}
      <header className="border-b border-white/5 bg-[#0D0D0D]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/checkout" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#39FF14]/30 flex items-center justify-center shrink-0 group-hover:border-[#39FF14] transition-colors">
              <div className="w-2.5 h-2.5 rounded-full bg-[#39FF14] shadow-[0_0_10px_#39FF14]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold tracking-wider text-white leading-none">
                OPAL
              </span>
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 leading-tight">
                Trading OS
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-neutral-400 hidden sm:inline">
              Déjà membre ?
            </span>
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ================================================================= */}
        {/* STEP 1: OFFER SELECTION                                           */}
        {/* ================================================================= */}
        {currentStep === 'select' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Accès Officiel OPAL OS</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Choisis ton accompagnement
              </h1>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                Accède à l'écosystème OPAL et choisis le niveau d'accompagnement
                adapté à ton objectif de rentabilité sur le marché des Futures.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto items-stretch">
              {/* CARD 1: ACADEMY */}
              <div
                className={cn(
                  'rounded-2xl bg-[#141414] border transition-all duration-200 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden',
                  selectedProductId === WHOP_PRODUCTS.ACADEMY
                    ? 'border-[#39FF14]/50 shadow-[0_0_30px_rgba(57,255,20,0.1)] ring-1 ring-[#39FF14]/40'
                    : 'border-white/10 hover:border-white/20'
                )}
              >
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold text-white pt-2">
                        OPAL Academy
                      </h2>
                      <p className="text-xs text-neutral-400 leading-snug">
                        Pour apprendre, pratiquer et progresser en autonomie
                        avec l'écosystème OPAL.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 pb-4 border-b border-white/5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-black text-white">
                        59 €
                      </span>
                      <span className="text-sm text-neutral-400 font-semibold">
                        / mois
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Sans engagement • Annulation en 1 clic
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Inclus dans l'accès Academy :
                    </p>
                    <ul className="space-y-2.5">
                      {[
                        'Dashboard de trading & cockpit OPAL OS',
                        'Academy complète : modules, chapitres & vidéos',
                        'Trading Workspace & gestionnaire de sessions',
                        'Trading Journal d’exécution & calcul de PnL',
                        'OPAL Systems & stratégies systématiques NQ',
                        'Live Sessions hebdomadaires & interactions',
                        'Replays vidéo illimités disponibles 24/7',
                        'Community de traders & salons d’échanges',
                        'Messagerie privée avec le support OPAL',
                      ].map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-neutral-300"
                        >
                          <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8 mt-auto">
                  <button
                    type="button"
                    onClick={() =>
                      handleProceedToCheckout(WHOP_PRODUCTS.ACADEMY)
                    }
                    className="w-full h-12 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/15 text-white hover:text-[#39FF14] border border-white/10 transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>Choisir OPAL Academy</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* CARD 2: INTENSIVE */}
              <div
                className={cn(
                  'rounded-2xl bg-[#141414] border transition-all duration-200 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden',
                  selectedProductId === WHOP_PRODUCTS.INTENSIVE
                    ? 'border-[#39FF14] shadow-[0_0_35px_rgba(57,255,20,0.18)] ring-2 ring-[#39FF14]/50 bg-gradient-to-b from-[#141414] to-[#121a12]'
                    : 'border-white/10 hover:border-[#39FF14]/50'
                )}
              >
                <div className="absolute top-0 right-0 bg-[#39FF14] text-black text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow-lg">
                  Accompagnement 1-on-1
                </div>

                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="w-10 h-10 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
                        <Flame className="w-5 h-5 fill-current" />
                      </div>
                      <h2 className="text-xl font-bold text-white pt-2 flex items-center gap-2">
                        <span>OPAL Intensive</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30 uppercase">
                          PRO
                        </span>
                      </h2>
                      <p className="text-xs text-neutral-400 leading-snug">
                        Pour les traders qui veulent un accompagnement
                        personnalisé et un suivi individuel.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 pb-4 border-b border-white/5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-black text-[#39FF14]">
                        1 998 €
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Paiement unique • Suivi sur-mesure
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <p className="text-[11px] font-bold text-[#39FF14] uppercase tracking-wider">
                      Tous les accès Academy PLUS :
                    </p>
                    <ul className="space-y-2.5">
                      {[
                        'Tous les accès complets OPAL Academy inclus',
                        'Cockpit dédié OPAL Intensive déverrouillé',
                        '2 sessions de coaching privé 1-on-1 par semaine',
                        'Audit complet de vos sessions de trading',
                        'Suivi personnalisé et validation d’objectifs',
                        'Comptes rendus détaillés après chaque séance',
                        'Canal de messagerie privée prioritaire avec vos mentors',
                        'Roadmap individualisée vers la rentabilité',
                      ].map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-white"
                        >
                          <Check className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8 mt-auto">
                  <button
                    type="button"
                    onClick={() =>
                      handleProceedToCheckout(WHOP_PRODUCTS.INTENSIVE)
                    }
                    className="w-full h-12 rounded-xl font-black text-sm bg-[#39FF14] hover:bg-[#32e612] text-black shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>Choisir OPAL Intensive</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 pt-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#39FF14]" />
                <span>Paiement sécurisé et chiffré SSL</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-neutral-400" />
                <span>Traitement officiel Whop (Apple Pay, CB, Google Pay)</span>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 2: HYBRID CHECKOUT (EMBED + DIRECT WHOP TERMINAL)            */}
        {/* ================================================================= */}
        {currentStep === 'checkout' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <button
                type="button"
                onClick={() => setCurrentStep('select')}
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Changer d'offre</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Offre choisie :</span>
                <span className="text-xs font-bold text-[#39FF14]">
                  {selectedProductId === WHOP_PRODUCTS.INTENSIVE
                    ? 'OPAL Intensive (1 998 €)'
                    : 'OPAL Academy (59 €/mois)'}
                </span>
              </div>
            </div>

            {/* Main Checkout Box */}
            <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between text-xs pb-4 border-b border-white/5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Lock className="w-4 h-4 text-[#39FF14]" />
                  <span>Paiement sécurisé propulsé par Whop</span>
                </div>
                <span className="text-neutral-500 text-[10px]">Chiffrement 256-bit</span>
              </div>

              {/* Direct 1-Click Payment Button */}
              <div className="space-y-3">
                <a
                  href={directWhopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-14 rounded-xl font-black text-sm bg-[#39FF14] hover:bg-[#32e612] text-black shadow-[0_0_25px_rgba(57,255,20,0.3)] flex items-center justify-center gap-2.5 transition-all group active:scale-95"
                >
                  <CreditCard className="w-5 h-5 text-black" />
                  <span>Procéder au paiement sur Whop (CB / Apple Pay)</span>
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <p className="text-center text-[11px] text-neutral-400">
                  Le paiement s'ouvre dans une fenêtre sécurisée Whop pour une compatibilité maximale.
                </p>
              </div>

              {/* Embedded Whop Checkout View */}
              <div className="pt-2 border-t border-white/5 space-y-3">
                <div className="w-full min-h-[360px] rounded-xl overflow-hidden bg-black/40 border border-white/5">
                  <WhopCheckoutEmbed
                    planId={selectedProductId}
                    theme="dark"
                    themeOptions={{
                      backgroundColor: '#141414',
                      accentColor: '#39FF14',
                    }}
                    skipRedirect={true}
                    onIdentityCaptured={(data) => {
                      if (data?.email) {
                        setCapturedEmail(data.email);
                        setAccountEmail(data.email);
                      }
                    }}
                    onComplete={handleWhopComplete}
                  />
                </div>
              </div>

              {/* Instant Verification after payment */}
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
                    <span>Tu as finalisé ton paiement ?</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Saisis l'adresse email utilisée lors du paiement pour débloquer immédiatement ton compte OPAL.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="trader@exemple.com"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#39FF14]"
                  />
                  <button
                    type="button"
                    onClick={() => handleManualVerify()}
                    disabled={isPollingVerification}
                    className="px-4 py-2 bg-[#39FF14] hover:bg-[#32e612] text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    {isPollingVerification ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Vérifier</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {verificationError && (
                  <p className="text-[11px] text-yellow-400 flex items-center gap-1.5 pt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{verificationError}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 2.5: VERIFYING PAYMENT STATE                                 */}
        {/* ================================================================= */}
        {currentStep === 'verifying' && (
          <div className="max-w-md mx-auto py-16 text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center mx-auto text-[#39FF14]">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                Vérification du paiement...
              </h2>
              <p className="text-xs text-neutral-400">
                Synchronisation de votre adhésion avec le réseau Whop en cours.
              </p>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 3: PAYMENT CONFIRMED & ACCOUNT CREATION                      */}
        {/* ================================================================= */}
        {currentStep === 'confirmed' && (
          <div className="max-w-lg mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="p-6 rounded-2xl bg-[#141414] border border-[#39FF14]/40 text-center space-y-3 shadow-[0_0_30px_rgba(57,255,20,0.1)]">
              <div className="w-12 h-12 rounded-full bg-[#39FF14] text-black flex items-center justify-center mx-auto font-black shadow-[0_0_15px_#39FF14]">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h2 className="text-2xl font-black text-white">
                Paiement confirmé ✓
              </h2>
              <p className="text-xs text-neutral-300">
                Votre accès au plan{' '}
                <span className="font-bold text-[#39FF14]">
                  {verifiedPlan === 'intensive'
                    ? 'OPAL Intensive'
                    : 'OPAL Academy'}
                </span>{' '}
                est débloqué.
              </p>
            </div>

            {/* CASE A: EXISTING USER */}
            {isExistingAccount ? (
              <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-5">
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">
                    Un compte OPAL existe déjà avec cette adresse email
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Votre nouvel accès a été automatiquement associé à votre compte ({accountEmail}). Connectez-vous simplement pour accéder à votre cockpit.
                  </p>
                </div>

                <Link
                  href={`/login?email=${encodeURIComponent(accountEmail)}&redirectTo=/dashboard`}
                  className="w-full h-12 rounded-xl font-bold text-sm bg-[#39FF14] hover:bg-[#32e612] text-black shadow-[0_0_15px_rgba(57,255,20,0.3)] flex items-center justify-center gap-2 transition-all"
                >
                  <span>Se connecter à mon compte OPAL</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              /* CASE B: NEW USER SIGNUP */
              <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-white/10 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    Crée ton compte OPAL
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Configure tes identifiants pour finaliser ton inscription.
                  </p>
                </div>

                {signupError && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{signupError}</span>
                  </div>
                )}

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      Prénom & Nom
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jean Dupont"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#39FF14]/50 focus:ring-1 focus:ring-[#39FF14]/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      Adresse Email de paiement
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="email"
                        required
                        value={accountEmail}
                        onChange={(e) => setAccountEmail(e.target.value)}
                        placeholder="jean.dupont@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#39FF14]/50 focus:ring-1 focus:ring-[#39FF14]/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="6 caractères minimum"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#39FF14]/50 focus:ring-1 focus:ring-[#39FF14]/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Répétez le mot de passe"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#39FF14]/50 focus:ring-1 focus:ring-[#39FF14]/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingSignup}
                    className={cn(
                      'w-full h-12 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all mt-4',
                      isSubmittingSignup
                        ? 'bg-white/10 text-neutral-500 cursor-not-allowed'
                        : 'bg-[#39FF14] text-black hover:bg-[#32e612] shadow-[0_0_20px_rgba(57,255,20,0.3)] active:scale-95'
                    )}
                  >
                    {isSubmittingSignup ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Accéder à mon Dashboard OPAL</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-neutral-500">
        <p>© 2026 OPAL OS — Tous droits réservés.</p>
      </footer>
    </div>
  );
}
