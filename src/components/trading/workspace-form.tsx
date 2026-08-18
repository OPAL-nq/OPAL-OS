'use client';

import React, { useState } from 'react';
import { WorkspaceSession } from '@/types/trading';
import { createWorkspaceSession, updateWorkspaceSession, deleteWorkspaceSession } from '@/app/actions/workspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BIAS_OPTIONS, DECISION_OPTIONS, INSTRUMENTS } from '@/lib/trading-constants';
import {
  Calendar,
  Compass,
  Layers,
  Shield,
  Brain,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowLeft,
  Trash2,
  Zap,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

interface WorkspaceFormProps {
  initialData?: WorkspaceSession | null;
}

export function WorkspaceForm({ initialData }: WorkspaceFormProps) {
  const [sessionDate, setSessionDate] = useState<string>(
    initialData?.session_date || new Date().toISOString().split('T')[0]
  );
  const [instrument, setInstrument] = useState<string>(initialData?.instrument || 'NQ');
  const [bias, setBias] = useState<string>(initialData?.bias || 'Neutral');
  const [decision, setDecision] = useState<string>(initialData?.decision || 'WAIT');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set('session_date', sessionDate);
    formData.set('instrument', instrument);
    formData.set('bias', bias);
    formData.set('decision', decision);

    try {
      if (initialData) {
        await updateWorkspaceSession(initialData.id, formData);
      } else {
        await createWorkspaceSession(formData);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erreur lors de la sauvegarde');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer ce plan de session ?')) {
      setLoading(true);
      try {
        await deleteWorkspaceSession(initialData.id);
        window.location.href = '/trading';
      } catch (err: any) {
        alert(err.message || 'Erreur lors de la suppression');
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <Link href="/trading">
          <Button variant="ghost" size="sm" type="button" className="text-neutral-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Retour au Trading Hub
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {initialData && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 text-xs font-semibold"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Supprimer le plan
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#39FF14] text-black hover:bg-[#32e012] font-bold px-6 shadow-[0_0_20px_rgba(57,255,20,0.3)] text-xs h-9"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Enregistrement...' : initialData ? 'Mettre à jour le plan' : 'Valider mon plan de session'}
          </Button>
        </div>
      </div>

      {/* 1. Session & Instrument & Bias */}
      <Card className="bg-[#141414] border-white/10">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#39FF14] uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Étape 1 — Contexte & Biais Directionnel</span>
          </div>
          <CardTitle className="text-lg text-white">Paramètres de la Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                Date de Session
              </label>
              <Input
                type="date"
                name="session_date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="bg-black/50 border-white/10 text-white font-mono text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                Instrument Actif (CME Futures)
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {Object.keys(INSTRUMENTS).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setInstrument(key)}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                      instrument === key
                        ? 'bg-[#39FF14]/15 border-[#39FF14] text-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.15)]'
                        : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-2">
              Biais Directionnel
            </label>
            <div className="grid grid-cols-3 gap-3">
              {BIAS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBias(opt.value)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    bias === opt.value
                      ? 'bg-[#39FF14]/15 border-[#39FF14] text-[#39FF14] font-bold shadow-[0_0_10px_rgba(57,255,20,0.2)]'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Key Levels: Volume Profile, Session Extremes, VWAP */}
      <Card className="bg-[#141414] border-white/10">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#39FF14] uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Étape 2 — Niveaux Clés & Cartographie Institutionnelle</span>
          </div>
          <CardTitle className="text-lg text-white">Volume Profile, Session High/Low & VWAP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1.5">
              Niveaux Volume Profile Previous Day & Hauts/Bas (VAH, VAL, POC, Asian High/Low, London High/Low)
            </label>
            <Input
              name="key_levels"
              defaultValue={initialData?.key_levels || ''}
              placeholder="Ex: VAH 21450, POC 21380, VAL 21290 | Asian High 21420, Asian Low 21310"
              className="bg-black/50 border-white/10 text-white font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1.5">
              Contexte VWAP & Structure de Marché
            </label>
            <Textarea
              name="market_context"
              defaultValue={initialData?.market_context || ''}
              placeholder="Ex: Prix au-dessus du VWAP de session, compression sous la VAH précédente, recherche d'un rejet vers le POC..."
              rows={3}
              className="bg-black/50 border-white/10 text-white text-xs resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Scenarios & Conditions: Inefficiencies, IFVG, BPR, FVG */}
      <Card className="bg-[#141414] border-white/10">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#39FF14] uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Étape 3 — Scénarios & Déclencheurs (IFVG / BPR / FVG)</span>
          </div>
          <CardTitle className="text-lg text-white">Plan de Trading & Signaux de Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#39FF14] block mb-1.5">
                Scénario Principal (A)
              </label>
              <Textarea
                name="primary_scenario"
                defaultValue={initialData?.primary_scenario || ''}
                placeholder="Ex: Rejet sur Asian Low + confluence VWAP -> inversion de tendance et reprise haussière vers la VAH..."
                rows={3}
                className="bg-black/50 border-[#39FF14]/30 text-white text-xs resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-amber-400 block mb-1.5">
                Scénario Alternatif (B)
              </label>
              <Textarea
                name="alternative_scenario"
                defaultValue={initialData?.alternative_scenario || ''}
                placeholder="Ex: Breakout franc sous la VAL avec inefficience confirmée -> continuation baissière..."
                rows={3}
                className="bg-black/50 border-amber-500/30 text-white text-xs resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                Conditions d'Entrée & Trigger (Inversion, Inefficience, IFVG / BPR / FVG)
              </label>
              <Input
                name="execution_conditions"
                defaultValue={initialData?.execution_conditions || ''}
                placeholder="Ex: Inversion validée sur indicateur + réaction sur IFVG / BPR en confluence VWAP"
                className="bg-black/50 border-white/10 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                Conditions d'Invalidation
              </label>
              <Input
                name="invalidation_conditions"
                defaultValue={initialData?.invalidation_conditions || ''}
                placeholder="Ex: Clôture opposée à travers le BPR ou perte nette du VWAP de session"
                className="bg-black/50 border-white/10 text-white text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Risk & Discipline */}
      <Card className="bg-[#141414] border-white/10">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#39FF14] uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Étape 4 — Risk Management en TICKS & Discipline</span>
          </div>
          <CardTitle className="text-lg text-white">Cadre de Risque & Posture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                Règles de Risque (SL max en Ticks / Risque $ / Nombre max de trades)
              </label>
              <Input
                name="risk_management"
                defaultValue={initialData?.risk_management || ''}
                placeholder="Ex: SL max 80 ticks (20 pts) • Risque $250 max • 2 trades max"
                className="bg-black/50 border-white/10 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                Mindset & État de Concentration
              </label>
              <Input
                name="mindset"
                defaultValue={initialData?.mindset || ''}
                placeholder="Ex: Patient, exécution chirurgicale, zéro précipitation"
                className="bg-black/50 border-white/10 text-white text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Final Decision */}
      <Card className="bg-black border-2 border-white/20 shadow-2xl">
        <CardHeader className="pb-3 text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-[#39FF14] mb-1">
            VERDICT AVANT SESSION
          </div>
          <CardTitle className="text-xl text-white font-extrabold">Décision Finale</CardTitle>
          <CardDescription className="text-xs text-neutral-400">
            Formalisez votre posture avant d'ouvrir la plateforme d'exécution
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DECISION_OPTIONS.map((dec) => (
              <button
                key={dec.value}
                type="button"
                onClick={() => setDecision(dec.value)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  decision === dec.value
                    ? 'bg-[#39FF14]/15 border-[#39FF14] text-[#39FF14] font-black shadow-[0_0_15px_rgba(57,255,20,0.25)] scale-[1.02]'
                    : 'bg-[#141414] border-white/10 text-neutral-400 hover:border-white/20'
                }`}
              >
                <div className="text-base tracking-wide font-black">{dec.value}</div>
                <div className="text-[11px] mt-1 opacity-80">{dec.desc}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Submit */}
      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#39FF14] text-black hover:bg-[#32e012] font-bold text-sm px-8 py-6 rounded-xl shadow-[0_0_25px_rgba(57,255,20,0.35)]"
        >
          <Save className="w-5 h-5 mr-2" />
          {loading ? 'Enregistrement en cours...' : initialData ? 'Mettre à jour la session' : 'Enregistrer mon Plan de Session'}
        </Button>
      </div>
    </form>
  );
}
