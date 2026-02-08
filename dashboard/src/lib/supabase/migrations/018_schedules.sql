-- 018_schedules.sql
-- Collection schedules for automated daily/weekly runs

-- Create schedules table
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'custom')),
    cron_expression TEXT, -- For custom schedules
    time_utc TEXT NOT NULL DEFAULT '09:00', -- HH:MM format
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- One active schedule per user/brand
    CONSTRAINT unique_active_schedule UNIQUE (user_id, brand_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON public.schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_brand_id ON public.schedules(brand_id);
CREATE INDEX IF NOT EXISTS idx_schedules_next_run ON public.schedules(next_run_at) WHERE is_active = true;

-- RLS policies
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Users can view their own schedules
CREATE POLICY "Users can view own schedules"
    ON public.schedules FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create schedules for their brands
CREATE POLICY "Users can create own schedules"
    ON public.schedules FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own schedules
CREATE POLICY "Users can update own schedules"
    ON public.schedules FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own schedules
CREATE POLICY "Users can delete own schedules"
    ON public.schedules FOR DELETE
    USING (auth.uid() = user_id);

-- Service role can access all schedules (for Inngest cron)
CREATE POLICY "Service role can access all schedules"
    ON public.schedules FOR ALL
    USING (auth.role() = 'service_role');

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER schedules_updated_at
    BEFORE UPDATE ON public.schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_schedules_updated_at();
