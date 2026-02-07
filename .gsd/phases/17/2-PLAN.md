---
phase: 17
plan: 2
wave: 1
depends_on: []
files_modified:
  - src/lib/analysis/explainer.ts
  - src/app/api/analysis/explain/route.ts
  - src/components/analysis/why-explainer-modal.tsx
  - src/components/dashboard/metric-cards.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Users can click any brand mention to see reasoning"
    - "Explainer uses follow-up LLM call with original context"
    - "Explanations are actionable and understandable"
  artifacts:
    - "explainer.ts exports explainMention function"
    - "Modal displays explanation on click"
---

# Plan 17.2: "Why Did They Say That?" Explainer

<objective>
For each brand mention in LLM responses, show users the likely reasoning behind the recommendation using a follow-up LLM call asking "Why did you recommend [brand] in this context?"

Purpose: Makes the data actionable. Users understand what drives perception and can act on it.
Output: Clickable explanations on brand mentions throughout the dashboard.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- src/lib/analysis/analyzer.ts (brand mention extraction)
- src/lib/openrouter/client.ts (LLM client patterns)
- src/components/dashboard/dashboard-client.tsx
</context>

<tasks>

<task type="auto">
  <name>Create explanation generator</name>
  <files>
    src/lib/analysis/explainer.ts
    src/types/index.ts
  </files>
  <action>
    Create `explainer.ts` with:
    - `ExplainRequest` interface: { originalPrompt, originalResponse, mentionedBrand, mentionContext }
    - `MentionExplanation` interface: { brandName, reasoning, keyFactors: string[], confidence, suggestions: string[] }
    - `explainMention(request: ExplainRequest)`: 
      - Calls gpt-4o-mini with prompt: "You recommended {brand} in response to: {originalPrompt}. Your response was: {response}. Explain in 2-3 sentences why you recommended this brand. List 2-3 key factors that influenced your recommendation. Suggest 2-3 ways the brand could improve its visibility."
      - Parse structured response into MentionExplanation
    
    Use lazy OpenAI initialization pattern (like watchlist/checker.ts).
    
    AVOID: Long prompts — keep explanation request concise for speed.
  </action>
  <verify>npx tsc --noEmit passes</verify>
  <done>explainMention function exports and compiles</done>
</task>

<task type="auto">
  <name>Build explain API endpoint</name>
  <files>
    src/app/api/analysis/explain/route.ts
  </files>
  <action>
    Create POST endpoint accepting:
    { responseId: string, brandName: string }
    
    Flow:
    1. Authenticate user
    2. Fetch response from DB (verify user owns it via brand ownership)
    3. Call explainMention with response context
    4. Return MentionExplanation
    
    Rate limit: Cache explanations in DB to avoid repeated LLM calls for same mention.
    
    Response time target: ~3-5 seconds.
  </action>
  <verify>npm run build passes</verify>
  <done>POST /api/analysis/explain returns structured explanation</done>
</task>

<task type="auto">
  <name>Create explainer modal and integration</name>
  <files>
    src/components/analysis/why-explainer-modal.tsx
    src/components/dashboard/metric-cards.tsx
  </files>
  <action>
    Create `WhyExplainerModal`:
    - Props: { isOpen, onClose, responseId, brandName }
    - On open: POST to /api/analysis/explain
    - Display: 
      - Loading state with spinner
      - Brand name header
      - "Why this recommendation:" section with reasoning
      - "Key factors:" bulleted list
      - "How to improve:" suggestions list
    - Emerald theme styling
    
    Integrate clickable "Why?" icon/button on brand mentions in MetricCards or related components.
    
    AVOID: Multiple simultaneous explain requests — disable button while loading.
  </action>
  <verify>npm run build passes, modal opens on click</verify>
  <done>Users can click to see explanation for any brand mention</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Click on mention opens explainer modal
- [ ] LLM provides actionable explanation
- [ ] Loading state shows while fetching
- [ ] Suggestions are specific and useful
</verification>

<success_criteria>
- [ ] "Why?" button visible on brand mentions
- [ ] Explanations load in <5 seconds
- [ ] Response includes key factors and suggestions
- [ ] Build compiles successfully
</success_criteria>
