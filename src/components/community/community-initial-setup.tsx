'use client';

import React, { useState } from 'react';
import { seedDefaultChannels } from '@/app/actions/community';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageSquare, Copy, Check, Terminal } from 'lucide-react';

interface CommunityInitialSetupProps {
  isAdmin: boolean;
}

export function CommunityInitialSetup({ isAdmin }: CommunityInitialSetupProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      await seedDefaultChannels();
      window.location.href = '/community/annonces';
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l’initialisation des salons. Exécutez le script SQL ci-dessous dans Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const sqlCode = `-- 1. PROFILES RLS
DROP POLICY IF EXISTS "Authenticated members can view public profiles" ON public.profiles;
CREATE POLICY "Authenticated members can view public profiles"
    ON public.profiles FOR SELECT
    USING (auth.role() = 'authenticated');

-- 2. LIVES & REPLAYS
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
ALTER TABLE public.lives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view published lives or admins view all" ON public.lives;
CREATE POLICY "Members can view published lives or admins view all" ON public.lives FOR SELECT USING (public.is_admin() OR (auth.role() = 'authenticated' AND published = true));
DROP POLICY IF EXISTS "Admins can manage lives" ON public.lives;
CREATE POLICY "Admins can manage lives" ON public.lives FOR ALL USING (public.is_admin());

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
ALTER TABLE public.live_replays ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view published replays or admins view all" ON public.live_replays;
CREATE POLICY "Members can view published replays or admins view all" ON public.live_replays FOR SELECT USING (public.is_admin() OR (auth.role() = 'authenticated' AND published = true));
DROP POLICY IF EXISTS "Admins can manage live replays" ON public.live_replays;
CREATE POLICY "Admins can manage live replays" ON public.live_replays FOR ALL USING (public.is_admin());

-- 3. COMMUNITY CHANNELS
CREATE TABLE IF NOT EXISTS public.community_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view published channels or admins view all" ON public.community_channels;
CREATE POLICY "Members can view published channels or admins view all" ON public.community_channels FOR SELECT USING (public.is_admin() OR (auth.role() = 'authenticated' AND published = true));
DROP POLICY IF EXISTS "Admins can manage community channels" ON public.community_channels;
CREATE POLICY "Admins can manage community channels" ON public.community_channels FOR ALL USING (public.is_admin());

-- 4. SEED 9 CHANNELS
INSERT INTO public.community_channels (name, slug, description, position, published)
VALUES
    ('📢 Annonces', 'annonces', 'Annonces officielles OPAL. Canal réservé aux administrateurs.', 1, true),
    ('💬 Général', 'general', 'Discussions générales, échanges et actualités entre membres de la communauté.', 2, true),
    ('📊 Trading & Analyses', 'trading', 'Analyses de marché, identification des niveaux clés, scénarios et partages de graphiques.', 3, true),
    ('🧠 Questions & Entraide', 'questions', 'Posez toutes vos questions sur la méthode OPAL, le trading et l''utilisation des outils.', 4, true),
    ('📝 Journal', 'journal', 'Partage de vos trades, débriefings de session, erreurs commises et retours d''expérience.', 5, true),
    ('🏆 Wins & Payouts', 'wins', 'Célébration des réussites, challenges prop firms validés, payouts et paliers franchis.', 6, true),
    ('🔥 Motivation', 'motivation', 'Discipline, psychologie, routines quotidiennes, objectifs et accountability.', 7, true),
    ('🆘 Support', 'support', 'Assistance privée avec l''administrateur. Vos échanges restent strictement confidentiels.', 8, true),
    ('🎥 Replays', 'replays', 'Signalement et accès aux replays importants des sessions de live trading et masterclasses.', 9, true)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    position = EXCLUDED.position,
    published = EXCLUDED.published;

-- 5. COMMUNITY MESSAGES (WITH PRIVATE SUPPORT RLS)
CREATE TABLE IF NOT EXISTS public.community_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES public.community_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    parent_message_id UUID REFERENCES public.community_messages(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
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

DROP POLICY IF EXISTS "Members can post messages in accessible channels" ON public.community_messages;
CREATE POLICY "Members can post messages in accessible channels"
    ON public.community_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.community_channels c WHERE c.id = channel_id AND (c.published = true OR public.is_admin()) AND (c.slug != 'annonces' OR public.is_admin())));

DROP POLICY IF EXISTS "Admins can manage all community messages" ON public.community_messages;
CREATE POLICY "Admins can manage all community messages" ON public.community_messages FOR ALL USING (public.is_admin());

-- 6. NOTIFICATIONS TABLE
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
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins and system can insert notifications" ON public.notifications;
CREATE POLICY "Admins and system can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- 7. REALTIME
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages; EXCEPTION WHEN others THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN others THEN null; END $$;

-- 8. STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) VALUES ('community-images', 'community-images', true) ON CONFLICT (id) DO UPDATE SET public = true;
DROP POLICY IF EXISTS "Public can view community images" ON storage.objects;
CREATE POLICY "Public can view community images" ON storage.objects FOR SELECT USING (bucket_id = 'community-images');
DROP POLICY IF EXISTS "Authenticated users can upload community images" ON storage.objects;
CREATE POLICY "Authenticated users can upload community images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'community-images' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can delete own community images or admins all" ON storage.objects;
CREATE POLICY "Users can delete own community images or admins all" ON storage.objects FOR DELETE USING (bucket_id = 'community-images' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin()));`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <Card className="bg-[#141414] border border-[#39FF14]/30 shadow-[0_0_30px_rgba(57,255,20,0.1)] p-6 sm:p-8 space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] mx-auto shadow-lg">
          <MessageSquare className="w-7 h-7" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Initialisation de l'Espace Community
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
            {isAdmin
              ? 'Pour créer les tables PostgreSQL, activer le temps réel, les notifications et charger les 9 salons, exécutez la requête SQL ci-dessous dans votre SQL Editor Supabase.'
              : 'Les salons de discussion sont en cours de configuration par l\'administrateur. Revenez d’ici quelques instants !'}
          </p>
        </div>

        {isAdmin && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-[#39FF14]" />
                Script SQL Phase 4 (Consolidé)
              </span>
              <Button
                size="sm"
                onClick={copySql}
                className="bg-[#39FF14] text-black hover:bg-[#32e012] font-black text-xs h-8 px-3"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? 'Copié dans le presse-papier !' : 'Copier le script SQL'}
              </Button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black p-4 font-mono text-[11px] text-neutral-300 max-h-48 overflow-y-auto text-left scrollbar-thin">
              <pre className="whitespace-pre-wrap">{sqlCode}</pre>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-neutral-400 text-left space-y-1.5">
              <div className="font-bold text-white">Étapes rapides dans Supabase :</div>
              <ol className="list-decimal list-inside space-y-1 text-neutral-400">
                <li>Cliquez sur le bouton vert <strong>« Copier le script SQL »</strong> ci-dessus.</li>
                <li>Ouvrez votre projet Supabase ➔ onglet <strong>SQL Editor</strong> ➔ <strong>New query</strong>.</li>
                <li>Collez le code et cliquez sur <strong>Run</strong>.</li>
                <li>Revenez ici et rechargez la page !</li>
              </ol>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
