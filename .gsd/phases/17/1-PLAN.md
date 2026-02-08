---
phase: 17
plan: 1
wave: 1
depends_on: []
files_modified:
  - src/lib/analysis/prompt-effectiveness.ts
  - src/types/index.ts
  - src/app/api/analysis/prompts/route.ts
  - src/components/analysis/prompt-effectiveness-card.tsx
  - src/app/analysis/page.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Each prompt shows mention rate as percentage"
    - "Dashboard displays prompts ranked by brand mention frequency"
    - "Users can see which prompts favor or ignore their brand"
  artifacts:
    - "prompt-effectiveness.ts exports calculatePromptEffectiveness"
    - "API returns effectiveness metrics per prompt"
---

# Plan 17.1: Prompt Effectiveness Scoring

<objective>
Build a system that analyzes which prompts generate the most favorable brand mentions, giving users insights like "This prompt mentions you 80% of the time" vs "This prompt rarely recommends you (12%)".

Purpose: Enables users to optimize their prompt matrix based on what works.
Output: Prompt effectiveness metrics with ranking visualization on analysis page.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- src/lib/analysis/pipeline.ts (existing analysis patterns)
- src/lib/prompts/templates.ts (prompt structure)
- src/types/analysis.ts
</context>

<tasks>

<task type="auto">
  <name>Create prompt effectiveness analyzer</name>
  <files>
    src/lib/analysis/prompt-effectiveness.ts
    src/types/index.ts
  </files>
  <action>
    Create `prompt-effectiveness.ts` with:
    - `PromptEffectiveness` interface: { promptId, promptText, category, mentionCount, totalResponses, mentionRate, avgSentiment, lastCalculated }
    - `calculatePromptEffectiveness(brandId: string)`: Query responses grouped by prompt, count brand mentions per prompt, calculate mention_rate = mentions/total * 100
    - `getPromptRanking(brandId: string)`: Return prompts sorted by mentionRate descending
    
    Add `PromptEffectiveness` type to types/index.ts.
    
    AVOID: Complex joins in single query — break into readable steps for debugging.
  </action>
  <verify>npx tsc --noEmit passes</verify>
  <done>PromptEffectiveness type exists, analyzer functions export correctly</done>
</task>

<task type="auto">
  <name>Build prompt effectiveness API</name>
  <files>
    src/app/api/analysis/prompts/route.ts
  </files>
  <action>
    Create GET endpoint that:
    1. Authenticates user via Supabase
    2. Gets user's brand_id
    3. Calls getPromptRanking(brandId)
    4. Returns JSON: { prompts: PromptEffectiveness[], summary: { bestPrompt, worstPrompt, avgMentionRate } }
    
    Handle edge cases: no data yet → return empty array with message.
  </action>
  <verify>npm run build passes, endpoint accessible at /api/analysis/prompts</verify>
  <done>API returns prompt effectiveness data for authenticated user</done>
</task>

<task type="auto">
  <name>Create prompt effectiveness UI component</name>
  <files>
    src/components/analysis/prompt-effectiveness-card.tsx
    src/app/analysis/page.tsx
  </files>
  <action>
    Create `PromptEffectivenessCard` component:
    - Fetches from /api/analysis/prompts
    - Displays ranked list of prompts with:
      - Prompt text (truncated)
      - Category badge
      - Mention rate as progress bar (0-100%)
      - Color coding: >70% green, 40-70% yellow, <40% red
    - Summary stats at top: "Best: [prompt] (85%)", "Needs work: [prompt] (12%)"
    
    Integrate into /analysis page layout.
    
    AVOID: Over-fetching — use SWR or similar for client-side caching.
  </action>
  <verify>npm run build passes, visual inspection of /analysis page shows effectiveness data</verify>
  <done>Prompt effectiveness scores visible on analysis page with color-coded rates</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] API returns correct mention rates per prompt
- [ ] UI displays ranked prompts with percentage bars
- [ ] Color coding reflects effectiveness level
- [ ] Empty state handles gracefully
</verification>

<success_criteria>
- [ ] Users can see "This prompt mentions you X% of the time"
- [ ] Prompts are ranked by effectiveness
- [ ] Build compiles successfully
</success_criteria>
