---
phase: 18
plan: 1
wave: 1
depends_on: []
files_modified:
  - src/lib/recommendations/engine.ts
  - src/lib/recommendations/rules.ts
  - src/types/index.ts
  - src/app/api/recommendations/route.ts
  - src/components/dashboard/recommendations-panel.tsx
  - src/app/page.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Users see actionable suggestions on dashboard"
    - "Recommendations update based on current metrics"
    - "Each recommendation has clear action and reason"
  artifacts:
    - "engine.ts exports generateRecommendations"
    - "Recommendations panel visible on dashboard"
---

# Plan 18.1: Recommendations Engine

<objective>
Build a system that analyzes user metrics and generates actionable suggestions to improve brand visibility. Users want to know "what should I do next?"

Purpose: Transform data into actionable insights that guide users toward improvement.
Output: Recommendations panel on dashboard with prioritized suggestions.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- src/lib/metrics/calculator.ts (existing metrics patterns)
- src/lib/analysis/prompt-effectiveness.ts (effectiveness patterns)
- src/components/dashboard/dashboard-client.tsx
</context>

<tasks>

<task type="auto">
  <name>Create recommendation rules engine</name>
  <files>
    src/lib/recommendations/engine.ts
    src/lib/recommendations/rules.ts
    src/types/index.ts
  </files>
  <action>
    Create `rules.ts` with recommendation rule definitions:
    - `RecommendationRule` interface: { id, trigger, check, recommendation }
    - Define rules:
      1. LOW_CITATION: "Brand rarely cited" → "Publish more on owned domains"
      2. COMPETITOR_DOMINANCE: "Competitor 2x more recommended" → "Analyze their strategy"
      3. NEGATIVE_SENTIMENT: "Negative sentiment on topic" → "Address in messaging"
      4. LOW_ASOV: "ASoV below 10%" → "Expand keyword coverage"
      5. CITATION_OPPORTUNITY: "Cited by external but not owned" → "Claim these mentions"
    
    Create `engine.ts` with:
    - `Recommendation` interface: { id, type, priority, title, description, action, reason, metrics }
    - `generateRecommendations(brandId)`: Run all rules, return prioritized list
    - Priority scoring: high (immediate action), medium (this week), low (backlog)
    
    Add types to types/index.ts.
    
    AVOID: Generic advice — each recommendation must cite specific metrics.
  </action>
  <verify>npx tsc --noEmit passes</verify>
  <done>Rules engine exports with 5+ recommendation types</done>
</task>

<task type="auto">
  <name>Build recommendations API and UI</name>
  <files>
    src/app/api/recommendations/route.ts
    src/components/dashboard/recommendations-panel.tsx
    src/app/page.tsx
  </files>
  <action>
    Create GET endpoint /api/recommendations:
    1. Authenticate user
    2. Get brand_id
    3. Call generateRecommendations(brandId)
    4. Return sorted by priority
    
    Create `RecommendationsPanel` component:
    - Fetches from /api/recommendations
    - Card layout with priority badges (🔴 High, 🟡 Medium, 🟢 Low)
    - Each card: title, description, "Learn More" expandable
    - Action button for each recommendation
    - Empty state: "Great work! No issues detected."
    
    Integrate into dashboard layout as sidebar panel or new section.
  </action>
  <verify>npm run build passes, recommendations visible on dashboard</verify>
  <done>Dashboard shows dynamic recommendations based on user's actual metrics</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] At least 3 recommendation types implemented
- [ ] Recommendations cite actual user metrics
- [ ] Priority sorting works correctly
- [ ] Empty state handles gracefully
</verification>

<success_criteria>
- [ ] Users see "Your brand is rarely cited..." when ASoV is low
- [ ] Competitor comparison recommendations appear when relevant
- [ ] Build compiles successfully
</success_criteria>
