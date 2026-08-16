-- ======================================================================
-- OPAL OS — Migration 007 : OPAL Intensive & 1-on-1 Coaching Architecture
-- ======================================================================

-- 1. COACHING SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.coaching_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'private' CHECK (type IN ('private', 'group')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coaching_sessions_client_scheduled ON public.coaching_sessions (client_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_status ON public.coaching_sessions (status);

-- 2. COACHING REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.coaching_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.coaching_sessions(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    key_points TEXT,
    work_assigned TEXT,
    next_steps TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coaching_reports_session ON public.coaching_reports (session_id);
CREATE INDEX IF NOT EXISTS idx_coaching_reports_client ON public.coaching_reports (client_id, created_at DESC);

-- 3. INTENSIVE OBJECTIVES TABLE
CREATE TABLE IF NOT EXISTS public.intensive_objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intensive_objectives_user_pos ON public.intensive_objectives (user_id, position ASC);

-- 4. INTENSIVE FOLLOW UPS TABLE (Single row per client)
CREATE TABLE IF NOT EXISTS public.intensive_follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_objective TEXT,
    points_worked TEXT,
    errors_to_fix TEXT,
    progression TEXT,
    next_step TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intensive_follow_ups_user ON public.intensive_follow_ups (user_id);

-- 5. UPDATE NOTIFICATIONS CHECK CONSTRAINT FOR INTENSIVE ALERTS
DO $$ BEGIN
    ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
    ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('announcement', 'support', 'live', 'system', 'intensive'));
EXCEPTION
    WHEN others THEN null;
END $$;

-- 6. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intensive_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intensive_follow_ups ENABLE ROW LEVEL SECURITY;

-- 6.1 Coaching Sessions RLS
DROP POLICY IF EXISTS "Intensive clients can view their own sessions or admins all" ON public.coaching_sessions;
CREATE POLICY "Intensive clients can view their own sessions or admins all"
    ON public.coaching_sessions FOR SELECT
    USING (
        public.is_admin() OR (
            auth.uid() = client_id AND EXISTS (
                SELECT 1 FROM public.profiles WHERE id = auth.uid() AND plan = 'intensive'
            )
        )
    );

DROP POLICY IF EXISTS "Admins can insert coaching sessions" ON public.coaching_sessions;
CREATE POLICY "Admins can insert coaching sessions"
    ON public.coaching_sessions FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update coaching sessions" ON public.coaching_sessions;
CREATE POLICY "Admins can update coaching sessions"
    ON public.coaching_sessions FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete coaching sessions" ON public.coaching_sessions;
CREATE POLICY "Admins can delete coaching sessions"
    ON public.coaching_sessions FOR DELETE
    USING (public.is_admin());

-- 6.2 Coaching Reports RLS
DROP POLICY IF EXISTS "Intensive clients can view their own reports or admins all" ON public.coaching_reports;
CREATE POLICY "Intensive clients can view their own reports or admins all"
    ON public.coaching_reports FOR SELECT
    USING (
        public.is_admin() OR (
            auth.uid() = client_id AND EXISTS (
                SELECT 1 FROM public.profiles WHERE id = auth.uid() AND plan = 'intensive'
            )
        )
    );

DROP POLICY IF EXISTS "Admins can insert coaching reports" ON public.coaching_reports;
CREATE POLICY "Admins can insert coaching reports"
    ON public.coaching_reports FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update coaching reports" ON public.coaching_reports;
CREATE POLICY "Admins can update coaching reports"
    ON public.coaching_reports FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete coaching reports" ON public.coaching_reports;
CREATE POLICY "Admins can delete coaching reports"
    ON public.coaching_reports FOR DELETE
    USING (public.is_admin());

-- 6.3 Intensive Objectives RLS
DROP POLICY IF EXISTS "Intensive clients can view their own objectives or admins all" ON public.intensive_objectives;
CREATE POLICY "Intensive clients can view their own objectives or admins all"
    ON public.intensive_objectives FOR SELECT
    USING (
        public.is_admin() OR (
            auth.uid() = user_id AND EXISTS (
                SELECT 1 FROM public.profiles WHERE id = auth.uid() AND plan = 'intensive'
            )
        )
    );

DROP POLICY IF EXISTS "Admins can insert intensive objectives" ON public.intensive_objectives;
CREATE POLICY "Admins can insert intensive objectives"
    ON public.intensive_objectives FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update intensive objectives" ON public.intensive_objectives;
CREATE POLICY "Admins can update intensive objectives"
    ON public.intensive_objectives FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete intensive objectives" ON public.intensive_objectives;
CREATE POLICY "Admins can delete intensive objectives"
    ON public.intensive_objectives FOR DELETE
    USING (public.is_admin());

-- 6.4 Intensive Follow Ups RLS
DROP POLICY IF EXISTS "Intensive clients can view their own follow up or admins all" ON public.intensive_follow_ups;
CREATE POLICY "Intensive clients can view their own follow up or admins all"
    ON public.intensive_follow_ups FOR SELECT
    USING (
        public.is_admin() OR (
            auth.uid() = user_id AND EXISTS (
                SELECT 1 FROM public.profiles WHERE id = auth.uid() AND plan = 'intensive'
            )
        )
    );

DROP POLICY IF EXISTS "Admins can insert intensive follow up" ON public.intensive_follow_ups;
CREATE POLICY "Admins can insert intensive follow up"
    ON public.intensive_follow_ups FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update intensive follow up" ON public.intensive_follow_ups;
CREATE POLICY "Admins can update intensive follow up"
    ON public.intensive_follow_ups FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete intensive follow up" ON public.intensive_follow_ups;
CREATE POLICY "Admins can delete intensive follow up"
    ON public.intensive_follow_ups FOR DELETE
    USING (public.is_admin());
