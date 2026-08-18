-- ======================================================================
-- OPAL OS — Migration 010 : Coaching Preparations ("Préparer mon Coaching")
-- ======================================================================

-- 1. COACHING PREPARATIONS TABLE
CREATE TABLE IF NOT EXISTS public.coaching_preparations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.coaching_sessions(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    questions TEXT,
    difficulties JSONB DEFAULT '{"psychology":[], "technique":[], "risk":[], "notes":""}'::jsonb,
    trades_to_review JSONB DEFAULT '[]'::jsonb,
    key_goals TEXT,
    coach_notes TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_coaching_preparations_session UNIQUE (session_id)
);

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_coaching_preparations_session ON public.coaching_preparations (session_id);
CREATE INDEX IF NOT EXISTS idx_coaching_preparations_client ON public.coaching_preparations (client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coaching_preparations_status ON public.coaching_preparations (status);

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.coaching_preparations ENABLE ROW LEVEL SECURITY;

-- 3.1 SELECT Policy:
-- Intensive clients can view their own preparations, admins can view all
DROP POLICY IF EXISTS "Intensive clients can view their own preparations or admins all" ON public.coaching_preparations;
CREATE POLICY "Intensive clients can view their own preparations or admins all"
    ON public.coaching_preparations FOR SELECT
    USING (
        public.is_admin() OR (
            auth.uid() = client_id AND EXISTS (
                SELECT 1 FROM public.profiles WHERE id = auth.uid() AND plan = 'intensive'
            )
        )
    );

-- 3.2 INSERT Policy:
-- Intensive clients can insert their own preparation, admins can insert for any client
DROP POLICY IF EXISTS "Intensive clients or admins can insert preparations" ON public.coaching_preparations;
CREATE POLICY "Intensive clients or admins can insert preparations"
    ON public.coaching_preparations FOR INSERT
    WITH CHECK (
        public.is_admin() OR (
            auth.uid() = client_id AND EXISTS (
                SELECT 1 FROM public.profiles WHERE id = auth.uid() AND plan = 'intensive'
            )
        )
    );

-- 3.3 UPDATE Policy:
-- Intensive clients can update their preparation, admins can update any preparation (including coach_notes)
DROP POLICY IF EXISTS "Intensive clients or admins can update preparations" ON public.coaching_preparations;
CREATE POLICY "Intensive clients or admins can update preparations"
    ON public.coaching_preparations FOR UPDATE
    USING (
        public.is_admin() OR (
            auth.uid() = client_id AND EXISTS (
                SELECT 1 FROM public.profiles WHERE id = auth.uid() AND plan = 'intensive'
            )
        )
    )
    WITH CHECK (
        public.is_admin() OR (
            auth.uid() = client_id AND EXISTS (
                SELECT 1 FROM public.profiles WHERE id = auth.uid() AND plan = 'intensive'
            )
        )
    );

-- 3.4 DELETE Policy:
-- Admins can delete preparations
DROP POLICY IF EXISTS "Admins can delete preparations" ON public.coaching_preparations;
CREATE POLICY "Admins can delete preparations"
    ON public.coaching_preparations FOR DELETE
    USING (public.is_admin());

-- 4. Enable Realtime
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.coaching_preparations;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN others THEN null;
END $$;
