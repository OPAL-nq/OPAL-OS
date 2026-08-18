export interface DailyProtocol {
  id: string;
  user_id: string;
  protocol_date: string; // YYYY-MM-DD
  pre_market_done: boolean;
  session_rules_done: boolean;
  journaling_done: boolean;
  mental_close_done: boolean;
  no_trade_day: boolean;
  is_completed: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DisciplineBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  requiredStreak: number;
}

export interface UserStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date?: string | null;
  freeze_count: number;
  badges: string[];
  updated_at: string;
}

export const ALL_DISCIPLINE_BADGES: DisciplineBadge[] = [
  {
    id: 'iron_shield_3d',
    name: 'Iron Shield (3 Jours)',
    description: '3 jours consécutifs de protocole et respect absolu de la Max Loss.',
    icon: '🛡️',
    requiredStreak: 3,
  },
  {
    id: 'sniper_execution_7d',
    name: 'Sniper Focus (7 Jours)',
    description: '7 jours consécutifs avec 100% du protocole quotidien complété.',
    icon: '🎯',
    requiredStreak: 7,
  },
  {
    id: 'discipline_titan_14d',
    name: 'Discipline Titan (14 Jours)',
    description: 'Deux semaines de trading sans le moindre écart de discipline.',
    icon: '🔥',
    requiredStreak: 14,
  },
  {
    id: 'zen_master_30d',
    name: 'Zen Master (30 Jours)',
    description: 'Un mois entier de maîtrise psychologique et de rigueur institutionnelle.',
    icon: '🧘',
    requiredStreak: 30,
  },
];
