---
phase: 11
plan: 2
wave: 1
---

# Plan 11.2: Authentication UI & Onboarding

## Objective
Create the user-facing login and registration flows to enable account creation.

## Context
- dashboard/src/middleware.ts
- dashboard/src/app/layout.tsx

## Tasks

<task type="auto">
  <name>Login & Sign-Up Pages</name>
  <files>
    - c:\Users\Joonh\clover\clover\dashboard\src\app\(auth)\login\page.tsx
    - c:\Users\Joonh\clover\clover\dashboard\src\app\(auth)\signup\page.tsx
    - c:\Users\Joonh\clover\clover\dashboard\src\app\auth\callback\route.ts
  </files>
  <action>
    1. Create a modern, Clover-aligned login page with email/password support via Supabase.
    2. Create a signup page that captures basic user info.
    3. Implement the `auth/callback` route to handle email confirmation and PKCE flow.
  </action>
  <verify>Successfully sign up a new user and confirm they are redirected to the dashboard.</verify>
  <done>Users can create accounts and log in securely.</done>
</task>

<task type="auto">
  <name>Auto-Onboarding & Brand Linking</name>
  <files>
    - c:\Users\Joonh\clover\clover\dashboard\src\app\api\auth\setup-profile\route.ts
  </files>
  <action>
    1. Implement a post-signup flow (or logic in `auth/callback`) that ensures a new user has a `brands` record linked to their `user_id`.
    2. If no brand exists, create a default "My Brand" or redirect to a quick onboarding screen.
  </action>
  <verify>Check database after signup to ensure a `brands` record exists with the correct `user_id`.</verify>
  <done>Every authenticated user is correctly linked to a brand in the database.</done>
</task>

## Success Criteria
- [ ] Working /login and /signup pages.
- [ ] Secure email confirmation/callback flow.
- [ ] Automatic brand-to-user linking on first login.
