// Centralized Futures Specifications for OPAL OS
// All calculations in Futures trading are natively based on TICKS.

export interface InstrumentSpec {
  name: string;
  fullName: string;
  category: 'E-mini' | 'Micro';
  tickSize: number;       // 0.25 pt
  tickValue: number;      // Dollar value per 1 tick ($)
  pointValue: number;     // Dollar value per 1 point ($) = tickValue * 4
  ticksPerPoint: number;  // 4 ticks per point
}

export const INSTRUMENTS: Record<string, InstrumentSpec> = {
  NQ: {
    name: 'NQ',
    fullName: 'E-mini Nasdaq 100',
    category: 'E-mini',
    tickSize: 0.25,
    tickValue: 5.0,
    pointValue: 20.0,
    ticksPerPoint: 4,
  },
  MNQ: {
    name: 'MNQ',
    fullName: 'Micro E-mini Nasdaq 100',
    category: 'Micro',
    tickSize: 0.25,
    tickValue: 0.5,
    pointValue: 2.0,
    ticksPerPoint: 4,
  },
  ES: {
    name: 'ES',
    fullName: 'E-mini S&P 500',
    category: 'E-mini',
    tickSize: 0.25,
    tickValue: 12.5,
    pointValue: 50.0,
    ticksPerPoint: 4,
  },
  MES: {
    name: 'MES',
    fullName: 'Micro E-mini S&P 500',
    category: 'Micro',
    tickSize: 0.25,
    tickValue: 1.25,
    pointValue: 5.0,
    ticksPerPoint: 4,
  },
};

export const BIAS_OPTIONS = [
  { value: 'Bullish', label: 'Bullish (Haussier)', color: 'emerald' },
  { value: 'Bearish', label: 'Bearish (Baissier)', color: 'red' },
  { value: 'Neutral', label: 'Neutral (Indécis / Range)', color: 'neutral' },
] as const;

export const DECISION_OPTIONS = [
  {
    value: 'EXECUTE',
    label: 'EXECUTE',
    desc: 'Conditions réunies — Prêt à trader',
    color: '#39FF14',
    badgeClass: 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/40',
  },
  {
    value: 'WAIT',
    label: 'WAIT',
    desc: 'En attente de confirmation',
    color: '#F59E0B',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/40',
  },
  {
    value: 'ABSTAIN',
    label: 'ABSTAIN',
    desc: 'Pas de setup clair — Ne pas toucher',
    color: '#EF4444',
    badgeClass: 'bg-red-500/10 text-red-400 border-red-500/40',
  },
] as const;
