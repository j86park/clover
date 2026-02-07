---
phase: 16
plan: 4
wave: 2
---

# Plan 16.4: Competitor Watchlist

## Objective
Allow users to maintain a watchlist of competitors with quick-refresh capability. Currently, competitor data is only collected alongside full brand collections. This feature enables monitoring competitor trends independently for faster insights.

## Context
- .gsd/SPEC.md
- dashboard/src/types/index.ts — Competitor type
- dashboard/src/lib/collector/runner.ts — collection runner
- dashboard/src/app/api/brands/ — brand management routes

## Tasks

<task type="auto">
  <name>Create competitor watchlist data model</name>
  <files>
    dashboard/src/types/index.ts
    dashboard/src/lib/supabase/migrations/017_watchlist.sql (new)
  </files>
  <action>
    1. Add to types/index.ts:
       ```typescript
       export interface WatchlistEntry {
         id: string;
         user_id: string;
         competitor_name: string;
         competitor_domain?: string;
         last_checked_at?: string;
         latest_asov?: number;
         latest_aigvr?: number;
         latest_sentiment?: number;
         trend_direction?: 'up' | 'down' | 'stable';
         created_at: string;
       }
       ```
    
    2. Create SQL migration:
       - watchlist table with RLS for user ownership
       - Index on user_id for fast lookups
       - No foreign key to competitors (standalone tracking)
  </action>
  <verify>Review migration SQL syntax</verify>
  <done>Watchlist type and migration exist</done>
</task>

<task type="auto">
  <name>Build competitor quick-check API</name>
  <files>
    dashboard/src/app/api/watchlist/route.ts (new)
    dashboard/src/app/api/watchlist/check/route.ts (new)
    dashboard/src/lib/watchlist/checker.ts (new)
  </files>
  <action>
    1. Create /api/watchlist route:
       - GET: List user's watchlist entries
       - POST: Add competitor to watchlist
       - DELETE: Remove from watchlist
    
    2. Create /api/watchlist/check route:
       - POST { competitorId: string }: Run quick check for single competitor
       - Uses lightweight prompt set (3-5 prompts, 1-2 models)
       - Returns: { asov, aigvr, sentiment, checkedAt }
    
    3. Create checker.ts:
       ```typescript
       export async function quickCheckCompetitor(
         competitorName: string,
         category: string
       ): Promise<QuickCheckResult> {
         // 1. Use minimal prompt set
         const prompts = [
           `What do you think of ${competitorName}?`,
           `Would you recommend ${competitorName} for ${category}?`,
           `What are the pros and cons of ${competitorName}?`,
         ];
         
         // 2. Query single model (gpt-4o-mini for speed/cost)
         // 3. Analyze responses for mentions/sentiment
         // 4. Return aggregated result
       }
       ```
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Quick-check API returns competitor metrics in ~5 seconds</done>
</task>

<task type="auto">
  <name>Create competitor watchlist UI</name>
  <files>
    dashboard/src/app/competitors/page.tsx (new)
    dashboard/src/components/watchlist/watchlist-table.tsx (new)
    dashboard/src/components/watchlist/add-competitor-modal.tsx (new)
  </files>
  <action>
    1. Create /competitors page:
       - Table of watchlist entries
       - Columns: Name, Domain, ASoV, AIGVR, Sentiment, Last Checked, Trend
       - Row actions: Check Now, Remove
       - "Add Competitor" button opens modal
    
    2. Create WatchlistTable component:
       - Sortable columns
       - Trend indicators (↑ green, ↓ red, → gray)
       - "Check Now" button with loading spinner
       - Refresh All button
    
    3. Create AddCompetitorModal:
       - Name input (required)
       - Domain input (optional)
       - Category dropdown (from user's brand keywords)
       - "Add & Check" button
    
    4. Add "Competitors" to sidebar navigation
  </action>
  <verify>npm run build && npm run dev</verify>
  <done>/competitors page shows watchlist table with functional check buttons</done>
</task>

## Success Criteria
- [ ] Users can add competitors to watchlist independent of main brands
- [ ] "Check Now" runs quick analysis in ~5-10 seconds
- [ ] Watchlist table shows ASoV, sentiment, and trend direction
- [ ] Data persists between sessions
- [ ] TypeScript compiles without errors
