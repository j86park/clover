---
phase: 8
plan: 1
wave: 1
---

# Plan 8.1: Performance Optimization

## Objective
Optimize the dashboard for production performance by analyzing bundle size, implementing lazy loading, and adding appropriate caching headers.

## Context
- .gsd/SPEC.md
- dashboard/src/app/layout.tsx
- dashboard/next.config.js (if exists)

## Tasks

<task type="auto">
  <name>Analyze and optimize bundle size</name>
  <files>
    dashboard/next.config.js (UPDATE or CREATE)
  </files>
  <action>
    1. Add bundle analyzer configuration to next.config.js
       - Install @next/bundle-analyzer if not present
       - Configure ANALYZE env variable trigger
    
    2. Review dynamic imports for heavy components
       - Dashboard charts should use next/dynamic with ssr: false
       - Testing page can be lazy loaded
    
    3. Enable experimental optimizations if safe:
       - optimizePackageImports for UI libraries
  </action>
  <verify>npm run build (check bundle size output)</verify>
  <done>Build completes with no increase in bundle size, heavy components dynamically imported</done>
</task>

<task type="auto">
  <name>Add caching headers for static assets</name>
  <files>
    dashboard/next.config.js
  </files>
  <action>
    Configure Next.js headers for:
    - Static assets (/_next/static/*): Cache-Control max-age=31536000
    - API routes: no-store or short cache as appropriate
    - Page routes: stale-while-revalidate pattern
  </action>
  <verify>npm run build && curl -I localhost:3000/_next/static/... (check headers)</verify>
  <done>Cache headers configured in next.config.js</done>
</task>

## Success Criteria
- [ ] Bundle analyzer configured
- [ ] Heavy components use dynamic imports
- [ ] Cache headers set for static assets
