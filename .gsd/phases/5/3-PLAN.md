---
phase: 5
plan: 3
wave: 2
---

# Plan 5.3: Collections & Competitor Views

## Objective
Build detailed views for browsing collection runs and comparing performance against competitors.

## Context
- src/api/collections (Data source)
- src/api/metrics/[id] (Comparison data)

## Tasks

<task type="auto">
  <name>Implement Collections List</name>
  <files>src/app/collections/page.tsx, src/components/collections/collection-list.tsx</files>
  <action>
    Create table view of past collections:
    - Columns: Date, Prompt Count, Status, Actions (View)
    - Link to detail view
  </action>
  <verify>Build check</verify>
  <done>Can browse and navigate collections</done>
</task>

<task type="auto">
  <name>Implement Competitor Comparison</name>
  <files>src/components/dashboard/competitor-table.tsx</files>
  <action>
    Create comparison table:
    - User Brand vs Competitor Brands
    - Columns: Brand, ASoV, AIGVR, Sentiment, Authority
    - Highlight winner/user brand
  </action>
  <verify>Build check</verify>
  <done>Comparison table renders correctly</done>
</task>

<task type="auto">
  <name>Collection Detail View</name>
  <files>src/app/collections/[id]/page.tsx</files>
  <action>
    Combine components into detail page:
    - Metrics Summary
    - Competitor Comparison
    - List of raw responses/analysis (optional but helpful)
  </action>
  <verify>Build check</verify>
  <done>Full detail view operational</done>
</task>

## Success Criteria
- [ ] Collection history accessible
- [ ] Competitor benchmarking visible
- [ ] Detailed collection drill-down working
