---
phase: 6
plan: 2
wave: 1
---

# Plan 6.2: API Key Authentication

## Objective
Implement API key authentication middleware that validates requests and associates them with tenants. This is the security foundation for the BAAS layer.

## Context
- .gsd/SPEC.md (Authentication requirements)
- dashboard/src/lib/supabase/ (Database client)
- dashboard/src/app/api/v1/ (API routes to protect)

## Tasks

<task type="auto">
  <name>Create API Keys Database Table</name>
  <files>dashboard/src/lib/supabase/migrations/api_keys.sql, dashboard/src/types/index.ts</files>
  <action>
    Create migration SQL for api_keys table:
    
    ```sql
    CREATE TABLE api_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key_hash TEXT NOT NULL UNIQUE,
      key_prefix TEXT NOT NULL,  -- First 8 chars for display (e.g., "clv_abc1...")
      name TEXT NOT NULL,
      tenant_id UUID NOT NULL REFERENCES brands(id),
      permissions TEXT[] DEFAULT ARRAY['read'],
      rate_limit INTEGER DEFAULT 1000,  -- requests per hour
      is_active BOOLEAN DEFAULT true,
      last_used_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE
    );
    
    CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
    CREATE INDEX idx_api_keys_tenant ON api_keys(tenant_id);
    ```
    
    Add ApiKey interface to types/index.ts.
  </action>
  <verify>SQL syntax valid, types added</verify>
  <done>Migration file created and types defined</done>
</task>

<task type="auto">
  <name>Implement Auth Middleware</name>
  <files>dashboard/src/lib/api/auth.ts, dashboard/src/lib/api/middleware.ts</files>
  <action>
    Create authentication utilities:
    
    1. auth.ts:
       - generateApiKey() - Creates new key (returns unhashed + hashed)
       - hashApiKey(key) - SHA-256 hash for storage
       - validateApiKey(key) - Validates and returns tenant info
       
    2. middleware.ts:
       - withApiAuth(handler) - HOF that wraps route handlers
       - Extracts key from Authorization header (Bearer token) or X-API-Key header
       - Validates key against database
       - Injects tenant context into request
       - Returns 401 if invalid
       
    Use crypto.subtle for hashing (available in Edge runtime).
  </action>
  <verify>Build passes, middleware can be imported</verify>
  <done>Auth middleware ready for use in routes</done>
</task>

<task type="auto">
  <name>Protect v1 Routes</name>
  <files>dashboard/src/app/api/v1/brands/route.ts, dashboard/src/app/api/v1/collections/route.ts, dashboard/src/app/api/v1/metrics/route.ts</files>
  <action>
    Wrap v1 route handlers with authentication middleware:
    
    ```typescript
    import { withApiAuth } from '@/lib/api/middleware';
    
    export const GET = withApiAuth(async (req, { tenant }) => {
      // tenant is now available from validated API key
      // Filter queries by tenant_id
    });
    ```
    
    Each route should:
    - Use withApiAuth wrapper
    - Access tenant from context
    - Filter all queries by tenant_id
  </action>
  <verify>curl without API key returns 401</verify>
  <done>All v1 routes require valid API key</done>
</task>

## Success Criteria
- [ ] api_keys table schema created
- [ ] API key generation and validation working
- [ ] Routes return 401 without valid key
- [ ] Tenant context available in protected routes
- [ ] Build passes
