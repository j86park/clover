---
phase: 17
plan: 4
wave: 1
depends_on: []
files_modified:
  - src/lib/metrics/model-breakdown.ts
  - src/app/api/metrics/by-model/route.ts
  - src/components/analysis/model-radar-chart.tsx
  - src/components/analysis/model-heatmap.tsx
  - src/app/analysis/page.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Users can see how each LLM perceives their brand differently"
    - "Radar chart shows ASoV per model"
    - "Heatmap shows sentiment differences across models"
  artifacts:
    - "model-breakdown.ts exports getMetricsByModel"
    - "Radar and heatmap charts render on analysis page"
---

# Plan 17.4: Model-by-Model Breakdown

<objective>
Show users how each LLM (GPT-4, Claude, Gemini) perceives their brand differently, since LLMs have different training data and one might favor competitors.

Purpose: Different LLMs = different visibility. Users can prioritize optimization for specific models.
Output: Radar chart showing ASoV per model, heatmap of sentiment per model on analysis page.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- src/lib/metrics/calculator.ts (existing metrics patterns)
- src/lib/openrouter/models.ts (model definitions)
- src/components/dashboard/charts.tsx (existing chart patterns)
</context>

<tasks>

<task type="auto">
  <name>Create model breakdown calculator</name>
  <files>
    src/lib/metrics/model-breakdown.ts
    src/types/index.ts
  </files>
  <action>
    Create `model-breakdown.ts` with:
    - `ModelMetrics` interface: { model: string, displayName: string, asov: number, aigvr: number, sentiment: number, mentionCount: number, responseCount: number }
    - `getMetricsByModel(brandId: string, collectionId?: string)`: 
      - Query responses grouped by model field
      - Calculate ASoV, AIGVR, sentiment per model
      - Return array of ModelMetrics
    - `SUPPORTED_MODELS` constant mapping model IDs to display names
    
    Handle case where some models have no data yet.
    
    AVOID: N+1 queries — use single aggregated query.
  </action>
  <verify>npx tsc --noEmit passes</verify>
  <done>getMetricsByModel returns per-model metrics correctly</done>
</task>

<task type="auto">
  <name>Build model breakdown API</name>
  <files>
    src/app/api/metrics/by-model/route.ts
  </files>
  <action>
    Create GET endpoint:
    1. Authenticate user
    2. Get user's brand_id
    3. Optional query param: collectionId (for specific collection)
    4. Call getMetricsByModel(brandId, collectionId)
    5. Return: { models: ModelMetrics[], summary: { bestModel, worstModel } }
    
    Cache results for 5 minutes to avoid repeated calculations.
  </action>
  <verify>npm run build passes</verify>
  <done>API returns model breakdown data</done>
</task>

<task type="auto">
  <name>Create visualization components</name>
  <files>
    src/components/analysis/model-radar-chart.tsx
    src/components/analysis/model-heatmap.tsx
    src/app/analysis/page.tsx
  </files>
  <action>
    Create `ModelRadarChart`:
    - Use Recharts RadarChart
    - Axes: ASoV, AIGVR, Sentiment (normalized 0-100)
    - One line per model with distinct colors
    - Legend showing model names
    - Tooltip with exact values
    
    Create `ModelHeatmap`:
    - Grid: rows = models, columns = metrics
    - Color scale: red (low) → yellow → green (high)
    - Cell shows exact value on hover
    - Labels for model names and metric names
    
    Integrate both into /analysis page in a "Model Comparison" section.
    
    AVOID: Cluttered visualization — limit to top 4 models if more exist.
  </action>
  <verify>npm run build passes, charts render on /analysis</verify>
  <done>Radar chart and heatmap visible with model comparison data</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Radar chart shows ASoV differences per model
- [ ] Heatmap shows sentiment variation across models
- [ ] Best/worst model highlighted
- [ ] Empty state handles no data gracefully
</verification>

<success_criteria>
- [ ] Users can compare GPT-4 vs Claude vs Gemini perception
- [ ] Radar chart is readable with 3-4 models
- [ ] Heatmap provides quick visual comparison
- [ ] Build compiles successfully
</success_criteria>
