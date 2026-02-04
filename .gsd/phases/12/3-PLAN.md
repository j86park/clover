---
phase: 12
plan: 3
wave: 2
---

# Plan 12.3: API Endpoint & Authentication Middleware

## Objective
Create the `/api/v1/metrics` JSON endpoint with API key authentication middleware.

## Context
- .gsd/SPEC.md
- .gsd/phases/12/1-PLAN.md (api_keys table)
- .gsd/phases/12/2-PLAN.md (key generation)
- dashboard/src/app/api/ (existing API patterns)

## Tasks

<task type="auto">
  <name>Create API key authentication helper</name>
  <files>dashboard/src/lib/auth/api-key.ts</files>
  <action>
    Create a helper module that:
    1. `authenticateApiKey(request: Request)`:
       - Extract `X-API-Key` header from the request
       - If missing, throw `{ status: 401, message: 'Missing API key' }`
       - Hash the provided key with SHA-256
       - Query `api_keys` table for matching `key_hash` where `revoked_at IS NULL`
       - If not found, throw `{ status: 401, message: 'Invalid API key' }`
       - Update `last_used_at` to now()
       - Return the key record (id, user_id, permissions)
    2. `hasPermission(keyRecord, requiredPermission)`:
       - Check if `requiredPermission` is in `keyRecord.permissions` array
  </action>
  <verify>TypeScript compiles without errors</verify>
  <done>API key auth helper exists and exports authenticateApiKey</done>
</task>

<task type="auto">
  <name>Create /api/v1/metrics endpoint</name>
  <files>dashboard/src/app/api/v1/metrics/route.ts</files>
  <action>
    Create a Next.js API route that:
    1. Calls `authenticateApiKey(request)` — returns 401 on failure
    2. Checks `hasPermission(keyRecord, 'metrics:read')` — returns 403 if missing
    3. Fetches the user's brand (via user_id from key record)
    4. Fetches the latest collection/metrics for that brand
    5. Returns JSON with:
       ```json
       {
         "brand": "Clover Labs",
         "timestamp": "2026-01-27T15:00:00Z",
         "metrics": {
           "asov": 62.5,
           "aigvr": 72.0,
           "sentiment": {
             "positive": 45,
             "neutral": 30,
             "negative": 25
           }
         },
         "competitors": [
           { "name": "Competitor A", "asov": 25.0 },
           { "name": "Competitor B", "asov": 12.5 }
         ]
       }
       ```
  </action>
  <verify>curl -H "X-API-Key: invalid" http://localhost:3000/api/v1/metrics (expect 401)</verify>
  <done>Endpoint returns 401 for invalid keys and JSON metrics for valid keys</done>
</task>

<task type="auto">
  <name>Create API test script</name>
  <files>dashboard/scripts/test-api.sh</files>
  <action>
    Create a simple bash script that:
    1. Tests with no key (expect 401)
    2. Tests with invalid key (expect 401)
    3. Prints instructions to test with a real key from the Settings UI
  </action>
  <verify>bash dashboard/scripts/test-api.sh runs without error</verify>
  <done>Test script exists and demonstrates API behavior</done>
</task>

## Success Criteria
- [ ] `/api/v1/metrics` returns 401 for missing/invalid keys
- [ ] `/api/v1/metrics` returns JSON metrics for valid keys
- [ ] `last_used_at` updates on successful API call
- [ ] Test script demonstrates expected behavior
