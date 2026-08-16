-- =======================================================
-- OPAL OS — Phase 3 Migration : Trading Workspace & Journal
-- =======================================================

-- 1. Workspace Sessions Table (Plan de préparation de session)
CREATE TABLE IF NOT EXISTS public.workspace_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    instrument TEXT NOT NULL DEFAULT 'NQ',
    bias TEXT NOT NULL DEFAULT 'Neutral',
    key_levels TEXT,
    market_context TEXT,
    primary_scenario TEXT,
    alternative_scenario TEXT,
    execution_conditions TEXT,
    invalidation_conditions TEXT,
    risk_management TEXT,
    mindset TEXT,
    decision TEXT NOT NULL DEFAULT 'WAIT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Trades Table (Journal de Trading)
CREATE TABLE IF NOT EXISTS public.trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_session_id UUID REFERENCES public.workspace_sessions(id) ON DELETE SET NULL,
    trade_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    instrument TEXT NOT NULL DEFAULT 'NQ',
    direction TEXT NOT NULL DEFAULT 'Long',
    entry_price NUMERIC,
    stop_loss NUMERIC,
    take_profit NUMERIC,
    risk_dollars NUMERIC NOT NULL DEFAULT 0,
    pnl_dollars NUMERIC NOT NULL DEFAULT 0,
    pnl_r NUMERIC NOT NULL DEFAULT 0,
    screenshot_url TEXT,
    plan_followed BOOLEAN NOT NULL DEFAULT true,
    mistakes TEXT,
    notes TEXT,
    market_context TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes for fast user queries and time-series sorting
CREATE INDEX IF NOT EXISTS idx_workspace_sessions_user_id ON public.workspace_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_sessions_date ON public.workspace_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_date ON public.trades(trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_session_id ON public.trades(workspace_session_id);

-- 4. Enable RLS
ALTER TABLE public.workspace_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Workspace Sessions (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own workspace sessions" ON public.workspace_sessions;
CREATE POLICY "Users can view own workspace sessions"
    ON public.workspace_sessions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own workspace sessions" ON public.workspace_sessions;
CREATE POLICY "Users can insert own workspace sessions"
    ON public.workspace_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own workspace sessions" ON public.workspace_sessions;
CREATE POLICY "Users can update own workspace sessions"
    ON public.workspace_sessions FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own workspace sessions" ON public.workspace_sessions;
CREATE POLICY "Users can delete own workspace sessions"
    ON public.workspace_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- 6. RLS Policies: Trades (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own trades" ON public.trades;
CREATE POLICY "Users can view own trades"
    ON public.trades FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own trades" ON public.trades;
CREATE POLICY "Users can insert own trades"
    ON public.trades FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own trades" ON public.trades;
CREATE POLICY "Users can update own trades"
    ON public.trades FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own trades" ON public.trades;
CREATE POLICY "Users can delete own trades"
    ON public.trades FOR DELETE
    USING (auth.uid() = user_id);

-- 7. Triggers for updated_at
DROP TRIGGER IF EXISTS handle_workspace_sessions_updated_at ON public.workspace_sessions;
CREATE TRIGGER handle_workspace_sessions_updated_at
    BEFORE UPDATE ON public.workspace_sessions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS handle_trades_updated_at ON public.trades;
CREATE TRIGGER handle_trades_updated_at
    BEFORE UPDATE ON public.trades
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
