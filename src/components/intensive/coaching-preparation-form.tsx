'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  HelpCircle,
  Brain,
  LineChart,
  Target,
  Send,
  Save,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  AlertCircle,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScreenshotUploader } from '@/components/trading/screenshot-uploader';
import { upsertCoachingPreparation } from '@/app/actions/intensive';
import { cn } from '@/lib/utils';
import type {
  CoachingSession,
  CoachingPreparation,
  CoachingPreparationDifficulties,
  TradeToReview,
  PreparationStatus,
} from '@/types';
import type { Trade } from '@/types/trading';

interface CoachingPreparationFormProps {
  session: CoachingSession;
  initialPreparation: CoachingPreparation | null;
  recentTrades: Trade[];
}

const PSYCHOLOGY_TAGS = [
  'Overtrading / Enchaînement compulsif',
  'Peur d’entrer (Hésitation / Paralysie)',
  'FOMO (Entrée tardive sans setup)',
  'Sortie prématurée (Gains coupés trop tôt)',
  'Non-respect du Stop Loss (Espoir)',
  'Revenge Trading après une perte',
  'Peur de perdre du capital',
  'Excès de confiance après une série gagnante',
  'Difficulté à s’arrêter sur Daily Loss',
];

const TECHNIQUE_TAGS = [
  'Volume Profile (Previous Day VAH / VAL / POC)',
  'VWAP de Session (Confluence & Réactions)',
  'Hauts & Bas de Session (Asian / London High & Low)',
  'Réactions VAH / VAL (Breakout / Rejection)',
  'Inversions de tendance & Structure de marché',
  'Inefficiences & Efficiences de marché',
  'Entrées sur IFVG / BPR / FVG',
  'Calibrage du Stop Loss & Prise de profit en ticks',
];

const RISK_TAGS = [
  'Calcul de taille de lot (NQ vs MNQ)',
  'Gestion du Daily Loss Limit',
  'Pression du Trailing Drawdown Prop Firm',
  'Scaling de taille / Nombre de contrats',
  'Gestion des annonces High Impact (CPI / FOMC)',
  'Passage d’évaluation / Challenge',
];

export function CoachingPreparationForm({
  session,
  initialPreparation,
  recentTrades,
}: CoachingPreparationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [status, setStatus] = useState<PreparationStatus>(initialPreparation?.status || 'draft');
  const [questions, setQuestions] = useState(initialPreparation?.questions || '');
  const [difficulties, setDifficulties] = useState<CoachingPreparationDifficulties>(
    initialPreparation?.difficulties || {
      psychology: [],
      technique: [],
      risk: [],
      notes: '',
    }
  );
  const [tradesToReview, setTradesToReview] = useState<TradeToReview[]>(
    initialPreparation?.trades_to_review || []
  );
  const [keyGoals, setKeyGoals] = useState(initialPreparation?.key_goals || '');

  // Add custom trade modal / state
  const [isAddingCustomTrade, setIsAddingCustomTrade] = useState(false);
  const [customTradeSymbol, setCustomTradeSymbol] = useState('NQ');
  const [customTradeDirection, setCustomTradeDirection] = useState<'Long' | 'Short'>('Long');
  const [customTradePnlR, setCustomTradePnlR] = useState('');
  const [customTradeDate, setCustomTradeDate] = useState(new Date().toISOString().split('T')[0]);
  const [customTradeScreenshot, setCustomTradeScreenshot] = useState('');
  const [customTradeNotes, setCustomTradeNotes] = useState('');

  // Toggle difficulty tag helper
  const toggleTag = (category: 'psychology' | 'technique' | 'risk', tag: string) => {
    setDifficulties((prev) => {
      const currentList = prev[category] || [];
      const exists = currentList.includes(tag);
      const nextList = exists ? currentList.filter((t) => t !== tag) : [...currentList, tag];
      return {
        ...prev,
        [category]: nextList,
      };
    });
  };

  // Add trade from journal
  const handleAddJournalTrade = (trade: Trade) => {
    if (tradesToReview.some((t) => t.id === trade.id)) return;
    const newTrade: TradeToReview = {
      id: trade.id,
      symbol: trade.instrument,
      direction: trade.direction,
      pnl_r: trade.pnl_r,
      pnl_dollars: trade.pnl_dollars,
      trade_date: trade.trade_date,
      screenshot_url: trade.screenshot_url || undefined,
      notes: trade.notes || undefined,
    };
    setTradesToReview((prev) => [...prev, newTrade]);
  };

  // Add custom trade
  const handleAddCustomTrade = () => {
    if (!customTradeSymbol.trim()) return;
    const newTrade: TradeToReview = {
      id: `custom_${Date.now()}`,
      symbol: customTradeSymbol.trim().toUpperCase(),
      direction: customTradeDirection,
      pnl_r: customTradePnlR ? Number(customTradePnlR) : undefined,
      trade_date: customTradeDate,
      screenshot_url: customTradeScreenshot || undefined,
      notes: customTradeNotes.trim() || undefined,
    };
    setTradesToReview((prev) => [...prev, newTrade]);
    setIsAddingCustomTrade(false);
    setCustomTradeScreenshot('');
    setCustomTradeNotes('');
    setCustomTradePnlR('');
  };

  // Remove trade
  const handleRemoveTrade = (index: number) => {
    setTradesToReview((prev) => prev.filter((_, i) => i !== index));
  };

  // Save handler
  const handleSave = (targetStatus: PreparationStatus) => {
    setSaveMessage(null);
    startTransition(async () => {
      try {
        const res = await upsertCoachingPreparation({
          sessionId: session.id,
          questions,
          difficulties,
          tradesToReview,
          keyGoals,
          status: targetStatus,
        });

        if (res.success) {
          setStatus(targetStatus);
          setSaveMessage({
            type: 'success',
            text:
              targetStatus === 'submitted'
                ? 'Fiche de coaching transmise avec succès à Maxym !'
                : 'Brouillon sauvegardé avec succès.',
          });
          router.refresh();
        }
      } catch (err: any) {
        console.error('Erreur sauvegarde coaching preparation:', err);
        setSaveMessage({
          type: 'error',
          text: err.message || 'Une erreur est survenue lors de la sauvegarde.',
        });
      }
    });
  };

  const sessionDate = new Date(session.scheduled_at);
  const formattedDate = sessionDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const startTime = sessionDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* 1. Header Navigation & Info Bar */}
      <div className="space-y-4">
        <Link
          href="/intensive/coaching"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour au planning des coachings</span>
        </Link>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#161616] via-[#141414] to-[#101010] border border-[#39FF14]/30 relative overflow-hidden shadow-[0_0_30px_rgba(57,255,20,0.06)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[#39FF14]/15 border border-[#39FF14]/30 text-[#39FF14] text-[10px] font-black uppercase tracking-wider">
                  OPAL Intensive • 1-on-1 Coaching
                </span>
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border',
                    status === 'submitted'
                      ? 'bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]/40'
                      : status === 'reviewed'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  )}
                >
                  {status === 'submitted'
                    ? 'Transmise à Maxym ✓'
                    : status === 'reviewed'
                    ? 'Revue par Maxym ✓'
                    : 'Brouillon en cours'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white capitalize tracking-tight">
                Préparer mon Coaching
              </h1>

              <div className="flex items-center gap-4 text-xs sm:text-sm text-neutral-300">
                <div className="flex items-center gap-1.5 text-[#39FF14] font-semibold">
                  <Calendar className="w-4 h-4 text-[#39FF14]" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{startTime} ({session.duration_minutes} min)</span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleSave('draft')}
                className="border-white/10 text-neutral-300 hover:bg-white/5 text-xs font-semibold h-10 px-4"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                <span>Sauvegarder brouillon</span>
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={isPending}
                onClick={() => handleSave('submitted')}
                className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold text-xs h-10 px-5 shadow-[0_0_20px_rgba(57,255,20,0.25)]"
              >
                {isPending ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Send className="w-3.5 h-3.5 mr-2" />
                )}
                <span>Valider & Transmettre</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Save feedback banner */}
        {saveMessage && (
          <div
            className={cn(
              'p-4 rounded-xl border text-xs font-medium flex items-center gap-2.5 transition-all',
              saveMessage.type === 'success'
                ? 'bg-[#39FF14]/10 border-[#39FF14]/30 text-[#39FF14]'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            )}
          >
            {saveMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{saveMessage.text}</span>
          </div>
        )}
      </div>

      {/* 2. SECTION 1: Questions & Key Points */}
      <Card className="bg-[#141414] border-white/5 shadow-lg">
        <CardHeader className="pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">
                1. Points & Questions à aborder
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Listez vos interrogations précises, blocages ou questions théoriques/pratiques pour Maxym.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Textarea
            rows={5}
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            placeholder="Ex : 
1. Comment mieux filtrer les faux signaux de liquidité lors de la session NY PM ?
2. Sur mon compte Topstep, comment adapter mon risque quand j'approche du target de 3 000 $ ?
3. Analyse du trade NQ de mardi : mon entrée était-elle valide selon le setup OPAL ?"
            className="bg-black/50 border-white/10 text-white text-xs leading-relaxed placeholder:text-neutral-600 focus:border-[#39FF14]/50 focus:ring-[#39FF14]/20 resize-y"
          />
        </CardContent>
      </Card>

      {/* 3. SECTION 2: Difficulties Encountered */}
      <Card className="bg-[#141414] border-white/5 shadow-lg">
        <CardHeader className="pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">
                2. Difficultés rencontrées cette semaine
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Sélectionnez les points de friction et ajoutez des détails pour orienter l'analyse du coach.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Psychology */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>🧠 Psychologie & Discipline</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PSYCHOLOGY_TAGS.map((tag) => {
                const selected = difficulties.psychology?.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag('psychology', tag)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all text-left',
                      selected
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                        : 'bg-black/40 text-neutral-400 border-white/10 hover:border-white/20 hover:text-white'
                    )}
                  >
                    {selected && <span className="mr-1.5 text-purple-400">✓</span>}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Technique */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>📐 Technique & Exécution</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TECHNIQUE_TAGS.map((tag) => {
                const selected = difficulties.technique?.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag('technique', tag)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all text-left',
                      selected
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                        : 'bg-black/40 text-neutral-400 border-white/10 hover:border-white/20 hover:text-white'
                    )}
                  >
                    {selected && <span className="mr-1.5 text-blue-400">✓</span>}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Risk */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>🛡️ Gestion du Risque & Prop Firms</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {RISK_TAGS.map((tag) => {
                const selected = difficulties.risk?.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag('risk', tag)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all text-left',
                      selected
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                        : 'bg-black/40 text-neutral-400 border-white/10 hover:border-white/20 hover:text-white'
                    )}
                  >
                    {selected && <span className="mr-1.5 text-amber-400">✓</span>}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Freeform notes on difficulties */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-neutral-300 mb-1.5 block">
              Précisions & Contexte sur vos difficultés :
            </label>
            <Textarea
              rows={3}
              value={difficulties.notes || ''}
              onChange={(e) =>
                setDifficulties((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Détaillez une situation particulière, une émotion ressentie ou un comportement récurrent..."
              className="bg-black/50 border-white/10 text-white text-xs leading-relaxed placeholder:text-neutral-600 focus:border-[#39FF14]/50 focus:ring-[#39FF14]/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. SECTION 3: Trades & Charts to Audit */}
      <Card className="bg-[#141414] border-white/5 shadow-lg">
        <CardHeader className="pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <LineChart className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-white">
                  3. Trades & Graphiques à auditer ({tradesToReview.length})
                </CardTitle>
                <CardDescription className="text-xs text-neutral-400">
                  Sélectionnez des trades de votre journal ou ajoutez des captures d'écran TradingView / CME.
                </CardDescription>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddingCustomTrade(true)}
              className="border-white/10 text-neutral-200 hover:text-white hover:bg-white/5 text-xs h-8"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-[#39FF14]" />
              <span>Ajouter un graphique</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Quick select from recent journal trades */}
          {recentTrades.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">
                Ajouter rapidement depuis votre Journal de trading :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {recentTrades.slice(0, 6).map((t) => {
                  const isSelected = tradesToReview.some((item) => item.id === t.id);
                  const isWin = Number(t.pnl_r) > 0;
                  const isLoss = Number(t.pnl_r) < 0;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      disabled={isSelected}
                      onClick={() => handleAddJournalTrade(t)}
                      className={cn(
                        'p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-all text-xs',
                        isSelected
                          ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                          : 'bg-black/40 border-white/10 hover:border-[#39FF14]/40 hover:bg-[#39FF14]/5 cursor-pointer'
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{t.instrument}</span>
                          <span
                            className={cn(
                              'text-[10px] font-black uppercase px-1.5 py-0.5 rounded',
                              t.direction === 'Long'
                                ? 'bg-[#39FF14]/15 text-[#39FF14]'
                                : 'bg-red-500/15 text-red-400'
                            )}
                          >
                            {t.direction}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                          {new Date(t.trade_date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                          })}{' '}
                          {t.notes ? `• ${t.notes}` : ''}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={cn(
                            'font-black text-xs',
                            isWin ? 'text-[#39FF14]' : isLoss ? 'text-red-400' : 'text-neutral-400'
                          )}
                        >
                          {Number(t.pnl_r) > 0 ? `+${t.pnl_r}` : t.pnl_r}R
                        </span>
                        <div className="text-[10px] text-neutral-500">
                          {isSelected ? '✓ Ajouté' : '+ Sélectionner'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal / Form for custom trade & screenshot */}
          {isAddingCustomTrade && (
            <div className="p-5 rounded-2xl bg-black/80 border border-[#39FF14]/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#39FF14]" />
                  <span>Ajouter un trade / graphique à analyser</span>
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingCustomTrade(false)}
                  className="h-6 px-2 text-xs text-neutral-400 hover:text-white"
                >
                  Fermer
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-300 mb-1 block">
                    Symbole
                  </label>
                  <Input
                    value={customTradeSymbol}
                    onChange={(e) => setCustomTradeSymbol(e.target.value)}
                    placeholder="NQ, ES, MNQ..."
                    className="bg-black/60 border-white/10 text-xs text-white uppercase"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-300 mb-1 block">
                    Direction
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCustomTradeDirection('Long')}
                      className={cn(
                        'flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors',
                        customTradeDirection === 'Long'
                          ? 'bg-[#39FF14]/20 border-[#39FF14] text-[#39FF14]'
                          : 'bg-black/40 border-white/10 text-neutral-400'
                      )}
                    >
                      Long
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomTradeDirection('Short')}
                      className={cn(
                        'flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors',
                        customTradeDirection === 'Short'
                          ? 'bg-red-500/20 border-red-500 text-red-400'
                          : 'bg-black/40 border-white/10 text-neutral-400'
                      )}
                    >
                      Short
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-300 mb-1 block">
                    Résultat en R (optionnel)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={customTradePnlR}
                    onChange={(e) => setCustomTradePnlR(e.target.value)}
                    placeholder="ex: -1.0 ou 2.5"
                    className="bg-black/60 border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              {/* Screenshot uploader */}
              <ScreenshotUploader
                value={customTradeScreenshot}
                onChange={(url) => setCustomTradeScreenshot(url)}
              />

              <div>
                <label className="text-[11px] font-semibold text-neutral-300 mb-1 block">
                  Contexte & Question sur ce trade :
                </label>
                <Textarea
                  rows={2}
                  value={customTradeNotes}
                  onChange={(e) => setCustomTradeNotes(e.target.value)}
                  placeholder="Ex : J'ai anticipé le breakout sur la session NY AM mais je me suis fait stopper sur le sweep..."
                  className="bg-black/60 border-white/10 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingCustomTrade(false)}
                  className="border-white/10 text-xs"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddCustomTrade}
                  className="bg-[#39FF14] text-black font-bold text-xs hover:bg-[#39FF14]/90"
                >
                  Ajouter à la fiche
                </Button>
              </div>
            </div>
          )}

          {/* List of attached trades */}
          {tradesToReview.length === 0 ? (
            <div className="p-8 rounded-2xl bg-black/40 border border-dashed border-white/10 text-center space-y-2">
              <LineChart className="w-6 h-6 text-neutral-500 mx-auto" />
              <p className="text-xs text-neutral-400">
                Aucun trade ou graphique attaché pour le moment.
              </p>
              <p className="text-[11px] text-neutral-500">
                Ajoutez 1 à 3 trades représentatifs de votre semaine pour que Maxym puisse auditer votre exécution.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tradesToReview.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{item.symbol}</span>
                      <span
                        className={cn(
                          'text-[10px] font-black uppercase px-1.5 py-0.5 rounded',
                          item.direction === 'Long'
                            ? 'bg-[#39FF14]/15 text-[#39FF14]'
                            : 'bg-red-500/15 text-red-400'
                        )}
                      >
                        {item.direction || 'Trade'}
                      </span>
                      {item.pnl_r !== undefined && (
                        <span
                          className={cn(
                            'text-xs font-bold',
                            Number(item.pnl_r) > 0 ? 'text-[#39FF14]' : 'text-red-400'
                          )}
                        >
                          {Number(item.pnl_r) > 0 ? `+${item.pnl_r}` : item.pnl_r}R
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveTrade(idx)}
                      className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                      title="Retirer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.screenshot_url && (
                    <a
                      href={item.screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative rounded-lg overflow-hidden border border-white/10 bg-black aspect-video group/img"
                    >
                      <img
                        src={item.screenshot_url}
                        alt="Capture Trade"
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold text-white gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Agrandir le graphique</span>
                      </div>
                    </a>
                  )}

                  {item.notes && (
                    <p className="text-xs text-neutral-300 bg-black/40 p-2 rounded-lg border border-white/5 italic">
                      « {item.notes} »
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. SECTION 4: Call Objectives */}
      <Card className="bg-[#141414] border-white/5 shadow-lg">
        <CardHeader className="pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">
                4. Objectifs du Call
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Ce que vous voulez avoir maîtrisé, débloqué ou résolu à la fin de vos 45 min avec Maxym.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Textarea
            rows={4}
            value={keyGoals}
            onChange={(e) => setKeyGoals(e.target.value)}
            placeholder="Ex : 
- Avoir un plan d'action clair pour éliminer mes entrées prématurées.
- Calibrer ma gestion de position pour respecter le drawdown de mon compte financé.
- Comprendre la mécanique de liquidité sur le setup d'ouverture NY."
            className="bg-black/50 border-white/10 text-white text-xs leading-relaxed placeholder:text-neutral-600 focus:border-[#39FF14]/50 focus:ring-[#39FF14]/20 resize-y"
          />
        </CardContent>
      </Card>

      {/* 6. Footer Save Bar */}
      <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="text-xs text-neutral-400">
          <span className="font-semibold text-white">Prêt pour votre coaching ?</span>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Vous pouvez modifier votre fiche à tout moment avant le début de votre séance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => handleSave('draft')}
            className="border-white/10 text-neutral-300 hover:bg-white/5 text-xs font-semibold h-11 px-5"
          >
            <Save className="w-4 h-4 mr-2" />
            <span>Sauvegarder en brouillon</span>
          </Button>

          <Button
            type="button"
            disabled={isPending}
            onClick={() => handleSave('submitted')}
            className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold text-xs h-11 px-6 shadow-[0_0_25px_rgba(57,255,20,0.3)]"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            <span>Transmettre à Maxym</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
