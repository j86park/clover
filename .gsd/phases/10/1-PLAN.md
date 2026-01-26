---
phase: 10
plan: 1
wave: 1
---

# Plan 10.1: Bug Squashing - Citation Modal & Analysis Page

## Objective
Restore the broken `/analysis` route and fix the non-responsive citation drill-down modal to ensure dashboard parity and data transparency.

## Context
- .gsd/SPEC.md
- src/app/page.tsx
- src/components/charts/authority-heatmap.tsx
- src/components/dashboard/dashboard-client.tsx
- src/components/dashboard/citation-modal.tsx

## Tasks

<task type="auto">
  <name>Fix Citation Modal Event Interception</name>
  <files>
    - src/components/charts/authority-heatmap.tsx
    - src/components/dashboard/dashboard-client.tsx
  </files>
  <action>
    - Move `onClick` handler from `BarChart` to `Bar` with captured data.
    - Add `pointer-events-none` to the `Tooltip` component to ensure it doesn't block clicks.
    - Add fallback `window.alert` logs (removed before PR) to confirm event firing in user's browser.
    - Wrap the `Bar` component in a way that ensures accessibility and clickability.
  </action>
  <verify>Clicking a bar in the Authority Breakdown chart triggers a console log and modal.</verify>
  <done>Modal opens correctly 100% of the time on bar click.</done>
</task>

<task type="auto">
  <name>Restore Analysis Page Route</name>
  <files>
    - src/app/analysis/page.tsx [NEW]
    - src/components/dashboard/analysis-list.tsx [NEW]
  </files>
  <action>
    - Create `src/app/analysis/page.tsx` as a server component.
    - Fetch the latest analysis records from Supabase (joined with responses).
    - Create a basic list/grid view component to display analysis results (mentions, sentiment, citation counts).
    - Ensure the "Analysis" link in the sidebar correctly renders this page.
  </action>
  <verify>Navigating to /analysis shows a list of analyzed records instead of a 404.</verify>
  <done>Analysis page is operational and displays real data.</done>
</task>

## Success Criteria
- [ ] Citation modal reliably pops up when clicking chart bars.
- [ ] /analysis route is no longer a 404 and displays content.
- [ ] No regression in dashboard data loading.
