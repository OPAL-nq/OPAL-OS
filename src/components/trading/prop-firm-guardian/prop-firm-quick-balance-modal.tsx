'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, Loader2, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { quickUpdateAccountBalance } from '@/app/actions/prop-firm';
import type { PropFirmAccount } from '@/types/prop-firm';

interface PropFirmQuickBalanceModalProps {
  account: PropFirmAccount;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function PropFirmQuickBalanceModal({
  account,
  trigger,
  onSuccess,
}: PropFirmQuickBalanceModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newBalance, setNewBalance] = useState<number>(Number(account.current_balance));
  const [pnlDelta, setPnlDelta] = useState<string>('');

  const handlePnlChange = (val: string) => {
    setPnlDelta(val);
    const num = Number(val);
    if (!isNaN(num)) {
      setNewBalance(Number(account.current_balance) + num);
    }
  };

  const handleBalanceChange = (val: number) => {
    setNewBalance(val);
    setPnlDelta(String(val - Number(account.current_balance)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await quickUpdateAccountBalance(account.id, Number(newBalance));
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDiff = newBalance - Number(account.current_balance);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 text-xs text-neutral-300 hover:bg-white/5 h-8"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1 text-[#39FF14]" />
            <span>Mettre à jour le solde</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-[#141414] border-white/10 text-white max-w-md p-6">
        <DialogHeader className="pb-3 border-b border-white/5">
          <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#39FF14]" />
            <span>Actualiser le Solde : {account.account_name}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/5 flex items-center justify-between text-xs">
            <span className="text-neutral-400">Solde enregistré :</span>
            <span className="font-mono font-bold text-white">
              {Number(account.current_balance).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              PnL de la séance / Gain du jour ($)
            </label>
            <Input
              type="number"
              step="any"
              placeholder="ex: +450 ou -200"
              value={pnlDelta}
              onChange={(e) => handlePnlChange(e.target.value)}
              className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Nouveau solde total ($)
            </label>
            <Input
              type="number"
              step="any"
              value={newBalance}
              onChange={(e) => handleBalanceChange(Number(e.target.value))}
              className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9 font-mono font-bold"
              required
            />
          </div>

          {currentDiff !== 0 && (
            <div className="text-xs flex items-center justify-between px-1">
              <span className="text-neutral-400">Variation :</span>
              <span
                className={`font-mono font-bold ${
                  currentDiff > 0 ? 'text-[#39FF14]' : 'text-red-400'
                }`}
              >
                {currentDiff > 0 ? `+${currentDiff.toFixed(2)} $` : `${currentDiff.toFixed(2)} $`}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold text-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  <span>Mise à jour...</span>
                </>
              ) : (
                <span>Enregistrer le solde</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
