'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  Flame,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
  ExternalLink,
  CreditCard,
  Mail,
  User as UserIcon,
  KeyRound,
  Award,
  Zap,
  Target,
  Calendar,
  Layers,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { WHOP_PRODUCTS, WHOP_PLANS } from '@/lib/whop/constants';
import {
  verifyWhopPaymentStatus,
  completeCheckoutRegistration,
} from '@/app/actions/checkout';
import { cn } from '@/lib/utils';
import { trackInitiateCheckout } from '@/components/tracking/pixel-tracker';

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

export function CheckoutFlow() {
  const router = useRouter();

  // Step state: 'checkout' | 'verifying' | 'confirmed'
  const [currentStep, setCurrentStep] = useState<
    'checkout' | 'verifying' | 'confirmed'
  >('checkout');

  const selectedPlanId = WHOP_PLANS.INTENSIVE;
  const selectedProductId = WHOP_PRODUCTS.INTENSIVE;

  // Buyer & verification state
  const [capturedEmail, setCapturedEmail] = useState<string>('');
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

  const directWhopUrl = `https://whop.com/checkout/${selectedPlanId}`;

  // Triggered when Whop payment completes inside embed
  const handleWhopComplete = async (
    _planId: string,
    _receiptId?: string,
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
            setIsExistingAccount(!!check.isExistingUser);
            break;
          }
        }
      } catch (err) {
        console.warn('Polling check error:', err);
      }
      await new Promise((r) => setTimeout(r, 1500));
    }

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
        setIsExistingAccount(!!check.isExistingUser);
        setCapturedEmail(accountEmail.trim());
        setCurrentStep('confirmed');
      } else {
        setVerificationError(
          "Paiement non trouvé pour cet email. Si vous venez de payer sur Whop, attendez quelques secondes puis cliquez à nouveau sur Vérifier."
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/checkout" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#39FF14]/30 flex items-center justify-center shrink-0 group-hover:border-[#39FF14] transition-colors">
              <div className="w-2.5 h-2.5 rounded-full bg-[#39FF14] shadow-[0_0_10px_#39FF14]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold tracking-wider text-white leading-none">
                OPAL
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#39FF14] leading-tight font-bold">
                Intensive OS
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ================================================================= */}
        {/* CHECKOUT STEP: PRESENTATION + EMBEDDED WHOP PAYMENT               */}
        {/* ================================================================= */}
        {currentStep === 'checkout' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            {/* Hero Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(57,255,20,0.15)]">
                <Flame className="w-4 h-4 fill-current" />
                <span>Programme Élite • Accompagnement 1-on-1</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Rejoindre <span className="text-[#39FF14]">OPAL Intensive</span>
              </h1>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl mx-auto">
                L'accompagnement individuel sur-mesure et l'écosystème complet de trading
                des Futures (NQ & ES) pour structurer votre exécution et accélérer votre rentabilité.
              </p>
            </div>

            {/* 2-Column Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
              {/* LEFT COLUMN: INTENSIVE VALUE STACK, PHASES & FAQ (7 COLS) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Main Offer Card */}
                <div className="rounded-2xl bg-[#141414] border border-[#39FF14]/40 p-6 sm:p-8 relative overflow-hidden shadow-[0_0_35px_rgba(57,255,20,0.12)] bg-gradient-to-b from-[#141414] via-[#141414] to-[#121c12]">
                  <div className="absolute top-0 right-0 bg-[#39FF14] text-black text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow-lg">
                    Offre Exclusive
                  </div>

                  <div className="space-y-6">
                    {/* Header with Title & Price */}
                    <div className="space-y-3 pb-6 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                          <Flame className="w-6 h-6 fill-current" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-black text-white">
                              OPAL Intensive
                            </h2>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30 uppercase">
                              PRO
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400">
                            Accompagnement 1-on-1 + Accès intégral Trading OS
                          </p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl sm:text-5xl font-black text-[#39FF14] tracking-tight">
                            1 998 €
                          </span>
                          <span className="text-xs font-semibold text-neutral-400">
                            Paiement unique • Accès complet & Suivi continu
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pillar 1: 1-on-1 Coaching */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#39FF14]">
                        <Zap className="w-4 h-4" />
                        <span>Accompagnement Individuel & Mentorat Privé</span>
                      </div>
                      <ul className="space-y-2.5 text-xs text-neutral-200">
                        {[
                          '2 sessions de coaching privé 1-on-1 par semaine avec Maxym',
                          'Cockpit dédié OPAL Intensive déverrouillé (objectifs, feuilles de route, comptes-rendus)',
                          'Audit complet et continu de vos sessions de trading et graphiques',
                          'Roadmap individualisée et validation progressive de vos étapes vers la rentabilité',
                          'Canal de messagerie privée prioritaire direct avec vos mentors',
                          'Comptes rendus détaillés après chaque séance de coaching',
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <div className="w-4 h-4 rounded-full bg-[#39FF14]/20 text-[#39FF14] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                            <span className="font-medium text-white">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pillar 2: Platform & Tools Included */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-400">
                        <Sparkles className="w-4 h-4 text-[#39FF14]" />
                        <span>Tout l’Écosystème OPAL OS Inclus</span>
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-neutral-300">
                        {[
                          'Dashboard de trading & cockpit OPAL OS',
                          'Academy complète : modules & vidéos institutionnelles',
                          'Trading Workspace & gestionnaire de sessions',
                          'Journal de trading & calcul automatique du PnL / Multiple R',
                          'OPAL Systems & stratégies systématiques NQ/ES',
                          'Live Sessions hebdomadaires de trading en direct',
                          'Replays vidéo illimités disponibles 24/7',
                          'Community privée de traders & salons thématiques',
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-[#39FF14] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 2. Process / Roadmap Steps */}
                <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                    <Layers className="w-4 h-4 text-[#39FF14]" />
                    <span>Déroulement & Méthode d'Accompagnement</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#39FF14]/20 text-[#39FF14] text-[10px] font-black flex items-center justify-center">
                          01
                        </span>
                        <h4 className="text-xs font-bold text-white">Audit & Cadrage</h4>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Analyse de vos blocages, de vos métriques et configuration sur-mesure de votre espace.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#39FF14]/20 text-[#39FF14] text-[10px] font-black flex items-center justify-center">
                          02
                        </span>
                        <h4 className="text-xs font-bold text-white">Ruleset & Exécution</h4>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Intégration stricte des stratégies NQ/ES, gestion du risque et élimination du FOMO.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#39FF14]/20 text-[#39FF14] text-[10px] font-black flex items-center justify-center">
                          03
                        </span>
                        <h4 className="text-xs font-bold text-white">Suivi 1-on-1</h4>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        2 calls privés par semaine, débriefings vidéo continus et montée en charge sur capitaux.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Who is this for? */}
                <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                    <Target className="w-4 h-4 text-[#39FF14]" />
                    <span>À qui s’adresse OPAL Intensive ?</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-neutral-300">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                      <span>
                        <strong>Traders en quête de rentabilité régulière :</strong> pour ceux qui veulent passer du trading aléatoire à une discipline institutionnelle rigoureuse.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                      <span>
                        <strong>Candidats aux comptes financés (Prop Firms) :</strong> validation et maintien des drawdowns stricts sur les marchés Futures CME.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                      <span>
                        <strong>Ceux qui veulent un mentor dédié :</strong> un suivi direct sans filtre avec Maxym pour corriger chaque trade en temps réel.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Quick FAQ */}
                <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                    <HelpCircle className="w-4 h-4 text-[#39FF14]" />
                    <span>Questions Fréquentes</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#39FF14]" />
                        <span>Comment se planifient les séances 1-on-1 ?</span>
                      </h4>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Dès votre inscription, vous accédez au module de réservation dans votre cockpit pour planifier vos 2 séances hebdomadaires selon votre emploi du temps.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-[#39FF14]" />
                        <span>Que se passe-t-il après le paiement ?</span>
                      </h4>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        L'activation est instantanée : vous configurez vos identifiants ci-contre et accédez immédiatement au Cockpit Intensive et à l'Academy complète.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5. Trust and Guarantee Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#39FF14] shrink-0" />
                    <div className="text-[11px]">
                      <div className="font-bold text-white">Sécurisé SSL</div>
                      <div className="text-neutral-500">Chiffrement 256-bit</div>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 flex items-center gap-3">
                    <Lock className="w-5 h-5 text-neutral-400 shrink-0" />
                    <div className="text-[11px]">
                      <div className="font-bold text-white">Partenaire Whop</div>
                      <div className="text-neutral-500">CB, Apple Pay, Google Pay</div>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 flex items-center gap-3">
                    <Award className="w-5 h-5 text-[#39FF14] shrink-0" />
                    <div className="text-[11px]">
                      <div className="font-bold text-white">Accès Immédiat</div>
                      <div className="text-neutral-500">Déblocage instantané</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: DIRECT TERMINAL & FAST CHECKOUT (5 COLS) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6 sticky top-24">
                  <div className="flex items-center justify-between text-xs pb-4 border-b border-white/5">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Lock className="w-4 h-4 text-[#39FF14]" />
                      <span>Terminal de Paiement Sécurisé</span>
                    </div>
                    <span className="text-[#39FF14] font-bold text-[11px]">1 998 €</span>
                  </div>

                  {/* Direct 1-Click Payment Button */}
                  <div className="space-y-3">
                    <a
                      href={directWhopUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackInitiateCheckout('Checkout Page - Direct Whop Button', 1998, 'EUR')}
                      className="w-full min-h-[3.5rem] py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm bg-[#39FF14] hover:bg-[#32e612] text-black shadow-[0_0_25px_rgba(57,255,20,0.35)] flex items-center justify-center gap-2.5 text-center transition-all group active:scale-95 leading-tight"
                    >
                      <CreditCard className="w-5 h-5 text-black shrink-0" />
                      <span>Payer 1 998 € sur Whop (CB / Apple Pay)</span>
                      <ExternalLink className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>

                    <p className="text-center text-[11px] text-neutral-400">
                      Paiement sécurisé avec validation immédiate de votre adhésion.
                    </p>
                  </div>

                  {/* Embedded Whop Checkout View */}
                  <div className="pt-2 border-t border-white/5 space-y-3">
                    <div className="w-full min-h-[360px] rounded-xl overflow-hidden bg-black/50 border border-white/5">
                      <WhopCheckoutEmbed
                        planId={selectedPlanId}
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
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP: VERIFYING PAYMENT STATE                                     */}
        {/* ================================================================= */}
        {currentStep === 'verifying' && (
          <div className="max-w-md mx-auto py-16 text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center mx-auto text-[#39FF14]">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                Vérification du paiement en cours...
              </h2>
              <p className="text-xs text-neutral-400">
                Synchronisation de votre adhésion OPAL Intensive avec le réseau Whop.
              </p>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP: PAYMENT CONFIRMED & ACCOUNT CREATION                        */}
        {/* ================================================================= */}
        {currentStep === 'confirmed' && (
          <div className="max-w-lg mx-auto space-y-6 animate-in fade-in duration-300 py-6">
            <div className="p-6 rounded-2xl bg-[#141414] border border-[#39FF14]/40 text-center space-y-3 shadow-[0_0_30px_rgba(57,255,20,0.15)]">
              <div className="w-12 h-12 rounded-full bg-[#39FF14] text-black flex items-center justify-center mx-auto font-black shadow-[0_0_15px_#39FF14]">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h2 className="text-2xl font-black text-white">
                Paiement confirmé ✓
              </h2>
              <p className="text-xs text-neutral-300">
                Votre accès exclusif à{' '}
                <span className="font-bold text-[#39FF14]">
                  OPAL Intensive (1 998 €)
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
                    Votre accès Intensive a été automatiquement associé à votre compte ({accountEmail}). Connectez-vous simplement pour accéder à votre cockpit.
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
                    Configure tes identifiants pour finaliser ton inscription au programme Intensive.
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
                        placeholder="Maxym"
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
                        placeholder="trader@exemple.com"
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
