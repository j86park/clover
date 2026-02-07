---
phase: 16
plan: 1
wave: 1
---

# Plan 16.1: Prompt Library Templates

## Objective
Expand the prompt template library with 20+ research-backed prompt templates covering common LLM SEO use cases. Users will be able to select from a rich library of templates when setting up their data collections, accelerating time-to-value.

## Context
- .gsd/SPEC.md
- dashboard/src/lib/prompts/templates.ts — existing template structure
- dashboard/src/lib/prompts/engine.ts — prompt rendering logic
- dashboard/src/types/index.ts — Prompt type definition
- dashboard/src/lib/collector/generator.ts — uses prompts for collection

## Tasks

<task type="auto">
  <name>Expand default prompt templates</name>
  <files>dashboard/src/lib/prompts/templates.ts</files>
  <action>
    Add new prompt templates to DEFAULT_PROMPTS array following existing pattern.
    
    New categories to add:
    - 'purchasing' — buying decision prompts
    - 'trending' — time-sensitive trend prompts
    
    New prompts to add (minimum 15 new):
    
    **Discovery (add 4 more):**
    - "What are the top-rated {category} tools in 2025?"
    - "Which {category} solution is best for startups?"
    - "What {category} tools do enterprise companies use?"
    - "Recommend a {category} tool for small teams"
    
    **Comparison (add 4 more):**
    - "Should I choose {brand} or {competitor} for {category}?"
    - "What are the key differences between {brand} and {competitor}?"
    - "Which is more cost-effective: {brand} or {competitor}?"
    - "Is {brand} better than {competitor} for beginners?"
    
    **Review (add 4 more):**
    - "What do users say about {brand}?"
    - "Is {brand} worth the price?"
    - "What are common complaints about {brand}?"
    - "How reliable is {brand}?"
    
    **Purchasing (new category, add 4):**
    - "Should I buy {brand} or look for alternatives?"
    - "Is {brand} the best value in {category}?"
    - "What should I consider before purchasing {brand}?"
    - "Is {brand} good for long-term use?"
    
    **Trending (new category, add 4):**
    - "What's the most talked about {category} tool right now?"
    - "Which {category} is trending on social media?"
    - "What {category} tools are gaining popularity?"
    - "What's new in the {category} space?"
    
    Update PromptCategory type to include 'purchasing' | 'trending'.
  </action>
  <verify>npx tsc --noEmit (TypeScript compiles without errors)</verify>
  <done>templates.ts contains 24+ prompt templates across 5 categories</done>
</task>

<task type="auto">
  <name>Create prompt template browser UI</name>
  <files>
    dashboard/src/components/prompts/template-library.tsx (new)
    dashboard/src/app/settings/prompts/page.tsx (new)
  </files>
  <action>
    1. Create TemplateLibrary component:
       - Grid display of all prompt templates
       - Filter by category (tabs or dropdown)
       - Search by intent or template text
       - Preview with sample variable substitution
       - "Add to Collection" button that queues template for next collection
    
    2. Create /settings/prompts page:
       - Show TemplateLibrary component
       - List user's current active prompts
       - Toggle prompts on/off for collections
       - "Add Custom" button (stretch: opens modal for custom template)
    
    Use existing UI components from dashboard/src/components/ui/
    Follow Emerald theme (bg-emerald-*, text-emerald-*)
  </action>
  <verify>npm run build (Next.js builds successfully)</verify>
  <done>/settings/prompts page loads and displays all templates organized by category</done>
</task>

<task type="auto">
  <name>Wire prompt selection to collection runner</name>
  <files>
    dashboard/src/app/collections/page.tsx
    dashboard/src/lib/collector/runner.ts
  </files>
  <action>
    1. Update collections page to show prompt count before running:
       - Display "Using X prompts from library" 
       - Link to /settings/prompts to customize
    
    2. Ensure runner.ts correctly loads prompts from database:
       - Already uses supabase.from('prompts').select('*').eq('is_active', true)
       - Verify this works with new templates
    
    3. Add API route to seed default prompts to database:
       - POST /api/prompts/seed — inserts DEFAULT_PROMPTS if prompts table is empty
       - Useful for new users
  </action>
  <verify>npm run build && npm run dev (server starts, /collections accessible)</verify>
  <done>Collections page shows prompt count, /settings/prompts allows customization</done>
</task>

## Success Criteria
- [ ] 24+ prompt templates available across 5 categories
- [ ] /settings/prompts page displays filterable template library
- [ ] Users can enable/disable prompts for their collections
- [ ] TypeScript compiles without errors
- [ ] Next.js build succeeds
