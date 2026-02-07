---
phase: 16
plan: 2
wave: 1
---

# Plan 16.2: Email Alerts for Significant Changes

## Objective
Implement a notification system that alerts users via email when their brand's LLM visibility metrics change significantly. This keeps users engaged and informed of critical shifts without requiring manual dashboard checks.

## Context
- .gsd/SPEC.md
- dashboard/src/lib/metrics/calculators.ts — metric calculations
- dashboard/src/lib/metrics/pipeline.ts — metric aggregation
- dashboard/src/lib/inngest/ — background job system
- dashboard/src/app/api/ — API routes
- **Email API**: [Resend](https://resend.com) (standard for Next.js, high deliverability)

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
         channel: 'email'; 
         destination: string; // recipient email address
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
       - `alerts` table with RLS for user ownership
       - `alert_logs` table for audit trail
       - Indexes on user_id, brand_id
  </action>
  <verify>Review migration file is valid SQL syntax</verify>
  <done>Types and migration file exist with correct schema</done>
</task>

<task type="auto">
  <name>Build alert evaluation and Resend integration</name>
  <files>
    dashboard/src/lib/alerts/evaluator.ts (new)
    dashboard/src/lib/alerts/sender.ts (new)
    dashboard/package.json (add resend)
  </files>
  <action>
    1. Install Resend: `npm install resend`
    
    2. Create evaluator.ts:
       - `evaluateAlerts(brandId: string, currentMetrics: Metrics, previousMetrics: Metrics): AlertTrigger[]`
       - Implements comparison logic for ASoV drop, Sentiment shift, etc.
    
    3. Create sender.ts:
       - `sendEmailAlert(to: string, subject: string, data: any): Promise<boolean>`
       - Uses `Resend` Node.js library
       - Implements a clean, emerald-themed HTML template for emails
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Alert evaluator and Resend sender functioning correctly</done>
</task>

<task type="auto">
  <name>Integrate alerts into collection flow</name>
  <files>
    dashboard/src/lib/inngest/functions.ts
    dashboard/src/app/api/alerts/route.ts (new)
  </files>
  <action>
    1. Update Inngest collection completion function:
       - Trigger evaluation after metrics are saved
       - Loop through active `AlertConfigs` for the brand
       - Dispatch emails for each trigger
       - Log results to `alert_logs`
    
    2. Create /api/alerts route for CRUD operations on alert configs.
  </action>
  <verify>npm run build</verify>
  <done>Emails trigger automatically when critical thresholds are met</done>
</task>

<task type="auto">
  <name>Create alert settings UI</name>
  <files>
    dashboard/src/app/settings/alerts/page.tsx (new)
    dashboard/src/components/alerts/alert-config-form.tsx (new)
  </files>
  <action>
    1. Create /settings/alerts page to list and manage subscriptions.
    2. Build AlertConfigForm:
       - Email destination input
       - Toggle switches for different triggers (ASoV drop, Competitor Overtake, etc.)
       - "Send Test Email" functionality
  </action>
  <verify>npm run build && navigate to /settings/alerts</verify>
  <done>Users can manage their email alert subscriptions via the UI</done>
</task>

## Success Criteria
- [ ] Users can configure thresholds for automated email alerts
- [ ] Emails are sent via Resend with professional branding
- [ ] Alert history is logged in the database
- [ ] No Slack integration code remains in the plan/deliverables
- [ ] TypeScript compiles without errors
