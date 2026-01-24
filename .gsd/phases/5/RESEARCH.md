# Phase 5 Research: Visualization Dashboard

## Objectives
Build a professional, "Clover-aligned" dashboard to visualize SEO metrics (ASoV, AIGVR, Sentiment).

## Tech Stack Decisions

### 1. Charting Library: **Recharts**
- **Why**: Native React SVG charts, highly customizable, responsive, standard for Next.js.
- **Alternatives**: Chart.js (canvas-based, harder to style reactively), Nivo (d3 wrapper, good but heavy).
- **Decision**: Use `recharts` for ASoV trends and authority heatmaps.

### 2. UI Components: **Shadcn/ui (Manual Implementation)**
- We have a basic `utils.ts` with `cn`.
- We will build reusable components following Shadcn patterns:
  - `Card` (for metric stats)
  - `Button` (already have likely, or will build)
  - `Badge` (for sentiment/status)
  - `Table` (for citations/responses)
- **Icons**: `lucide-react` (already standard in Next.js).

### 3. Layout Architecture
- **Sidebar Navigation**:
  - Dashboard (Overview)
  - Collections (Data runs)
  - Analysis (Raw results)
  - Settings
- **Header**:
  - User context (mock for now)
  - Theme toggle (optional)

## Component Hierarchy

```
Layout
├── Sidebar
└── Main Content
    ├── Header
    └── Page Content
        ├── Overview (ASoV, AIGVR Cards)
        ├── TrendChart (Recharts AreaChart)
        ├── CompetitorTable
        └── AuthorityHeatmap (Custom Grid)
```

## Data Fetching Strategy
- **Client Components**: Use SWR or React Query for live polishing?
- **Decision**: Keep it simple. Server Components for initial data, client components for interactivity.
- Use `useSWR` for periodic updates if needed, but standard `fetch` in Server Components is preferred for V1.

## Design System (Clover Alignment)
- **Colors**:
  - Primary: Indigo/Violet (AI feel)
  - Success: Emerald
  - Warning: Amber
  - Error: Rose
  - Background: Slate/Gray (Clean, SaaS B2B look)
- **Typography**: Inter (Default Next.js font)

## Verification
- Visual check of charts
- Mobile responsiveness
- Empty states (no data)
