---
phase: 11
plan: 3
wave: 1
---

# Plan 11.3: Data Isolation & Profile Resolution

## Objective
Update the application logic to fetch data exclusively for the authenticated user's brand.

## Context
- dashboard/src/app/(dashboard)/page.tsx
- dashboard/src/lib/metrics/pipeline.ts

## Tasks

<task type="auto">
  <name>Filter Dashboard & Metrics by UserID</name>
  <files>
    - c:\Users\Joonh\clover\clover\dashboard\src\app\(dashboard)\page.tsx
    - c:\Users\Joonh\clover\clover\dashboard\src\app\collections\page.tsx
    - c:\Users\Joonh\clover\clover\dashboard\src\lib\metrics\pipeline.ts
  </files>
  <action>
    1. Update the `Dashboard` and `Collections` pages to first retrieve the authenticated user's `brand_id`.
    2. Ensure all Supabase queries include a filter for the specific `brand_id`.
    3. Update the `runMetricsPipeline` and `getCollectionMetrics` functions to validate brand ownership before processing.
  </action>
  <verify>Log in as User A and confirm they cannot see metrics or collections belonging to User B's brand (manual test with two accounts).</verify>
  <done>Data isolation is enforced at the application layer, complementing the database RLS.</done>
</task>

<task type="auto">
  <name>Profile & Logout UI Polish</name>
  <files>
    - c:\Users\Joonh\clover\clover\dashboard\src\components\layout\sidebar.tsx
    - c:\Users\Joonh\clover\clover\dashboard\src\app\settings\page.tsx
  </files>
  <action>
    1. Add a user profile section to the sidebar showing the logged-in email and the associated brand name.
    2. Implement a "Logout" button that clears the Supabase session and redirects to `/login`.
  </action>
  <verify>Click logout and confirm you are redirected and can no longer access /dashboard.</verify>
  <done>The authentication lifecycle is fully integrated into the UI.</done>
</task>

## Success Criteria
- [ ] Multi-tenancy is verified via manual testing.
- [ ] User profile and logout are functional in the UI.
- [ ] All data fetching adheres to the brand ownership model.
