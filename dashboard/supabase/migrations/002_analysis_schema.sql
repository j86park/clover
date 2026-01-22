-- Analysis results storage
-- Run this in your Supabase SQL editor AFTER 001_initial_schema.sql

CREATE TABLE analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
  mentions JSONB NOT NULL DEFAULT '[]',
  citations JSONB NOT NULL DEFAULT '[]',
  summary TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_analysis_response ON analysis(response_id);

-- Enable Row Level Security
ALTER TABLE analysis ENABLE ROW LEVEL SECURITY;

-- Temporary policy allowing all access (update when auth is added)
CREATE POLICY "Allow all access to analysis" ON analysis FOR ALL USING (true);

-- Optional: Add category field to brands for better prompt context
ALTER TABLE brands ADD COLUMN IF NOT EXISTS category TEXT;
