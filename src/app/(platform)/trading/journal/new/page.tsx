import React from 'react';
import { TradeForm } from '@/components/trading/trade-form';

export const dynamic = 'force-dynamic';

export default function NewTradePage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-extrabold text-white">Journaliser un Trade</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Enregistrez votre trade, vos niveaux, votre résultat en R et vos enseignements.
        </p>
      </div>

      <TradeForm />
    </div>
  );
}
