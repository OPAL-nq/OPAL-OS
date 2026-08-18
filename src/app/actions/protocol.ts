'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { DailyProtocol, UserStreak, ALL_DISCIPLINE_BADGES } from '@/types/protocol';

/**
 * Returns date in YYYY-MM-DD format (local/UTC aligned)
 */
function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date string is Saturday or Sunday
 */
function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

/**
 * Get previous business day date string
 */
function getPreviousBusinessDay(dateStr: string): string {
  const d = new Date(dateStr);
  let daysToSubtract = 1;
  const dayOfWeek = d.getDay();

  if (dayOfWeek === 1) {
    // Monday -> goes back to Friday (subtract 3 days)
    daysToSubtract = 3;
  } else if (dayOfWeek === 0) {
    // Sunday -> Friday
    daysToSubtract = 2;
  }

  const prev = new Date(d.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);
  const year = prev.getFullYear();
  const month = String(prev.getMonth() + 1).padStart(2, '0');
  const day = String(prev.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's protocol and user streak
 */
export async function getTodayProtocol(): Promise<{
  protocol: DailyProtocol;
  streak: UserStreak;
  recentDays: DailyProtocol[];
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const todayStr = getTodayDateString();

  const fallbackProtocol: DailyProtocol = {
    id: 'local-today',
    user_id: user?.id || '',
    protocol_date: todayStr,
    pre_market_done: false,
    session_rules_done: false,
    journaling_done: false,
    mental_close_done: false,
    no_trade_day: false,
    is_completed: false,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const fallbackStreak: UserStreak = {
    user_id: user?.id || '',
    current_streak: 0,
    longest_streak: 0,
    last_completed_date: null,
    freeze_count: 0,
    badges: [],
    updated_at: new Date().toISOString(),
  };

  if (!user) {
    return {
      protocol: fallbackProtocol,
      streak: fallbackStreak,
      recentDays: [],
    };
  }

  try {
    // 1. Fetch Today's Protocol
    let { data: protocol } = await supabase
      .from('daily_protocols')
      .select('*')
      .eq('user_id', user.id)
      .eq('protocol_date', todayStr)
      .maybeSingle();

    if (!protocol) {
      const { data: newProto } = await supabase
        .from('daily_protocols')
        .insert({
          user_id: user.id,
          protocol_date: todayStr,
          pre_market_done: false,
          session_rules_done: false,
          journaling_done: false,
          mental_close_done: false,
          no_trade_day: false,
          is_completed: false,
        })
        .select('*')
        .single();

      protocol = newProto || fallbackProtocol;
    }

    // 2. Fetch User Streak
    let { data: streak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!streak) {
      const { data: newStreak } = await supabase
        .from('user_streaks')
        .insert({
          user_id: user.id,
          current_streak: 0,
          longest_streak: 0,
          badges: [],
        })
        .select('*')
        .single();

      streak = newStreak || fallbackStreak;
    } else {
      // Check if streak is broken (if last completed date is older than previous business day and not today)
      if (streak.last_completed_date && streak.last_completed_date !== todayStr) {
        const prevBizDay = getPreviousBusinessDay(todayStr);
        if (streak.last_completed_date < prevBizDay && streak.current_streak > 0) {
          // Streak expired
          streak.current_streak = 0;
          await supabase
            .from('user_streaks')
            .update({ current_streak: 0, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
        }
      }
    }

    // 3. Fetch Recent Days (last 14 days)
    const { data: recentDays } = await supabase
      .from('daily_protocols')
      .select('*')
      .eq('user_id', user.id)
      .order('protocol_date', { ascending: false })
      .limit(14);

    return {
      protocol: protocol as DailyProtocol,
      streak: streak as UserStreak,
      recentDays: (recentDays || []) as DailyProtocol[],
    };
  } catch (err) {
    console.error('Erreur getTodayProtocol:', err);
    return {
      protocol: fallbackProtocol,
      streak: fallbackStreak,
      recentDays: [],
    };
  }
}

/**
 * Toggle a specific step in the daily protocol
 */
export async function toggleProtocolStep(
  stepKey: 'pre_market_done' | 'session_rules_done' | 'journaling_done' | 'mental_close_done',
  value: boolean
): Promise<{ success: boolean; protocol: DailyProtocol; streak: UserStreak }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const todayStr = getTodayDateString();

  // Fetch current
  const { data: current } = await supabase
    .from('daily_protocols')
    .select('*')
    .eq('user_id', user.id)
    .eq('protocol_date', todayStr)
    .single();

  const updatedValues = {
    ...current,
    [stepKey]: value,
    updated_at: new Date().toISOString(),
  };

  const isAllDone =
    (updatedValues.pre_market_done &&
      updatedValues.session_rules_done &&
      updatedValues.journaling_done &&
      updatedValues.mental_close_done) ||
    updatedValues.no_trade_day;

  const wasCompletedBefore = current?.is_completed || false;
  updatedValues.is_completed = isAllDone;

  // Update protocol
  const { data: savedProtocol } = await supabase
    .from('daily_protocols')
    .update(updatedValues)
    .eq('user_id', user.id)
    .eq('protocol_date', todayStr)
    .select('*')
    .single();

  // Handle Streak recalculation
  const { data: streakData } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  let streak = streakData || {
    user_id: user.id,
    current_streak: 0,
    longest_streak: 0,
    last_completed_date: null,
    badges: [],
  };

  if (isAllDone && !wasCompletedBefore) {
    // Just completed today!
    const prevBizDay = getPreviousBusinessDay(todayStr);
    let newStreakCount = 1;

    if (streak.last_completed_date === prevBizDay) {
      newStreakCount = (streak.current_streak || 0) + 1;
    } else if (streak.last_completed_date === todayStr) {
      newStreakCount = streak.current_streak || 1;
    }

    const longest = Math.max(streak.longest_streak || 0, newStreakCount);

    // Calculate badges
    const currentBadges: string[] = Array.isArray(streak.badges) ? streak.badges : [];
    ALL_DISCIPLINE_BADGES.forEach((b) => {
      if (newStreakCount >= b.requiredStreak && !currentBadges.includes(b.id)) {
        currentBadges.push(b.id);
      }
    });

    const { data: updatedStreak } = await supabase
      .from('user_streaks')
      .upsert({
        user_id: user.id,
        current_streak: newStreakCount,
        longest_streak: longest,
        last_completed_date: todayStr,
        badges: currentBadges,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    streak = updatedStreak || streak;
  } else if (!isAllDone && wasCompletedBefore && streak.last_completed_date === todayStr) {
    // Uncompleted today
    const decremented = Math.max(0, (streak.current_streak || 1) - 1);
    const { data: updatedStreak } = await supabase
      .from('user_streaks')
      .update({
        current_streak: decremented,
        last_completed_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select('*')
      .single();

    streak = updatedStreak || streak;
  }

  revalidatePath('/dashboard');
  revalidatePath('/trading');

  return {
    success: true,
    protocol: (savedProtocol || updatedValues) as DailyProtocol,
    streak: streak as UserStreak,
  };
}

/**
 * Toggle No-Trade Day (Perfect Patience Day)
 */
export async function toggleNoTradeDay(value: boolean): Promise<{ success: boolean; protocol: DailyProtocol; streak: UserStreak }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const todayStr = getTodayDateString();

  const { data: current } = await supabase
    .from('daily_protocols')
    .select('*')
    .eq('user_id', user.id)
    .eq('protocol_date', todayStr)
    .single();

  const isCompleted = value
    ? true
    : Boolean(
        current?.pre_market_done &&
        current?.session_rules_done &&
        current?.journaling_done &&
        current?.mental_close_done
      );

  const { data: updatedProtocol } = await supabase
    .from('daily_protocols')
    .update({
      no_trade_day: value,
      is_completed: isCompleted,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('protocol_date', todayStr)
    .select('*')
    .single();

  // Streak update if newly completed
  const { data: streakData } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  let streak = streakData || {
    user_id: user.id,
    current_streak: 0,
    longest_streak: 0,
    last_completed_date: null,
    badges: [],
  };

  if (isCompleted && !current?.is_completed) {
    const prevBizDay = getPreviousBusinessDay(todayStr);
    let newStreakCount = 1;
    if (streak.last_completed_date === prevBizDay) {
      newStreakCount = (streak.current_streak || 0) + 1;
    }
    const longest = Math.max(streak.longest_streak || 0, newStreakCount);

    const currentBadges: string[] = Array.isArray(streak.badges) ? streak.badges : [];
    ALL_DISCIPLINE_BADGES.forEach((b) => {
      if (newStreakCount >= b.requiredStreak && !currentBadges.includes(b.id)) {
        currentBadges.push(b.id);
      }
    });

    const { data: updatedStreak } = await supabase
      .from('user_streaks')
      .upsert({
        user_id: user.id,
        current_streak: newStreakCount,
        longest_streak: longest,
        last_completed_date: todayStr,
        badges: currentBadges,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    streak = updatedStreak || streak;
  }

  revalidatePath('/dashboard');
  revalidatePath('/trading');

  return {
    success: true,
    protocol: updatedProtocol as DailyProtocol,
    streak: streak as UserStreak,
  };
}
