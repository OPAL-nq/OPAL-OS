import React from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { CsvTradeImporter } from '@/components/trading/csv-trade-importer';

export const dynamic = 'force-dynamic';

export default function TradingCsvImportPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center gap-2">
        <Link
          href="/trading"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au Trading Hub</span>
        </Link>
      </div>

      {/* Main Universal CSV Importer Client Component */}
      <CsvTradeImporter />
    </div>
  );
}
