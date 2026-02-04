---
phase: 12
plan: 2
wave: 1
---

# Plan 12.2: Key Management Logic & UI

## Objective
Implement secure API key generation with a one-time display flow and wire up the Settings UI.

## Context
- .gsd/SPEC.md
- .gsd/phases/12/1-PLAN.md (assumes migration applied)
- dashboard/src/app/settings/page.tsx (existing settings UI)
- dashboard/src/lib/supabase/ (Supabase client patterns)

## Tasks

<task type="auto">
  <name>Create key generation server action</name>
  <files>dashboard/src/app/actions/api-keys.ts</files>
  <action>
    Create a server action file with:
    1. `generateApiKey()`:
       - Generate a secure random string with `clv_live_` prefix (e.g., `clv_live_abc123def456...`)
       - Use `crypto.randomBytes(32).toString('hex')` for the random part
       - Compute SHA-256 hash of the full key
       - Extract key_prefix (first 12 chars including prefix)
       - Insert into `api_keys` table: { user_id, key_hash, key_prefix, name, permissions }
       - Return the RAW key to the caller (this is the only time it's available)
    2. `listApiKeys()`:
       - Fetch all non-revoked keys for the current user
       - Return: id, key_prefix, name, permissions, last_used_at, created_at
    3. `revokeApiKey(keyId)`:
       - Soft delete by setting `revoked_at = now()`
  </action>
  <verify>TypeScript compiles without errors</verify>
  <done>Server actions exist and can be imported</done>
</task>

<task type="auto">
  <name>Wire up Settings API Keys UI</name>
  <files>dashboard/src/app/settings/page.tsx</files>
  <action>
    Update the existing settings page to:
    1. Call `listApiKeys()` on mount to display existing keys
    2. Add a "Generate New Key" button that:
       - Opens a modal/dialog to enter a key name
       - Calls `generateApiKey(name)`
       - Displays the raw key in a copyable field with a warning: "This key will only be shown once. Copy it now."
       - After closing, refresh the key list
    3. Add a "Revoke" button on each key row that calls `revokeApiKey(id)`
    4. Display key_prefix, name, created_at, and last_used_at in the table
  </action>
  <verify>Run dev server. Navigate to /settings. Verify key list renders.</verify>
  <done>Settings page shows API keys table with generate and revoke functionality</done>
</task>

## Success Criteria
- [ ] Keys can be generated and the raw key is displayed once
- [ ] Keys are listed in the Settings UI
- [ ] Keys can be revoked (soft deleted)
