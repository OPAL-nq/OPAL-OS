import { Trade } from '@/types/trading';
import {
  PsychologyMetrics,
  EmotionalState,
  PlanCompliance,
  StopDiscipline,
  TiltRiskLevel,
  ComplianceStats,
  EmotionalStats,
  HourlyStats,
  DailyStats,
  HarshTruthInsight,
} from '@/types/psychology';

const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export function calculatePsychologyMetrics(trades: Trade[]): PsychologyMetrics {
  const totalTrades = trades.length;

  // 1. Sort trades chronologically
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
  );

  // 2. Identify Revenge Trades & Inter-trade timing
  let revengeTradesCount = 0;
  let revengeTotalR = 0;
  let revengeWins = 0;
  let revengePnlDollars = 0;

  for (let i = 0; i < sortedTrades.length; i++) {
    const trade = sortedTrades[i];
    const prevTrade = i > 0 ? sortedTrades[i - 1] : null;

    let isRevenge = false;
    if (trade.emotional_state === 'revenge') {
      isRevenge = true;
    } else if (prevTrade) {
      const prevDate = new Date(prevTrade.trade_date);
      const currDate = new Date(trade.trade_date);
      const isSameDay = prevDate.toDateString() === currDate.toDateString();
      const diffMinutes = (currDate.getTime() - prevDate.getTime()) / (1000 * 60);

      // If previous trade was a loss and next trade taken within 7 minutes
      if (isSameDay && (prevTrade.pnl_r < 0 || prevTrade.pnl_dollars < 0) && diffMinutes >= 0 && diffMinutes <= 7) {
        isRevenge = true;
      }
    }

    if (isRevenge) {
      revengeTradesCount++;
      revengeTotalR += Number(trade.pnl_r) || 0;
      revengePnlDollars += Number(trade.pnl_dollars) || 0;
      if (Number(trade.pnl_r) > 0) revengeWins++;
    }
  }

  const revengeStats = {
    count: revengeTradesCount,
    totalR: revengeTotalR,
    winRate: revengeTradesCount > 0 ? (revengeWins / revengeTradesCount) * 100 : 0,
    avgR: revengeTradesCount > 0 ? revengeTotalR / revengeTradesCount : 0,
    totalPnlDollars: revengePnlDollars,
  };

  // 3. Compliance Impact (Full vs Deviations)
  let fullCount = 0;
  let fullTotalR = 0;
  let fullWins = 0;
  let fullPnlDollars = 0;

  let devCount = 0;
  let devTotalR = 0;
  let devWins = 0;
  let devPnlDollars = 0;

  trades.forEach((t) => {
    const isFull =
      t.plan_compliance === 'full' ||
      (t.plan_compliance === undefined && t.plan_followed === true) ||
      (t.plan_compliance === null && t.plan_followed === true);

    const r = Number(t.pnl_r) || 0;
    const dollars = Number(t.pnl_dollars) || 0;

    if (isFull) {
      fullCount++;
      fullTotalR += r;
      fullPnlDollars += dollars;
      if (r > 0) fullWins++;
    } else {
      devCount++;
      devTotalR += r;
      devPnlDollars += dollars;
      if (r > 0) devWins++;
    }
  });

  const complianceImpact = {
    fullCompliance: {
      count: fullCount,
      totalR: fullTotalR,
      winRate: fullCount > 0 ? (fullWins / fullCount) * 100 : 0,
      avgR: fullCount > 0 ? fullTotalR / fullCount : 0,
      totalPnlDollars: fullPnlDollars,
    },
    deviations: {
      count: devCount,
      totalR: devTotalR,
      winRate: devCount > 0 ? (devWins / devCount) * 100 : 0,
      avgR: devCount > 0 ? devTotalR / devCount : 0,
      totalPnlDollars: devPnlDollars,
    },
    costOfDeviationsR: devTotalR < 0 ? Math.abs(devTotalR) : 0,
    costOfDeviationsDollars: devPnlDollars < 0 ? Math.abs(devPnlDollars) : 0,
  };

  // 4. Emotional Breakdown
  const emotionalStates: EmotionalState[] = ['calm', 'fomo', 'revenge', 'fatigued'];
  const emotionalBreakdown = {} as Record<EmotionalState, EmotionalStats>;

  emotionalStates.forEach((state) => {
    const stateTrades = trades.filter((t) => t.emotional_state === state);
    const count = stateTrades.length;
    const totalR = stateTrades.reduce((acc, t) => acc + (Number(t.pnl_r) || 0), 0);
    const totalPnl = stateTrades.reduce((acc, t) => acc + (Number(t.pnl_dollars) || 0), 0);
    const wins = stateTrades.filter((t) => Number(t.pnl_r) > 0).length;

    emotionalBreakdown[state] = {
      count,
      totalR,
      winRate: count > 0 ? (wins / count) * 100 : 0,
      avgR: count > 0 ? totalR / count : 0,
      totalPnlDollars: totalPnl,
    };
  });

  // 5. Stop Loss Discipline Breakdown
  const stopStates: StopDiscipline[] = ['respected', 'moved_early', 'widened_or_removed'];
  const stopDisciplineBreakdown = {} as Record<StopDiscipline, { count: number; totalR: number; winRate: number }>;

  stopStates.forEach((state) => {
    const stateTrades = trades.filter((t) => t.stop_discipline === state);
    const count = stateTrades.length;
    const totalR = stateTrades.reduce((acc, t) => acc + (Number(t.pnl_r) || 0), 0);
    const wins = stateTrades.filter((t) => Number(t.pnl_r) > 0).length;

    stopDisciplineBreakdown[state] = {
      count,
      totalR,
      winRate: count > 0 ? (wins / count) * 100 : 0,
    };
  });

  // 6. Hourly & Daily Breakdown
  const hourlyMap = new Map<number, { count: number; totalR: number; wins: number; pnl: number }>();
  const dailyMap = new Map<number, { count: number; totalR: number; wins: number; pnl: number }>();

  for (let h = 8; h <= 22; h++) {
    hourlyMap.set(h, { count: 0, totalR: 0, wins: 0, pnl: 0 });
  }
  for (let d = 1; d <= 5; d++) {
    dailyMap.set(d, { count: 0, totalR: 0, wins: 0, pnl: 0 });
  }

  trades.forEach((t) => {
    const d = new Date(t.trade_date);
    const hour = d.getHours();
    const day = d.getDay();
    const r = Number(t.pnl_r) || 0;
    const dollars = Number(t.pnl_dollars) || 0;

    if (hourlyMap.has(hour)) {
      const entry = hourlyMap.get(hour)!;
      entry.count++;
      entry.totalR += r;
      entry.pnl += dollars;
      if (r > 0) entry.wins++;
    }

    if (dailyMap.has(day)) {
      const entry = dailyMap.get(day)!;
      entry.count++;
      entry.totalR += r;
      entry.pnl += dollars;
      if (r > 0) entry.wins++;
    }
  });

  const hourlyPerformance: HourlyStats[] = Array.from(hourlyMap.entries()).map(([hour, data]) => ({
    hour,
    label: `${hour}h00`,
    count: data.count,
    totalR: data.totalR,
    winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0,
    avgR: data.count > 0 ? data.totalR / data.count : 0,
  }));

  const dailyPerformance: DailyStats[] = [1, 2, 3, 4, 5].map((dayIndex) => {
    const data = dailyMap.get(dayIndex) || { count: 0, totalR: 0, wins: 0, pnl: 0 };
    return {
      dayIndex,
      dayLabel: DAY_NAMES[dayIndex],
      count: data.count,
      totalR: data.totalR,
      winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0,
      avgR: data.count > 0 ? data.totalR / data.count : 0,
    };
  });

  // 7. Today's live stats & Tilt Risk Level
  const todayStr = new Date().toDateString();
  const todayTrades = sortedTrades.filter((t) => new Date(t.trade_date).toDateString() === todayStr);
  const tradesTodayCount = todayTrades.length;
  const totalRToday = todayTrades.reduce((acc, t) => acc + (Number(t.pnl_r) || 0), 0);
  const totalPnlDollarsToday = todayTrades.reduce((acc, t) => acc + (Number(t.pnl_dollars) || 0), 0);

  // Consecutive losses today
  let consecutiveLossesToday = 0;
  for (let i = todayTrades.length - 1; i >= 0; i--) {
    if (Number(todayTrades[i].pnl_r) < 0 || Number(todayTrades[i].pnl_dollars) < 0) {
      consecutiveLossesToday++;
    } else {
      break;
    }
  }

  const lastTrade = todayTrades.length > 0 ? todayTrades[todayTrades.length - 1] : null;
  const lastTradeTime = lastTrade ? lastTrade.trade_date : null;
  const minutesSinceLastTrade = lastTrade
    ? Math.floor((new Date().getTime() - new Date(lastTrade.trade_date).getTime()) / (1000 * 60))
    : null;

  const isOvertrading = tradesTodayCount >= 5;

  let tiltRiskLevel: TiltRiskLevel = 'green';
  let tiltRiskReason = 'Conditions optimales : discipline respectée et lucidité totale.';
  let tiltRiskScore = 15; // 0 (calm) to 100 (extreme tilt)

  if (consecutiveLossesToday >= 3 || (consecutiveLossesToday >= 2 && tradesTodayCount >= 4)) {
    tiltRiskLevel = 'red';
    tiltRiskScore = 90;
    tiltRiskReason = `Zone Rouge Critique : ${consecutiveLossesToday} pertes consécutives aujourd'hui. Fermez votre station de trading.`;
  } else if (consecutiveLossesToday === 2) {
    tiltRiskLevel = 'yellow';
    tiltRiskScore = 60;
    tiltRiskReason = 'Vigilance Émotionnelle : 2 pertes consécutives. Pause obligatoire de 15 minutes recommandée.';
  } else if (isOvertrading) {
    tiltRiskLevel = 'yellow';
    tiltRiskScore = 55;
    tiltRiskReason = `Attention Overtrading : déjà ${tradesTodayCount} trades exécutés sur la session.`;
  } else if (todayTrades.some((t) => t.plan_compliance === 'off_plan' || t.emotional_state === 'revenge')) {
    tiltRiskLevel = 'yellow';
    tiltRiskScore = 65;
    tiltRiskReason = 'Écart de discipline détecté sur la session : recentrez-vous sur vos règles de base.';
  }

  // 8. Discipline Score Calculation (0 to 100)
  const planComplianceScore =
    totalTrades > 0
      ? Math.round((fullCount / totalTrades) * 100)
      : 100;

  const stopDisciplineScore = (() => {
    const taggedStops = trades.filter((t) => t.stop_discipline);
    if (taggedStops.length === 0) return 95;
    const respected = taggedStops.filter((t) => t.stop_discipline === 'respected').length;
    return Math.round((respected / taggedStops.length) * 100);
  })();

  const revengeAvoidanceScore = (() => {
    if (totalTrades === 0) return 100;
    const revengeRate = revengeTradesCount / totalTrades;
    return Math.max(0, Math.round((1 - revengeRate * 2.5) * 100));
  })();

  const emotionalMasteryScore = (() => {
    const taggedEmotional = trades.filter((t) => t.emotional_state);
    if (taggedEmotional.length === 0) return 90;
    const calmCount = taggedEmotional.filter((t) => t.emotional_state === 'calm').length;
    return Math.round((calmCount / taggedEmotional.length) * 100);
  })();

  const disciplineScore = Math.round(
    planComplianceScore * 0.4 +
      stopDisciplineScore * 0.3 +
      revengeAvoidanceScore * 0.2 +
      emotionalMasteryScore * 0.1
  );

  let disciplineGrade: 'S+' | 'A' | 'B' | 'C' | 'D' = 'B';
  if (disciplineScore >= 92) disciplineGrade = 'S+';
  else if (disciplineScore >= 82) disciplineGrade = 'A';
  else if (disciplineScore >= 70) disciplineGrade = 'B';
  else if (disciplineScore >= 55) disciplineGrade = 'C';
  else disciplineGrade = 'D';

  // 9. Automated Harsh Truth Insights
  const harshTruthInsights: HarshTruthInsight[] = [];

  // Insight 1: Deviations Cost
  if (devCount > 0 && devTotalR < 0) {
    harshTruthInsights.push({
      id: 'plan_deviation_cost',
      type: 'critical',
      title: 'Coût Réel des Écarts au Plan',
      message: `Vos trades conformes au plan génèrent ${fullTotalR >= 0 ? `+${fullTotalR.toFixed(1)}R` : `${fullTotalR.toFixed(1)}R`}. Vos déviations et trades hors plan vous ont coûté ${devTotalR.toFixed(1)}R (${devPnlDollars < 0 ? `-$${Math.abs(devPnlDollars).toFixed(0)}` : ''}).`,
      metricBadge: `${devTotalR.toFixed(1)}R`,
      impactR: devTotalR,
    });
  } else if (totalTrades > 0 && fullCount === totalTrades) {
    harshTruthInsights.push({
      id: 'perfect_discipline',
      type: 'success',
      title: 'Discipline Parfaite',
      message: '100% de vos trades récents sont conformes à votre ruleset. Continuez à exécuter avec cette rigueur.',
      metricBadge: '100% Plan',
    });
  }

  // Insight 2: Revenge Trading stats
  if (revengeTradesCount >= 2) {
    harshTruthInsights.push({
      id: 'revenge_trading_leak',
      type: 'critical',
      title: 'Hémorragie de Revenge Trading Détectée',
      message: `${revengeTradesCount} trades ont été pris impulsivement après une perte. Leur Winrate moyen est de ${revengeStats.winRate.toFixed(0)}% pour une espérance négative de ${revengeStats.avgR.toFixed(2)}R par trade.`,
      metricBadge: `${revengeStats.winRate.toFixed(0)}% WR`,
      impactR: revengeStats.totalR,
    });
  }

  // Insight 3: Emotional vs Calm
  if (emotionalBreakdown.calm.count > 0 && (emotionalBreakdown.fomo.count > 0 || emotionalBreakdown.revenge.count > 0)) {
    const calmWr = emotionalBreakdown.calm.winRate;
    const impulsiveWr =
      (emotionalBreakdown.fomo.winRate * emotionalBreakdown.fomo.count +
        emotionalBreakdown.revenge.winRate * emotionalBreakdown.revenge.count) /
      Math.max(1, emotionalBreakdown.fomo.count + emotionalBreakdown.revenge.count);

    if (calmWr > impulsiveWr + 15) {
      harshTruthInsights.push({
        id: 'calm_vs_impulsive',
        type: 'warning',
        title: 'Impact de la Lucidité Mentale',
        message: `Vous gagnez ${calmWr.toFixed(0)}% de vos trades lorsque vous êtes Calme & Confiant, contre seulement ${impulsiveWr.toFixed(0)}% en état de FOMO ou de Frustration.`,
        metricBadge: `+${(calmWr - impulsiveWr).toFixed(0)}% WR`,
      });
    }
  }

  // Insight 4: Best & Worst Days
  const activeDays = dailyPerformance.filter((d) => d.count >= 2);
  if (activeDays.length >= 2) {
    const bestDay = [...activeDays].sort((a, b) => b.totalR - a.totalR)[0];
    const worstDay = [...activeDays].sort((a, b) => a.totalR - b.totalR)[0];

    if (bestDay && worstDay && bestDay.totalR > worstDay.totalR + 2) {
      harshTruthInsights.push({
        id: 'day_bias',
        type: 'info',
        title: 'Biais Temporel Hebdomadaire',
        message: `${bestDay.dayLabel} est votre jour le plus rentable (+${bestDay.totalR.toFixed(1)}R, ${bestDay.winRate.toFixed(0)}% WR), tandis que ${worstDay.dayLabel} concentre le plus de pertes (${worstDay.totalR.toFixed(1)}R).`,
        metricBadge: `${bestDay.dayLabel} Top`,
      });
    }
  }

  return {
    disciplineScore,
    disciplineGrade,
    tiltRiskLevel,
    tiltRiskReason,
    tiltRiskScore,
    todayStats: {
      tradesCount: tradesTodayCount,
      consecutiveLosses: consecutiveLossesToday,
      totalRToday,
      totalPnlDollarsToday,
      lastTradeTime,
      minutesSinceLastTrade,
      isOvertrading,
    },
    pillars: {
      planComplianceScore,
      stopDisciplineScore,
      revengeAvoidanceScore,
      emotionalMasteryScore,
    },
    revengeTrades: revengeStats,
    complianceImpact,
    emotionalBreakdown,
    stopDisciplineBreakdown,
    hourlyPerformance,
    dailyPerformance,
    harshTruthInsights,
  };
}
