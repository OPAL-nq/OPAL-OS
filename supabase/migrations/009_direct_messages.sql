-- ======================================================================
-- OPAL OS — Migration 009 : Direct Messages (Member <-> Admin)
-- ======================================================================

-- 1. Create table direct_messages
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for fast queries & conversation ordering
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_id ON public.direct_messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver_id ON public.direct_messages (receiver_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON public.direct_messages (created_at ASC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_read ON public.direct_messages (receiver_id, read);
CREATE INDEX IF NOT EXISTS idx_direct_messages_pair ON public.direct_messages (sender_id, receiver_id, created_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Helper admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- SELECT Policy:
-- Authenticated users can only see messages they sent or received, or admins can see all
DROP POLICY IF EXISTS "Users can read their own direct messages or admins can read all" ON public.direct_messages;
CREATE POLICY "Users can read their own direct messages or admins can read all"
    ON public.direct_messages FOR SELECT
    USING (
        auth.role() = 'authenticated' AND (
            sender_id = auth.uid() 
            OR receiver_id = auth.uid() 
            OR public.is_admin()
        )
    );

-- INSERT Policy:
-- Sender MUST be the authenticated user.
-- IF user is NOT admin, receiver_id MUST be an admin.
-- IF user IS admin, receiver_id can be any member.
DROP POLICY IF EXISTS "Users can insert direct messages to admins or admins to anyone" ON public.direct_messages;
CREATE POLICY "Users can insert direct messages to admins or admins to anyone"
    ON public.direct_messages FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        sender_id = auth.uid() AND (
            public.is_admin() OR
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = receiver_id AND role = 'admin'
            )
        )
    );

-- UPDATE Policy:
-- Only receiver or admin can update (e.g., mark as read)
DROP POLICY IF EXISTS "Receivers or admins can update message read status" ON public.direct_messages;
CREATE POLICY "Receivers or admins can update message read status"
    ON public.direct_messages FOR UPDATE
    USING (
        auth.role() = 'authenticated' AND (
            receiver_id = auth.uid() OR
            public.is_admin()
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' AND (
            receiver_id = auth.uid() OR
            public.is_admin()
        )
    );

-- DELETE Policy:
-- Admins or sender can delete
DROP POLICY IF EXISTS "Admins or sender can delete messages" ON public.direct_messages;
CREATE POLICY "Admins or sender can delete messages"
    ON public.direct_messages FOR DELETE
    USING (
        auth.role() = 'authenticated' AND (
            public.is_admin() OR
            sender_id = auth.uid()
        )
    );

-- 4. Enable Realtime
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN others THEN null;
END $$;
