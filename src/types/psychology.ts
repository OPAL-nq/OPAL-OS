export type EmotionalState = 'calm' | 'fomo' | 'revenge' | 'fatigued';
export type PlanCompliance = 'full' | 'minor_deviation' | 'off_plan';
export type StopDiscipline = 'respected' | 'moved_early' | 'widened_or_removed';

export type TiltRiskLevel = 'green' | 'yellow' | 'red';

export interface EmotionalStats {
  count: number;
  totalR: number;
  winRate: number;
  avgR: number;
  totalPnlDollars: number;
}

export interface ComplianceStats {
  count: number;
  totalR: number;
  winRate: number;
  avgR: number;
  totalPnlDollars: number;
}

export interface HourlyStats {
  hour: number;
  label: string;
  count: number;
  totalR: number;
  winRate: number;
  avgR: number;
}

export interface DailyStats {
  dayIndex: number;
  dayLabel: string;
  count: number;
  totalR: number;
  winRate: number;
  avgR: number;
}

export interface HarshTruthInsight {
  id: string;
  type: 'critical' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  metricBadge?: string;
  impactR?: number;
}

export interface PsychologyMetrics {
  disciplineScore: number;
  disciplineGrade: 'S+' | 'A' | 'B' | 'C' | 'D';
  tiltRiskLevel: TiltRiskLevel;
  tiltRiskReason: string;
  tiltRiskScore: number; // 0 to 100
  
  // Today's live stats
  todayStats: {
    tradesCount: number;
    consecutiveLosses: number;
    totalRToday: number;
    totalPnlDollarsToday: number;
    lastTradeTime: string | null;
    minutesSinceLastTrade: number | null;
    isOvertrading: boolean;
  };

  // Pillars breakdown (0-100)
  pillars: {
    planComplianceScore: number;
    stopDisciplineScore: number;
    revengeAvoidanceScore: number;
    emotionalMasteryScore: number;
  };

  // Revenge Trading
  revengeTrades: {
    count: number;
    totalR: number;
    winRate: number;
    avgR: number;
    totalPnlDollars: number;
  };

  // Compliance Impact
  complianceImpact: {
    fullCompliance: ComplianceStats;
    deviations: ComplianceStats;
    costOfDeviationsR: number;
    costOfDeviationsDollars: number;
  };

  // Breakdown by Emotional State
  emotionalBreakdown: Record<EmotionalState, EmotionalStats>;

  // Breakdown by Stop Loss Discipline
  stopDisciplineBreakdown: Record<StopDiscipline, { count: number; totalR: number; winRate: number }>;

  // Time & Day Heatmap
  hourlyPerformance: HourlyStats[];
  dailyPerformance: DailyStats[];

  // Dynamic Insights
  harshTruthInsights: HarshTruthInsight[];
}
