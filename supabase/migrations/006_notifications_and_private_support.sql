-- ======================================================================
-- OPAL OS — Migration 006 : In-App Notifications & Private Support Channel RLS
-- ======================================================================

-- 1. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    type TEXT NOT NULL DEFAULT 'announcement' CHECK (type IN ('announcement', 'support', 'live', 'system')),
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications (user_id, read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins and system can insert notifications" ON public.notifications;
CREATE POLICY "Admins and system can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

-- Realtime for notifications
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN others THEN null;
END $$;

-- 2. PRIVATE SUPPORT RLS ON COMMUNITY_MESSAGES
-- In 'support' channel, non-admins can ONLY view their own messages or replies on their own messages.
DROP POLICY IF EXISTS "Members can view messages in accessible channels" ON public.community_messages;
CREATE POLICY "Members can view messages in accessible channels"
    ON public.community_messages FOR SELECT
    USING (
        auth.role() = 'authenticated' AND (
            public.is_admin() OR
            EXISTS (
                SELECT 1 FROM public.community_channels c 
                WHERE c.id = community_messages.channel_id 
                  AND (c.published = true OR public.is_admin())
                  AND (
                      c.slug != 'support' 
                      OR community_messages.user_id = auth.uid()
                      OR (
                          community_messages.parent_message_id IS NOT NULL AND
                          EXISTS (
                              SELECT 1 FROM public.community_messages parent 
                              WHERE parent.id = community_messages.parent_message_id 
                                AND parent.user_id = auth.uid()
                          )
                      )
                  )
            )
        )
    );
