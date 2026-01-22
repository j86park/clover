---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Prompt Template System

## Objective

Create the prompt template engine and seed initial templates. This enables dynamic prompt generation for different brand/category combinations.

## Context

- .gsd/SPEC.md
- .gsd/phases/2/RESEARCH.md
- dashboard/src/types/index.ts

## Tasks

<task type="auto">
  <name>Create Prompt Template Engine</name>
  <files>
    - dashboard/src/lib/prompts/engine.ts
    - dashboard/src/lib/prompts/index.ts
  </files>
  <action>
    Create a prompt template engine that:
    1. Takes a template string with `{variable}` placeholders
    2. Replaces placeholders with provided values
    3. Validates all required variables are provided
    
    ```typescript
    // engine.ts
    export interface PromptVariables {
      brand?: string;
      category?: string;
      competitor?: string;
      [key: string]: string | undefined;
    }
    
    export function renderPrompt(template: string, variables: PromptVariables): string
    export function extractVariables(template: string): string[]
    export function validateVariables(template: string, variables: PromptVariables): boolean
    ```
  </action>
  <verify>npx tsc --noEmit dashboard/src/lib/prompts/engine.ts</verify>
  <done>Engine compiles and exports renderPrompt, extractVariables, validateVariables</done>
</task>

<task type="auto">
  <name>Create Default Prompt Templates</name>
  <files>
    - dashboard/src/lib/prompts/templates.ts
  </files>
  <action>
    Create a file with default prompt templates covering:
    
    **Discovery prompts:**
    - `best_in_category`: "What is the best {category} software/tool?"
    - `category_leaders`: "Who are the top 5 companies in {category}?"
    
    **Comparison prompts:**
    - `brand_vs_competitor`: "Compare {brand} vs {competitor}. Which is better?"
    - `brand_alternatives`: "What are the best alternatives to {brand}?"
    
    **Review prompts:**
    - `brand_review`: "What are the pros and cons of {brand}?"
    - `brand_recommendation`: "Would you recommend {brand} for a business?"
    
    Export as typed array with category, intent, and template fields.
  </action>
  <verify>npx tsc --noEmit dashboard/src/lib/prompts/templates.ts</verify>
  <done>Templates file exports DEFAULT_PROMPTS array with 6+ templates</done>
</task>

<task type="auto">
  <name>Create Prompts API Route</name>
  <files>
    - dashboard/src/app/api/prompts/route.ts
  </files>
  <action>
    Create API route for prompt template CRUD:
    
    **GET /api/prompts**
    - Returns all prompts from database
    - Falls back to DEFAULT_PROMPTS if DB empty
    
    **POST /api/prompts**
    - Creates new prompt template
    - Validates: category, intent, template required
    - Stores in Supabase `prompts` table
    
    Use Zod for request validation.
  </action>
  <verify>curl http://localhost:3000/api/prompts</verify>
  <done>GET returns list of prompts, POST creates new prompt</done>
</task>

## Success Criteria

- [ ] Template engine correctly substitutes variables
- [ ] At least 6 default prompt templates defined
- [ ] API returns prompts from database or defaults
