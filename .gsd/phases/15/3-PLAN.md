---
phase: 15
plan: 3
wave: 2
---

# Plan 15.3: Reusable Animation Components

## Objective
Create shared animation components that will be used across multiple scenes.

## Context
- .gsd/phases/15/1-PLAN.md (completed)
- .gsd/phases/15/2-PLAN.md (completed)
- video-showcase/src/styles/theme.ts

## Tasks

<task type="auto">
  <name>Create Core Animation Components</name>
  <files>
    - video-showcase/src/components/AnimatedText.tsx
    - video-showcase/src/components/BrandLogo.tsx
    - video-showcase/src/components/GlowEffect.tsx
    - video-showcase/src/components/index.ts
  </files>
  <action>
    Create AnimatedText.tsx:
    - Props: text, fontSize, color, delay, effect ('fade' | 'typewriter' | 'slide')
    - Use useCurrentFrame() and interpolate() for animations
    - Support emerald glow effect option
    
    Create BrandLogo.tsx:
    - Clover logo component (can use simple SVG or text initially)
    - Animated entrance with scale and opacity
    - Emerald pulse glow effect
    
    Create GlowEffect.tsx:
    - Reusable emerald glow container
    - Animated pulse using spring()
    - Configurable intensity and spread
    
    Export all from index.ts barrel file.
  </action>
  <verify>Get-ChildItem video-showcase/src/components/</verify>
  <done>Component files exist and export correctly</done>
</task>

<task type="auto">
  <name>Create Data Visualization Components</name>
  <files>
    - video-showcase/src/components/AnimatedChart.tsx
    - video-showcase/src/components/MetricCard.tsx
    - video-showcase/src/components/NetworkGraph.tsx
  </files>
  <action>
    Create AnimatedChart.tsx:
    - Simple animated bar/line chart
    - Bars grow from bottom using interpolate()
    - Uses theme colors for bars (emerald gradient)
    
    Create MetricCard.tsx:
    - Card with metric name, value, and optional change indicator
    - Animated counter for value
    - Emerald accent border/highlight
    
    Create NetworkGraph.tsx:
    - SVG-based network visualization
    - Animated nodes and connections
    - For showing LLM provider connections
    
    Add to index.ts exports.
  </action>
  <verify>Get-Content video-showcase/src/components/index.ts</verify>
  <done>All 6 components exported from barrel file</done>
</task>

## Success Criteria
- [ ] AnimatedText supports fade, typewriter, and slide effects
- [ ] BrandLogo displays with entrance animation
- [ ] GlowEffect creates emerald glow around children
- [ ] AnimatedChart animates bars growing up
- [ ] MetricCard displays animated counter
- [ ] NetworkGraph renders nodes and edges
