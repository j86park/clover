---
phase: 2
plan: 3
wave: 2
---

# Plan 2.3: Collection Runner

## Objective

Build the orchestration system that runs LLM queries across multiple models and stores responses. This is the core data collection engine.

## Context

- .gsd/SPEC.md
- .gsd/phases/2/RESEARCH.md
- dashboard/src/lib/openrouter/
- dashboard/src/lib/prompts/

## Tasks

<task type="auto">
  <name>Install Dependencies and Create Runner Core</name>
  <files>
    - dashboard/package.json
    - dashboard/src/lib/collector/runner.ts
    - dashboard/src/lib/collector/index.ts
  </files>
  <action>
    Install p-limit for concurrency control:
    ```bash
    npm install p-limit
    ```
    
    Create the collection runner with:
    
    ```typescript
    // runner.ts
    export interface CollectionConfig {
      brandId: string;
      models: string[];      // Which LLM models to query
      promptIds?: string[];  // Specific prompts (or all active)
      concurrency?: number;  // Max concurrent requests (default 3)
    }
    
    export interface CollectionResult {
      collectionId: string;
      totalPrompts: number;
      completed: number;
      failed: number;
    }
    
    export async function runCollection(config: CollectionConfig): Promise<CollectionResult>
    ```
    
    Runner should:
    1. Create collection record in DB (status: 'running')
    2. Load brand + competitors
    3. Load prompts
    4. Generate all prompt instances
    5. Execute with rate limiting
    6. Store each response
    7. Update collection status on completion
  </action>
  <verify>npm list p-limit</verify>
  <done>p-limit installed, runner.ts compiles</done>
</task>

<task type="auto">
  <name>Create Prompt Instance Generator</name>
  <files>
    - dashboard/src/lib/collector/generator.ts
  </files>
  <action>
    Create function that generates all prompt instances for a collection:
    
    ```typescript
    export interface PromptInstance {
      promptId: string;
      promptText: string;  // Rendered with variables
      variables: Record<string, string>;
    }
    
    export function generatePromptInstances(
      brand: Brand,
      competitors: Competitor[],
      prompts: Prompt[]
    ): PromptInstance[]
    ```
    
    For each prompt template:
    - If template uses {competitor}, generate one instance per competitor
    - Substitute {brand}, {category} from brand data
    - Return array of ready-to-execute prompts
  </action>
  <verify>npx tsc --noEmit dashboard/src/lib/collector/generator.ts</verify>
  <done>Generator creates correct prompt instances with variable substitution</done>
</task>

<task type="auto">
  <name>Create Collections API Route</name>
  <files>
    - dashboard/src/app/api/collections/route.ts
    - dashboard/src/app/api/collections/[id]/route.ts
  </files>
  <action>
    Create API routes:
    
    **POST /api/collections**
    - Starts a new collection run
    - Body: { brandId, models: string[], promptIds?: string[] }
    - Calls runCollection() and returns immediately with collectionId
    - Collection runs in background
    
    **GET /api/collections**
    - Returns list of collections with status
    
    **GET /api/collections/[id]**
    - Returns collection details with responses
    - Includes progress (completed/total)
  </action>
  <verify>Test starting a collection via POST</verify>
  <done>Can start collection and check status</done>
</task>

## Success Criteria

- [ ] Collection runner executes prompts against specified models
- [ ] Rate limiting prevents API overload (max 3 concurrent)
- [ ] Responses stored in database with collection reference
- [ ] Collection status accurately reflects progress
