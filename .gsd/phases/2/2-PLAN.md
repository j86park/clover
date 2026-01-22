---
phase: 2
plan: 2
wave: 1
---

# Plan 2.2: Brand Management API

## Objective

Create API routes for managing tracked brands and their competitors. This provides the data that feeds into the prompt template engine.

## Context

- .gsd/SPEC.md
- dashboard/src/types/index.ts
- dashboard/supabase/migrations/001_initial_schema.sql

## Tasks

<task type="auto">
  <name>Create Brands API Route</name>
  <files>
    - dashboard/src/app/api/brands/route.ts
  </files>
  <action>
    Create API route for brand CRUD:
    
    **GET /api/brands**
    - Returns all brands with their competitors
    - Joins brands + competitors tables
    
    **POST /api/brands**
    - Creates new brand
    - Required: name
    - Optional: domain, keywords (array)
    - Returns created brand with ID
    
    Use Zod validation. Use server Supabase client.
  </action>
  <verify>curl http://localhost:3000/api/brands</verify>
  <done>GET returns brands array, POST creates brand</done>
</task>

<task type="auto">
  <name>Create Single Brand Route</name>
  <files>
    - dashboard/src/app/api/brands/[id]/route.ts
  </files>
  <action>
    Create dynamic route for single brand operations:
    
    **GET /api/brands/[id]**
    - Returns brand with competitors
    
    **PATCH /api/brands/[id]**
    - Updates brand fields
    
    **DELETE /api/brands/[id]**
    - Deletes brand (cascades to competitors)
  </action>
  <verify>Test with existing brand ID from database</verify>
  <done>Single brand CRUD operations work</done>
</task>

<task type="auto">
  <name>Create Competitors API Route</name>
  <files>
    - dashboard/src/app/api/brands/[id]/competitors/route.ts
  </files>
  <action>
    Create nested route for managing competitors:
    
    **GET /api/brands/[id]/competitors**
    - Returns competitors for a brand
    
    **POST /api/brands/[id]/competitors**
    - Adds competitor to brand
    - Required: name
    - Optional: domain
    
    **DELETE /api/brands/[id]/competitors/[competitorId]**
    - Removes competitor
  </action>
  <verify>Test adding competitor to a brand</verify>
  <done>Competitor CRUD operations work</done>
</task>

## Success Criteria

- [ ] Can create, read, update, delete brands
- [ ] Can add and remove competitors for a brand
- [ ] Brand endpoints return associated competitors
