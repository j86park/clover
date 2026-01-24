---
phase: 6
plan: 1
wave: 1
---

# Plan 6.1: API v1 Endpoints & Versioning

## Objective
Create versioned API structure (/api/v1/*) that wraps existing internal APIs for external consumption. This establishes the foundation for the BAAS layer.

## Context
- .gsd/SPEC.md (BAAS requirements)
- dashboard/src/app/api/ (Existing internal API structure)
- dashboard/src/types/index.ts (Data types)

## Tasks

<task type="auto">
  <name>Create API v1 Route Structure</name>
  <files>dashboard/src/app/api/v1/brands/route.ts, dashboard/src/app/api/v1/collections/route.ts, dashboard/src/app/api/v1/metrics/route.ts</files>
  <action>
    Create versioned API routes under /api/v1/:
    
    1. /api/v1/brands - GET (list brands), POST (create brand)
    2. /api/v1/brands/[id] - GET (get brand), PUT (update), DELETE
    3. /api/v1/collections - GET (list), POST (start collection)
    4. /api/v1/collections/[id] - GET (get collection with status)
    5. /api/v1/metrics/[collection_id] - GET (get metrics for collection)
    
    Each route should:
    - Wrap the existing internal API logic
    - Return consistent JSON response format: { success: boolean, data?: T, error?: string }
    - Include proper HTTP status codes
    - Add request validation with Zod
  </action>
  <verify>curl http://localhost:3000/api/v1/brands returns valid JSON</verify>
  <done>All v1 endpoints return properly formatted responses</done>
</task>

<task type="auto">
  <name>Create API Response Utilities</name>
  <files>dashboard/src/lib/api/response.ts, dashboard/src/lib/api/errors.ts</files>
  <action>
    Create standardized API response helpers:
    
    1. response.ts:
       - success(data, status = 200) - Returns success response
       - error(message, status = 400) - Returns error response
       - notFound(message) - 404 response
       - unauthorized(message) - 401 response
       
    2. errors.ts:
       - ApiError class extending Error
       - Common error types: ValidationError, NotFoundError, UnauthorizedError
       
    These will be used by all v1 routes for consistent responses.
  </action>
  <verify>Import and use in one route, verify build passes</verify>
  <done>Response utilities available and typed correctly</done>
</task>

## Success Criteria
- [ ] /api/v1/brands endpoint functional
- [ ] /api/v1/collections endpoint functional
- [ ] /api/v1/metrics endpoint functional
- [ ] Consistent response format across all endpoints
- [ ] Build passes
