-- Migration: 014_api_usage.sql
-- Purpose: Track API usage for logging and statistics

-- Drop existing table to ensure schema matches requirements
DROP TABLE IF EXISTS public.api_usage CASCADE;

CREATE TABLE public.api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    status INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for filtering by user and date
CREATE INDEX idx_api_usage_user_date ON public.api_usage(user_id, created_at);

-- Index for filtering by key
CREATE INDEX idx_api_usage_key ON public.api_usage(key_id);

-- Enable RLS
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own usage data
CREATE POLICY "Users can view their own API usage"
ON public.api_usage
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Note: We don't need an INSERT policy for the API itself because 
-- we use the service_role key to log usage during authentication
-- which bypasses RLS.
