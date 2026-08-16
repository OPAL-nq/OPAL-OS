-- =======================================================
-- OPAL OS — Phase 9 Migration : Whop Memberships & Auto Access Sync
-- =======================================================

-- 1. Create Whop Memberships Table
CREATE TABLE IF NOT EXISTS public.whop_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    whop_user_id TEXT,
    whop_membership_id TEXT UNIQUE NOT NULL,
    whop_product_id TEXT NOT NULL,
    whop_plan_id TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    plan_type user_plan NOT NULL DEFAULT 'community',
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    last_event TEXT,
    raw_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for Performance & Idempotency
CREATE INDEX IF NOT EXISTS idx_whop_memberships_user_id ON public.whop_memberships (user_id);
CREATE INDEX IF NOT EXISTS idx_whop_memberships_email ON public.whop_memberships (lower(email));
CREATE INDEX IF NOT EXISTS idx_whop_memberships_membership_id ON public.whop_memberships (whop_membership_id);
CREATE INDEX IF NOT EXISTS idx_whop_memberships_product_id ON public.whop_memberships (whop_product_id);
CREATE INDEX IF NOT EXISTS idx_whop_memberships_status ON public.whop_memberships (status);

-- 3. Enable RLS
ALTER TABLE public.whop_memberships ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Users can view own whop memberships" ON public.whop_memberships;
CREATE POLICY "Users can view own whop memberships"
    ON public.whop_memberships
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all whop memberships" ON public.whop_memberships;
CREATE POLICY "Admins can manage all whop memberships"
    ON public.whop_memberships
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Updated handle_new_user to link with existing Whop Membership automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    matched_plan user_plan := 'community';
    matched_whop_id UUID;
BEGIN
    -- Check if a valid Whop membership already exists for this email
    SELECT id, plan_type INTO matched_whop_id, matched_plan
    FROM public.whop_memberships
    WHERE lower(email) = lower(NEW.email)
      AND status IN ('active', 'valid', 'completed')
    ORDER BY (CASE WHEN plan_type = 'intensive' THEN 1 ELSE 2 END), created_at DESC
    LIMIT 1;

    -- Insert profile with matched plan
    INSERT INTO public.profiles (id, email, full_name, role, plan, status)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'user',
        COALESCE(matched_plan, 'community'),
        'active'
    )
    ON CONFLICT (id) DO UPDATE SET
        plan = EXCLUDED.plan;

    -- If a membership was found, link user_id
    IF matched_whop_id IS NOT NULL THEN
        UPDATE public.whop_memberships
        SET user_id = NEW.id
        WHERE lower(email) = lower(NEW.email) AND user_id IS NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger for updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.whop_memberships;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.whop_memberships
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
