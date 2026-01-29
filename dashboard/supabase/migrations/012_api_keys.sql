-- Migration: 012_api_keys.sql
-- Purpose: Create api_keys table for programmatic API access with secure key storage

-- IMPORTANT: Drop any existing partial table to ensure clean creation
-- This handles cases where a previous migration attempt left a broken table
DROP TABLE IF EXISTS public.api_keys CASCADE;

-- Create the api_keys table with explicit schema
CREATE TABLE public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL,
    name TEXT NOT NULL,
    permissions TEXT[] DEFAULT ARRAY['metrics:read'],
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    revoked_at TIMESTAMPTZ
);

-- Create index on key_hash for fast lookups during API authentication
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);

-- Create index on user_id for listing user's keys
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);

-- Enable Row Level Security
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only SELECT their own keys
CREATE POLICY "Users can view their own API keys"
ON public.api_keys
FOR SELECT
TO authenticated
USING (auth.uid() = public.api_keys.user_id);

-- RLS Policy: Users can only INSERT keys for themselves
CREATE POLICY "Users can create their own API keys"
ON public.api_keys
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = public.api_keys.user_id);

-- RLS Policy: Users can only UPDATE their own keys (for revoking)
CREATE POLICY "Users can update their own API keys"
ON public.api_keys
FOR UPDATE
TO authenticated
USING (auth.uid() = public.api_keys.user_id)
WITH CHECK (auth.uid() = public.api_keys.user_id);

-- RLS Policy: Users can DELETE their own keys (hard delete option)
CREATE POLICY "Users can delete their own API keys"
ON public.api_keys
FOR DELETE
TO authenticated
USING (auth.uid() = public.api_keys.user_id);
