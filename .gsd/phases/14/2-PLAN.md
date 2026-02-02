---
phase: 14
plan: 2
wave: 2
---

# Plan 14.2: UI Foundation Integration

## Objective
Integrate the "Deep Emerald" aesthetic into the core UI by updating global styles, the main layout backdrop, and base component styling.

## Context
- .gsd/phases/14/RESEARCH.md
- dashboard/src/app/globals.css
- dashboard/src/app/layout.tsx

## Tasks

<task type="auto">
  <name>Update Global Tokens & Base Background</name>
  <files>dashboard/src/app/globals.css</files>
  <action>
    Define the "Deep Emerald" palette in `:root` (dark mode focus).
    Add the `bg-clover-base` mesh gradient and radial grid overlay as utility classes.
  </action>
  <verify>Check for the presence of #010805 and mesh gradient definitions in globals.css</verify>
  <done>Global variables and mesh background are defined.</done>
</task>

<task type="auto">
  <name>Apply Clover Layout Backdrop</name>
  <files>dashboard/src/app/layout.tsx</files>
  <action>
    Apply the `bg-clover-base` class to the body to establish the "Deep Emerald" environment across the whole app.
  </action>
  <verify>Examine layout.tsx for the new class on body.</verify>
  <done>Full-app backdrop updated.</done>
</task>

<task type="auto">
  <name>Polish Core Components (Button & Card)</name>
  <files>dashboard/src/components/ui/button.tsx, dashboard/src/components/ui/card.tsx</files>
  <action>
    Update `Button` (primary variant) to match the high-contrast Cloud White aesthetic from the research.
    Update `Card` to include the subtle border and backdrop-blur identified in the "Emerald Glow" research.
  </action>
  <verify>Examine component definitions for style updates.</verify>
  <done>Base components aligned with Clover aesthetic.</done>
</task>

## Success Criteria
- [ ] Application has a dark obsidian-green background with emerald mesh glows.
- [ ] Subtle dot grid pattern is visible on the backdrop.
- [ ] Primary buttons align with the high-contrast white style.
