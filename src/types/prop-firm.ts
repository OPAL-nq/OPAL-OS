export type PropFirmName =
  | 'tradeify'
  | 'lucid'
  | 'topstep'
  | 'apex'
  | 'mffu'
  | 'tradeday'
  | 'bulenox'
  | 'custom'
  | (string & {});

export type PropFirmAccountStatus = 'active' | 'passed' | 'blown' | 'payout_ready';

export interface PropFirmAccount {
  id: string;
  user_id: string;
  account_name: string;
  firm_name: PropFirmName;
  account_tier: string;
  starting_balance: number;
  current_balance: number;
  high_water_mark: number;
  drawdown_limit: number;
  max_daily_loss?: number | null;
  consistency_rule_pct?: number | null;
  profit_target?: number | null;
  is_trailing_eod: boolean;
  is_active: boolean;
  status: PropFirmAccountStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropFirmPreset {
  id: string;
  firmName: PropFirmName;
  firmLabel: string;
  tierLabel: string;
  startingBalance: number;
  drawdownLimit: number;
  maxDailyLoss?: number;
  profitTarget?: number;
  consistencyRulePct?: number;
  isTrailingEod: boolean;
  maxContractsMini: number;
  maxContractsMicro: number;
  description: string;
}

export interface GuardianMetrics {
  currentBalance: number;
  highWaterMark: number;
  liquidationThreshold: number;
  bufferDollars: number;
  bufferPercent: number;
  dailyLossThreshold?: number | null;
  dailyLossBuffer?: number | null;
  tolerableConsecutiveLosses: number;
  tolerableDailyLosses?: number | null;
  zone: 'safe' | 'warning' | 'critical';
  zoneLabel: string;
  zoneColor: string;
  profitEarned: number;
  targetProgressPercent: number;
  isProfitTargetReached: boolean;
}

export interface SizingRecommendation {
  instrument: string;
  stopLossPoints: number;
  stopLossTicks: number;
  riskDollars: number;
  miniContracts: number;
  miniRiskTotal: number;
  miniCommissions: number;
  microContracts: number;
  microRiskTotal: number;
  microCommissions: number;
  recommendedCategory: 'Mini' | 'Micro';
  recommendationReason: string;
}
