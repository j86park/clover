---
phase: 18
plan: 3
wave: 2
depends_on: ["18.1", "18.2"]
files_modified:
  - src/lib/visualization/citation-network.ts
  - src/app/api/citations/network/route.ts
  - src/components/visualization/citation-graph.tsx
  - src/app/citations/page.tsx
  - src/components/layout/sidebar.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Interactive node graph shows sources → brand mentions"
    - "Nodes filterable by owned/earned/external"
    - "Click on node shows specific responses"
  artifacts:
    - "citation-graph.tsx renders interactive network"
    - "/citations page accessible from sidebar"
---

# Plan 18.3: Citation Network Visualization

<objective>
Create an interactive graph showing which sources cite the user's brand, helping them understand their earned media footprint in AI citations.

Purpose: Visual understanding of citation ecosystem — who talks about you and how.
Output: Interactive node graph at /citations with filtering and drill-down.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- src/lib/analysis/citations.ts (citation extraction)
- src/lib/analysis/classifier.ts (source type classification)
- src/types/analysis.ts
</context>

<tasks>

<task type="auto">
  <name>Create citation network data builder</name>
  <files>
    src/lib/visualization/citation-network.ts
    src/types/index.ts
  </files>
  <action>
    Create `citation-network.ts` with:
    - `NetworkNode` interface: { id, type: 'source' | 'brand', label, sourceType?: 'owned' | 'earned' | 'external', mentionCount, domain }
    - `NetworkEdge` interface: { source, target, weight, responseIds: string[] }
    - `buildCitationNetwork(brandId: string)`:
      1. Fetch all citations for brand's responses
      2. Create nodes for each unique domain + brand node
      3. Create edges from domain → brand with weight = mention count
      4. Classify each domain as owned/earned/external
      5. Return { nodes, edges, stats }
    
    Include stats: total sources, by type counts, top sources.
    
    AVOID: Too many nodes — aggregate by domain, not URL.
  </action>
  <verify>npx tsc --noEmit passes</verify>
  <done>buildCitationNetwork returns graph-ready data structure</done>
</task>

<task type="auto">
  <name>Build citation network visualization</name>
  <files>
    src/app/api/citations/network/route.ts
    src/components/visualization/citation-graph.tsx
    src/app/citations/page.tsx
    src/components/layout/sidebar.tsx
  </files>
  <action>
    Create GET endpoint /api/citations/network:
    - Authenticate user, get brand
    - Return network data with nodes and edges
    
    Create `CitationGraph` component using react-force-graph-2d or similar:
    - Nodes colored by type: owned (green), earned (blue), external (gray)
    - Edge thickness = mention count
    - Brand node centered, larger
    - Hover shows domain name and count
    - Click opens panel with specific responses
    - Filter buttons: All | Owned | Earned | External
    
    Create /citations page:
    - Header with stats summary
    - CitationGraph component
    - Side panel for response details
    
    Add "Citations" to sidebar nav with Link icon.
    
    AVOID: Canvas performance issues — limit to top 50 sources if more.
  </action>
  <verify>npm run build passes, /citations page renders graph</verify>
  <done>Interactive citation network shows source relationships visually</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Graph renders with nodes and edges
- [ ] Filter by source type works
- [ ] Click on node shows relevant responses
- [ ] Performance acceptable with 50+ nodes
</verification>

<success_criteria>
- [ ] Visual network of sources citing brand
- [ ] Source type filtering works
- [ ] Drill-down to specific responses
- [ ] Build compiles successfully
</success_criteria>
