---
phase: 18
plan: 5
wave: 2
depends_on: ["18.1", "18.2"]
files_modified:
  - src/lib/query/nl-parser.ts
  - src/lib/query/sql-generator.ts
  - src/lib/query/result-formatter.ts
  - src/app/api/query/route.ts
  - src/components/query/query-interface.tsx
  - src/app/query/page.tsx
  - src/components/layout/sidebar.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Users can ask questions in plain English"
    - "System generates safe read-only SQL"
    - "Results formatted as natural language + data"
  artifacts:
    - "nl-parser.ts exports parseQuery"
    - "/query page with chat-like interface"
---

# Plan 18.5: Natural Language Query Interface

<objective>
Let power users ask questions about their data in plain English, getting quick answers without navigating dashboards. "What was my best week?" "Which model likes us most?"

Purpose: Democratize data access for non-technical users and speed up power user workflows.
Output: Chat-like query interface at /query with natural language to SQL.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- src/lib/supabase/server.ts (database access)
- src/lib/openrouter/client.ts (LLM client)
- Database schema from migrations
</context>

<tasks>

<task type="auto">
  <name>Create natural language query engine</name>
  <files>
    src/lib/query/nl-parser.ts
    src/lib/query/sql-generator.ts
    src/lib/query/result-formatter.ts
    src/types/index.ts
  </files>
  <action>
    Create `nl-parser.ts`:
    - Parse question to identify: metric type, time range, comparison, entity
    - `QueryIntent` interface: { metricType, timeRange, comparison, filters }
    - `parseQueryIntent(question: string, brandId: string)`: Use GPT-4o to extract intent
    
    Create `sql-generator.ts`:
    - `generateSafeSQL(intent: QueryIntent, userId: string)`:
      - Build READ-ONLY SQL from intent
      - Always include user_id/brand_id filter for security
      - Constrain to allowed tables: responses, analysis, metrics_daily, brands, competitors
      - Use parameterized queries, no raw string interpolation
    - `ALLOWED_QUERIES` whitelist of query patterns
    
    Create `result-formatter.ts`:
    - `formatQueryResult(data: any[], question: string)`: 
      - Use LLM to generate natural language summary
      - Include relevant data in structured format
    
    Add `QueryResult` type to types/index.ts.
    
    SECURITY: Read-only views only. No mutations. Always filter by user ownership.
    
    AVOID: Arbitrary SQL — use intent-based query templates, not raw generation.
  </action>
  <verify>npx tsc --noEmit passes</verify>
  <done>Query engine parses NL, generates safe SQL, formats results</done>
</task>

<task type="auto">
  <name>Build query interface UI</name>
  <files>
    src/app/api/query/route.ts
    src/components/query/query-interface.tsx
    src/app/query/page.tsx
    src/components/layout/sidebar.tsx
  </files>
  <action>
    Create POST endpoint /api/query:
    - Authenticate user
    - Rate limit: 10 queries per minute
    - Call parseQueryIntent → generateSafeSQL → execute → formatResult
    - Return { answer: string, data: any[], sql: string (debug mode only) }
    
    Create `QueryInterface` component:
    - Chat-like interface with message history
    - Input field with "Ask a question" placeholder
    - Example questions shown initially:
      - "What was my best performing week?"
      - "Which LLM model recommends me most?"
      - "Compare my visibility vs [Competitor]"
      - "What topics am I missing?"
    - Response: natural language + data table if applicable
    - Loading state during query processing
    
    Create /query page with QueryInterface.
    
    Add "Ask Data" to sidebar nav with MessageSquare icon.
  </action>
  <verify>npm run build passes, /query page accepts and answers questions</verify>
  <done>Users can ask natural language questions and get formatted answers</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] "What was my best week?" returns valid answer
- [ ] SQL is read-only and user-scoped
- [ ] Rate limiting prevents abuse
- [ ] Unknown questions handled gracefully
</verification>

<success_criteria>
- [ ] Natural language questions work for common queries
- [ ] Security: Only user's own data accessible
- [ ] Results include both prose and data
- [ ] Build compiles successfully
</success_criteria>
