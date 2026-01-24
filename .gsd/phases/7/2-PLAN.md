---
phase: 7
plan: 2
wave: 1
---

# Plan 7.2: Correlation Test Module

## Objective
Build the correlation test module that compares LLM brand mentions against branded search volume to validate the accuracy of the dashboard's metrics.

## Context
- .gsd/SPEC.md
- dashboard/src/lib/metrics/calculators.ts — existing metrics
- dashboard/src/lib/supabase/server.ts — database client
- dashboard/src/types/testing.ts — testing types (from Plan 7.1)

## Tasks

<task type="auto">
  <name>Create correlation calculator</name>
  <files>
    dashboard/src/lib/testing/correlation.ts (NEW)
  </files>
  <action>
    Build statistical correlation functions:
    
    1. calculatePearsonCorrelation(x[], y[]): Returns -1 to 1
    2. calculateSpearmanCorrelation(x[], y[]): Rank-based correlation
    3. calculateSignificance(correlation, sampleSize): P-value
    4. aggregateMentionsByBrand(analysisData): Group mention counts
    
    Include:
    - Input validation (matching array lengths, minimum samples)
    - Error handling for edge cases (zero variance, etc.)
    - Statistical significance thresholds (p < 0.05)
  </action>
  <verify>tsc --noEmit</verify>
  <done>Correlation functions implemented with proper statistical methods</done>
</task>

<task type="auto">
  <name>Create correlation test runner</name>
  <files>
    dashboard/src/lib/testing/correlation-test.ts (NEW)
    dashboard/src/lib/testing/index.ts (UPDATE)
  </files>
  <action>
    Build the test runner that:
    
    1. runCorrelationTest(config): Main entry point
       - config: { brandId, dateRange, searchVolumeData }
       - Fetches mention data from Supabase
       - Computes correlation with provided search data
       - Returns CorrelationTestResult
    
    2. generateCorrelationReport(result): Creates readable report
       - Correlation coefficient interpretation
       - Statistical significance
       - Actionable insights
    
    3. Export from lib/testing/index.ts
    
    Note: User provides search volume data (from Google Trends, etc.)
    We compute correlation against our mention counts
  </action>
  <verify>tsc --noEmit</verify>
  <done>Correlation test runner complete with reporting</done>
</task>

## Success Criteria
- [ ] Pearson and Spearman correlation implemented
- [ ] Statistical significance calculation working
- [ ] Correlation test runner integrates with existing data
- [ ] Report generation provides actionable insights
