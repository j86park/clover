---
phase: 15
plan: 2
wave: 1
---

# Plan 15.2: Video Composition Structure

## Objective
Create the main composition file and scene component stubs that define the video structure.

## Context
- .gsd/phases/15/1-PLAN.md (completed)
- video-showcase/src/styles/theme.ts

## Tasks

<task type="auto">
  <name>Create Main Composition (Root.tsx)</name>
  <files>
    - video-showcase/src/Root.tsx
    - video-showcase/src/Video.tsx
  </files>
  <action>
    Update Root.tsx to define main composition:
    
    ```tsx
    import { Composition } from 'remotion';
    import { CloverShowcase } from './Video';
    
    export const RemotionRoot = () => {
      return (
        <Composition
          id="CloverShowcase"
          component={CloverShowcase}
          durationInFrames={2700} // 90 seconds at 30fps
          fps={30}
          width={1920}
          height={1080}
        />
      );
    };
    ```
    
    Create Video.tsx as main sequence orchestrator:
    - Import all scenes
    - Use <Series> to sequence scenes
    - Define frame ranges per scene:
      - Intro: 0-150 (5s)
      - Problem: 150-450 (10s)
      - DataCollection: 450-900 (15s)
      - Analysis: 900-1350 (15s)
      - Dashboard: 1350-1950 (20s)
      - Testing: 1950-2400 (15s)
      - Outro: 2400-2700 (10s)
  </action>
  <verify>Get-Content video-showcase/src/Root.tsx; Get-Content video-showcase/src/Video.tsx</verify>
  <done>Root.tsx and Video.tsx exist with composition and sequence structure</done>
</task>

<task type="auto">
  <name>Create Scene Component Stubs</name>
  <files>
    - video-showcase/src/scenes/IntroScene.tsx
    - video-showcase/src/scenes/ProblemScene.tsx
    - video-showcase/src/scenes/DataCollectionScene.tsx
    - video-showcase/src/scenes/AnalysisScene.tsx
    - video-showcase/src/scenes/DashboardScene.tsx
    - video-showcase/src/scenes/TestingScene.tsx
    - video-showcase/src/scenes/OutroScene.tsx
    - video-showcase/src/scenes/index.ts
  </files>
  <action>
    Create stub components for each scene with:
    - Basic AbsoluteFill container with theme background
    - Placeholder text showing scene name
    - Export from index.ts barrel file
    
    Each scene should accept `style?: React.CSSProperties` prop.
    Use theme colors for backgrounds (dark slate).
  </action>
  <verify>Get-ChildItem video-showcase/src/scenes/</verify>
  <done>All 7 scene files exist plus index.ts barrel export</done>
</task>

## Success Criteria
- [ ] Root.tsx registers CloverShowcase composition
- [ ] Video.tsx sequences all scenes with correct timing
- [ ] All scene stubs render without errors
- [ ] Remotion Studio shows 90-second video with scene placeholders
