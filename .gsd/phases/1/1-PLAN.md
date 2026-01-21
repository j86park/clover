---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Next.js Project Initialization

## Objective

Initialize the Next.js project with TypeScript, Tailwind CSS, and proper directory structure. This creates the foundation for all subsequent development.

## Context

- .gsd/SPEC.md
- .gsd/phases/1/RESEARCH.md

## Tasks

<task type="auto">
  <name>Initialize Next.js Project</name>
  <files>
    - package.json
    - tsconfig.json
    - tailwind.config.ts
    - next.config.ts
    - src/app/layout.tsx
    - src/app/page.tsx
  </files>
  <action>
    Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --use-npm` in the project root.
    
    **Important flags:**
    - `--app` — Use App Router (not Pages Router)
    - `--src-dir` — Place code in src/ directory
    - `--use-npm` — Use npm (consistent with Vercel)
    
    If prompted for project name, use current directory `.`
    Accept defaults for other prompts.
  </action>
  <verify>npm run build</verify>
  <done>Project builds successfully with no errors</done>
</task>

<task type="auto">
  <name>Create Project Directory Structure</name>
  <files>
    - src/lib/supabase/.gitkeep
    - src/lib/openrouter/.gitkeep
    - src/lib/utils.ts
    - src/types/index.ts
    - src/components/ui/.gitkeep
  </files>
  <action>
    Create the following directory structure:
    
    ```
    src/
    ├── lib/
    │   ├── supabase/      # Supabase clients
    │   ├── openrouter/    # OpenRouter client
    │   └── utils.ts       # Utility functions
    ├── types/
    │   └── index.ts       # Shared TypeScript types
    └── components/
        └── ui/            # Reusable UI components
    ```
    
    Create placeholder files with minimal content:
    - `utils.ts`: Export a `cn()` function for className merging
    - `index.ts`: Export placeholder type `Brand`
  </action>
  <verify>Test-Path src/lib/supabase, src/lib/openrouter, src/types/index.ts</verify>
  <done>All directories and placeholder files exist</done>
</task>

<task type="auto">
  <name>Configure Environment Variables</name>
  <files>
    - .env.local.example
    - .gitignore
  </files>
  <action>
    Create `.env.local.example` with all required environment variables (empty values).
    
    Ensure `.gitignore` includes:
    - `.env.local`
    - `.env*.local`
    
    **Environment variables needed:**
    ```
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=
    NEXT_PUBLIC_SUPABASE_ANON_KEY=
    SUPABASE_SERVICE_ROLE_KEY=
    
    # OpenRouter
    OPENROUTER_API_KEY=
    
    # App
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ```
  </action>
  <verify>Test-Path .env.local.example</verify>
  <done>.env.local.example exists with all required variables listed</done>
</task>

## Success Criteria

- [ ] `npm run dev` starts development server on localhost:3000
- [ ] `npm run build` completes without errors
- [ ] Directory structure matches RESEARCH.md specification
- [ ] Environment variables template is documented
