-- ======================================================================
-- OPAL OS — Migration 012 : Tilt Radar & Psychology Tags on Trades
-- ======================================================================

-- 1. ADD PSYCHOLOGY AND RIGOR COLUMNS TO TRADES TABLE
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS emotional_state TEXT DEFAULT NULL CHECK (emotional_state IS NULL OR emotional_state IN ('calm', 'fomo', 'revenge', 'fatigued')),
ADD COLUMN IF NOT EXISTS plan_compliance TEXT DEFAULT NULL CHECK (plan_compliance IS NULL OR plan_compliance IN ('full', 'minor_deviation', 'off_plan')),
ADD COLUMN IF NOT EXISTS stop_discipline TEXT DEFAULT NULL CHECK (stop_discipline IS NULL OR stop_discipline IN ('respected', 'moved_early', 'widened_or_removed'));

-- 2. CREATE INDEXES FOR PSYCHOLOGY ANALYTICS
CREATE INDEX IF NOT EXISTS idx_trades_emotional_state ON public.trades (user_id, emotional_state);
CREATE INDEX IF NOT EXISTS idx_trades_plan_compliance ON public.trades (user_id, plan_compliance);
CREATE INDEX IF NOT EXISTS idx_trades_stop_discipline ON public.trades (user_id, stop_discipline);
