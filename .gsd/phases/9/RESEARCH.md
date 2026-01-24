# Research: Phase 9 (Infrastructure Hardening)

## Objective
Transition from MVP fire-and-forget patterns to production-grade reliable systems, specifically addressing Vercel serverless timeout limits (~10-60s) for data collection.

## 1. Job Queue System
**Decision: Inngest**

### Options Analysis
| Feature | BullMQ (Redis) | Inngest (Serverless) |
|---------|----------------|----------------------|
| **Infrastructure** | Requires Redis (Upstash/Self-hosted) | Zero infra (uses HTTP) |
| **Worker Host** | Needs persistent server/container | Runs and scales on Vercel |
| **DevEx** | Complex local setup | Built-in local dev server |
| **Cost** | Redis hosting costs | Free tier (generous) |
| **Timeout Handling**| Manual | Automatic (Steps/Sleep) |

### Why Inngest?
- Designed for Next.js/Vercel serverless environment.
- No need to manage Redis connection pools or worker health.
- "Step" architecture allows breaking large collection jobs into small chunks, completely bypassing the 60s timeout limit.

### Implementation Plan
1. Install `inngest` package.
2. Create `/api/inngest` route handler.
3. Migrating `runCollection` logic to an Inngest function.
4. Calling `inngest.send()` from the API route.

## 2. Persistent Storage
**Decision: Supabase Tables**

We need to persist logs and test results that are currently transient or non-existent.

### New Tables
1. **`audit_logs`**
   - Track key user actions (create collection, update settings).
   - Fields: `id`, `user_id`, `action`, `entity_type`, `entity_id`, `details` (JSONB), `created_at`.

2. **`test_runs`** (for Phase 7 Framework)
   - Store results of correlation tests and A/B tests.
   - Fields: `id`, `test_type` (correlation, ab, semantic), `configuration` (JSONB), `results` (JSONB), `status`, `created_at`.

## 3. Architecture Changes
- **Before**: API Route -> `await runCollection()` -> Response (Risk: Timeout)
- **After**: API Route -> `inngest.send()` -> "Job Started" Response (Immediate)
           Async Worker -> `runCollection()` (Safe)
