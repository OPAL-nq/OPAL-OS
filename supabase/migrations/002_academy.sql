-- =======================================================
-- OPAL OS — Phase 2 Migration : Academy (Modules, Lessons, Resources, Progress)
-- =======================================================

-- 1. Helper Function: Check if user is Admin (Security Definer to prevent RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Modules Table
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Lessons Table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    video_url TEXT NOT NULL DEFAULT '',
    video_provider TEXT NOT NULL DEFAULT 'youtube',
    duration TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Lesson Resources Table (External URLs: PDF, Notion, Drive, etc.)
CREATE TABLE IF NOT EXISTS public.lesson_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Lien',
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Lesson Progress Table (Tracking simple completed: true/false)
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_lesson_progress UNIQUE(user_id, lesson_id)
);

-- 6. Enable RLS
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies: Modules
DROP POLICY IF EXISTS "Anyone authenticated can view published modules or admins all" ON public.modules;
CREATE POLICY "Anyone authenticated can view published modules or admins all"
    ON public.modules
    FOR SELECT
    USING (published = true OR is_admin());

DROP POLICY IF EXISTS "Admins can insert modules" ON public.modules;
CREATE POLICY "Admins can insert modules"
    ON public.modules
    FOR INSERT
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update modules" ON public.modules;
CREATE POLICY "Admins can update modules"
    ON public.modules
    FOR UPDATE
    USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete modules" ON public.modules;
CREATE POLICY "Admins can delete modules"
    ON public.modules
    FOR DELETE
    USING (is_admin());

-- 8. RLS Policies: Lessons
DROP POLICY IF EXISTS "Anyone authenticated can view published lessons or admins all" ON public.lessons;
CREATE POLICY "Anyone authenticated can view published lessons or admins all"
    ON public.lessons
    FOR SELECT
    USING (published = true OR is_admin());

DROP POLICY IF EXISTS "Admins can insert lessons" ON public.lessons;
CREATE POLICY "Admins can insert lessons"
    ON public.lessons
    FOR INSERT
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update lessons" ON public.lessons;
CREATE POLICY "Admins can update lessons"
    ON public.lessons
    FOR UPDATE
    USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete lessons" ON public.lessons;
CREATE POLICY "Admins can delete lessons"
    ON public.lessons
    FOR DELETE
    USING (is_admin());

-- 9. RLS Policies: Lesson Resources
DROP POLICY IF EXISTS "Anyone authenticated can view resources of visible lessons" ON public.lesson_resources;
CREATE POLICY "Anyone authenticated can view resources of visible lessons"
    ON public.lesson_resources
    FOR SELECT
    USING (
        is_admin() OR EXISTS (
            SELECT 1 FROM public.lessons
            WHERE id = lesson_id AND (published = true OR is_admin())
        )
    );

DROP POLICY IF EXISTS "Admins can insert resources" ON public.lesson_resources;
CREATE POLICY "Admins can insert resources"
    ON public.lesson_resources
    FOR INSERT
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update resources" ON public.lesson_resources;
CREATE POLICY "Admins can update resources"
    ON public.lesson_resources
    FOR UPDATE
    USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete resources" ON public.lesson_resources;
CREATE POLICY "Admins can delete resources"
    ON public.lesson_resources
    FOR DELETE
    USING (is_admin());

-- 10. RLS Policies: Lesson Progress
DROP POLICY IF EXISTS "Users can view own progress" ON public.lesson_progress;
CREATE POLICY "Users can view own progress"
    ON public.lesson_progress
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON public.lesson_progress;
CREATE POLICY "Users can insert own progress"
    ON public.lesson_progress
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON public.lesson_progress;
CREATE POLICY "Users can update own progress"
    ON public.lesson_progress
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own progress" ON public.lesson_progress;
CREATE POLICY "Users can delete own progress"
    ON public.lesson_progress
    FOR DELETE
    USING (auth.uid() = user_id);

-- 11. Triggers for updated_at
DROP TRIGGER IF EXISTS handle_modules_updated_at ON public.modules;
CREATE TRIGGER handle_modules_updated_at
    BEFORE UPDATE ON public.modules
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS handle_lessons_updated_at ON public.lessons;
CREATE TRIGGER handle_lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
