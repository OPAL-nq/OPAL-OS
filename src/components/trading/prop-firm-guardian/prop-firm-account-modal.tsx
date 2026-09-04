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
import { Textarea } from '@/components/ui/textarea';
import { Plus, Shield, Sparkles, Loader2, Edit, AlertCircle } from 'lucide-react';
import { PROP_FIRM_PRESETS, POPULAR_PROP_FIRMS, getPropFirmLabel } from '@/lib/prop-firm-constants';
import { createPropFirmAccount, updatePropFirmAccount } from '@/app/actions/prop-firm';
import type { PropFirmAccount, PropFirmPreset } from '@/types/prop-firm';
import { cn } from '@/lib/utils';

interface PropFirmAccountModalProps {
  accountToEdit?: PropFirmAccount | null;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const KNOWN_FIRM_KEYS = ['tradeify', 'mffu', 'topstep', 'apex', 'lucid', 'tradeday', 'bulenox'];

export function PropFirmAccountModal({
  accountToEdit,
  trigger,
  onSuccess,
}: PropFirmAccountModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preset Filter State
  const [presetFilter, setPresetFilter] = useState<string>('all');

  // Detect if existing account is custom or known
  const existingIsCustom = accountToEdit
    ? !KNOWN_FIRM_KEYS.includes(accountToEdit.firm_name.toLowerCase()) || accountToEdit.firm_name === 'custom'
    : false;

  // Form State
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    accountToEdit ? `${accountToEdit.firm_name}-${accountToEdit.account_tier}` : 'tradeify-50k-growth'
  );
  const [accountName, setAccountName] = useState(accountToEdit?.account_name || 'Tradeify 50k #1');
  const [firmName, setFirmName] = useState<string>(
    accountToEdit ? (existingIsCustom ? 'custom' : accountToEdit.firm_name.toLowerCase()) : 'tradeify'
  );
  const [customFirmName, setCustomFirmName] = useState<string>(
    existingIsCustom && accountToEdit ? accountToEdit.firm_name : ''
  );
  const [accountTier, setAccountTier] = useState(accountToEdit?.account_tier || '50k');
  const [startingBalance, setStartingBalance] = useState(accountToEdit?.starting_balance || 50000);
  const [currentBalance, setCurrentBalance] = useState(
    accountToEdit?.current_balance || accountToEdit?.starting_balance || 50000
  );
  const [highWaterMark, setHighWaterMark] = useState(
    accountToEdit?.high_water_mark || accountToEdit?.starting_balance || 50000
  );
  const [drawdownLimit, setDrawdownLimit] = useState(accountToEdit?.drawdown_limit || 2000);
  const [maxDailyLoss, setMaxDailyLoss] = useState<string>(
    accountToEdit?.max_daily_loss ? String(accountToEdit.max_daily_loss) : '1250'
  );
  const [profitTarget, setProfitTarget] = useState<string>(
    accountToEdit?.profit_target ? String(accountToEdit.profit_target) : '3000'
  );
  const [consistencyRulePct, setConsistencyRulePct] = useState<string>(
    accountToEdit?.consistency_rule_pct ? String(accountToEdit.consistency_rule_pct) : ''
  );
  const [isTrailingEod, setIsTrailingEod] = useState(accountToEdit?.is_trailing_eod ?? true);
  const [notes, setNotes] = useState(accountToEdit?.notes || '');

  // Filtered Presets
  const filteredPresets =
    presetFilter === 'all'
      ? PROP_FIRM_PRESETS
      : PROP_FIRM_PRESETS.filter((p) => p.firmName === presetFilter);

  // Handle preset selection
  const handleSelectPreset = (preset: PropFirmPreset) => {
    setSelectedPresetId(preset.id);
    setFirmName(preset.firmName);
    if (preset.firmName === 'custom') {
      setCustomFirmName('');
    }
    setAccountTier(preset.tierLabel);
    setStartingBalance(preset.startingBalance);
    setCurrentBalance(preset.startingBalance);
    setHighWaterMark(preset.startingBalance);
    setDrawdownLimit(preset.drawdownLimit);
    setMaxDailyLoss(preset.maxDailyLoss ? String(preset.maxDailyLoss) : '');
    setProfitTarget(preset.profitTarget ? String(preset.profitTarget) : '');
    setConsistencyRulePct(preset.consistencyRulePct ? String(preset.consistencyRulePct) : '');
    setIsTrailingEod(preset.isTrailingEod);
    if (!accountToEdit) {
      const tierShort = preset.tierLabel.split(' ')[0];
      setAccountName(`${preset.firmLabel} ${tierShort} #1`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) {
      setError('Veuillez donner un nom à ce compte.');
      return;
    }

    if (firmName === 'custom' && !customFirmName.trim()) {
      setError('Veuillez indiquer le nom de votre Prop Firm personnalisée.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const resolvedFirmName =
      firmName === 'custom' && customFirmName.trim() ? customFirmName.trim() : firmName;

    try {
      if (accountToEdit) {
        await updatePropFirmAccount(accountToEdit.id, {
          accountName,
          firmName: resolvedFirmName,
          accountTier,
          startingBalance: Number(startingBalance),
          currentBalance: Number(currentBalance),
          highWaterMark: Number(highWaterMark),
          drawdownLimit: Number(drawdownLimit),
          maxDailyLoss: maxDailyLoss ? Number(maxDailyLoss) : null,
          profitTarget: profitTarget ? Number(profitTarget) : null,
          consistencyRulePct: consistencyRulePct ? Number(consistencyRulePct) : null,
          isTrailingEod,
          notes,
        });
      } else {
        await createPropFirmAccount({
          accountName,
          firmName: resolvedFirmName,
          accountTier,
          startingBalance: Number(startingBalance),
          currentBalance: Number(currentBalance),
          highWaterMark: Number(highWaterMark),
          drawdownLimit: Number(drawdownLimit),
          maxDailyLoss: maxDailyLoss ? Number(maxDailyLoss) : null,
          profitTarget: profitTarget ? Number(profitTarget) : null,
          consistencyRulePct: consistencyRulePct ? Number(consistencyRulePct) : null,
          isTrailingEod,
          notes,
        });
      }

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="sm"
            className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold text-xs shadow-[0_0_15px_rgba(57,255,20,0.25)]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Ajouter un Compte Prop Firm</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-[#141414] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-3 border-b border-white/5">
          <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#39FF14]" />
            <span>{accountToEdit ? 'Modifier le Compte Prop Firm' : 'Nouveau Compte Prop Firm & Drawdown'}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Presets Selector */}
          {!accountToEdit && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
                  <span>1. Choisir un Template Prop Firm préconfiguré</span>
                </label>
              </div>

              {/* Firm Category Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setPresetFilter('all')}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all border shrink-0',
                    presetFilter === 'all'
                      ? 'bg-[#39FF14] text-black border-[#39FF14]'
                      : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white hover:border-white/20'
                  )}
                >
                  Toutes ({PROP_FIRM_PRESETS.length})
                </button>
                {POPULAR_PROP_FIRMS.map((firm) => {
                  const count = PROP_FIRM_PRESETS.filter((p) => p.firmName === firm.key).length;
                  const isSelected = presetFilter === firm.key;
                  return (
                    <button
                      key={firm.key}
                      type="button"
                      onClick={() => setPresetFilter(firm.key)}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all border shrink-0',
                        isSelected
                          ? 'bg-[#39FF14] text-black border-[#39FF14]'
                          : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white hover:border-white/20'
                      )}
                    >
                      {firm.label.split(' ')[0]} {count > 0 && `(${count})`}
                    </button>
                  );
                })}
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {filteredPresets.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={cn(
                        'p-2.5 rounded-lg border text-left transition-all text-xs flex flex-col justify-between gap-1',
                        isSelected
                          ? 'bg-[#39FF14]/15 border-[#39FF14] text-white shadow-[0_0_10px_rgba(57,255,20,0.15)]'
                          : 'bg-[#0A0A0A] border-white/10 text-neutral-400 hover:border-white/25 hover:text-neutral-200'
                      )}
                    >
                      <div>
                        <div className="font-bold text-white flex items-center justify-between">
                          <span className="truncate">{preset.firmLabel}</span>
                          <span className="text-[10px] text-[#39FF14] font-mono shrink-0 ml-1">
                            {preset.tierLabel.split(' ')[0]}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                          {preset.tierLabel}
                        </p>
                      </div>
                      <p className="text-[9px] text-neutral-500 font-mono">
                        {preset.isTrailingEod ? 'Trailing EOD' : 'Trailing Intraday'} • DD ${preset.drawdownLimit}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4 pt-2 border-t border-white/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Nom du compte (identifiant personnel)
                </label>
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="ex: Tradeify 50k #1, Topstep Combine #2..."
                  className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Prop Firm
                </label>
                <select
                  value={firmName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFirmName(val);
                    if (val !== 'custom') {
                      setCustomFirmName('');
                    }
                  }}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-md text-white text-xs h-9 px-3 focus:border-[#39FF14]/50 focus:outline-none"
                >
                  {POPULAR_PROP_FIRMS.map((firm) => (
                    <option key={firm.key} value={firm.key}>
                      {firm.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Prop Firm Name Field */}
              {firmName === 'custom' && (
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                    <span>Nom de votre Prop Firm personnalisée</span>
                    <span className="text-[10px] text-[#39FF14] font-bold">Sur Mesure</span>
                  </label>
                  <Input
                    value={customFirmName}
                    onChange={(e) => setCustomFirmName(e.target.value)}
                    placeholder="ex: Take Profit Trader, Fast Track Trading, Funding Pips, Alpha Capital..."
                    className="bg-[#0A0A0A] border-[#39FF14]/40 text-white text-xs h-9 focus:border-[#39FF14]"
                    required
                  />
                  <p className="text-[10px] text-neutral-400">
                    Saisissez le nom exact de la prop firm : elle sera enregistrée et affichée sur votre tableau de bord.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Solde de départ ($)
                </label>
                <Input
                  type="number"
                  value={startingBalance}
                  onChange={(e) => setStartingBalance(Number(e.target.value))}
                  className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Solde actuel ($)
                </label>
                <Input
                  type="number"
                  value={currentBalance}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCurrentBalance(val);
                    if (val > highWaterMark) setHighWaterMark(val);
                  }}
                  className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Plus Haut Atteint (HWM) ($)
                </label>
                <Input
                  type="number"
                  value={highWaterMark}
                  onChange={(e) => setHighWaterMark(Number(e.target.value))}
                  className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Drawdown Max Autorisé ($)
                </label>
                <Input
                  type="number"
                  value={drawdownLimit}
                  onChange={(e) => setDrawdownLimit(Number(e.target.value))}
                  className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Perte Max Journalière ($)
                </label>
                <Input
                  type="number"
                  value={maxDailyLoss}
                  onChange={(e) => setMaxDailyLoss(e.target.value)}
                  placeholder="Optionnel (ex: 1000)"
                  className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Objectif de Profit ($)
                </label>
                <Input
                  type="number"
                  value={profitTarget}
                  onChange={(e) => setProfitTarget(e.target.value)}
                  placeholder="Optionnel (ex: 3000)"
                  className="bg-[#0A0A0A] border-white/10 text-white text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 mb-2">
                  Mécanisme de Trailing
                </label>
                <div className="flex items-center gap-4 h-9">
                  <label className="inline-flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="radio"
                      name="trailingType"
                      checked={isTrailingEod}
                      onChange={() => setIsTrailingEod(true)}
                      className="accent-[#39FF14]"
                    />
                    <span>Trailing EOD</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="radio"
                      name="trailingType"
                      checked={!isTrailingEod}
                      onChange={() => setIsTrailingEod(false)}
                      className="accent-[#39FF14]"
                    />
                    <span>Trailing Live</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Notes & Stratégie pour ce compte
              </label>
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ex: Passer en Micro MNQ dès que le buffer passe sous 1000$..."
                className="bg-[#0A0A0A] border-white/10 text-white text-xs leading-relaxed"
              />
            </div>
          </div>

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
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>{accountToEdit ? 'Mettre à jour' : 'Créer le compte Guardian'}</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
