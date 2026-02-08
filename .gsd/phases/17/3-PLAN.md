---
phase: 17
plan: 3
wave: 2
depends_on: ["17.1"]
files_modified:
  - src/app/prompts/builder/page.tsx
  - src/components/prompts/wizard-step.tsx
  - src/components/prompts/prompt-preview.tsx
  - src/components/prompts/ab-variant-creator.tsx
  - src/lib/prompts/builder.ts
  - src/components/layout/sidebar.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Non-technical users can build prompts via guided steps"
    - "Prompt preview shows final output before saving"
    - "A/B variants can be created inline"
  artifacts:
    - "/prompts/builder page exists and is accessible"
    - "Sidebar includes Prompt Builder link"
---

# Plan 17.3: Prompt Builder Wizard

<objective>
Create a guided UI to help non-technical users construct effective prompts with variables, reducing the barrier to prompt engineering.

Purpose: Non-technical users struggle with prompt engineering — this wizard makes it accessible.
Output: Step-by-step wizard at /prompts/builder with preview and A/B variant creator.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- src/lib/prompts/templates.ts (existing prompt structure)
- src/app/settings/prompts/page.tsx (if exists, for patterns)
- src/components/watchlist/add-competitor-modal.tsx (modal patterns)
</context>

<tasks>

<task type="auto">
  <name>Create prompt builder utility</name>
  <files>
    src/lib/prompts/builder.ts
    src/types/index.ts
  </files>
  <action>
    Create `builder.ts` with:
    - `PromptBuilderState` interface: { category, intent, brandName?, competitorNames?: string[], includeComparison, tone, outputFormat }
    - `buildPromptFromWizard(state: PromptBuilderState): string`: Generate prompt template from wizard selections
    - `generateABVariant(basePrompt: string, variationType: 'tone' | 'length' | 'focus'): string`: Create variant of prompt
    - `PROMPT_CATEGORIES`, `INTENT_TYPES`, `TONE_OPTIONS` constants
    
    Export all from prompts/index.ts barrel.
    
    AVOID: Hardcoding — make wizard options data-driven for future expansion.
  </action>
  <verify>npx tsc --noEmit passes</verify>
  <done>Prompt builder utilities export correctly</done>
</task>

<task type="auto">
  <name>Build wizard UI components</name>
  <files>
    src/components/prompts/wizard-step.tsx
    src/components/prompts/prompt-preview.tsx
    src/components/prompts/ab-variant-creator.tsx
  </files>
  <action>
    Create `WizardStep` component:
    - Props: { step, title, description, children, isActive, isComplete }
    - Step indicator with numbered circles
    - Collapsible content area
    
    Create `PromptPreview` component:
    - Props: { prompt, variables }
    - Syntax-highlighted display of generated prompt
    - Variable placeholders highlighted
    - Copy button
    
    Create `ABVariantCreator` component:
    - Props: { basePrompt, onVariantCreated }
    - Dropdown to select variation type
    - Preview of A and B variants side-by-side
    - Save both button
    
    Style with emerald theme.
  </action>
  <verify>npx tsc --noEmit passes</verify>
  <done>All wizard components export and compile</done>
</task>

<task type="auto">
  <name>Create prompt builder page</name>
  <files>
    src/app/prompts/builder/page.tsx
    src/components/layout/sidebar.tsx
  </files>
  <action>
    Create builder page with wizard flow:
    - Step 1: Select Category (discovery, comparison, review, etc.)
    - Step 2: Choose Intent Type (recommendation, evaluation, alternatives)
    - Step 3: Add Brand/Competitor Names (optional toggles)
    - Step 4: Configure Tone and Format
    - Step 5: Preview and Refine
    - Step 6: Create A/B Variant (optional)
    - Save button → POST to /api/prompts
    
    Add "Prompt Builder" to sidebar nav under a "Prompts" section with Wand icon.
    
    AVOID: Too many steps — keep wizard to 4-6 steps max.
  </action>
  <verify>npm run build passes, /prompts/builder accessible</verify>
  <done>Wizard works end-to-end from category selection to saved prompt</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Non-technical user can build prompt without coding
- [ ] Preview accurately reflects final prompt
- [ ] A/B variants generate correctly
- [ ] Saved prompts appear in prompt library
</verification>

<success_criteria>
- [ ] 6-step wizard guides prompt creation
- [ ] Preview shows generated prompt with highlights
- [ ] A/B variant creator works inline
- [ ] Build compiles successfully
</success_criteria>
