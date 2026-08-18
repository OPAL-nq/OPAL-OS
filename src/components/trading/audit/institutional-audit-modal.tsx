'use client';

import React, { useState, useMemo } from 'react';
import { Trade } from '@/types/trading';
import {
  generateInstitutionalAuditPdf,
  computeAuditMetrics,
  AuditExportOptions,
} from '@/lib/pdf/institutional-audit-generator';
import {
  FileText,
  Download,
  Shield,
  EyeOff,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  X,
  FileCheck,
} from 'lucide-react';

interface InstitutionalAuditModalProps {
  trades: Trade[];
  accounts?: any[];
  userProfile?: {
    full_name?: string;
    email?: string;
  };
  triggerButtonText?: string;
  className?: string;
}

export function InstitutionalAuditModal({
  trades,
  accounts = [],
  userProfile,
  triggerButtonText = 'Exporter l’Audit PDF',
  className = '',
}: InstitutionalAuditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Configuration States
  const [traderName, setTraderName] = useState(userProfile?.full_name || 'Trader OPAL');
  const [auditTitle, setAuditTitle] = useState('RAPPORT D’AUDIT INSTITUTIONNEL & PERFORMANCE');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'month' | '30d' | '7d' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [maskDollarAmounts, setMaskDollarAmounts] = useState(false);
  const [includeEquityCurve, setIncludeEquityCurve] = useState(true);
  const [includePsychologyMatrix, setIncludePsychologyMatrix] = useState(true);
  const [includeMentorSignoff, setIncludeMentorSignoff] = useState(true);
  const [traderNotes, setTraderNotes] = useState('');
  const [mentorNotes, setMentorNotes] = useState(
    'Le profil d’exécution démontre une gestion du risque rigoureuse et une exécution conforme aux standards du programme OPAL Intensive.'
  );
  const [nextMonthGoals, setNextMonthGoals] = useState(
    '1. Maintenir le taux de conformité > 90%  |  2. Prioriser les setups NY AM  |  3. Zéro écart de Stop Loss.'
  );

  // Filter trades based on selected period & account
  const filteredTrades = useMemo(() => {
    let list = [...trades];

    // Filter by Account
    if (selectedAccountId !== 'all') {
      list = list.filter((t) => (t as any).account_id === selectedAccountId || (t as any).prop_firm_account_id === selectedAccountId);
    }

    // Filter by Date
    const now = new Date();
    if (periodFilter === '7d') {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      list = list.filter((t) => new Date(t.trade_date) >= past7);
    } else if (periodFilter === '30d') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      list = list.filter((t) => new Date(t.trade_date) >= past30);
    } else if (periodFilter === 'month') {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      list = list.filter((t) => new Date(t.trade_date) >= firstDayOfMonth);
    } else if (periodFilter === 'custom') {
      if (startDate) {
        const start = new Date(startDate);
        list = list.filter((t) => new Date(t.trade_date) >= start);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        list = list.filter((t) => new Date(t.trade_date) <= end);
      }
    }

    return list;
  }, [trades, periodFilter, startDate, endDate, selectedAccountId]);

  // Real-time preview stats
  const previewStats = useMemo(() => {
    return computeAuditMetrics(filteredTrades);
  }, [filteredTrades]);

  // Selected Period Label
  const periodLabel = useMemo(() => {
    if (periodFilter === 'all') return 'Tout l’historique';
    if (periodFilter === 'month') {
      return new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
    if (periodFilter === '30d') return '30 Derniers Jours';
    if (periodFilter === '7d') return '7 Derniers Jours';
    if (periodFilter === 'custom') {
      return `${startDate || 'Début'} au ${endDate || 'Aujourd’hui'}`;
    }
    return 'Période Sélectionnée';
  }, [periodFilter, startDate, endDate]);

  // Account Label
  const accountLabel = useMemo(() => {
    if (selectedAccountId === 'all') return 'Tous les comptes combinés';
    const acc = accounts.find((a) => a.id === selectedAccountId);
    return acc ? `${acc.account_name} (${acc.firm_name?.toUpperCase()})` : 'Compte Spécifique';
  }, [selectedAccountId, accounts]);

  const handleGeneratePdf = async () => {
    try {
      setIsGenerating(true);
      setDownloadSuccess(false);

      const options: AuditExportOptions = {
        traderName: traderName.trim() || 'Membre OPAL',
        auditTitle: auditTitle.trim(),
        periodLabel,
        accountLabel,
        maskDollarAmounts,
        includeEquityCurve,
        includePsychologyMatrix,
        includeMentorSignoff,
        traderNotes: traderNotes.trim() || undefined,
        mentorNotes: mentorNotes.trim() || undefined,
        nextMonthGoals: nextMonthGoals.trim() || undefined,
      };

      await generateInstitutionalAuditPdf(filteredTrades, options);

      setIsGenerating(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Erreur génération PDF:', err);
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-700 text-white border border-white/10 hover:border-[#39FF14]/40 text-xs font-semibold shadow-lg hover:shadow-[#39FF14]/10 transition-all duration-200 group ${className}`}
      >
        <div className="w-5 h-5 rounded-lg bg-[#39FF14]/10 flex items-center justify-center text-[#39FF14] group-hover:scale-110 transition-transform">
          <FileText className="w-3.5 h-3.5" />
        </div>
        <span>{triggerButtonText}</span>
        <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[10px] text-[#39FF14] font-mono">
          PDF HD
        </span>
      </button>

      {/* Modal Backdrop & Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0E1015] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#12141C]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white tracking-tight">
                      Générateur de Rapport d’Audit Institutionnel
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-[10px] font-mono font-semibold">
                      OPAL AUDIT ENGINE
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Exportez un dossier PDF multi-pages haute résolution prêt pour vos bilans, prop firms et investisseurs.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body with 2-Column Layout */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Live Preview Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-[#141722] border border-white/5">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Trades Inclus
                  </span>
                  <span className="text-lg font-black text-white font-mono">
                    {previewStats.totalTrades}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">
                    {previewStats.winTrades}W / {previewStats.lossTrades}L
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Performance R
                  </span>
                  <span
                    className={`text-lg font-black font-mono ${
                      previewStats.totalR >= 0 ? 'text-[#39FF14]' : 'text-[#FF3B30]'
                    }`}
                  >
                    {previewStats.totalR >= 0 ? '+' : ''}
                    {previewStats.totalR.toFixed(2)} R
                  </span>
                  <span className="text-[10px] text-neutral-500 block">
                    {maskDollarAmounts ? 'Montant $ masqué' : `${previewStats.totalPnlDollars >= 0 ? '+' : ''}${previewStats.totalPnlDollars.toFixed(0)} $`}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Win Rate
                  </span>
                  <span className="text-lg font-black text-white font-mono">
                    {previewStats.winRate.toFixed(1)} %
                  </span>
                  <span className="text-[10px] text-neutral-500 block">
                    Ratio {previewStats.winTrades}/{previewStats.totalTrades || 1}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Profit Factor
                  </span>
                  <span
                    className={`text-lg font-black font-mono ${
                      previewStats.profitFactor >= 1.5 ? 'text-[#39FF14]' : 'text-cyan-400'
                    }`}
                  >
                    {previewStats.profitFactor >= 99 ? '∞' : previewStats.profitFactor.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">
                    Gain vs Perte
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Max Drawdown
                  </span>
                  <span className="text-lg font-black text-[#FF3B30] font-mono">
                    -{previewStats.maxDrawdownR.toFixed(2)} R
                  </span>
                  <span className="text-[10px] text-neutral-500 block">
                    Rigueur {previewStats.planFollowedRate.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Metadata & Scope */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#39FF14]" />
                    <span>1. Période & Périmètre d’Audit</span>
                  </h3>

                  {/* Trader Name */}
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Nom / Pseudo sur le rapport
                    </label>
                    <input
                      type="text"
                      value={traderName}
                      onChange={(e) => setTraderName(e.target.value)}
                      placeholder="Ex: Alex - OPAL Intensive"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#39FF14] transition-colors"
                    />
                  </div>

                  {/* Period Filter Buttons */}
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">
                      Période analysée
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { id: 'all', label: 'Tout l’historique' },
                        { id: 'month', label: 'Ce mois-ci' },
                        { id: '30d', label: '30 Jours' },
                        { id: 'custom', label: 'Personnalisée' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPeriodFilter(p.id as any)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-center border ${
                            periodFilter === p.id
                              ? 'bg-[#39FF14]/15 border-[#39FF14] text-[#39FF14]'
                              : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    {periodFilter === 'custom' && (
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5 animate-in fade-in">
                        <div>
                          <span className="text-[10px] text-neutral-400 block mb-0.5">Date début</span>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#39FF14]"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 block mb-0.5">Date fin</span>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#39FF14]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Account Selector */}
                  {accounts.length > 0 && (
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                        Compte ciblé
                      </label>
                      <select
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#39FF14] transition-colors"
                      >
                        <option value="all">Tous les comptes combinés</option>
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.account_name} ({acc.firm_name?.toUpperCase()} - {acc.account_tier})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Trader Context Note */}
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Note de contexte du trader (optionnel)
                    </label>
                    <textarea
                      rows={2}
                      value={traderNotes}
                      onChange={(e) => setTraderNotes(e.target.value)}
                      placeholder="Ex: Période de transition sur contrat NQ, application stricte des Killzones AM..."
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#39FF14] transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Right Column: PDF Options & Institutional Sign-off */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>2. Options de Présentation & Confidentialité</span>
                  </h3>

                  {/* Options Toggles */}
                  <div className="space-y-2.5 p-3.5 rounded-xl bg-white/5 border border-white/5">
                    {/* Mask Dollars Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {maskDollarAmounts ? (
                          <EyeOff className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-neutral-400" />
                        )}
                        <div>
                          <span className="text-xs font-semibold text-white block">
                            Masquer les montants en Dollars ($)
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            Affiche uniquement les R et % (idéal pour partage public / réseaux)
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={maskDollarAmounts}
                        onChange={(e) => setMaskDollarAmounts(e.target.checked)}
                        className="w-4 h-4 accent-[#39FF14] rounded cursor-pointer"
                      />
                    </div>

                    {/* Equity Curve Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#39FF14]" />
                        <div>
                          <span className="text-xs font-semibold text-white block">
                            Courbe d’Équité Vectorielle HD
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            Graphique haute résolution avec gradient et ligne zéro
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={includeEquityCurve}
                        onChange={(e) => setIncludeEquityCurve(e.target.checked)}
                        className="w-4 h-4 accent-[#39FF14] rounded cursor-pointer"
                      />
                    </div>

                    {/* Psychology Matrix Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <div>
                          <span className="text-xs font-semibold text-white block">
                            Matrice Psychologique & Rigueur
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            Analyse des Killzones, respect du plan et discipline
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={includePsychologyMatrix}
                        onChange={(e) => setIncludePsychologyMatrix(e.target.checked)}
                        className="w-4 h-4 accent-[#39FF14] rounded cursor-pointer"
                      />
                    </div>

                    {/* Mentor Sign-off Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#39FF14]" />
                        <div>
                          <span className="text-xs font-semibold text-white block">
                            Encart de Validation Mentor Maxym
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            Sceau officiel et signature numérique OPAL Intensive
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={includeMentorSignoff}
                        onChange={(e) => setIncludeMentorSignoff(e.target.checked)}
                        className="w-4 h-4 accent-[#39FF14] rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Mentor Remarks & Objectives (if enabled) */}
                  {includeMentorSignoff && (
                    <div className="space-y-2 p-3 rounded-xl bg-black/40 border border-white/10 animate-in fade-in">
                      <div>
                        <label className="block text-[10px] font-bold text-[#39FF14] uppercase tracking-wider mb-1">
                          Appréciation & Validation Mentor
                        </label>
                        <textarea
                          rows={2}
                          value={mentorNotes}
                          onChange={(e) => setMentorNotes(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#39FF14] transition-colors resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                          Objectifs ciblés pour le mois suivant
                        </label>
                        <input
                          type="text"
                          value={nextMonthGoals}
                          onChange={(e) => setNextMonthGoals(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#39FF14] transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-[#12141C]">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <FileCheck className="w-4 h-4 text-[#39FF14]" />
                <span>
                  Format A4 multi-pages • Design Dark Luxury • Génération 100% sécurisée
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold transition-colors"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={handleGeneratePdf}
                  disabled={isGenerating || filteredTrades.length === 0}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                    filteredTrades.length === 0
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5'
                      : 'bg-[#39FF14] hover:bg-[#32e012] text-black shadow-[#39FF14]/20 hover:scale-[1.02]'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Génération de l’Audit HD...</span>
                    </>
                  ) : downloadSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Audit PDF Téléchargé !</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Télécharger l’Audit PDF HD</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
