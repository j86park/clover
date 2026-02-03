---
phase: 15
plan: 1
wave: 1
---

# Plan 15.1: Remotion Project Setup

## Objective
Initialize a new Remotion project in `video-showcase/` directory with all required dependencies and configure the emerald/green theme system.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md (Phase 15)
- dashboard/package.json (for consistency in tooling)

## Tasks

<task type="auto">
  <name>Initialize Remotion Project</name>
  <files>
    - video-showcase/package.json
    - video-showcase/tsconfig.json
    - video-showcase/remotion.config.ts
    - video-showcase/src/index.ts
  </files>
  <action>
    Run `npx create-video@latest` in the clover root to scaffold Remotion project in `video-showcase/`.
    
    During setup:
    - Select "Hello World" template for minimal starting point
    - Use npm as package manager
    - Project name: "clover-showcase"
    
    After scaffolding, update `remotion.config.ts`:
    - Set dimensions to 1920x1080
    - Set FPS to 30
    - Configure output directory to `out/`
  </action>
  <verify>cd video-showcase && npm run remotion -- versions</verify>
  <done>Remotion CLI reports version successfully, project structure exists</done>
</task>

<task type="auto">
  <name>Create Emerald Theme Configuration</name>
  <files>
    - video-showcase/src/styles/theme.ts
  </files>
  <action>
    Create theme configuration file with:
    
    ```typescript
    export const theme = {
      colors: {
        primary: { DEFAULT: '#10b981', dark: '#059669', light: '#34d399' },
        accent: { light: '#6ee7b7', dark: '#047857', darkest: '#065f46' },
        background: { primary: '#0f172a', secondary: '#1e293b', tertiary: '#334155' },
        text: { primary: '#f8fafc', secondary: '#94a3b8', muted: '#64748b' }
      },
      fonts: {
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif',
        mono: 'JetBrains Mono, monospace'
      },
      timing: {
        fast: 0.2,
        normal: 0.4,
        slow: 0.8
      }
    };
    ```
    
    Export type definitions for TypeScript safety.
  </action>
  <verify>Get-Content video-showcase/src/styles/theme.ts</verify>
  <done>Theme file exists with emerald color palette and exports</done>
</task>

## Success Criteria
- [ ] Remotion project scaffolded in `video-showcase/`
- [ ] `npm run remotion` opens Remotion Studio
- [ ] Theme file contains complete emerald color system
- [ ] TypeScript compiles without errors
