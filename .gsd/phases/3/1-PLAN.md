---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Analysis Types & Database Schema

## Objective

Define TypeScript types for analysis results and extend the database schema to store brand mentions, citations, and sentiment data.

## Context

- .gsd/SPEC.md
- .gsd/phases/3/RESEARCH.md
- dashboard/src/types/index.ts
- dashboard/supabase/migrations/001_initial_schema.sql

## Tasks

<task type="auto">
  <name>Create Analysis Types</name>
  <files>
    - dashboard/src/types/analysis.ts
  </files>
  <action>
    Create TypeScript types for analysis:
    
    ```typescript
    export interface BrandMention {
      brand_name: string;
      context: string;
      is_recommended: boolean;
      sentiment: 'positive' | 'neutral' | 'negative';
      position: number;
    }
    
    export interface Citation {
      url: string;
      domain: string;
      source_type: 'owned' | 'earned' | 'external';
    }
    
    export interface AnalysisResult {
      id: string;
      response_id: string;
      mentions: BrandMention[];
      citations: Citation[];
      summary: string | null;
      analyzed_at: string;
      created_at: string;
    }
    ```
  </action>
  <verify>npx tsc --noEmit dashboard/src/types/analysis.ts</verify>
  <done>Types compile with no errors</done>
</task>

<task type="auto">
  <name>Create Analysis Schema Migration</name>
  <files>
    - dashboard/supabase/migrations/002_analysis_schema.sql
  </files>
  <action>
    Create SQL migration for analysis table:
    
    ```sql
    -- Analysis results storage
    CREATE TABLE analysis (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
      mentions JSONB NOT NULL DEFAULT '[]',
      citations JSONB NOT NULL DEFAULT '[]',
      summary TEXT,
      analyzed_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX idx_analysis_response ON analysis(response_id);
    
    -- Enable RLS
    ALTER TABLE analysis ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow all access to analysis" ON analysis FOR ALL USING (true);
    ```
    
    Also add `category` field to brands table for better prompts.
  </action>
  <verify>File exists with proper SQL syntax</verify>
  <done>SQL file created and ready to run in Supabase</done>
</task>

## Success Criteria

- [ ] Analysis types defined with proper TypeScript structure
- [ ] Migration SQL ready for Supabase
