# Phase 4 Research: Metrics Calculation

> **Discovery Level**: Level 0 — Skip (internal work)
> **Date**: 2026-01-21

## Summary

Phase 4 computes the core metrics that power the dashboard. All metrics are derived from the analysis data created in Phase 3.

---

## Metric Definitions

### 1. Answer Share of Voice (ASoV)
**Definition**: Percentage of times a brand is mentioned across all LLM responses.

```
ASoV = (Brand Mentions / Total Mentions) × 100
```

**Variants**:
- **Raw ASoV**: Simple mention count ratio
- **Weighted ASoV**: Weighted by recommendation status
- **Category ASoV**: Filtered by prompt category (discovery/comparison/review)

---

### 2. AI-Generated Visibility Rate (AIGVR)
**Definition**: Percentage of responses where a brand is mentioned at all.

```
AIGVR = (Responses Mentioning Brand / Total Responses) × 100
```

**Key difference from ASoV**: AIGVR counts presence/absence, ASoV counts frequency.

---

### 3. Source Authority Score
**Definition**: Quality score based on citation sources.

```
Score = (Owned × 3) + (Earned × 2) + (External × 1)
```

**Normalization**: Divide by total citations to get 1-3 scale.

---

### 4. Competitor Comparison
**Definition**: Head-to-head metrics between tracked brand and competitors.

**Metrics**:
- Direct mention comparison rate
- Win rate in comparison prompts
- Sentiment differential

---

### 5. Historical Trends
**Definition**: Metrics over time (per collection).

**Storage**: Aggregate metrics per collection, track changes over time.

---

## Database Schema Addition

```sql
CREATE TABLE metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  asov DECIMAL(5,2),           -- Answer Share of Voice (0-100)
  asov_weighted DECIMAL(5,2),   -- Weighted by recommendations
  aigvr DECIMAL(5,2),           -- AI-Generated Visibility Rate (0-100)
  authority_score DECIMAL(3,2), -- Source authority (1-3)
  sentiment_score DECIMAL(3,2), -- Average sentiment (-1 to 1)
  recommendation_rate DECIMAL(5,2), -- % of mentions that recommend
  total_mentions INTEGER,
  total_responses INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_metrics_collection ON metrics(collection_id);
CREATE INDEX idx_metrics_brand ON metrics(brand_id);
CREATE UNIQUE INDEX idx_metrics_unique ON metrics(collection_id, brand_id);
```

---

## Decisions

✅ **Separate metrics table**: Store computed metrics for fast retrieval
✅ **Per-collection granularity**: Track metrics per collection run
✅ **Unique constraint**: One metrics row per brand per collection
