---
phase: 8
plan: 3
wave: 2
---

# Plan 8.3: User Onboarding Flow

## Objective
Create a minimal onboarding experience that guides new users through initial setup and explains the dashboard's key features.

## Context
- dashboard/src/app/page.tsx — Current home page
- dashboard/src/components/ui/ — UI components

## Tasks

<task type="auto">
  <name>Create welcome/onboarding page</name>
  <files>
    dashboard/src/app/onboarding/page.tsx (NEW)
    dashboard/src/app/onboarding/layout.tsx (NEW)
  </files>
  <action>
    Create a simple onboarding flow:
    
    1. Welcome step: Explain what the dashboard does
       - "Track your brand's AI visibility"
       - Key features: ASoV, AIGVR, Citation tracking
    
    2. Setup step: Link to create first brand
       - Button to /brands/new (or existing brand setup)
    
    3. Use existing Card/Button components
    4. Clean, simple design
    
    Note: This is MVP onboarding. Advanced wizard deferred.
  </action>
  <verify>npm run build && npm run dev (navigate to /onboarding)</verify>
  <done>Onboarding page accessible at /onboarding</done>
</task>

<task type="auto">
  <name>Add first-run detection</name>
  <files>
    dashboard/src/app/page.tsx (UPDATE)
  </files>
  <action>
    On the home page:
    
    1. Check if user has any brands configured
       - If no brands: Show "Get Started" CTA linking to /onboarding
       - If brands exist: Show normal dashboard content
    
    2. Use simple conditional rendering
    3. Keep logic minimal (no complex state)
  </action>
  <verify>npm run build</verify>
  <done>Home page conditionally shows onboarding prompt for new users</done>
</task>

## Success Criteria
- [ ] Onboarding page exists at /onboarding
- [ ] Home page shows "Get Started" for users without brands
