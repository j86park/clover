---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Dashboard Layout & Infrastructure

## Objective
Establish the frontend infrastructure, including dependency installation, layout components, navigation, and the base dashboard shell.

## Context
- .gsd/SPEC.md (Vision: Visualization Dashboard)
- src/lib/utils.ts (Already has `cn`)
- Tailwind CSS (Already configured)

## Tasks

<task type="auto">
  <name>Install Dependencies</name>
  <files>package.json</files>
  <action>
    Install UI libraries:
    - `recharts` (Charting)
    - `lucide-react` (Icons)
    - `class-variance-authority` (Component variants)
    - `clsx` (Class merging - already installed but confirm)
  </action>
  <verify>npm list recharts lucide-react class-variance-authority</verify>
  <done>Dependencies installed</done>
</task>

<task type="auto">
  <name>Create UI Components</name>
  <files>src/components/ui/card.tsx, src/components/ui/button.tsx, src/components/ui/badge.tsx</files>
  <action>
    Create core UI components following Shadcn patterns (manual implementation to avoid CLI bloat):
    - `Card`: Header, Title, Content, Footer
    - `Button`: Variants (default, outline, ghost), Sizes
    - `Badge`: Variants (default, success, warning, destructive)
  </action>
  <verify>Build verification</verify>
  <done>Components importable and renderable</done>
</task>

<task type="auto">
  <name>Implement Dashboard Layout</name>
  <files>src/components/layout/sidebar.tsx, src/components/layout/header.tsx, src/app/layout.tsx</files>
  <action>
    Create application layout:
    - Sidebar with navigation links: Dashboard, Collections, Analysis, Settings
    - Header with user placeholder
    - Responsive structure (sidebar hidden on mobile - basic implementation)
  </action>
  <verify>Visual check via browser (if possible) or build check</verify>
  <done>Layout wrapper functioning</done>
</task>

## Success Criteria
- [ ] Dependencies installed
- [ ] Basic UI kit (Card, Button, Badge) available
- [ ] Persistent sidebar navigation
- [ ] Build succeeds
