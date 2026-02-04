---
phase: 11
plan: 1
wave: 1
---

# Plan 11.1: Database Schema & SSR Infrastructure

## Objective
Establish the database foundation and server-side utilities required for multi-tenant authentication.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md
- dashboard/src/lib/supabase/server.ts
- dashboard/src/lib/supabase/index.ts

## Tasks

<task type="auto">
  <name>Database Migration: User Identity & RLS</name>
  <files>
    - c:\Users\Joonh\clover\clover\dashboard\supabase\migrations\011_auth_identity.sql
  </files>
  <action>
    Create a new migration that:
    1. Adds a `user_id` (UUID) column to the `brands` table, referencing `auth.users(id)`.
    2. Updates RLS policies for `brands`, `competitors`, `collections`, `metrics`, `analysis`, and `responses` to restrict access based on the brand's `user_id`.
    3. Ensures that child tables (collections, etc.) inherit protection via their relationship to the parent `brand_id`.
  </action>
  <verify>Apply the migration via Supabase CLI or SQL Editor and check table schemas.</verify>
  <done>All core tables have RLS enabled and check for `user_id` or link to a brand with a `user_id`.</done>
</task>

<task type="auto">
  <name>Next.js Middleware & Auth Utilities</name>
  <files>
    - c:\Users\Joonh\clover\clover\dashboard\src\middleware.ts
    - c:\Users\Joonh\clover\clover\dashboard\src\lib\supabase\middleware.ts
  </files>
  <action>
    1. Implement `src/lib/supabase/middleware.ts` to handle session refreshing via `createServerClient`.
    2. Implement `src/middleware.ts` at the root of the project to:
       - Refresh the Supabase session on every request.
       - Redirect unauthenticated users from `/dashboard`, `/collections`, `/analysis`, and `/settings` to `/login`.
  </action>
  <verify>Attempt to access /dashboard without a session and confirm redirect to /login.</verify>
  <done>Middleware correctly blocks protected routes and refreshes tokens.</done>
</task>

## Success Criteria
- [ ] Database schema supports `user_id` ownership.
- [ ] RLS is active on all metrics-related tables.
- [ ] Application shell redirects unauthenticated users to `/login`.
