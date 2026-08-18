'use client';

import React from 'react';
import { TraderContract } from '@/types/contract';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileSignature, ShieldCheck, Clock, Target, AlertTriangle, RefreshCw } from 'lucide-react';
import Image from 'next/image';

interface ActiveContractViewProps {
  contract: TraderContract;
  onRenewContract: () => void;
}

export function ActiveContractView({ contract, onRenewContract }: ActiveContractViewProps) {
  const signedDate = new Date(contract.signed_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#39FF14]" />
            Contrat Opérationnel Actif
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Signé et scellé le {signedDate}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRenewContract}
          className="border-white/10 text-neutral-400 hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" />
          Nouveau Contrat
        </Button>
      </div>

      <Card className="relative overflow-hidden bg-gradient-to-b from-[#14161F] via-[#10121A] to-[#0D0E14] border-white/10 p-8 shadow-2xl">
        {/* Decorative corner seal */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#39FF14]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-6 right-6 pointer-events-none opacity-20">
          <FileSignature className="w-24 h-24 text-[#39FF14]" />
        </div>

        <div className="relative z-10 space-y-10">
          {/* Section 1: Risque */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest border-b border-white/5 pb-2">
              Paramètres de Risque Strict
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-black/40 p-4 rounded-xl border border-red-500/20">
                <div className="flex items-center gap-2 text-red-400 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Perte Journalière Max</span>
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  ${contract.max_daily_loss}
                </div>
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-amber-500/20">
                <div className="flex items-center gap-2 text-amber-400 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Trades Max / Jour</span>
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {contract.max_trades_per_day} trades
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Périmètre */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest border-b border-white/5 pb-2">
              Périmètre d'Intervention
            </h3>
            
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-4">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <span className="text-xs text-neutral-500 block mb-1">Horaires de Trading</span>
                  <div className="flex items-center gap-2 text-white font-mono font-bold">
                    <Clock className="w-4 h-4 text-[#39FF14]" />
                    {contract.trading_hours_start.slice(0, 5)} - {contract.trading_hours_end.slice(0, 5)}
                  </div>
                </div>

                <div className="w-px h-8 bg-white/10 hidden sm:block" />

                <div>
                  <span className="text-xs text-neutral-500 block mb-1">Actifs Autorisés</span>
                  <div className="flex flex-wrap gap-2">
                    {contract.allowed_instruments.map((inst, i) => (
                      <Badge key={i} variant="secondary" className="bg-white/5 text-white border-white/10">
                        {inst}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <span className="text-xs text-neutral-500 block mb-2">Setups Autorisés</span>
                <div className="flex flex-wrap gap-2">
                  {contract.allowed_setups.map((setup, i) => (
                    <Badge key={i} variant="outline" className="text-cyan-400 border-cyan-400/20 bg-cyan-400/5">
                      {setup}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Signatures */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-8 justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold">Signature du Trader</p>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 min-h-[100px] flex items-center justify-center relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={contract.signature_data_url} 
                  alt="Signature du trader" 
                  className="max-h-20 opacity-80 filter drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]" 
                />
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold">Sceau OPAL / Coach</p>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 min-h-[100px] flex items-center justify-center relative">
                {contract.coach_signature_data_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={contract.coach_signature_data_url} 
                    alt="Signature du coach" 
                    className="max-h-20 opacity-80" 
                  />
                ) : (
                  <div className="text-center">
                    <ShieldCheck className="w-8 h-8 text-white/10 mx-auto mb-1" />
                    <span className="text-xs text-neutral-500 italic">En attente de validation Intensive</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
