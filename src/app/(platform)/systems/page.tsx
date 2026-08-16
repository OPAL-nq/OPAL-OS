import React from 'react';
import { RiskCalculator } from '@/components/systems/risk-calculator';
import { PropFirmCalculator } from '@/components/systems/propfirm-calculator';
import { Cpu, ShieldAlert, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SystemsPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#39FF14] uppercase tracking-wider mb-1">
          <Cpu className="w-4 h-4" />
          <span>OPAL Systems Toolbox</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Calculateurs & Outils de Risque
        </h1>
        <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
          Déterminez précisément la taille de vos positions sur les Futures (NQ, MNQ, ES, MES) et verrouillez vos règles de Drawdown Prop Firm avant chaque session.
        </p>
      </div>

      {/* Calculators Grid */}
      <div className="space-y-8">
        <RiskCalculator />
        <PropFirmCalculator />
      </div>
    </div>
  );
}
