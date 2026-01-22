-- Metrics storage
-- Run this in your Supabase SQL editor AFTER 002_analysis_schema.sql

CREATE TABLE metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  asov DECIMAL(5,2) DEFAULT 0,           -- Answer Share of Voice (0-100)
  asov_weighted DECIMAL(5,2) DEFAULT 0,   -- Weighted by recommendations (0-100)
  aigvr DECIMAL(5,2) DEFAULT 0,           -- AI-Generated Visibility Rate (0-100)
  authority_score DECIMAL(3,2) DEFAULT 1, -- Source authority (1-3)
  sentiment_score DECIMAL(4,3) DEFAULT 0, -- Average sentiment (-1 to 1)
  recommendation_rate DECIMAL(5,2) DEFAULT 0, -- % of mentions that recommend (0-100)
  total_mentions INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_metrics_collection ON metrics(collection_id);
CREATE INDEX idx_metrics_brand ON metrics(brand_id);
CREATE UNIQUE INDEX idx_metrics_unique ON metrics(collection_id, brand_id);

-- Enable Row Level Security
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Temporary policy allowing all access (update when auth is added)
CREATE POLICY "Allow all access to metrics" ON metrics FOR ALL USING (true);
