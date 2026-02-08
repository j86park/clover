---
phase: 18
plan: 2
wave: 1
depends_on: []
files_modified:
  - src/lib/analysis/content-gaps.ts
  - src/app/api/analysis/gaps/route.ts
  - src/components/analysis/content-gap-table.tsx
  - src/app/analysis/page.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Users see topics where competitors appear but they don't"
    - "Gap table shows competitor vs user mention counts"
    - "Each gap links to relevant prompts for context"
  artifacts:
    - "content-gaps.ts exports analyzeContentGaps"
    - "Gap table component exists on analysis page"
---

# Plan 18.2: Content Gap Analysis

<objective>
Identify topics and prompts where competitors are mentioned but the user's brand is not. Shows where to focus content creation efforts.

Purpose: "Competitor talked about X in 15 prompts, you in 0" — reveals content opportunities.
Output: Gap analysis table on analysis page showing unaddressed topic areas.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- src/lib/analysis/pipeline.ts (response analysis patterns)
- src/lib/analysis/prompt-effectiveness.ts (prompt analysis patterns)
- src/types/analysis.ts
</context>

<tasks>

<task type="auto">
  <name>Create content gap analyzer</name>
  <files>
    src/lib/analysis/content-gaps.ts
    src/types/index.ts
  </files>
  <action>
    Create `content-gaps.ts` with:
    - `ContentGap` interface: { topic, promptCategory, competitorMentions: { name, count }[], userMentions, gapScore, examplePrompts: string[] }
    - `analyzeContentGaps(brandId: string, competitorIds: string[])`:
      1. Get all prompts with responses
      2. For each prompt category/topic, count:
         - How many times competitors were mentioned
         - How many times user brand was mentioned
      3. Calculate gap score = competitor_mentions - user_mentions
      4. Return sorted by gap score (highest gaps first)
    
    Topic extraction: Use prompt categories + LLM-detected topics from analysis.
    
    AVOID: Complex topic clustering — use simple category + keyword matching first.
  </action>
  <verify>npx tsc --noEmit passes</verify>
  <done>analyzeContentGaps returns gap data sorted by opportunity size</done>
</task>

<task type="auto">
  <name>Build gap analysis API and UI</name>
  <files>
    src/app/api/analysis/gaps/route.ts
    src/components/analysis/content-gap-table.tsx
    src/app/analysis/page.tsx
  </files>
  <action>
    Create GET endpoint /api/analysis/gaps:
    1. Authenticate user
    2. Get brand and competitors
    3. Call analyzeContentGaps
    4. Return top 20 gaps
    
    Create `ContentGapTable` component:
    - Sortable table with columns: Topic, Your Mentions, Competitor Mentions, Gap
    - Color coding: large gap = red, small gap = yellow
    - Expandable row showing example prompts where gap exists
    - "Create Content" button linking to prompt builder (if exists)
    
    Integrate into /analysis page below prompt effectiveness.
  </action>
  <verify>npm run build passes, gap table visible on /analysis</verify>
  <done>Content gap table shows "Competitor X: 15, You: 0" style data</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Gaps calculated correctly from response data
- [ ] Table shows competitor vs user mention comparison
- [ ] Example prompts are relevant to each gap
- [ ] Empty state handles no competitors case
</verification>

<success_criteria>
- [ ] Users see specific topics where competitors dominate
- [ ] Gap score prioritizes biggest opportunities
- [ ] Build compiles successfully
</success_criteria>
