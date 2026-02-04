---
phase: 15
plan: 7
wave: 4
---

# Plan 15.7: Problem Scene & Final Polish

## Objective
Implement the Problem Statement scene and perform final polish on all scenes for cohesive video.

## Context
- .gsd/phases/15/4-PLAN.md (completed)
- .gsd/phases/15/5-PLAN.md (completed)
- .gsd/phases/15/6-PLAN.md (completed)

## Tasks

<task type="auto">
  <name>Implement ProblemScene</name>
  <files>
    - video-showcase/src/scenes/ProblemScene.tsx
  </files>
  <action>
    Create engaging problem statement scene (10 seconds / 300 frames):
    
    Frames 0-100:
    - Dark background
    - Question appears: "How do LLMs talk about your brand?"
    - Typewriter effect with emerald cursor
    
    Frames 100-200:
    - LLM logos fade in around the question (ChatGPT, Claude, Gemini icons)
    - Subtle animation on each logo
    
    Frames 200-300:
    - Question fades, replaced by: "Now you can find out."
    - Emerald glow pulse
    - Transition to next scene
    
    Create tension and curiosity before feature reveal.
  </action>
  <verify>npm run remotion -- render CloverShowcase --frames=150-450 out/problem-test.mp4 --quality=50</verify>
  <done>Problem scene creates curiosity and hooks viewer</done>
</task>

<task type="auto">
  <name>Scene Transitions & Timing Polish</name>
  <files>
    - video-showcase/src/Video.tsx
    - video-showcase/src/scenes/*.tsx
  </files>
  <action>
    Review and polish all scene transitions:
    
    1. Verify frame timing in Video.tsx matches scene content
    2. Add cross-fade transitions between scenes (2-5 frames overlap)
    3. Ensure consistent animation easing (use spring() consistently)
    4. Check color consistency across all scenes
    5. Verify no jarring cuts between stylized and literal sections
    
    Polish items:
    - Add subtle vignette to all scenes
    - Ensure text is readable at all sizes
    - Verify emerald colors are consistent
    
    DO NOT add audio in this task (optional stretch goal).
  </action>
  <verify>npm run remotion -- render CloverShowcase out/full-preview.mp4 --quality=70</verify>
  <done>Full video renders smoothly with consistent transitions</done>
</task>

## Success Criteria
- [ ] Problem scene creates hook and curiosity
- [ ] All scene transitions are smooth
- [ ] Timing feels natural (not rushed, not slow)
- [ ] Color scheme is consistent throughout
- [ ] Full 90-second video renders without errors
