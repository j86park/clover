-- API Usage Tracking Table Migration
-- Records all API calls for analytics and rate limiting

CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_api_usage_key ON api_usage(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_date ON api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_key_date ON api_usage(api_key_id, created_at);

-- Row Level Security
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Allow reads for analytics
CREATE POLICY "Allow read access to usage" ON api_usage
    FOR SELECT
    USING (true);

-- Policy: Allow inserts for tracking
CREATE POLICY "Allow insert for tracking" ON api_usage
    FOR INSERT
    WITH CHECK (true);
