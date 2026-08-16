-- ======================================================================
-- OPAL OS — Phase 3 Update : Storage Bucket, Ticks & Admin RLS access
-- ======================================================================

-- 1. Create Public Storage Bucket for Trade Screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-screenshots', 'trade-screenshots', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Policies: Users can upload and read trade screenshots
DROP POLICY IF EXISTS "Public can view trade screenshots" ON storage.objects;
CREATE POLICY "Public can view trade screenshots"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'trade-screenshots');

DROP POLICY IF EXISTS "Authenticated users can upload trade screenshots" ON storage.objects;
CREATE POLICY "Authenticated users can upload trade screenshots"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'trade-screenshots' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own trade screenshots" ON storage.objects;
CREATE POLICY "Users can delete own trade screenshots"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Add stop_loss_ticks & take_profit_ticks columns to trades (if not existing)
ALTER TABLE public.trades 
    ADD COLUMN IF NOT EXISTS stop_loss_ticks NUMERIC,
    ADD COLUMN IF NOT EXISTS take_profit_ticks NUMERIC;

-- 4. Allow Admin to view all workspace sessions & all trades
DROP POLICY IF EXISTS "Admins can view all workspace sessions" ON public.workspace_sessions;
CREATE POLICY "Admins can view all workspace sessions"
    ON public.workspace_sessions FOR SELECT
    USING (public.is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all trades" ON public.trades;
CREATE POLICY "Admins can view all trades"
    ON public.trades FOR SELECT
    USING (public.is_admin() OR auth.uid() = user_id);
