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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <Link href="/trading">
          <Button variant="ghost" size="sm" type="button" className="text-neutral-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Retour au Workspace
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
            className="bg-[#39FF14] text-black hover:bg-[#32e012] font-bold px-6 shadow-[0_0_20px_rgba(57,255,20,0.3)]"
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
            <span>Étape 1 — Contexte & Biais Initial</span>
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
                className="bg-black/50 border-white/10 text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                Instrument Actif
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {Object.keys(INSTRUMENTS).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setInstrument(key)}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                      instrument === key
                        ? 'bg-[#39FF14]/10 border-[#39FF14] text-white shadow-[0_0_10px_rgba(57,255,20,0.15)]'
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
                      ? `${opt.color} font-bold ring-1 ring-white/20`
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:border-white/20'
                  }`}
                >
                  <div className="text-sm">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Key Levels & Context */}
      <Card className="bg-[#141414] border-white/10">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#39FF14] uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Étape 2 — Niveaux Clés & Analyse</span>
          </div>
          <CardTitle className="text-lg text-white">Cartographie du Marché</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1.5">
              Niveaux Clés (PDH/PDL, Open, VAH/VAL, FVG, Liquidity Pools)
            </label>
            <Input
              name="key_levels"
              defaultValue={initialData?.key_levels || ''}
              placeholder="Ex: 21450 (PDH), 21320 (Asia High), 21200 (Support HTF)"
              className="bg-black/50 border-white/10 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1.5">
              Analyse & Contexte Macro / Structure HTF
            </label>
            <Textarea
              name="market_context"
              defaultValue={initialData?.market_context || ''}
              placeholder="Quel est le narratif ? Tendance HTF, annonces économiques attendues..."
              rows={3}
              className="bg-black/50 border-white/10 text-white resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Scenarios & Conditions */}
      <Card className="bg-[#141414] border-white/10">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#39FF14] uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Étape 3 — Scénarios & Exécution</span>
          </div>
          <CardTitle className="text-lg text-white">Plan de Trading Structuré</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-emerald-400 block mb-1.5">
                Scénario Principal (A)
              </label>
              <Textarea
                name="primary_scenario"
                defaultValue={initialData?.primary_scenario || ''}
                placeholder="Ex: Sweep de l'Asia Low à l'open NY puis réintégration haussière vers PDH..."
                rows={3}
                className="bg-black/50 border-emerald-500/20 text-white resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-amber-400 block mb-1.5">
                Scénario Alternatif (B)
              </label>
              <Textarea
                name="alternative_scenario"
                defaultValue={initialData?.alternative_scenario || ''}
                placeholder="Ex: Cassure nette de 21200 avec volume -> continuation baissière..."
                rows={3}
                className="bg-black/50 border-amber-500/20 text-white resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                Conditions d'Entrée
              </label>
              <Input
                name="execution_conditions"
                defaultValue={initialData?.execution_conditions || ''}
                placeholder="Ex: Clôture 1M au-dessus du FVG + validation delta"
                className="bg-black/50 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                Conditions d'Invalidation
              </label>
              <Input
                name="invalidation_conditions"
                defaultValue={initialData?.invalidation_conditions || ''}
                placeholder="Ex: Rejet violent sous le VWAP ou réintégration opposée"
                className="bg-black/50 border-white/10 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Risk & Mindset */}
      <Card className="bg-[#141414] border-white/10">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#39FF14] uppercase tracking-wider">
            <Brain className="w-4 h-4" />
            <span>Étape 4 — Risk & Psychologie</span>
          </div>
          <CardTitle className="text-lg text-white">Discipline & État Mental</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                Gestion du Risque (Max Loss / Max Trades)
              </label>
              <Input
                name="risk_management"
                defaultValue={initialData?.risk_management || ''}
                placeholder="Ex: Max 2 trades / Risque $300 max par trade"
                className="bg-black/50 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                Mindset / Niveau d'énergie
              </label>
              <Input
                name="mindset"
                defaultValue={initialData?.mindset || ''}
                placeholder="Ex: Calme, concentré, patient, pas de FOMO"
                className="bg-black/50 border-white/10 text-white"
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
            Formalisez votre posture avant d'ouvrir votre plateforme d'exécution
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
                    ? `${dec.color} font-black shadow-lg scale-[1.02]`
                    : 'bg-[#141414] border-white/10 text-neutral-400 hover:border-white/20'
                }`}
              >
                <div className="text-base tracking-wide font-black">{dec.value}</div>
                <div className="text-[11px] mt-1 opacity-80">{dec.label.split('—')[1]}</div>
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
