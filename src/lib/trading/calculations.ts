import { INSTRUMENTS, InstrumentSpec } from '@/lib/trading-constants';

export interface TradeCalculationParams {
  instrument: string;
  direction: 'Long' | 'Short';
  entryPrice?: number | null;
  exitPrice?: number | null;
  stopLossTicks?: number | null;
  takeProfitTicks?: number | null;
  contracts?: number;
  riskDollars?: number;
}

export interface TradeCalculationResult {
  pnlDollars: number;
  pnlR: number;
  stopLossDollars: number;
  takeProfitDollars: number;
  points: number;
  ticks: number;
  isWinner: boolean;
}

/**
 * Calculates financial results (PnL $, R-multiple, points, ticks)
 * using CME Futures tick values.
 */
export function calculateTradeResult(params: TradeCalculationParams): TradeCalculationResult {
  const spec: InstrumentSpec = INSTRUMENTS[params.instrument] || INSTRUMENTS.NQ;
  const contracts = Math.max(1, params.contracts || 1);
  const riskDollars = Math.max(1, params.riskDollars || 300);

  let pnlDollars = 0;
  let points = 0;
  let ticks = 0;

  if (params.entryPrice !== undefined && params.entryPrice !== null && 
      params.exitPrice !== undefined && params.exitPrice !== null) {
    if (params.direction === 'Long') {
      points = params.exitPrice - params.entryPrice;
    } else {
      points = params.entryPrice - params.exitPrice;
    }

    ticks = Math.round((points / spec.tickSize) * 100) / 100;
    pnlDollars = Math.round(ticks * spec.tickValue * contracts * 100) / 100;
  }

  const pnlR = riskDollars > 0 ? Math.round((pnlDollars / riskDollars) * 100) / 100 : 0;
  const stopLossDollars = params.stopLossTicks ? Math.round(params.stopLossTicks * spec.tickValue * contracts * 100) / 100 : 0;
  const takeProfitDollars = params.takeProfitTicks ? Math.round(params.takeProfitTicks * spec.tickValue * contracts * 100) / 100 : 0;

  return {
    pnlDollars,
    pnlR,
    stopLossDollars,
    takeProfitDollars,
    points: Math.round(points * 100) / 100,
    ticks,
    isWinner: pnlDollars > 0,
  };
}

/**
 * Calculates recommended position size based on capital, risk percentage, and stop loss in ticks.
 */
export function calculatePositionSize(
  instrument: string,
  accountSize: number,
  riskPercent: number,
  stopLossTicks: number
) {
  const spec: InstrumentSpec = INSTRUMENTS[instrument] || INSTRUMENTS.NQ;
  const safeAccountSize = Math.max(0, accountSize);
  const safeRiskPercent = Math.max(0.01, Math.min(100, riskPercent));
  const safeStopLossTicks = Math.max(1, stopLossTicks);

  const riskAmountDollars = (safeAccountSize * safeRiskPercent) / 100;
  const dollarRiskPerContract = safeStopLossTicks * spec.tickValue;

  const rawContracts = dollarRiskPerContract > 0 ? riskAmountDollars / dollarRiskPerContract : 0;
  const recommendedContracts = Math.floor(rawContracts);
  const actualRiskDollars = recommendedContracts * dollarRiskPerContract;

  return {
    riskAmountDollars: Math.round(riskAmountDollars * 100) / 100,
    dollarRiskPerContract: Math.round(dollarRiskPerContract * 100) / 100,
    recommendedContracts,
    actualRiskDollars: Math.round(actualRiskDollars * 100) / 100,
    stopLossPoints: Math.round((safeStopLossTicks * spec.tickSize) * 100) / 100,
  };
}

/**
 * Calculates Prop Firm buffer and consecutive losses tolerated before breach.
 */
export function calculatePropFirmMetrics(
  accountSize: number,
  maxDrawdown: number,
  dailyLossLimit: number,
  riskPerTrade: number
) {
  const safeAccount = Math.max(1, accountSize);
  const safeDrawdown = Math.max(1, maxDrawdown);
  const safeDaily = Math.max(0, dailyLossLimit);
  const safeRisk = Math.max(1, riskPerTrade);

  const consecutiveLossesBeforeBreach = Math.floor(safeDrawdown / safeRisk);
  const consecutiveLossesDaily = safeDaily > 0 ? Math.floor(safeDaily / safeRisk) : 0;
  const riskPercentOfAccount = Math.round(((safeRisk / safeAccount) * 100) * 100) / 100;
  const riskPercentOfDrawdown = Math.round(((safeRisk / safeDrawdown) * 100) * 10) / 10;

  return {
    consecutiveLossesBeforeBreach,
    consecutiveLossesDaily,
    riskPercentOfAccount,
    riskPercentOfDrawdown,
    isHighRisk: consecutiveLossesBeforeBreach < 5,
  };
}
