'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  getUserSubscriptionDetails,
  SubscriptionDetails,
} from '@/app/actions/billing';
import {
  CreditCard,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Loader2,
  ChevronRight,
  Flame,
  GraduationCap,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const [details, setDetails] = useState<SubscriptionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelGuide, setShowCancelGuide] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      getUserSubscriptionDetails().then((res) => {
        if (res.success && res.data) {
          setDetails(res.data);
        }
        setIsLoading(false);
      });
    } else {
      setShowCancelGuide(false);
    }
  }, [open]);

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '—';
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-[#0F0F0F] border border-white/10 text-white p-0 overflow-hidden shadow-2xl rounded-2xl">
        {/* Header with Neon Accent */}
        <div className="bg-gradient-to-r from-[#141414] via-[#1a1a1a] to-[#141414] p-6 border-b border-white/5 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.15)]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white tracking-wide">
                Abonnement & Facturation
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-400">
                Gérez votre formule, vos factures et les paramètres de votre adhésion OPAL.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-neutral-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#39FF14]" />
              <span className="text-xs">Chargement des données de facturation...</span>
            </div>
          ) : (
            <>
              {/* Plan Card */}
              <div className="rounded-xl bg-[#141414] border border-white/10 p-5 space-y-4 relative overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center">
                      {details?.plan === 'intensive' ? (
                        <Flame className="w-5 h-5 text-[#39FF14] fill-current" />
                      ) : (
                        <GraduationCap className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">
                          {details?.planName || 'OPAL Intensive'}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
                          Actif
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {details?.billingPeriod}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-white">
                      {details?.priceFormatted}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/5 text-xs">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Calendar className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span>
                      Début :{' '}
                      <strong className="text-white">
                        {formatDate(details?.startsAt || null)}
                      </strong>
                    </span>
                  </div>

                  {details?.expiresAt && (
                    <div className="flex items-center gap-2 text-neutral-400">
                      <Calendar className="w-4 h-4 text-neutral-500 shrink-0" />
                      <span>
                        Échéance :{' '}
                        <strong className="text-white">
                          {formatDate(details.expiresAt)}
                        </strong>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-neutral-400 sm:col-span-2">
                    <ShieldCheck className="w-4 h-4 text-[#39FF14] shrink-0" />
                    <span className="truncate">
                      Compte associé :{' '}
                      <strong className="text-white">{details?.email}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Whop Portal Action */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
                      <span>Espace Client Whop (Paiements & Factures)</span>
                    </h4>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Vos paiements et factures sont gérés sur le portail sécurisé Whop. Vous pouvez y télécharger vos reçus fiscaux, modifier votre carte bancaire ou gérer votre formule.
                    </p>
                  </div>
                </div>

                <a
                  href={details?.whopPortalUrl || 'https://whop.com/hub/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-[#39FF14]/40 font-bold text-xs flex items-center justify-center gap-2 transition-all group"
                >
                  <span>Accéder à mon espace client Whop</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>

              {/* Cancellation Accordion / Section */}
              <div className="rounded-xl border border-white/10 bg-[#121212] overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setShowCancelGuide(!showCancelGuide)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400/80" />
                    <span className="text-xs font-semibold text-neutral-300">
                      Comment résilier mon abonnement ?
                    </span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                      showCancelGuide ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {showCancelGuide && (
                  <div className="p-4 pt-0 border-t border-white/5 space-y-4 animate-in fade-in duration-200">
                    <div className="p-3 rounded-lg bg-black/60 border border-white/5 text-[11px] text-neutral-300 space-y-2">
                      <div className="flex items-center gap-1.5 text-[#39FF14] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Sans engagement • Vos droits garantis :</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-neutral-400 pl-1">
                        <li>
                          Votre accès à OPAL reste <strong className="text-white">100% actif</strong> jusqu'à la fin de votre période déjà réglée.
                        </li>
                        <li>
                          <strong className="text-white">Aucun prélèvement futur</strong> ne sera effectué après l'annulation.
                        </li>
                        <li>
                          Vous pouvez vous réabonner quand vous le souhaitez en conservant vos statistiques et historiques.
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-white">
                        Procédure de résiliation en 3 étapes :
                      </p>
                      <div className="space-y-2 text-xs text-neutral-400">
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                            1
                          </span>
                          <span>
                            Cliquez sur le bouton ci-dessous pour ouvrir votre espace client Whop (connecté avec l'email <strong>{details?.email}</strong>).
                          </span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                            2
                          </span>
                          <span>
                            Sélectionnez votre abonnement <strong>OPAL</strong>, puis cliquez sur <strong>« Manage »</strong> puis <strong>« Cancel Membership »</strong>.
                          </span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                            3
                          </span>
                          <span>
                            Validez : votre résiliation est prise en compte instantanément par notre serveur et confirmée par email.
                          </span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={details?.whopPortalUrl || 'https://whop.com/hub/'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-11 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-colors group"
                    >
                      <span>Résilier sur l'Espace Client Whop</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-[#0D0D0D] flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[11px]">Besoin d'aide ? Contactez le support OPAL</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs h-8"
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
