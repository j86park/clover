---
phase: 6
plan: 3
wave: 2
---

# Plan 6.3: Multi-tenant Data Isolation

## Objective
Ensure all data queries are properly scoped to the authenticated tenant, preventing cross-tenant data access.

## Context
- dashboard/src/lib/api/middleware.ts (Auth middleware with tenant context)
- dashboard/src/lib/supabase/ (Database client)
- dashboard/src/app/api/v1/ (Protected routes)

## Tasks

<task type="auto">
  <name>Create Tenant-Scoped Query Helpers</name>
  <files>dashboard/src/lib/api/tenant.ts</files>
  <action>
    Create tenant-aware query utilities:
    
    1. getTenantBrands(tenantId) - Returns only brands for tenant
    2. getTenantCollections(tenantId) - Returns only collections for tenant's brands
    3. getTenantMetrics(tenantId, collectionId) - Returns metrics with tenant validation
    
    Each function should:
    - Accept tenantId from auth context
    - Add .eq('brand_id', tenantId) or equivalent filter
    - Throw UnauthorizedError if accessing other tenant's data
    
    For collections and metrics (which belong to brands):
    - First verify the parent brand belongs to tenant
    - Then fetch the requested data
  </action>
  <verify>Build passes, functions exported correctly</verify>
  <done>Tenant-scoped queries available</done>
</task>

<task type="auto">
  <name>Update v1 Routes to Use Tenant Queries</name>
  <files>dashboard/src/app/api/v1/brands/route.ts, dashboard/src/app/api/v1/brands/[id]/route.ts, dashboard/src/app/api/v1/collections/route.ts, dashboard/src/app/api/v1/collections/[id]/route.ts, dashboard/src/app/api/v1/metrics/[id]/route.ts</files>
  <action>
    Refactor all v1 routes to use tenant-scoped queries:
    
    1. Replace direct Supabase queries with tenant helper functions
    2. Pass tenant.id from auth context to all query helpers
    3. Ensure POST/PUT operations also validate tenant ownership
    4. Return 403 Forbidden if attempting to access other tenant's resources
    
    Example pattern:
    ```typescript
    export const GET = withApiAuth(async (req, { tenant }) => {
      const brands = await getTenantBrands(tenant.id);
      return success(brands);
    });
    ```
  </action>
  <verify>Attempting to access another tenant's data returns 403</verify>
  <done>All routes enforce tenant isolation</done>
</task>

## Success Criteria
- [ ] Tenant-scoped query helpers implemented
- [ ] All v1 routes use tenant queries
- [ ] Cross-tenant access returns 403
- [ ] Build passes
