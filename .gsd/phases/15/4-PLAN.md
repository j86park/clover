---
phase: 15
plan: 4
wave: 2
---

# Plan 15.4: Stylized Scenes (Intro & Outro)

## Objective
Implement fully stylized intro and outro scenes with emerald branding and animations.

## Context
- .gsd/phases/15/1-PLAN.md (completed)
- .gsd/phases/15/2-PLAN.md (completed)
- .gsd/phases/15/3-PLAN.md (completed)
- video-showcase/src/components/

## Tasks

<task type="auto">
  <name>Implement IntroScene</name>
  <files>
    - video-showcase/src/scenes/IntroScene.tsx
  </files>
  <action>
    Create engaging intro scene (5 seconds / 150 frames):
    
    Visual elements:
    1. Dark slate background with subtle emerald gradient
    2. Animated particles/dots floating upward (emerald colored)
    3. Clover logo fade-in with scale (frames 0-60)
    4. Logo pulse glow effect (frames 60-90)
    5. Tagline "AI Visibility & Distribution" typewriter (frames 90-150)
    
    Use:
    - BrandLogo component for logo
    - GlowEffect for emerald glow
    - AnimatedText for tagline
    - Custom particle animation with useCurrentFrame
    
    Ensure smooth transitions and premium feel.
  </action>
  <verify>npm run remotion -- render CloverShowcase --frames=0-150 out/intro-test.mp4 --quality=50</verify>
  <done>Intro renders with logo, glow, and tagline appearing in sequence</done>
</task>

<task type="auto">
  <name>Implement OutroScene</name>
  <files>
    - video-showcase/src/scenes/OutroScene.tsx
  </files>
  <action>
    Create call-to-action outro scene (10 seconds / 300 frames):
    
    Visual elements:
    1. Emerald gradient background (animated, subtle movement)
    2. Main CTA text: "Optimize Your AI Presence" (fade in, frames 0-60)
    3. Secondary text: "with Clover" (typewriter, frames 60-120)
    4. Clover logo fade in below text (frames 120-180)
    5. Website/contact info fade in (frames 180-240)
    6. Final glow pulse effect (frames 240-300)
    
    Use emerald glow effects extensively for premium feel.
    End with strong visual that lingers.
  </action>
  <verify>npm run remotion -- render CloverShowcase --frames=2400-2700 out/outro-test.mp4 --quality=50</verify>
  <done>Outro renders with CTA, logo, and contact info sequence</done>
</task>

## Success Criteria
- [ ] Intro scene has animated logo with emerald glow
- [ ] Intro tagline appears with typewriter effect
- [ ] Outro has clear call-to-action messaging
- [ ] Both scenes use consistent emerald theme
- [ ] Animations are smooth and professional
