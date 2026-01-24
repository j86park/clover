# Phase 4: Metrics Calculation — Summary

**Status**: ✅ Complete  
**Completed**: 2026-01-21

## What Was Built

### Core Metrics Types & Schema
- `src/types/metrics.ts` — TypeScript interfaces for BrandMetrics, CollectionMetrics, trends
- `supabase/migrations/003_metrics_schema.sql` — Metrics table with indexes and RLS

### Calculation Engine
- `src/lib/metrics/calculators.ts` — Pure calculation functions:
  - `calculateASoV()` — Answer Share of Voice (0-100%)
  - `calculateWeightedASoV()` — Recommendations weighted 2x
  - `calculateAIGVR()` — AI-Generated Visibility Rate (0-100%)
  - `calculateAuthorityScore()` — Source authority (1-3)
  - `calculateSentimentScore()` — Average sentiment (-1 to 1)
  - `calculateRecommendationRate()` — % of mentions with recommendations

- `src/lib/metrics/aggregator.ts` — Aggregates analysis data by brand
- `src/lib/metrics/pipeline.ts` — Orchestrates metrics calculation workflow

### API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/metrics` | GET | List metrics (optional collection filter) |
| `/api/metrics` | POST | Calculate metrics for a collection |
| `/api/metrics/[id]` | GET | Detailed metrics with competitive rankings |

## API Usage

**Calculate Metrics:**
```bash
curl -X POST http://localhost:3000/api/metrics \
  -H "Content-Type: application/json" \
  -d '{"collection_id": "uuid-here"}'
```

**Get Collection Metrics:**
```bash
curl http://localhost:3000/api/metrics/[collection-id]
```

## Key Design Decisions

1. **Pure calculators** — No dependencies, easy to test
2. **Weighted ASoV** — Recommendations count 2x for brand importance
3. **Competitive rankings** — Automatic ranking across all tracked brands
4. **Aggregation by brand name** — Matches brands across responses by name

## Verification
- ✅ Build passes (`npm run build`)
- ✅ All TypeScript types correct
- ✅ API routes created

## Next Steps
1. User must run `003_metrics_schema.sql` in Supabase
2. Phase 5: Visualization Dashboard
