'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SignaturePad } from './signature-pad';
import { ContractDraft } from '@/types/contract';
import { ShieldAlert, Info, ArrowRight, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { signNewContract } from '@/app/actions/contract';

interface ContractBuilderProps {
  onContractSigned: () => void;
}

export function ContractBuilder({ onContractSigned }: ContractBuilderProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [maxDailyLoss, setMaxDailyLoss] = useState<string>('500');
  const [maxTrades, setMaxTrades] = useState<string>('3');
  const [startTime, setStartTime] = useState<string>('15:30');
  const [endTime, setEndTime] = useState<string>('17:30');
  const [instruments, setInstruments] = useState<string>('NQ, MNQ');
  const [setups, setSetups] = useState<string>('Pullback M1, Breakout M5');
  const [signature, setSignature] = useState<string | null>(null);

  const handleNext = () => {
    setErrorMessage(null);
    setStep((s) => Math.min(s + 1, 3));
  };
  const handlePrev = () => {
    setErrorMessage(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSign = async () => {
    setErrorMessage(null);
    if (!signature) {
      setErrorMessage('Veuillez apposer votre signature sur le cadre ci-dessous.');
      return;
    }

    setIsSubmitting(true);
    
    const draft: ContractDraft = {
      max_daily_loss: parseFloat(maxDailyLoss),
      max_trades_per_day: parseInt(maxTrades, 10),
      allowed_instruments: instruments.split(',').map((s) => s.trim()),
      allowed_setups: setups.split(',').map((s) => s.trim()),
      trading_hours_start: startTime + ':00',
      trading_hours_end: endTime + ':00',
      signature_data_url: signature,
    };

    const res = await signNewContract(draft);
    setIsSubmitting(false);

    if (res.success) {
      onContractSigned();
    } else {
      setErrorMessage(res.error || 'Une erreur est survenue lors de la signature.');
    }
  };

  return (
    <Card className="bg-[#141414] border-white/10 p-6 md:p-8 space-y-8 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider">
          Contrat d'Exécution Professionnel
        </h2>
        <p className="text-neutral-400 text-sm">
          Formalisez vos règles infranchissables. Toute violation de ce contrat déclenchera une alerte.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                step >= i
                  ? 'bg-[#39FF14] text-black shadow-[0_0_10px_rgba(57,255,20,0.3)]'
                  : 'bg-white/5 text-neutral-500 border border-white/10'
              }`}
            >
              {i}
            </div>
            {i < 3 && (
              <div
                className={`w-12 h-px ${
                  step > i ? 'bg-[#39FF14]' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">
              Étape 1 : Gestion du Risque
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-neutral-300">Perte Journalière Max ($)</Label>
                <Input
                  type="number"
                  value={maxDailyLoss}
                  onChange={(e) => setMaxDailyLoss(e.target.value)}
                  className="bg-black/40 border-white/10 text-white"
                  placeholder="ex: 500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Nombre Max de Trades / Jour</Label>
                <Input
                  type="number"
                  value={maxTrades}
                  onChange={(e) => setMaxTrades(e.target.value)}
                  className="bg-black/40 border-white/10 text-white"
                  placeholder="ex: 3"
                />
              </div>
            </div>
            <div className="flex p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <p>
                Ces limites sont non-négociables. Atteindre votre perte journalière max ou votre limite de trades signifie l'arrêt immédiat de la session.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">
              Étape 2 : Périmètre d'Intervention
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-neutral-300">Heure de Début (Session)</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-black/40 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Heure de Fin Maximum</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-black/40 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-neutral-300">Actifs Autorisés (séparés par des virgules)</Label>
              <Input
                value={instruments}
                onChange={(e) => setInstruments(e.target.value)}
                className="bg-black/40 border-white/10 text-white"
                placeholder="ex: NQ, MNQ, ES"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-neutral-300">Setups Valides (séparés par des virgules)</Label>
              <Input
                value={setups}
                onChange={(e) => setSetups(e.target.value)}
                className="bg-black/40 border-white/10 text-white"
                placeholder="ex: Breakout Asie, Pullback VWAP"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">
              Étape 3 : Serment & Signature
            </h3>
            
            <div className="bg-black/40 p-5 rounded-xl border border-white/5 space-y-4 text-sm text-neutral-300 leading-relaxed italic">
              <p>
                "Je m'engage solennellement à respecter ces règles d'exécution. Je reconnais que la discipline est la seule voie vers la rentabilité à long terme."
              </p>
              <p>
                "Toute déviation par rapport à ce plan sera enregistrée, analysée, et assumée de ma part. Je suis le seul responsable de l'exécution de mes trades."
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-white font-bold">Signature Numérique :</Label>
              <SignaturePad onSignatureChange={setSignature} />
            </div>
          </div>
        )}
      </div>

      {/* Error message banner */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={step === 1 || isSubmitting}
          className="border-white/10 text-white hover:bg-white/10"
        >
          Précédent
        </Button>

        {step < 3 ? (
          <Button
            onClick={handleNext}
            className="bg-[#39FF14] text-black hover:bg-[#32e012] font-bold"
          >
            Suivant <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSign}
            disabled={!signature || isSubmitting}
            className="bg-[#39FF14] text-black hover:bg-[#32e012] font-bold shadow-[0_0_15px_rgba(57,255,20,0.25)]"
          >
            {isSubmitting ? 'Signature en cours...' : 'Signer le Contrat'}
            {!isSubmitting && <Save className="w-4 h-4 ml-2" />}
          </Button>
        )}
      </div>
    </Card>
  );
}
