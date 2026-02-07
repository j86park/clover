---
phase: 18
plan: 4
wave: 1
depends_on: []
files_modified:
  - src/lib/supabase/migrations/018_schedules.sql
  - src/types/index.ts
  - src/lib/inngest/scheduled-collection.ts
  - src/app/api/schedules/route.ts
  - src/components/settings/schedule-settings.tsx
  - src/app/settings/schedules/page.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Users can configure daily/weekly collection schedules"
    - "Inngest cron executes collections automatically"
    - "Schedule status visible in settings"
  artifacts:
    - "schedules table exists with user_id and cron_expression"
    - "Inngest function runs on schedule"
---

# Plan 18.4: Scheduled Collections

<objective>
Enable automated daily/weekly data collection runs so users don't need to manually trigger collections. Hands-off monitoring becomes possible.

Purpose: Transform from manual tool to automated monitoring system.
Output: User-configurable schedules with Inngest cron execution.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- src/lib/inngest/client.ts (existing Inngest setup)
- src/lib/inngest/functions.ts (existing functions)
- src/app/api/collections/route.ts (collection triggering)
</context>

<tasks>

<task type="auto">
  <name>Create schedule data model and Inngest function</name>
  <files>
    src/lib/supabase/migrations/018_schedules.sql
    src/types/index.ts
    src/lib/inngest/scheduled-collection.ts
    src/lib/inngest/index.ts
  </files>
  <action>
    Create SQL migration for schedules table:
    - id, user_id (FK), brand_id (FK)
    - schedule_type: 'daily' | 'weekly' | 'custom'
    - cron_expression: string (for custom)
    - time_utc: string (HH:MM)
    - day_of_week: int (for weekly, 0-6)
    - is_active: boolean
    - last_run_at, next_run_at
    - created_at, updated_at
    - RLS policies for user ownership
    
    Add `CollectionSchedule` type to types/index.ts.
    
    Create Inngest function `scheduled-collection`:
    - Triggered by cron: Run every 15 minutes
    - Query schedules where next_run_at <= now() AND is_active = true
    - For each, trigger collection and update last_run_at, next_run_at
    
    Register in inngest/index.ts exports.
    
    AVOID: Per-user cron jobs (expensive) — single cron checks all schedules.
  </action>
  <verify>npx tsc --noEmit passes</verify>
  <done>Schedule model and Inngest function ready for cron execution</done>
</task>

<task type="auto">
  <name>Build schedule management API and UI</name>
  <files>
    src/app/api/schedules/route.ts
    src/components/settings/schedule-settings.tsx
    src/app/settings/schedules/page.tsx
    src/app/settings/page.tsx
  </files>
  <action>
    Create API endpoints:
    - GET /api/schedules: List user's schedules
    - POST /api/schedules: Create schedule { type, time_utc, day_of_week? }
    - DELETE /api/schedules/[id]: Remove schedule
    - PATCH /api/schedules/[id]: Toggle active, update time
    
    Create `ScheduleSettings` component:
    - Toggle: Enable automated collections
    - Frequency selector: Daily | Weekly | Custom
    - Time picker for run time (in user's timezone, convert to UTC)
    - Day selector for weekly
    - Show next scheduled run
    - Status: Last run date/time, success/failure
    
    Create /settings/schedules page, link from main settings.
    
    AVOID: Complex timezone handling — store UTC, display local.
  </action>
  <verify>npm run build passes, /settings/schedules accessible</verify>
  <done>Users can enable daily/weekly automated collections</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Schedule saves to database correctly
- [ ] Inngest function queries due schedules
- [ ] UI shows correct next run time
- [ ] Toggle active/inactive works
</verification>

<success_criteria>
- [ ] User can set daily 9am collection
- [ ] User can set weekly Monday collection
- [ ] Schedule status visible in settings
- [ ] Build compiles successfully
</success_criteria>
