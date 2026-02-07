-- Migration: 017_watchlist.sql
-- Creates the competitor watchlist table for independent competitor tracking

CREATE TABLE IF NOT EXISTS watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    competitor_name TEXT NOT NULL,
    competitor_domain TEXT,
    category TEXT,
    last_checked_at TIMESTAMPTZ,
    latest_asov NUMERIC(5,2),
    latest_aigvr NUMERIC(5,2),
    latest_sentiment NUMERIC(4,3),
    trend_direction TEXT CHECK (trend_direction IN ('up', 'down', 'stable')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Unique constraint: one entry per competitor per user
    UNIQUE(user_id, competitor_name)
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);

-- Index for sorting by last checked
CREATE INDEX IF NOT EXISTS idx_watchlist_last_checked ON watchlist(last_checked_at DESC);

-- Enable RLS
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own watchlist entries
CREATE POLICY "Users can view own watchlist" ON watchlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist entries" ON watchlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist entries" ON watchlist
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist entries" ON watchlist
    FOR DELETE USING (auth.uid() = user_id);

-- Service role bypass for API operations
CREATE POLICY "Service role full access" ON watchlist
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
