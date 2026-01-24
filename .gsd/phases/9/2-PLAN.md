---
phase: 9
plan: 2
wave: 1
---

# Plan 9.2: Async Job Queue (Inngest)

## Objective
Implement Inngest to handle data collection jobs asynchronously, preventing Vercel serverless timeouts.

## Context
- `dashboard/src/app/api/collections/route.ts`
- `dashboard/src/lib/collector/runner.ts`
- `.gsd/phases/9/RESEARCH.md`

## Tasks

<task type="auto">
  <name>Install Inngest</name>
  <files>
    c:/Users/Joonh/clover/clover/dashboard/package.json
  </files>
  <action>
    Run `npm install inngest` in the dashboard directory.
  </action>
  <verify>
    grep "inngest" c:/Users/Joonh/clover/clover/dashboard/package.json
  </verify>
  <done>
    Inngest installed.
  </done>
</task>

<task type="auto">
  <name>Setup Inngest Client & Route</name>
  <files>
    c:/Users/Joonh/clover/clover/dashboard/src/lib/inngest/client.ts
    c:/Users/Joonh/clover/clover/dashboard/src/app/api/inngest/route.ts
  </files>
  <action>
    1. Create `src/lib/inngest/client.ts`: Initialize Inngest client with ID "clover-dashboard".
    2. Create `src/app/api/inngest/route.ts`: Export { GET, POST, PUT } from serve().
  </action>
  <verify>
    Test-Path c:/Users/Joonh/clover/clover/dashboard/src/app/api/inngest/route.ts
  </verify>
  <done>
    Route handler exists.
  </done>
</task>

<task type="auto">
  <name>Create Collection Function</name>
  <files>
    c:/Users/Joonh/clover/clover/dashboard/src/lib/inngest/functions/collection.ts
    c:/Users/Joonh/clover/clover/dashboard/src/lib/collector/runner.ts
  </files>
  <action>
    1. Create `src/lib/inngest/functions/collection.ts` defining `collection.start` event.
    2. Move logic from `runner.ts` (or import it) into the Inngest function.
    3. Ensure the function runs the collection logic (calling `queryLLM` etc).
    4. Register this function in `src/app/api/inngest/route.ts`.
  </action>
  <verify>
    grep "createFunction" c:/Users/Joonh/clover/clover/dashboard/src/lib/inngest/functions/collection.ts
  </verify>
  <done>
    Function created and registered.
  </done>
</task>

<task type="auto">
  <name>Refactor API Trigger</name>
  <files>
    c:/Users/Joonh/clover/clover/dashboard/src/app/api/collections/route.ts
  </files>
  <action>
    Modify POST handler to:
    1. Validate input (keep existing zod logic).
    2. Instead of `await runCollection()`, call `inngest.send({ name: 'collection.start', data: ... })`.
    3. Return success immediately.
  </action>
  <verify>
    grep "inngest.send" c:/Users/Joonh/clover/clover/dashboard/src/app/api/collections/route.ts
  </verify>
  <done>
    API triggers event instead of running logic.
  </done>
</task>

<task type="checkpoint:human-verify">
  <name>Start Inngest Server (Manual)</name>
  <files>
    c:/Users/Joonh/clover/clover/dashboard/package.json
  </files>
  <action>
    To verify execution locally:
    1. Run `npx inngest-cli@latest dev` in a separate terminal.
    2. Ensure your Next.js app is running (`npm run dev`).
    3. Visit http://localhost:8288 to see the Inngest dashboard.
  </action>
  <verify>
    Inngest dashboard loads.
  </verify>
  <done>
    Dev server running.
  </done>
</task>

## Success Criteria
- [ ] Inngest installed and configured
- [ ] API Route responds immediately
- [ ] Background job handles the collection logic
