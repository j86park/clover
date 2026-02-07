-- Migration: 016_alerts
-- Purpose: Create tables for email alert configuration and logging
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- ALERTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email')),
    destination TEXT NOT NULL, -- email address
    triggers JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_triggered_at TIMESTAMPTZ
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_brand_id ON alerts(brand_id);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active) WHERE is_active = true;

-- RLS: Users can only manage their own alerts
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts"
    ON alerts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts"
    ON alerts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
    ON alerts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
    ON alerts FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- ALERT_LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS alert_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_config_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
    error_message TEXT
);

-- Index for querying logs by alert config
CREATE INDEX IF NOT EXISTS idx_alert_logs_config_id ON alert_logs(alert_config_id);
CREATE INDEX IF NOT EXISTS idx_alert_logs_sent_at ON alert_logs(sent_at DESC);

-- RLS: Users can view logs for their own alerts
ALTER TABLE alert_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alert logs"
    ON alert_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM alerts
            WHERE alerts.id = alert_logs.alert_config_id
            AND alerts.user_id = auth.uid()
        )
    );

-- Service role can insert logs (from background jobs)
CREATE POLICY "Service can insert alert logs"
    ON alert_logs FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT ALL ON alerts TO authenticated;
GRANT ALL ON alert_logs TO authenticated;
