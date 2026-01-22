---
phase: 3
plan: 4
wave: 2
---

# Plan 3.4: Analysis Pipeline & API

## Objective

Create the complete analysis pipeline that processes collection responses and stores results. Add API endpoint for triggering analysis.

## Context

- .gsd/SPEC.md
- .gsd/phases/3/RESEARCH.md
- dashboard/src/lib/analysis/
- dashboard/src/lib/collector/

## Tasks

<task type="auto">
  <name>Create Analysis Pipeline</name>
  <files>
    - dashboard/src/lib/analysis/pipeline.ts
  </files>
  <action>
    Create the full pipeline that orchestrates all analysis:
    
    ```typescript
    export interface PipelineConfig {
      collectionId: string;
      brandDomain?: string;
      competitorDomains?: string[];
      concurrency?: number;
    }
    
    export interface PipelineResult {
      analyzed: number;
      failed: number;
      totalMentions: number;
    }
    
    export async function runAnalysisPipeline(
      config: PipelineConfig
    ): Promise<PipelineResult>
    ```
    
    Pipeline steps:
    1. Load all responses for collection
    2. For each response (with rate limiting):
       a. Run brand extraction
       b. Extract citations
       c. Classify sources
       d. Store analysis result
    3. Update collection with analysis status
  </action>
  <verify>npx tsc --noEmit dashboard/src/lib/analysis/pipeline.ts</verify>
  <done>Pipeline compiles and orchestrates all analysis steps</done>
</task>

<task type="auto">
  <name>Create Analysis API Route</name>
  <files>
    - dashboard/src/app/api/analysis/route.ts
    - dashboard/src/app/api/analysis/[id]/route.ts
  </files>
  <action>
    Create API routes for analysis:
    
    **POST /api/analysis**
    - Trigger analysis for a collection
    - Body: { collectionId, brandDomain?, competitorDomains? }
    - Returns: { success, result }
    
    **GET /api/analysis?collectionId=xxx**
    - Get analysis results for a collection
    
    **GET /api/analysis/[id]**
    - Get single analysis result with full details
  </action>
  <verify>curl http://localhost:3000/api/analysis -X GET</verify>
  <done>API routes work and return correct data</done>
</task>

## Success Criteria

- [ ] Pipeline processes all responses in a collection
- [ ] Analysis results stored in database
- [ ] API endpoint triggers and returns analysis
