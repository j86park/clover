-- Migration: 004_robustness.sql
-- Description: Add audit_logs and test_runs for infrastructure hardening

-- 1. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Test Runs
CREATE TABLE IF NOT EXISTS public.test_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_type TEXT NOT NULL, -- 'correlation', 'ab', 'semantic'
    configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    results JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Security (RLS)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view their own audit logs (if user_id matches)
-- For now, allowing all authenticated users to view for Clover internal dashboard
CREATE POLICY "Allow authenticated users to view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated users can view test runs
CREATE POLICY "Allow authenticated users to view test runs"
ON public.test_runs FOR SELECT
TO authenticated
USING (true);

-- Policy: Server-side (service role) can do anything
-- This is implicit in Supabase for the service role key, but useful for reference.
