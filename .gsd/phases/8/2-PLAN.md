---
phase: 8
plan: 2
wave: 1
---

# Plan 8.2: Error Handling & Edge Cases

## Objective
Implement robust error handling across the application to ensure graceful degradation and clear user feedback when things go wrong.

## Context
- dashboard/src/app/layout.tsx
- dashboard/src/app/api/ — API routes
- dashboard/src/lib/ — Utility functions

## Tasks

<task type="auto">
  <name>Create global error boundary</name>
  <files>
    dashboard/src/app/error.tsx (NEW)
    dashboard/src/app/global-error.tsx (NEW)
    dashboard/src/app/not-found.tsx (NEW or UPDATE)
  </files>
  <action>
    1. Create error.tsx for route-level error handling
       - Display user-friendly error message
       - Include "Try Again" button with reset()
       - Log error details to console
    
    2. Create global-error.tsx for root layout errors
       - Minimal styling (inline, no external CSS imports)
       - Hard refresh button
    
    3. Create/update not-found.tsx
       - Friendly 404 page
       - Navigation back to dashboard
  </action>
  <verify>npm run build (no errors)</verify>
  <done>Error pages exist and handle errors gracefully</done>
</task>

<task type="auto">
  <name>Standardize API error responses</name>
  <files>
    dashboard/src/lib/api/errors.ts (NEW)
  </files>
  <action>
    Create a standard error response utility:
    
    1. ApiError class with status, message, code
    2. createErrorResponse(error, status) helper
    3. Use consistent format: { error: { message, code } }
    
    Note: This is a utility file. Existing API routes can
    adopt it over time; not required to update all now.
  </action>
  <verify>tsc --noEmit</verify>
  <done>Error utility created with consistent response format</done>
</task>

## Success Criteria
- [ ] Global error boundary catches and displays errors
- [ ] 404 page exists
- [ ] API error utility created
