---
phase: 7
plan: 3
wave: 2
---

# Plan 7.3: A/B Content Test Framework

## Objective
Create an A/B testing framework that allows users to test different content variations and measure their impact on LLM brand mentions and recommendations.

## Context
- .gsd/SPEC.md
- dashboard/src/lib/collector/ — data collection patterns
- dashboard/src/lib/openrouter/client.ts — LLM client
- dashboard/src/lib/testing/ — testing modules (from Plans 7.1, 7.2)

## Tasks

<task type="auto">
  <name>Create A/B test configuration and runner</name>
  <files>
    dashboard/src/lib/testing/ab-test.ts (NEW)
  </files>
  <action>
    Build the A/B testing system:
    
    1. Interfaces:
       - ABVariant: { id, name, content, metadata }
       - ABTestConfig: { variants, promptTemplate, models, iterations }
       - ABTestResult: { variantId, mentions, recommendations, scores }
    
    2. createABTest(config): Initialize test
    3. runABTest(testId): Execute test across variants
       - For each variant, run prompt through LLMs
       - Analyze responses using lib/analysis
       - Collect mention/recommendation data
    4. compareVariants(results): Statistical comparison
       - Chi-square test for categorical outcomes
       - T-test for continuous metrics
       - Confidence intervals
    5. Export from lib/testing/index.ts
  </action>
  <verify>tsc --noEmit</verify>
  <done>A/B test framework compiles with variant comparison logic</done>
</task>

<task type="auto">
  <name>Create A/B test API endpoint</name>
  <files>
    dashboard/src/app/api/testing/ab/route.ts (NEW)
  </files>
  <action>
    Build API endpoints for A/B testing:
    
    POST /api/testing/ab — Create new A/B test
    - Request: { name, variants[], promptTemplate, models[] }
    - Response: { testId, status }
    
    GET /api/testing/ab/[id] — Get test results
    - Response: { test, results, comparison }
    
    POST /api/testing/ab/[id]/run — Execute test
    - Response: { status, progress }
    
    Follow patterns from existing API routes
    Use proper error handling and validation
  </action>
  <verify>npm run build (no build errors)</verify>
  <done>A/B test API endpoints functional</done>
</task>

## Success Criteria
- [ ] A/B test creation and configuration working
- [ ] Variant comparison with statistical significance
- [ ] API endpoints for test management
- [ ] Integration with existing analysis pipeline
