---
phase: 5
plan: 2
wave: 2
---

# Plan 5.2: Metrics Visualization

## Objective
Implement core visualization components for ASoV, AIGVR, and Sentiment metrics using Recharts.

## Context
- src/types/metrics.ts (Data structures)
- src/api/metrics (Data source)

## Tasks

<task type="auto">
  <name>Create Metric Cards</name>
  <files>src/components/dashboard/metric-card.tsx, src/app/page.tsx</files>
  <action>
    Create `MetricCard` component:
    - Label, Value, Trend (change from previous), Icon
    - Implement dashboard overview page fetching latest collection metrics
    - Display ASoV, AIGVR, Authority, Sentiment cards
  </action>
  <verify>Build check</verify>
  <done>Dashboard homepage shows real metric data</done>
</task>

<task type="auto">
  <name>Implement ASoV Trend Chart</name>
  <files>src/components/charts/asov-trend.tsx, src/components/dashboard/overview.tsx</files>
  <action>
    Create `ASoVTrendChart` using Recharts:
    - AreaChart showing ASoV over time (mock historical data for now if single point)
    - X-Axis: Date
    - Y-Axis: ASoV %
    - Tooltips and responsive container
  </action>
  <verify>Build check</verify>
  <done>Chart component renders without errors</done>
</task>

<task type="auto">
  <name>Implement Authority Heatmap</name>
  <files>src/components/charts/authority-heatmap.tsx</files>
  <action>
    Create visualization for citation authority:
    - BarChart or custom specific visual
    - Breakdown of Owned vs Earned vs External citations
  </action>
  <verify>Build check</verify>
  <done>Authority breakdown visualized</done>
</task>

## Success Criteria
- [ ] Dashboard homepage displays key metrics
- [ ] ASoV trend chart operational
- [ ] Authority breakdown visualized
