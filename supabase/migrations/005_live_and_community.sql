-- ======================================================================
-- OPAL OS — Phase 4 Migration : Live Sessions, Replays & Community Realtime
-- ======================================================================

-- 1. PROFILES RLS (Allow authenticated members to view member profiles for community avatars/names)
DROP POLICY IF EXISTS "Authenticated members can view public profiles" ON public.profiles;
CREATE POLICY "Authenticated members can view public profiles"
    ON public.profiles FOR SELECT
    USING (auth.role() = 'authenticated');

-- 2. LIVES TABLE
CREATE TABLE IF NOT EXISTS public.lives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('live_trading', 'masterclass', 'collective')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    stream_url TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
    published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lives_scheduled ON public.lives (scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_lives_status ON public.lives (status, published);

ALTER TABLE public.lives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view published lives or admins view all" ON public.lives;
CREATE POLICY "Members can view published lives or admins view all"
    ON public.lives FOR SELECT
    USING (public.is_admin() OR (auth.role() = 'authenticated' AND published = true));

DROP POLICY IF EXISTS "Admins can manage lives" ON public.lives;
CREATE POLICY "Admins can manage lives"
    ON public.lives FOR ALL
    USING (public.is_admin());

-- 3. LIVE REPLAYS TABLE
CREATE TABLE IF NOT EXISTS public.live_replays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_id UUID NOT NULL REFERENCES public.lives(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_replays_live_id ON public.live_replays (live_id);
CREATE INDEX IF NOT EXISTS idx_live_replays_created ON public.live_replays (created_at DESC);

ALTER TABLE public.live_replays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view published replays or admins view all" ON public.live_replays;
CREATE POLICY "Members can view published replays or admins view all"
    ON public.live_replays FOR SELECT
    USING (public.is_admin() OR (auth.role() = 'authenticated' AND published = true));

DROP POLICY IF EXISTS "Admins can manage live replays" ON public.live_replays;
CREATE POLICY "Admins can manage live replays"
    ON public.live_replays FOR ALL
    USING (public.is_admin());

-- 4. COMMUNITY CHANNELS TABLE
CREATE TABLE IF NOT EXISTS public.community_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_channels_position ON public.community_channels (position ASC);

ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view published channels or admins view all" ON public.community_channels;
CREATE POLICY "Members can view published channels or admins view all"
    ON public.community_channels FOR SELECT
    USING (public.is_admin() OR (auth.role() = 'authenticated' AND published = true));

DROP POLICY IF EXISTS "Admins can manage community channels" ON public.community_channels;
CREATE POLICY "Admins can manage community channels"
    ON public.community_channels FOR ALL
    USING (public.is_admin());

-- Seed / Update the 9 definitive OPAL Community channels in order (1 -> 9)
INSERT INTO public.community_channels (name, slug, description, position, published)
VALUES
    ('📢 Annonces', 'annonces', 'Annonces officielles OPAL & Coach Maxym. Canal d''informations officielles réservé à l''équipe.', 1, true),
    ('💬 Général', 'general', 'Discussions générales, échanges et actualités entre membres de la communauté.', 2, true),
    ('📊 Trading & Analyses', 'trading', 'Analyses de marché, identification des niveaux clés, scénarios et partages de graphiques.', 3, true),
    ('🧠 Questions & Entraide', 'questions', 'Posez toutes vos questions sur la méthode OPAL, le trading et l''utilisation des outils.', 4, true),
    ('📝 Journal', 'journal', 'Partage de vos trades, débriefings de session, erreurs commises et retours d''expérience.', 5, true),
    ('🏆 Wins & Payouts', 'wins', 'Célébration des réussites, challenges prop firms validés, payouts et paliers franchis.', 6, true),
    ('🔥 Motivation', 'motivation', 'Discipline, psychologie, routines quotidiennes, objectifs et accountability.', 7, true),
    ('🆘 Support', 'support', 'Assistance technique, questions d''accès et support relatif à la plateforme OPAL OS.', 8, true),
    ('🎥 Replays', 'replays', 'Signalement et accès aux replays importants des sessions de live trading et masterclasses.', 9, true)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    position = EXCLUDED.position,
    published = EXCLUDED.published;

-- Clean up any obsolete channels if present
DELETE FROM public.community_channels 
WHERE slug NOT IN ('annonces', 'general', 'trading', 'questions', 'journal', 'wins', 'motivation', 'support', 'replays');

-- 5. COMMUNITY MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.community_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES public.community_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    parent_message_id UUID REFERENCES public.community_messages(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_messages_channel ON public.community_messages (channel_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_community_messages_parent ON public.community_messages (parent_message_id);

ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

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

-- STRICT POLICY: Members can ONLY post in accessible channels AND cannot post in 'annonces' (Admin only)
DROP POLICY IF EXISTS "Members can post messages in accessible channels" ON public.community_messages;
CREATE POLICY "Members can post messages in accessible channels"
    ON public.community_messages FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND 
        EXISTS (
            SELECT 1 FROM public.community_channels c 
            WHERE c.id = channel_id 
              AND (c.published = true OR public.is_admin())
              AND (c.slug != 'annonces' OR public.is_admin())
        )
    );

-- Admins have full access for moderation
DROP POLICY IF EXISTS "Admins can manage all community messages" ON public.community_messages;
CREATE POLICY "Admins can manage all community messages"
    ON public.community_messages FOR ALL
    USING (public.is_admin());

-- 6. ENABLE REALTIME ON COMMUNITY MESSAGES
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN others THEN null;
END $$;

-- 7. COMMUNITY IMAGES STORAGE BUCKET & POLICIES
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-images', 'community-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view community images" ON storage.objects;
CREATE POLICY "Public can view community images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'community-images');

DROP POLICY IF EXISTS "Authenticated users can upload community images" ON storage.objects;
CREATE POLICY "Authenticated users can upload community images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'community-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own community images or admins all" ON storage.objects;
CREATE POLICY "Users can delete own community images or admins all"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'community-images' AND 
        (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
    );

-- 8. NOTIFICATIONS TABLE
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

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN others THEN null;
END $$;
