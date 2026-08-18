-- ======================================================================
-- OPAL OS — Migration 011 : Prop Firm Drawdown Guardian
-- ======================================================================

-- 1. PROP FIRM ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.prop_firm_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    account_name TEXT NOT NULL,
    firm_name TEXT NOT NULL, -- 'topstep', 'apex', 'mffu', 'bulenox', 'tradeday', 'custom'
    account_tier TEXT NOT NULL, -- '25k', '50k', '100k', '150k', '300k', 'custom'
    starting_balance NUMERIC NOT NULL,
    current_balance NUMERIC NOT NULL,
    high_water_mark NUMERIC NOT NULL,
    drawdown_limit NUMERIC NOT NULL,
    max_daily_loss NUMERIC,
    consistency_rule_pct NUMERIC, -- e.g. 30, 40, 50
    profit_target NUMERIC,
    is_trailing_eod BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'passed', 'blown', 'payout_ready')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_prop_firm_accounts_user ON public.prop_firm_accounts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prop_firm_accounts_active ON public.prop_firm_accounts (user_id, is_active);

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.prop_firm_accounts ENABLE ROW LEVEL SECURITY;

-- 3.1 SELECT Policy:
DROP POLICY IF EXISTS "Users can view own prop firm accounts or admins all" ON public.prop_firm_accounts;
CREATE POLICY "Users can view own prop firm accounts or admins all"
    ON public.prop_firm_accounts FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- 3.2 INSERT Policy:
DROP POLICY IF EXISTS "Users can insert own prop firm accounts" ON public.prop_firm_accounts;
CREATE POLICY "Users can insert own prop firm accounts"
    ON public.prop_firm_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 3.3 UPDATE Policy:
DROP POLICY IF EXISTS "Users can update own prop firm accounts" ON public.prop_firm_accounts;
CREATE POLICY "Users can update own prop firm accounts"
    ON public.prop_firm_accounts FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 3.4 DELETE Policy:
DROP POLICY IF EXISTS "Users can delete own prop firm accounts" ON public.prop_firm_accounts;
CREATE POLICY "Users can delete own prop firm accounts"
    ON public.prop_firm_accounts FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());

-- 4. Enable Realtime
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.prop_firm_accounts;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN others THEN null;
END $$;
