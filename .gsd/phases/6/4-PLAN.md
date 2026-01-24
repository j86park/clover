---
phase: 6
plan: 4
wave: 2
---

# Plan 6.4: Admin Dashboard & Usage Tracking

## Objective
Build admin interface for API key management and implement usage tracking per API key.

## Context
- dashboard/src/app/ (Existing dashboard pages)
- dashboard/src/lib/api/auth.ts (Key generation)
- dashboard/src/components/ui/ (UI components)

## Tasks

<task type="auto">
  <name>Create Usage Tracking System</name>
  <files>dashboard/src/lib/supabase/migrations/api_usage.sql, dashboard/src/lib/api/usage.ts, dashboard/src/types/index.ts</files>
  <action>
    1. Create api_usage table migration:
    ```sql
    CREATE TABLE api_usage (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      api_key_id UUID NOT NULL REFERENCES api_keys(id),
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      response_time_ms INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX idx_api_usage_key ON api_usage(api_key_id);
    CREATE INDEX idx_api_usage_date ON api_usage(created_at);
    ```
    
    2. Create usage.ts:
       - trackUsage(keyId, endpoint, method, status, responseTime)
       - getUsageStats(keyId, startDate, endDate)
       - getUsageSummary(keyId) - Returns total calls, avg response time
       
    3. Update middleware to call trackUsage after each request
  </action>
  <verify>Build passes, usage tracking imports correctly</verify>
  <done>Usage tracking records API calls</done>
</task>

<task type="auto">
  <name>Create Settings Page with API Key Management</name>
  <files>dashboard/src/app/settings/page.tsx, dashboard/src/app/settings/api-keys/page.tsx, dashboard/src/components/settings/api-key-list.tsx, dashboard/src/components/settings/create-key-dialog.tsx</files>
  <action>
    Build settings UI for API key management:
    
    1. settings/page.tsx:
       - Navigation to API Keys, Usage, etc.
       
    2. settings/api-keys/page.tsx:
       - List all API keys for current user/brand
       - Show: name, key prefix, created date, last used, status
       - Actions: Create, Revoke, View Usage
       
    3. api-key-list.tsx:
       - Table component for displaying keys
       - Status badges (active/revoked/expired)
       - Delete confirmation
       
    4. create-key-dialog.tsx:
       - Form: name, permissions (checkboxes), expiration (optional)
       - On create: Show full key ONCE with copy button
       - Warning: "This key will not be shown again"
  </action>
  <verify>Navigate to /settings/api-keys, page renders</verify>
  <done>API key management UI functional</done>
</task>

<task type="auto">
  <name>Create Usage Dashboard</name>
  <files>dashboard/src/app/settings/usage/page.tsx, dashboard/src/components/settings/usage-chart.tsx</files>
  <action>
    Build usage analytics view:
    
    1. settings/usage/page.tsx:
       - Select API key dropdown
       - Date range picker (last 7 days, 30 days, custom)
       - Usage statistics cards (total calls, avg response time, error rate)
       - Usage chart (calls over time)
       
    2. usage-chart.tsx:
       - Line chart using Recharts (already installed)
       - X-axis: time
       - Y-axis: request count
       - Tooltip with details
  </action>
  <verify>Navigate to /settings/usage, page renders with chart</verify>
  <done>Usage dashboard displays analytics</done>
</task>

## Success Criteria
- [ ] Usage tracking records all API calls
- [ ] API key management page accessible
- [ ] Can create new API keys
- [ ] Can revoke existing keys
- [ ] Usage dashboard shows call statistics
- [ ] Build passes
