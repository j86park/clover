---
phase: 15
plan: 5
wave: 3
---

# Plan 15.5: Hybrid Feature Scenes (Data & Analysis)

## Objective
Implement hybrid scenes that combine stylized animations with dashboard screenshots for Data Collection and Analysis features.

## Context
- .gsd/phases/15/3-PLAN.md (completed)
- .gsd/phases/15/4-PLAN.md (completed)
- video-showcase/src/components/
- video-showcase/public/ (screenshots will be added here)

## Tasks

<task type="checkpoint:human-verify">
  <name>Capture Dashboard Screenshots</name>
  <files>
    - video-showcase/public/screenshots/data-collection.png
    - video-showcase/public/screenshots/analysis-results.png
  </files>
  <action>
    User must capture dashboard screenshots:
    
    1. Data Collection Screenshot (1920x1080):
       - Navigate to prompt configuration page
       - Show LLM provider selection (OpenAI, Anthropic, Google, Perplexity)
       - Capture with emerald theme active
    
    2. Analysis Results Screenshot (1920x1080):
       - Navigate to analysis results page
       - Show NER extraction table with brand mentions
       - Show sentiment indicators
       - Capture with emerald theme active
    
    Save to video-showcase/public/screenshots/
  </action>
  <verify>Test-Path video-showcase/public/screenshots/data-collection.png</verify>
  <done>Both screenshots exist at 1920x1080 resolution</done>
</task>

<task type="auto">
  <name>Implement DataCollectionScene</name>
  <files>
    - video-showcase/src/scenes/DataCollectionScene.tsx
  </files>
  <action>
    Create hybrid scene (15 seconds / 450 frames):
    
    Part 1 - Stylized (frames 0-200):
    - NetworkGraph showing Clover hub connecting to LLM nodes
    - Animated "pulse" effects on connections
    - Labels: "GPT-4", "Claude", "Gemini", "Perplexity"
    
    Part 2 - Transition (frames 200-250):
    - Network graph zooms/morphs into dashboard
    - Cross-fade effect
    
    Part 3 - Literal (frames 250-450):
    - Dashboard screenshot with Ken Burns effect (slow zoom)
    - Highlight boxes appearing on key areas
    - Subtle floating annotations
    
    Use Img component from remotion for screenshots.
  </action>
  <verify>Get-Content video-showcase/src/scenes/DataCollectionScene.tsx</verify>
  <done>Scene alternates between stylized network and dashboard screenshot</done>
</task>

<task type="auto">
  <name>Implement AnalysisScene</name>
  <files>
    - video-showcase/src/scenes/AnalysisScene.tsx
  </files>
  <action>
    Create hybrid scene (15 seconds / 450 frames):
    
    Part 1 - Stylized (frames 0-200):
    - Text block appearing with simulated "processing"
    - NER extraction animation (text highlighting words)
    - Words flying out and categorizing (brand, sentiment, etc.)
    
    Part 2 - Transition (frames 200-250):
    - Extracted entities consolidate into table layout
    
    Part 3 - Literal (frames 250-450):
    - Analysis results screenshot
    - Smooth pan across the data
    - MetricCard overlays showing key stats
    
    Focus on showing the "magic" of NER extraction visually.
  </action>
  <verify>Get-Content video-showcase/src/scenes/AnalysisScene.tsx</verify>
  <done>Scene shows text extraction animation transitioning to real results</done>
</task>

## Success Criteria
- [ ] Screenshots captured and placed in public/screenshots/
- [ ] DataCollectionScene shows network graph → dashboard transition
- [ ] AnalysisScene shows NER extraction animation → results table
- [ ] Transitions between stylized and literal are smooth
- [ ] Ken Burns effect applied to screenshots
