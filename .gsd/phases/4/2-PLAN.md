---
phase: 4
plan: 2
wave: 1
---

# Plan 4.2: Core Metrics Calculators

## Objective

Create the core metric calculation functions: ASoV, AIGVR, Authority Score, and Sentiment Score.

## Context

- .gsd/SPEC.md
- .gsd/phases/4/RESEARCH.md
- dashboard/src/types/metrics.ts
- dashboard/src/types/analysis.ts

## Tasks

<task type="auto">
  <name>Create ASoV and AIGVR Calculators</name>
  <files>
    - dashboard/src/lib/metrics/calculators.ts
  </files>
  <action>
    Create calculation functions:
    
    ```typescript
    // Answer Share of Voice
    export function calculateASoV(
      brandMentions: number,
      totalMentions: number
    ): number
    
    // Weighted ASoV (recommendations count more)
    export function calculateWeightedASoV(
      brandRecommendations: number,
      brandMentions: number,
      totalMentions: number
    ): number
    
    // AI-Generated Visibility Rate
    export function calculateAIGVR(
      responsesWithBrand: number,
      totalResponses: number
    ): number
    
    // Authority Score (1-3 based on source types)
    export function calculateAuthorityScore(
      ownedCount: number,
      earnedCount: number,
      externalCount: number
    ): number
    
    // Sentiment Score (-1 to 1)
    export function calculateSentimentScore(
      positive: number,
      neutral: number,
      negative: number
    ): number
    ```
  </action>
  <verify>npx tsc --noEmit dashboard/src/lib/metrics/calculators.ts</verify>
  <done>All calculator functions compile and export</done>
</task>

<task type="auto">
  <name>Create Metrics Aggregator</name>
  <files>
    - dashboard/src/lib/metrics/aggregator.ts
    - dashboard/src/lib/metrics/index.ts
  </files>
  <action>
    Create function that processes analysis results and calculates all metrics:
    
    ```typescript
    export async function calculateCollectionMetrics(
      collectionId: string,
      brandId: string
    ): Promise<BrandMetrics>
    ```
    
    Steps:
    1. Load all analysis results for collection
    2. Count brand mentions and totals
    3. Calculate each metric
    4. Return complete metrics object
  </action>
  <verify>npx tsc --noEmit dashboard/src/lib/metrics/aggregator.ts</verify>
  <done>Aggregator compiles and exports function</done>
</task>

## Success Criteria

- [ ] ASoV calculation is correct (0-100%)
- [ ] AIGVR calculation is correct (0-100%)
- [ ] Authority score is 1-3 range
- [ ] Sentiment score is -1 to 1 range
