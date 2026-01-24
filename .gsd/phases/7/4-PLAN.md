---
phase: 7
plan: 4
wave: 3
---

# Plan 7.4: Test Result Visualization & Reports

## Objective
Build the UI components and automated report generation for displaying test results, correlation analyses, and validation summaries.

## Context
- .gsd/SPEC.md
- dashboard/src/components/ui/ — existing UI components
- dashboard/src/lib/testing/ — testing modules (from Plans 7.1-7.3)
- dashboard/src/app/(dashboard)/ — dashboard routes

## Tasks

<task type="auto">
  <name>Create validation report generator</name>
  <files>
    dashboard/src/lib/testing/reports.ts (NEW)
  </files>
  <action>
    Build automated validation report system:
    
    1. generateValidationReport(data): Main report generator
       - Aggregates all test results
       - Calculates overall health scores
       - Identifies areas of concern
       - Provides recommendations
    
    2. formatReportAsMarkdown(report): Export format
    3. formatReportAsJSON(report): API format
    
    4. Report sections:
       - Executive Summary (pass/fail counts, overall score)
       - Correlation Analysis (if run)
       - A/B Test Results (if run)
       - LLM Judge Scores (if run)
       - Recommendations
    
    5. Export from lib/testing/index.ts
  </action>
  <verify>tsc --noEmit</verify>
  <done>Report generator creates structured validation reports</done>
</task>

<task type="auto">
  <name>Create testing dashboard page</name>
  <files>
    dashboard/src/app/(dashboard)/testing/page.tsx (NEW)
    dashboard/src/app/(dashboard)/testing/layout.tsx (NEW)
  </files>
  <action>
    Build the testing dashboard UI:
    
    1. Testing overview page:
       - Summary cards (total tests, pass rate, last run)
       - Quick actions (run correlation, create A/B test)
       - Recent test results list
    
    2. Use existing UI components (Card, Button, Badge)
    3. Fetch data via API routes
    4. Follow dashboard layout patterns from other pages
    
    Layout: Standard dashboard layout with sidebar
    Style: Match existing Clover-aligned design
  </action>
  <verify>npm run build && npm run dev (visual check)</verify>
  <done>Testing dashboard page renders with proper layout</done>
</task>

<task type="checkpoint:human-verify">
  <name>Visual verification of testing dashboard</name>
  <files>dashboard/src/app/(dashboard)/testing/page.tsx</files>
  <action>
    Navigate to /testing in browser
    Verify:
    - Page layout matches dashboard style
    - Cards display correctly
    - Actions are clickable
    - Responsive on different screen sizes
  </action>
  <verify>Visual inspection in browser</verify>
  <done>UI is visually consistent and functional</done>
</task>

## Success Criteria
- [ ] Automated validation report generation working
- [ ] Testing dashboard page accessible at /testing
- [ ] UI components match existing dashboard style
- [ ] Reports exportable as Markdown and JSON
