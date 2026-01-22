---
phase: 3
plan: 2
wave: 1
---

# Plan 3.2: Brand Extraction & Sentiment Analyzer

## Objective

Create the LLM-based brand extraction and sentiment analysis module. This is the core analysis engine that uses GPT-4o-mini to extract structured data from LLM responses.

## Context

- .gsd/SPEC.md
- .gsd/phases/3/RESEARCH.md
- dashboard/src/lib/openrouter/
- dashboard/src/types/analysis.ts

## Tasks

<task type="auto">
  <name>Create Analysis Prompts</name>
  <files>
    - dashboard/src/lib/analysis/prompts.ts
  </files>
  <action>
    Create structured prompts for LLM analysis:
    
    1. **Brand Extraction Prompt**:
       - System prompt explaining the task
       - User prompt with the response text
       - Expected JSON output format
       
    2. **Include instructions for**:
       - Extracting ALL brand/product/company names
       - Determining if each is recommended
       - Assigning sentiment (positive/neutral/negative)
       - Order of mention (position)
       
    Export `BRAND_EXTRACTION_PROMPT` and helper function.
  </action>
  <verify>npx tsc --noEmit dashboard/src/lib/analysis/prompts.ts</verify>
  <done>Prompts defined and exported</done>
</task>

<task type="auto">
  <name>Create Brand Analyzer</name>
  <files>
    - dashboard/src/lib/analysis/analyzer.ts
    - dashboard/src/lib/analysis/index.ts
  </files>
  <action>
    Create the analyzer module:
    
    ```typescript
    export interface AnalyzeOptions {
      trackedBrand: string;
      competitors?: string[];
    }
    
    export async function analyzeBrands(
      responseText: string,
      options: AnalyzeOptions
    ): Promise<BrandMention[]>
    
    export async function analyzeResponse(
      responseText: string,
      options: AnalyzeOptions
    ): Promise<{
      mentions: BrandMention[];
      citations: Citation[];
      summary: string;
    }>
    ```
    
    Implementation:
    1. Call OpenRouter with extraction prompt
    2. Parse JSON response
    3. Validate with Zod schema
    4. Handle errors gracefully
  </action>
  <verify>npx tsc --noEmit dashboard/src/lib/analysis/analyzer.ts</verify>
  <done>Analyzer compiles and exports functions</done>
</task>

## Success Criteria

- [ ] Brand extraction prompt produces structured JSON
- [ ] Analyzer correctly parses LLM responses
- [ ] Sentiment classification works for all three categories
