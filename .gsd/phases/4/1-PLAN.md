---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Metrics Schema & Types

## Objective

Define TypeScript types for metrics and extend the database schema to store calculated metrics per collection.

## Context

- .gsd/SPEC.md
- .gsd/phases/4/RESEARCH.md
- dashboard/src/types/

## Tasks

<task type="auto">
  <name>Create Metrics Types</name>
  <files>
    - dashboard/src/types/metrics.ts
  </files>
  <action>
    Create TypeScript types for metrics:
    
    ```typescript
    export interface BrandMetrics {
      brand_id: string;
      brand_name: string;
      asov: number;           // 0-100
      asov_weighted: number;  // 0-100
      aigvr: number;          // 0-100
      authority_score: number; // 1-3
      sentiment_score: number; // -1 to 1
      recommendation_rate: number; // 0-100
      total_mentions: number;
      total_responses: number;
    }
    
    export interface CollectionMetrics {
      collection_id: string;
      brand_metrics: BrandMetrics;
      competitor_metrics: BrandMetrics[];
      created_at: string;
    }
    ```
  </action>
  <verify>npx tsc --noEmit dashboard/src/types/metrics.ts</verify>
  <done>Types compile with no errors</done>
</task>

<task type="auto">
  <name>Create Metrics Schema Migration</name>
  <files>
    - dashboard/supabase/migrations/003_metrics_schema.sql
  </files>
  <action>
    Create SQL migration for metrics table as defined in RESEARCH.md.
    Include indexes and RLS policy.
  </action>
  <verify>File exists with proper SQL syntax</verify>
  <done>SQL file created and ready to run in Supabase</done>
</task>

## Success Criteria

- [ ] Metrics types defined
- [ ] Migration SQL ready
