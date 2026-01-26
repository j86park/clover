---
phase: 9
plan: 1
wave: 1
---

# Plan 9.1: Database Schema Hardening

## Objective
Create persistent storage for audit logs and test execution results to enable production-grade observability and historical tracking.

## Context
- `dashboard/supabase/migrations/`
- `.gsd/phases/9/RESEARCH.md`

## Tasks

<task type="auto">
  <name>Create Migration File</name>
  <files>
    c:/Users/Joonh/clover/clover/dashboard/supabase/migrations/004_robustness.sql
  </files>
  <action>
    Create a new SQL migration file that defines:
    1. `audit_logs` table (id, user_id, action, resource_type, resource_id, details, created_at)
    2. `test_runs` table (id, test_type, configuration, status, results, created_at)
    3. RLS policies for both (viewable by authenticated users, insertable by service role/users)
  </action>
  <verify>
    Check file exists and contains correct SQL syntax (CREATE TABLE, ALTER TABLE ENABLE ROW LEVEL SECURITY).
  </verify>
  <done>
    File created with valid SQL.
  </done>
</task>

<task type="checkpoint:human-verify">
  <name>Apply Migration (Manual)</name>
  <files>
    c:/Users/Joonh/clover/clover/dashboard/supabase/migrations/004_robustness.sql
  </files>
  <action>
    Since you are likely using a managed Supabase instance or local dev:
    - If local: Run `npx supabase migration up` (or `supabase migration up` if installed globally).
    - If production: Push the migration via `supabase link` and `db push` or paste the SQL into the Supabase Dashboard SQL Editor.
  </action>
  <verify>
    Check Supabase dashboard table editor for `audit_logs` table.
  </verify>
  <done>
    Table exists in database.
  </done>
</task>

<task type="auto">
  <name>Update Types</name>
  <files>
    c:/Users/Joonh/clover/clover/dashboard/src/types/index.ts
  </files>
  <action>
    Export TypeScript interfaces for `AuditLog` and `TestRun` matching the new database schema.
  </action>
  <verify>
    cat c:/Users/Joonh/clover/clover/dashboard/src/types/index.ts | grep "export interface AuditLog"
  </verify>
  <done>
    Types exported.
  </done>
</task>

## Success Criteria
- [ ] 004_robustness.sql created
- [ ] TypeScript types updated
