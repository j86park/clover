---
phase: 4
plan: 3
wave: 2
---

# Plan 4.3: Metrics API & Historical Tracking

## Objective

Create API endpoints for metrics retrieval and add historical trend tracking.

## Context

- .gsd/SPEC.md
- .gsd/phases/4/RESEARCH.md
- dashboard/src/lib/metrics/

## Tasks

<task type="auto">
  <name>Create Metrics API Route</name>
  <files>
    - dashboard/src/app/api/metrics/route.ts
    - dashboard/src/app/api/metrics/[brandId]/route.ts
  </files>
  <action>
    Create API routes:
    
    **POST /api/metrics**
    - Calculate and store metrics for a collection
    - Body: { collectionId, brandId }
    - Stores result in metrics table
    
    **GET /api/metrics?brandId=xxx**
    - Get latest metrics for a brand (across all collections)
    
    **GET /api/metrics/[brandId]**
    - Get full metrics history for a brand
    - Returns array ordered by date
  </action>
  <verify>curl http://localhost:3000/api/metrics -X GET</verify>
  <done>API routes work and return metrics data</done>
</task>

<task type="auto">
  <name>Create Competitor Comparison</name>
  <files>
    - dashboard/src/lib/metrics/comparison.ts
  </files>
  <action>
    Create competitor comparison function:
    
    ```typescript
    export interface CompetitorComparison {
      brand: BrandMetrics;
      competitors: BrandMetrics[];
      rankings: {
        asov: number;      // 1 = best
        aigvr: number;
        sentiment: number;
      };
    }
    
    export async function compareWithCompetitors(
      collectionId: string,
      brandId: string
    ): Promise<CompetitorComparison>
    ```
    
    Ranks the tracked brand against all competitors.
  </action>
  <verify>npx tsc --noEmit dashboard/src/lib/metrics/comparison.ts</verify>
  <done>Comparison function compiles and ranks correctly</done>
</task>

## Success Criteria

- [ ] Metrics stored in database per collection
- [ ] Historical metrics retrievable
- [ ] Competitor rankings calculated correctly
