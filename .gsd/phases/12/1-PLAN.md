---
phase: 12
plan: 1
wave: 1
---

# Plan 12.1: Database Infrastructure (api_keys table)

## Objective
Create the `api_keys` table with secure storage for hashed API keys, enabling multi-tenant key management.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md (Phase 12)
- dashboard/supabase/migrations/ (existing migration patterns)

## Tasks

<task type="auto">
  <name>Create api_keys migration</name>
  <files>dashboard/supabase/migrations/012_api_keys.sql</files>
  <action>
    Create a new SQL migration file that:
    1. Creates an `api_keys` table with columns:
       - `id` (UUID, primary key, default gen_random_uuid())
       - `user_id` (UUID, references auth.users, NOT NULL)
       - `key_hash` (TEXT, NOT NULL, unique) — SHA-256 hash of the full key
       - `key_prefix` (TEXT, NOT NULL) — First 8 characters for UI display (e.g., "clv_abc1")
       - `name` (TEXT, NOT NULL) — User-defined name like "Production Monitor"
       - `permissions` (TEXT[], default ARRAY['metrics:read']) — Scoped permissions
       - `last_used_at` (TIMESTAMPTZ, nullable) — For security auditing
       - `created_at` (TIMESTAMPTZ, default now())
       - `revoked_at` (TIMESTAMPTZ, nullable) — Soft delete
    2. Enable RLS on the table
    3. Create policies:
       - SELECT: Users can only see their own keys
       - INSERT: Users can only create keys for themselves
       - UPDATE: Users can only update their own keys (for revoking)
    4. Create an index on `key_hash` for fast lookups during API auth
  </action>
  <verify>Run: npx supabase migration list (or check file exists)</verify>
  <done>Migration file exists at dashboard/supabase/migrations/012_api_keys.sql with RLS policies</done>
</task>

<task type="checkpoint:human-verify">
  <name>Apply migration to local Supabase</name>
  <files>N/A</files>
  <action>
    User should apply the migration to their local Supabase instance:
    ```bash
    cd dashboard && npx supabase db reset
    # OR
    cd dashboard && npx supabase migration up
    ```
  </action>
  <verify>Check Supabase Studio for api_keys table</verify>
  <done>api_keys table exists in Supabase with correct columns and RLS enabled</done>
</task>

## Success Criteria
- [ ] `api_keys` table created with all required columns
- [ ] RLS policies enforce user-level isolation
- [ ] Index on `key_hash` for performant lookups
