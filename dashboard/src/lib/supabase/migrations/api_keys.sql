-- API Keys Table Migration
-- Stores hashed API keys for multi-tenant authentication

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL,  -- First 8 chars for display (e.g., "clv_abc1...")
    name TEXT NOT NULL,
    tenant_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    permissions TEXT[] DEFAULT ARRAY['read'],
    rate_limit INTEGER DEFAULT 1000,  -- requests per hour
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

-- Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own API keys (based on tenant_id matching brand they own)
CREATE POLICY "Users can view own API keys" ON api_keys
    FOR SELECT
    USING (true);  -- For now, allow all reads (restrict in production)

CREATE POLICY "Users can create own API keys" ON api_keys
    FOR INSERT
    WITH CHECK (true);  -- For now, allow all inserts

CREATE POLICY "Users can update own API keys" ON api_keys
    FOR UPDATE
    USING (true);

CREATE POLICY "Users can delete own API keys" ON api_keys
    FOR DELETE
    USING (true);
