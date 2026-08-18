-- ======================================================================
-- OPAL OS — Migration 013 : Daily Protocol & Discipline Streaks
-- ======================================================================

-- 1. DAILY PROTOCOL TABLE
CREATE TABLE IF NOT EXISTS public.daily_protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    protocol_date DATE NOT NULL,
    pre_market_done BOOLEAN DEFAULT false,
    session_rules_done BOOLEAN DEFAULT false,
    journaling_done BOOLEAN DEFAULT false,
    mental_close_done BOOLEAN DEFAULT false,
    no_trade_day BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, protocol_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_protocols_user_date ON public.daily_protocols (user_id, protocol_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_protocols_completed ON public.daily_protocols (user_id, is_completed);

-- 2. USER STREAKS & BADGES TABLE
CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_completed_date DATE,
    freeze_count INTEGER NOT NULL DEFAULT 0,
    badges JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.daily_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Policies for daily_protocols
DROP POLICY IF EXISTS "Users can view own protocols or admins all" ON public.daily_protocols;
CREATE POLICY "Users can view own protocols or admins all"
    ON public.daily_protocols FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own protocols" ON public.daily_protocols;
CREATE POLICY "Users can insert own protocols"
    ON public.daily_protocols FOR INSERT
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own protocols" ON public.daily_protocols;
CREATE POLICY "Users can update own protocols"
    ON public.daily_protocols FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own protocols" ON public.daily_protocols;
CREATE POLICY "Users can delete own protocols"
    ON public.daily_protocols FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());

-- Policies for user_streaks
DROP POLICY IF EXISTS "Users can view own streaks or admins all" ON public.user_streaks;
CREATE POLICY "Users can view own streaks or admins all"
    ON public.user_streaks FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own streaks" ON public.user_streaks;
CREATE POLICY "Users can insert own streaks"
    ON public.user_streaks FOR INSERT
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own streaks" ON public.user_streaks;
CREATE POLICY "Users can update own streaks"
    ON public.user_streaks FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());
