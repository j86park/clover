# Phase 1 Research: Foundation & Infrastructure

> **Discovery Level**: Level 2 — Standard Research
> **Date**: 2026-01-21

## Summary

Phase 1 requires setting up Next.js with TypeScript, Supabase for PostgreSQL, and OpenRouter for multi-LLM access. All technologies have mature integration patterns.

---

## Next.js Setup

**Recommendation**: Use `create-next-app` with TypeScript and App Router.

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --use-npm
```

**Key decisions:**
- App Router (not Pages Router) for modern patterns
- TypeScript for type safety
- Tailwind CSS for styling (Clover likely uses similar)
- `src/` directory for cleaner organization

---

## Supabase Integration

**Recommendation**: Use `@supabase/supabase-js` v2+ with SSR helpers.

**Installation:**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Key files to create:**
- `src/lib/supabase/client.ts` — Browser client
- `src/lib/supabase/server.ts` — Server-side client
- `src/lib/supabase/middleware.ts` — Auth middleware

**Environment variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Database Schema (initial tables):**
- `brands` — Tracked brands
- `competitors` — Competitor brands per tracked brand
- `prompts` — Prompt templates with categories
- `collections` — Scheduled collection runs
- `responses` — Raw LLM responses
- `analyses` — Processed analysis results

---

## OpenRouter Integration

**Recommendation**: Use the `openai` package with OpenRouter base URL.

**Installation:**
```bash
npm install openai
```

**Configuration pattern:**
```typescript
import OpenAI from 'openai';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL,
    'X-Title': 'LLM SEO Dashboard',
  },
});
```

**Key considerations:**
- Use Route Handlers (`app/api/*/route.ts`) for API calls
- Never expose API key client-side
- Implement streaming for long responses
- Add Zod validation for request bodies

**Environment variables:**
```env
OPENROUTER_API_KEY=your-openrouter-key
```

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── llm/
│   │   │   └── route.ts          # OpenRouter proxy
│   │   └── brands/
│   │       └── route.ts          # Brand CRUD
│   ├── dashboard/
│   │   └── page.tsx              # Main dashboard
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/                       # Reusable components
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts              # Generated types
│   ├── openrouter/
│   │   ├── client.ts
│   │   └── models.ts             # Model definitions
│   └── utils.ts
└── types/
    └── index.ts                  # Shared types
```

---

## Vercel Deployment

**Configuration**: `vercel.json` not required for standard Next.js.

**Environment setup:**
- Add all env vars in Vercel dashboard
- Use Vercel Postgres OR connect to external Supabase

**Consideration**: Supabase is recommended over Vercel Postgres for:
- Better SQL editor
- Built-in auth (may need later)
- Row Level Security
- Real-time subscriptions

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| OpenRouter rate limits | Implement queue with exponential backoff |
| Supabase cold starts | Use connection pooling |
| Type drift from DB | Use Supabase CLI to generate types |

---

## Decision: Stack Confirmation

✅ **Next.js 14+** with App Router and TypeScript
✅ **Supabase** for PostgreSQL database
✅ **OpenRouter** via `openai` package for LLM access
✅ **Vercel** for hosting
✅ **Tailwind CSS** for styling (Clover-aligned)
