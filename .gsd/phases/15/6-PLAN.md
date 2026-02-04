---
phase: 15
plan: 6
wave: 3
---

# Plan 15.6: Dashboard & Testing Scenes

## Objective
Implement the Dashboard metrics showcase scene (literal) and Testing framework scene (hybrid).

## Context
- .gsd/phases/15/5-PLAN.md (completed)
- video-showcase/public/screenshots/

## Tasks

<task type="checkpoint:human-verify">
  <name>Capture Remaining Screenshots</name>
  <files>
    - video-showcase/public/screenshots/dashboard-metrics.png
    - video-showcase/public/screenshots/testing-framework.png
  </files>
  <action>
    User must capture additional screenshots:
    
    1. Dashboard Metrics Screenshot (1920x1080):
       - Main dashboard view
       - Show ASoV and AIGVR charts
       - Include competitor comparison if visible
    
    2. Testing Framework Screenshot (1920x1080):
       - A/B test results or correlation test view
       - Show test comparison data
    
    Save to video-showcase/public/screenshots/
  </action>
  <verify>Test-Path video-showcase/public/screenshots/dashboard-metrics.png</verify>
  <done>Both additional screenshots exist</done>
</task>

<task type="auto">
  <name>Implement DashboardScene</name>
  <files>
    - video-showcase/src/scenes/DashboardScene.tsx
  </files>
  <action>
    Create literal-focused scene (20 seconds / 600 frames):
    
    This is primarily the "product showcase" scene.
    
    Frames 0-150:
    - Dashboard screenshot zooms out from detail to full view
    - Subtle glow highlights on charts
    
    Frames 150-300:
    - AnimatedChart overlays recreating the ASoV chart
    - Numbers counting up to final values
    
    Frames 300-450:
    - Pan to AIGVR section
    - MetricCard overlays with animated stats
    
    Frames 450-600:
    - Overview shot with multiple highlights
    - Subtle emerald particles floating
    
    Keep it clean and professional - let the product speak.
  </action>
  <verify>Get-Content video-showcase/src/scenes/DashboardScene.tsx</verify>
  <done>Scene showcases dashboard with animated overlays</done>
</task>

<task type="auto">
  <name>Implement TestingScene</name>
  <files>
    - video-showcase/src/scenes/TestingScene.tsx
  </files>
  <action>
    Create hybrid scene (15 seconds / 450 frames):
    
    Part 1 - Stylized (frames 0-180):
    - "A" vs "B" split screen animation
    - Abstract visualization of content variants
    - Arrows showing different content going to LLM
    
    Part 2 - Transition (frames 180-240):
    - Split screen merges into results view
    
    Part 3 - Literal (frames 240-450):
    - Testing framework screenshot
    - Highlight winning variant
    - Show key metric differences
    - Success indicator animation (checkmark, etc.)
    
    Message: "Ground truth validation built-in"
  </action>
  <verify>Get-Content video-showcase/src/scenes/TestingScene.tsx</verify>
  <done>Scene shows A/B concept → real test results</done>
</task>

## Success Criteria
- [ ] Dashboard scene is polished product showcase
- [ ] Animated chart overlays match theme colors
- [ ] Testing scene communicates A/B testing concept
- [ ] All screenshots integrate smoothly with animations
