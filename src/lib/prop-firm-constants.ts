import { PropFirmPreset, PropFirmAccount, GuardianMetrics, SizingRecommendation } from '@/types/prop-firm';
import { INSTRUMENTS } from '@/lib/trading-constants';

export const PROP_FIRM_PRESETS: PropFirmPreset[] = [
  // TOPSTEP
  {
    id: 'topstep-50k',
    firmName: 'topstep',
    firmLabel: 'Topstep',
    tierLabel: '50k Trading Combine',
    startingBalance: 50000,
    drawdownLimit: 2000,
    maxDailyLoss: 1000,
    profitTarget: 3000,
    consistencyRulePct: 50,
    isTrailingEod: true,
    maxContractsMini: 5,
    maxContractsMicro: 50,
    description: 'Trailing EOD • Max Loss 2 000 $ • Daily Loss 1 000 $ • Target 3 000 $',
  },
  {
    id: 'topstep-100k',
    firmName: 'topstep',
    firmLabel: 'Topstep',
    tierLabel: '100k Trading Combine',
    startingBalance: 100000,
    drawdownLimit: 3000,
    maxDailyLoss: 2000,
    profitTarget: 6000,
    consistencyRulePct: 50,
    isTrailingEod: true,
    maxContractsMini: 10,
    maxContractsMicro: 100,
    description: 'Trailing EOD • Max Loss 3 000 $ • Daily Loss 2 000 $ • Target 6 000 $',
  },
  {
    id: 'topstep-150k',
    firmName: 'topstep',
    firmLabel: 'Topstep',
    tierLabel: '150k Trading Combine',
    startingBalance: 150000,
    drawdownLimit: 4500,
    maxDailyLoss: 3000,
    profitTarget: 9000,
    consistencyRulePct: 50,
    isTrailingEod: true,
    maxContractsMini: 15,
    maxContractsMicro: 150,
    description: 'Trailing EOD • Max Loss 4 500 $ • Daily Loss 3 000 $ • Target 9 000 $',
  },

  // APEX TRADER FUNDING
  {
    id: 'apex-25k',
    firmName: 'apex',
    firmLabel: 'Apex Trader Funding',
    tierLabel: '25k Evaluation / PA',
    startingBalance: 25000,
    drawdownLimit: 1500,
    maxDailyLoss: undefined,
    profitTarget: 1500,
    consistencyRulePct: 30,
    isTrailingEod: false,
    maxContractsMini: 4,
    maxContractsMicro: 40,
    description: 'Trailing Intraday Live • Max Loss 1 500 $ • Pas de Daily Loss • Target 1 500 $',
  },
  {
    id: 'apex-50k',
    firmName: 'apex',
    firmLabel: 'Apex Trader Funding',
    tierLabel: '50k Evaluation / PA',
    startingBalance: 50000,
    drawdownLimit: 2500,
    maxDailyLoss: undefined,
    profitTarget: 3000,
    consistencyRulePct: 30,
    isTrailingEod: false,
    maxContractsMini: 10,
    maxContractsMicro: 100,
    description: 'Trailing Intraday Live • Max Loss 2 500 $ • Pas de Daily Loss • Target 3 000 $',
  },
  {
    id: 'apex-100k',
    firmName: 'apex',
    firmLabel: 'Apex Trader Funding',
    tierLabel: '100k Evaluation / PA',
    startingBalance: 100000,
    drawdownLimit: 3000,
    maxDailyLoss: undefined,
    profitTarget: 6000,
    consistencyRulePct: 30,
    isTrailingEod: false,
    maxContractsMini: 14,
    maxContractsMicro: 140,
    description: 'Trailing Intraday Live • Max Loss 3 000 $ • Pas de Daily Loss • Target 6 000 $',
  },
  {
    id: 'apex-150k',
    firmName: 'apex',
    firmLabel: 'Apex Trader Funding',
    tierLabel: '150k Evaluation / PA',
    startingBalance: 150000,
    drawdownLimit: 5000,
    maxDailyLoss: undefined,
    profitTarget: 9000,
    consistencyRulePct: 30,
    isTrailingEod: false,
    maxContractsMini: 17,
    maxContractsMicro: 170,
    description: 'Trailing Intraday Live • Max Loss 5 000 $ • Pas de Daily Loss • Target 9 000 $',
  },
  {
    id: 'apex-300k',
    firmName: 'apex',
    firmLabel: 'Apex Trader Funding',
    tierLabel: '300k Evaluation / PA',
    startingBalance: 300000,
    drawdownLimit: 7500,
    maxDailyLoss: undefined,
    profitTarget: 20000,
    consistencyRulePct: 30,
    isTrailingEod: false,
    maxContractsMini: 35,
    maxContractsMicro: 350,
    description: 'Trailing Intraday Live • Max Loss 7 500 $ • Pas de Daily Loss • Target 20 000 $',
  },

  // MYFUNDEDFUTURES (MFFU)
  {
    id: 'mffu-50k-starter',
    firmName: 'mffu',
    firmLabel: 'MyFundedFutures',
    tierLabel: '50k Starter (EOD)',
    startingBalance: 50000,
    drawdownLimit: 2000,
    maxDailyLoss: 1200,
    profitTarget: 3000,
    consistencyRulePct: 40,
    isTrailingEod: true,
    maxContractsMini: 5,
    maxContractsMicro: 50,
    description: 'Trailing EOD • Max Loss 2 000 $ • Daily Loss 1 200 $ • Target 3 000 $',
  },
  {
    id: 'mffu-50k-expert',
    firmName: 'mffu',
    firmLabel: 'MyFundedFutures',
    tierLabel: '50k Expert (No Daily Loss)',
    startingBalance: 50000,
    drawdownLimit: 2000,
    maxDailyLoss: undefined,
    profitTarget: 3000,
    consistencyRulePct: 40,
    isTrailingEod: true,
    maxContractsMini: 5,
    maxContractsMicro: 50,
    description: 'Trailing EOD • Max Loss 2 000 $ • Pas de Daily Loss • Target 3 000 $',
  },
  {
    id: 'mffu-100k-starter',
    firmName: 'mffu',
    firmLabel: 'MyFundedFutures',
    tierLabel: '100k Starter (EOD)',
    startingBalance: 100000,
    drawdownLimit: 3000,
    maxDailyLoss: 2200,
    profitTarget: 6000,
    consistencyRulePct: 40,
    isTrailingEod: true,
    maxContractsMini: 10,
    maxContractsMicro: 100,
    description: 'Trailing EOD • Max Loss 3 000 $ • Daily Loss 2 200 $ • Target 6 000 $',
  },

  // TRADEDAY
  {
    id: 'tradeday-50k',
    firmName: 'tradeday',
    firmLabel: 'TradeDay',
    tierLabel: '50k Evaluation',
    startingBalance: 50000,
    drawdownLimit: 2000,
    maxDailyLoss: 1000,
    profitTarget: 3000,
    consistencyRulePct: 30,
    isTrailingEod: true,
    maxContractsMini: 5,
    maxContractsMicro: 50,
    description: 'Trailing EOD • Max Loss 2 000 $ • Daily Loss 1 000 $ • Target 3 000 $',
  },
  {
    id: 'tradeday-100k',
    firmName: 'tradeday',
    firmLabel: 'TradeDay',
    tierLabel: '100k Evaluation',
    startingBalance: 100000,
    drawdownLimit: 3500,
    maxDailyLoss: 2000,
    profitTarget: 6000,
    consistencyRulePct: 30,
    isTrailingEod: true,
    maxContractsMini: 10,
    maxContractsMicro: 100,
    description: 'Trailing EOD • Max Loss 3 500 $ • Daily Loss 2 000 $ • Target 6 000 $',
  },

  // BULENOX
  {
    id: 'bulenox-50k',
    firmName: 'bulenox',
    firmLabel: 'Bulenox',
    tierLabel: '50k Master Account',
    startingBalance: 50000,
    drawdownLimit: 2500,
    maxDailyLoss: undefined,
    profitTarget: 3000,
    consistencyRulePct: 40,
    isTrailingEod: false,
    maxContractsMini: 7,
    maxContractsMicro: 70,
    description: 'Trailing Intraday • Max Loss 2 500 $ • Pas de Daily Loss • Target 3 000 $',
  },

  // CUSTOM
  {
    id: 'custom-account',
    firmName: 'custom',
    firmLabel: 'Personnalisé',
    tierLabel: 'Compte Propre / Sur Mesure',
    startingBalance: 50000,
    drawdownLimit: 2000,
    maxDailyLoss: 1000,
    profitTarget: 3000,
    consistencyRulePct: undefined,
    isTrailingEod: true,
    maxContractsMini: 5,
    maxContractsMicro: 50,
    description: 'Paramètres personnalisables selon votre propre politique de gestion du risque.',
  },
];

export const COMMISSIONS = {
  MINI_ROUNDTRIP: 2.5, // $ par contrat aller-retour
  MICRO_ROUNDTRIP: 0.62, // $ par contrat aller-retour
};

/**
 * Calculates current liquidation threshold and drawdown runway metrics.
 */
export function calculateGuardianMetrics(
  account: PropFirmAccount,
  riskPerTrade: number = 250
): GuardianMetrics {
  const currentBalance = Number(account.current_balance) || Number(account.starting_balance);
  const startingBalance = Number(account.starting_balance) || 50000;
  const highWaterMark = Math.max(Number(account.high_water_mark) || startingBalance, currentBalance);
  const drawdownLimit = Number(account.drawdown_limit) || 2000;
  const maxDailyLoss = account.max_daily_loss ? Number(account.max_daily_loss) : null;
  const profitTarget = account.profit_target ? Number(account.profit_target) : null;

  // Trailing threshold calculation
  let liquidationThreshold = highWaterMark - drawdownLimit;

  // If Apex: stops trailing once threshold reaches Starting Balance + $100
  if (account.firm_name === 'apex') {
    const apexThresholdCap = startingBalance + 100;
    if (liquidationThreshold > apexThresholdCap) {
      liquidationThreshold = apexThresholdCap;
    }
  }

  // Buffer available before breach
  const bufferDollars = Math.max(0, currentBalance - liquidationThreshold);
  const bufferPercent = Math.min(100, Math.max(0, (bufferDollars / drawdownLimit) * 100));

  // Daily Loss Buffer (if applicable)
  let dailyLossThreshold: number | null = null;
  let dailyLossBuffer: number | null = null;
  let tolerableDailyLosses: number | null = null;

  if (maxDailyLoss && maxDailyLoss > 0) {
    dailyLossThreshold = currentBalance - maxDailyLoss;
    dailyLossBuffer = maxDailyLoss;
    tolerableDailyLosses = riskPerTrade > 0 ? Math.floor(maxDailyLoss / riskPerTrade) : 0;
  }

  // Tolerable consecutive losses at current risk
  const safeRisk = Math.max(1, riskPerTrade);
  const tolerableConsecutiveLosses = Math.floor(bufferDollars / safeRisk);

  // Status Zone determination (Green / Yellow / Red)
  let zone: 'safe' | 'warning' | 'critical' = 'safe';
  let zoneLabel = 'Zone Sécurisée';
  let zoneColor = '#39FF14';

  if (bufferDollars < safeRisk * 2 || tolerableConsecutiveLosses < 2) {
    zone = 'critical';
    zoneLabel = 'Zone Critique (Danger)';
    zoneColor = '#EF4444';
  } else if (bufferDollars < safeRisk * 4 || tolerableConsecutiveLosses < 4) {
    zone = 'warning';
    zoneLabel = 'Zone de Vigilance';
    zoneColor = '#F59E0B';
  }

  // Profit target progress
  const profitEarned = Math.max(0, currentBalance - startingBalance);
  let targetProgressPercent = 0;
  let isProfitTargetReached = false;

  if (profitTarget && profitTarget > 0) {
    targetProgressPercent = Math.min(100, Math.round((profitEarned / profitTarget) * 100));
    isProfitTargetReached = profitEarned >= profitTarget;
  }

  return {
    currentBalance: Math.round(currentBalance * 100) / 100,
    highWaterMark: Math.round(highWaterMark * 100) / 100,
    liquidationThreshold: Math.round(liquidationThreshold * 100) / 100,
    bufferDollars: Math.round(bufferDollars * 100) / 100,
    bufferPercent: Math.round(bufferPercent * 10) / 10,
    dailyLossThreshold: dailyLossThreshold ? Math.round(dailyLossThreshold * 100) / 100 : null,
    dailyLossBuffer: dailyLossBuffer ? Math.round(dailyLossBuffer * 100) / 100 : null,
    tolerableConsecutiveLosses,
    tolerableDailyLosses,
    zone,
    zoneLabel,
    zoneColor,
    profitEarned: Math.round(profitEarned * 100) / 100,
    targetProgressPercent,
    isProfitTargetReached,
  };
}

/**
 * Native TICKS Position Sizing Engine for CME Futures (NQ / MNQ / ES / MES).
 * All risk and contract calculations are strictly driven by TICKS.
 */
export function calculateSizingComparison(
  selectedInstrument: 'NQ' | 'MNQ' | 'ES' | 'MES',
  stopLossTicks: number,
  riskDollars: number,
  accountBuffer: number
): SizingRecommendation {
  const isNasdaq = selectedInstrument === 'NQ' || selectedInstrument === 'MNQ';
  const miniKey = isNasdaq ? 'NQ' : 'ES';
  const microKey = isNasdaq ? 'MNQ' : 'MES';

  const miniSpec = INSTRUMENTS[miniKey];
  const microSpec = INSTRUMENTS[microKey];

  const safeTicks = Math.max(1, Math.round(stopLossTicks));
  const stopLossPoints = safeTicks * miniSpec.tickSize;

  // Mini calculation (Ticks * Tick Value)
  const miniRiskPerContract = safeTicks * miniSpec.tickValue;
  const miniRaw = miniRiskPerContract > 0 ? riskDollars / miniRiskPerContract : 0;
  const miniContracts = Math.floor(miniRaw);
  const miniGrossLoss = miniContracts * miniRiskPerContract;
  const miniCommissions = miniContracts * COMMISSIONS.MINI_ROUNDTRIP;
  const miniRiskTotal = miniGrossLoss + miniCommissions;

  // Micro calculation (Ticks * Tick Value)
  const microRiskPerContract = safeTicks * microSpec.tickValue;
  const microRaw = microRiskPerContract > 0 ? riskDollars / microRiskPerContract : 0;
  const microContracts = Math.floor(microRaw);
  const microGrossLoss = microContracts * microRiskPerContract;
  const microCommissions = microContracts * COMMISSIONS.MICRO_ROUNDTRIP;
  const microRiskTotal = microGrossLoss + microCommissions;

  // Recommendation engine
  let recommendedCategory: 'Mini' | 'Micro' = 'Micro';
  let recommendationReason = '';

  if (miniContracts === 0) {
    recommendedCategory = 'Micro';
    recommendationReason = `À ${riskDollars} $ de risque pour un SL de ${safeTicks} ticks, 1 contrat Mini ${miniKey} risquerait ${miniRiskPerContract.toFixed(0)} $ (trop élevé). Utilise ${microContracts} contrat(s) Micro ${microKey} pour respecter précisément ton risque.`;
  } else if (accountBuffer < riskDollars * 4) {
    recommendedCategory = 'Micro';
    recommendationReason = `Ton buffer de sécurité (${accountBuffer.toFixed(0)} $) est sous tension (< 4R). Les Micros (${microKey}) te permettent de calibrer ton risque au tick près par tranche de ${microRiskPerContract.toFixed(0)} $.`;
  } else if (miniContracts >= 1) {
    recommendedCategory = 'Mini';
    recommendationReason = `Ton buffer est confortable (> 4R). Tu peux intervenir avec ${miniContracts} contrat(s) Mini ${miniKey} (${miniGrossLoss.toFixed(0)} $) ou ${microContracts} Micro(s) ${microKey}.`;
  }

  return {
    instrument: selectedInstrument,
    stopLossPoints: Math.round(stopLossPoints * 100) / 100,
    stopLossTicks: safeTicks,
    riskDollars,
    miniContracts,
    miniRiskTotal: Math.round(miniRiskTotal * 100) / 100,
    miniCommissions: Math.round(miniCommissions * 100) / 100,
    microContracts,
    microRiskTotal: Math.round(microRiskTotal * 100) / 100,
    microCommissions: Math.round(microCommissions * 100) / 100,
    recommendedCategory,
    recommendationReason,
  };
}
