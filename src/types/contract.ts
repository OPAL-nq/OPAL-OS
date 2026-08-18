export interface TraderContract {
  id: string;
  user_id: string;
  max_daily_loss: number;
  max_trades_per_day: number;
  allowed_instruments: string[];
  allowed_setups: string[];
  trading_hours_start: string; // e.g., '15:30:00'
  trading_hours_end: string;   // e.g., '17:30:00'
  signature_data_url: string;
  coach_signature_data_url?: string | null;
  is_active: boolean;
  signed_at: string;
}

export interface ContractDraft {
  max_daily_loss: number;
  max_trades_per_day: number;
  allowed_instruments: string[];
  allowed_setups: string[];
  trading_hours_start: string;
  trading_hours_end: string;
  signature_data_url: string;
}
