---
phase: 16
plan: 2
wave: 1
---

# Plan 16.2: Email/Slack Alerts for Significant Changes

## Objective
Implement a notification system that alerts users when their brand's LLM visibility metrics change significantly. This keeps users engaged without requiring daily dashboard visits.

## Context
- .gsd/SPEC.md
- dashboard/src/lib/metrics/calculators.ts — metric calculations
- dashboard/src/lib/metrics/pipeline.ts — metric aggregation
- dashboard/src/lib/inngest/ — background job system
- dashboard/src/app/api/ — API routes

## Tasks

<task type="auto">
  <name>Create alert configuration schema and types</name>
  <files>
    dashboard/src/types/alerts.ts (new)
    dashboard/src/lib/supabase/migrations/016_alerts.sql (new)
  </files>
  <action>
    1. Create alerts.ts types:
       ```typescript
       export interface AlertConfig {
         id: string;
         user_id: string;
         brand_id: string;
         channel: 'email' | 'slack';
         // Slack webhook URL or email address
         destination: string;
         // Alert triggers
         triggers: {
           asov_drop_percent?: number;      // e.g., 10 = alert if drops 10%
           competitor_overtake?: boolean;   // alert if competitor beats you
           sentiment_negative?: boolean;    // alert if sentiment turns negative
           new_citation_source?: boolean;   // alert on new citation detected
         };
         is_active: boolean;
         created_at: string;
         last_triggered_at?: string;
       }
       
       export interface AlertLog {
         id: string;
         alert_config_id: string;
         trigger_type: string;
         message: string;
         sent_at: string;
         status: 'sent' | 'failed';
       }
       ```
    
    2. Create SQL migration:
       - alerts table with RLS for user ownership
       - alert_logs table for audit trail
       - Indexes on user_id, brand_id
  </action>
  <verify>Review migration file is valid SQL syntax</verify>
  <done>Types and migration file exist with correct schema</done>
</task>

<task type="auto">
  <name>Build alert evaluation engine</name>
  <files>
    dashboard/src/lib/alerts/evaluator.ts (new)
    dashboard/src/lib/alerts/sender.ts (new)
    dashboard/src/lib/alerts/index.ts (new)
  </files>
  <action>
    1. Create evaluator.ts:
       - evaluateAlerts(brandId: string, currentMetrics: Metrics, previousMetrics: Metrics): AlertTrigger[]
       - Check each trigger condition:
         - ASoV drop: (previous.asov - current.asov) / previous.asov * 100 > threshold
         - Competitor overtake: compare current ranks
         - Sentiment negative: current.sentiment_score < 0 when previous >= 0
         - New citation: compare citation sources between collections
    
    2. Create sender.ts:
       - sendEmailAlert(to: string, subject: string, body: string): Promise<boolean>
       - sendSlackAlert(webhookUrl: string, message: object): Promise<boolean>
       - Use fetch() for Slack webhook
       - Use Resend or console.log placeholder for email (MVP)
    
    3. Create index.ts to export all
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Alert evaluator correctly identifies trigger conditions</done>
</task>

<task type="auto">
  <name>Integrate alerts into collection completion flow</name>
  <files>
    dashboard/src/lib/inngest/functions.ts
    dashboard/src/app/api/alerts/route.ts (new)
  </files>
  <action>
    1. Update Inngest function that runs after collection completes:
       - After metrics are calculated, call evaluateAlerts()
       - For each triggered alert, call sender
       - Log to alert_logs table
    
    2. Create /api/alerts route:
       - GET: List user's alert configs
       - POST: Create new alert config
       - PATCH: Update existing config
       - DELETE: Deactivate config
  </action>
  <verify>npm run build</verify>
  <done>Alerts trigger automatically when collection completes with significant changes</done>
</task>

<task type="auto">
  <name>Create alert settings UI</name>
  <files>
    dashboard/src/app/settings/alerts/page.tsx (new)
    dashboard/src/components/alerts/alert-config-form.tsx (new)
  </files>
  <action>
    1. Create /settings/alerts page:
       - List existing alert configurations
       - Show last triggered time
       - Toggle enable/disable
       - Delete button
    
    2. Create AlertConfigForm component:
       - Channel selector (Email/Slack)
       - Destination input (email or webhook URL)
       - Trigger checkboxes with threshold inputs
       - Save and test buttons
    
    3. Add "Alerts" link to /settings page nav
  </action>
  <verify>npm run build && navigate to /settings/alerts in browser</verify>
  <done>/settings/alerts page allows configuring email/Slack notifications</done>
</task>

## Success Criteria
- [ ] Users can configure alerts for ASoV drops, competitor overtakes, sentiment changes
- [ ] Slack webhook integration works (send test message)
- [ ] Email placeholder logs message (or Resend integration if API key available)
- [ ] Alert logs are persisted to database
- [ ] TypeScript compiles without errors
