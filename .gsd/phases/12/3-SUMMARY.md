---
phase: 12
plan: 3
---

# Summary 12.3: API Endpoint & Authentication Middleware

## Completed Tasks

### Task 1: Create API key authentication helper ✅
- Created `dashboard/src/lib/auth/api-key.ts` with:
  - `authenticateApiKey(request)`: Extracts X-API-Key header, hashes with SHA-256, validates against database
  - `hasPermission(keyRecord, permission)`: Checks if key has required permission
  - Uses service role client to bypass RLS for API auth
  - Updates `last_used_at` on successful authentication

### Task 2: Create /api/v1/metrics endpoint ✅
- Created `dashboard/src/app/api/v1/metrics/route.ts` with:
  - API key authentication via X-API-Key header
  - Permission check for `metrics:read`
  - Fetches user's brand and latest metrics from Supabase
  - Returns JSON with: brand name, timestamp, ASoV, AIGVR, sentiment scores, authority breakdown, competitors

### Task 3: Create API test script ✅
- Created `dashboard/scripts/test-api.sh` with:
  - Test 1: No API key (expects 401)
  - Test 2: Invalid API key (expects 401)
  - Instructions for testing with a real key

## Files Created
- `dashboard/src/lib/auth/api-key.ts`
- `dashboard/src/app/api/v1/metrics/route.ts`
- `dashboard/scripts/test-api.sh`

## API Response Format
```json
{
  "brand": "Clover Labs",
  "timestamp": "2026-01-27T15:00:00Z",
  "metrics": {
    "asov": 62.5,
    "aigvr": 72.0,
    "sentiment": { "positive": 45, "neutral": 30, "negative": 25 },
    "authority": { "owned": 2, "earned": 1, "external": 1 }
  },
  "competitors": [{ "name": "Competitor A", "asov": 25.0 }]
}
```
