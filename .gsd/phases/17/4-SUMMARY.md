---
phase: 17
plan: 4
status: complete
completed_at: 2026-02-07T12:55:00-05:00
---

# Plan 17.4 Summary: Model-by-Model Breakdown

## What Was Built

### 1. Model Breakdown Calculator
**File:** `src/lib/metrics/model-breakdown.ts`
- `ModelMetrics` interface with per-model ASoV, AIGVR, sentiment
- `getMetricsByModel(brandId, collectionId?)` aggregates responses by LLM model
- Maps model IDs to display names via `AVAILABLE_MODELS`
- Returns `ModelBreakdownSummary` with best/worst model identification

### 2. API Endpoint
**File:** `src/app/api/metrics/by-model/route.ts`
- `GET /api/metrics/by-model?collectionId=...`
- 5-minute in-memory cache to avoid repeated calculations
- Returns `{ models: ModelMetrics[], summary: { bestModel, worstModel, totalModels } }`

### 3. Visualization Components
**Files:**
- `src/components/analysis/model-radar-chart.tsx` — Recharts radar with ASoV, AIGVR, Sentiment axes
- `src/components/analysis/model-heatmap.tsx` — Color-coded grid with heat colors per metric
- `src/components/analysis/model-breakdown-section.tsx` — Client wrapper that fetches and renders both

### 4. Integration
**File:** `src/app/analysis/page.tsx`
- Added `ModelBreakdownSection` between Prompt Effectiveness and Analysis List

## Verification
- `npx tsc --noEmit` passes with 0 errors
- Components render loading/empty states gracefully
- Limited to top 4 models to prevent visual clutter
