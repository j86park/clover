---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: Supabase Database Integration

## Objective

Set up Supabase client libraries and create the initial database schema for tracking brands, prompts, and LLM responses.

## Context

- .gsd/SPEC.md
- .gsd/phases/1/RESEARCH.md
- src/lib/supabase/

## Tasks

<task type="auto">
  <name>Install Supabase Dependencies</name>
  <files>
    - package.json
  </files>
  <action>
    Install Supabase packages:
    
    ```bash
    npm install @supabase/supabase-js @supabase/ssr
    ```
    
    These provide:
    - `@supabase/supabase-js` — Core Supabase client
    - `@supabase/ssr` — Server-side rendering helpers for Next.js
  </action>
  <verify>npm list @supabase/supabase-js @supabase/ssr</verify>
  <done>Both packages appear in npm list output</done>
</task>

<task type="auto">
  <name>Create Supabase Client Files</name>
  <files>
    - src/lib/supabase/client.ts
    - src/lib/supabase/server.ts
  </files>
  <action>
    Create browser and server Supabase clients:
    
    **client.ts** (for Client Components):
    ```typescript
    import { createBrowserClient } from '@supabase/ssr'
    
    export function createClient() {
      return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    }
    ```
    
    **server.ts** (for Server Components and Route Handlers):
    ```typescript
    import { createServerClient, type CookieOptions } from '@supabase/ssr'
    import { cookies } from 'next/headers'
    
    export async function createClient() {
      const cookieStore = await cookies()
      
      return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                )
              } catch {
                // Ignore in Server Components
              }
            },
          },
        }
      )
    }
    ```
  </action>
  <verify>npx tsc --noEmit src/lib/supabase/client.ts src/lib/supabase/server.ts</verify>
  <done>TypeScript compiles both files without errors</done>
</task>

<task type="auto">
  <name>Create Database Schema SQL</name>
  <files>
    - supabase/migrations/001_initial_schema.sql
  </files>
  <action>
    Create the initial database schema:
    
    ```sql
    -- Brands being tracked
    CREATE TABLE brands (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      domain TEXT,
      keywords TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Competitors for each brand
    CREATE TABLE competitors (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      domain TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Prompt templates
    CREATE TABLE prompts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      category TEXT NOT NULL, -- 'discovery', 'comparison', 'review'
      intent TEXT NOT NULL,   -- 'best_in_category', 'brand_vs_competitor', etc.
      template TEXT NOT NULL, -- With {{brand}}, {{category}} placeholders
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Collection runs
    CREATE TABLE collections (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Raw LLM responses
    CREATE TABLE responses (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
      prompt_id UUID REFERENCES prompts(id),
      model TEXT NOT NULL,      -- e.g., 'gpt-4', 'claude-3-opus'
      prompt_text TEXT NOT NULL,
      response_text TEXT NOT NULL,
      tokens_used INTEGER,
      latency_ms INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Indexes for common queries
    CREATE INDEX idx_responses_collection ON responses(collection_id);
    CREATE INDEX idx_responses_model ON responses(model);
    CREATE INDEX idx_collections_brand ON collections(brand_id);
    CREATE INDEX idx_collections_status ON collections(status);
    ```
    
    **Note:** This SQL will be run manually in Supabase dashboard for now.
    Future: Use Supabase CLI for migrations.
  </action>
  <verify>Test-Path supabase/migrations/001_initial_schema.sql</verify>
  <done>Migration file exists with valid SQL</done>
</task>

## Success Criteria

- [ ] Supabase packages installed and in package.json
- [ ] Browser and server clients compile without TypeScript errors
- [ ] Database schema SQL file ready for execution
