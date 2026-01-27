-- Migration: 012_api_keys.sql
-- Purpose: Create api_keys table for programmatic API access with secure key storage

-- Create the api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
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
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);

-- Create index on user_id for listing user's keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

-- Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only SELECT their own keys
CREATE POLICY "Users can view their own API keys"
ON api_keys
FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policy: Users can only INSERT keys for themselves
CREATE POLICY "Users can create their own API keys"
ON api_keys
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only UPDATE their own keys (for revoking)
CREATE POLICY "Users can update their own API keys"
ON api_keys
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can DELETE their own keys (hard delete option)
CREATE POLICY "Users can delete their own API keys"
ON api_keys
FOR DELETE
USING (auth.uid() = user_id);
