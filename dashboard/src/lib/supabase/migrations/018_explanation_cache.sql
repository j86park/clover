-- Migration: 018_explanation_cache.sql
-- Creates cache table for brand mention explanations

CREATE TABLE IF NOT EXISTS explanation_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    explanation JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Prevent duplicate explanations for same response/brand
    UNIQUE(response_id, brand_name)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_explanation_cache_lookup 
ON explanation_cache(response_id, brand_name);

-- RLS: Users can only see explanations for their own responses
ALTER TABLE explanation_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own explanations"
ON explanation_cache FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM responses r
        JOIN collections c ON r.collection_id = c.id
        JOIN brands b ON c.brand_id = b.id
        WHERE r.id = explanation_cache.response_id
        AND b.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert own explanations"
ON explanation_cache FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM responses r
        JOIN collections c ON r.collection_id = c.id
        JOIN brands b ON c.brand_id = b.id
        WHERE r.id = explanation_cache.response_id
        AND b.user_id = auth.uid()
    )
);
