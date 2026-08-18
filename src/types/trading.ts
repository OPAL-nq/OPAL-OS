export type InstrumentType = 'NQ' | 'MNQ' | 'ES' | 'MES';
export type BiasType = 'Bullish' | 'Bearish' | 'Neutral';
export type DecisionType = 'EXECUTE' | 'WAIT' | 'ABSTAIN';
export type TradeDirection = 'Long' | 'Short';

export interface WorkspaceSession {
  id: string;
  user_id: string;
  session_date: string;
  instrument: InstrumentType;
  bias: BiasType;
  key_levels?: string;
  market_context?: string;
  primary_scenario?: string;
  alternative_scenario?: string;
  execution_conditions?: string;
  invalidation_conditions?: string;
  risk_management?: string;
  mindset?: string;
  decision: DecisionType;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  workspace_session_id?: string | null;
  trade_date: string;
  instrument: InstrumentType;
  direction: TradeDirection;
  entry_price?: number | null;
  stop_loss?: number | null;
  take_profit?: number | null;
  stop_loss_ticks?: number | null;
  take_profit_ticks?: number | null;
  risk_dollars: number;
  pnl_dollars: number;
  pnl_r: number;
  screenshot_url?: string | null;
  plan_followed: boolean;
  emotional_state?: 'calm' | 'fomo' | 'revenge' | 'fatigued' | null;
  plan_compliance?: 'full' | 'minor_deviation' | 'off_plan' | null;
  stop_discipline?: 'respected' | 'moved_early' | 'widened_or_removed' | null;
  mistakes?: string | null;
  notes?: string | null;
  market_context?: string | null;
  created_at: string;
  updated_at: string;
  workspace_session?: WorkspaceSession | null;
}

export interface TradeStats {
  totalTrades: number;
  winTrades: number;
  lossTrades: number;
  beTrades: number;
  winRate: number;
  totalR: number;
  totalPnlDollars: number;
  avgR: number;
  planFollowedRate: number;
}
