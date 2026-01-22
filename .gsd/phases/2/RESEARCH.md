# Phase 2 Research: Data Collection Engine

> **Discovery Level**: Level 1 — Quick Verification
> **Date**: 2026-01-21

## Summary

Phase 2 builds the prompt orchestration system that queries LLMs and stores responses. Since we already have the OpenRouter integration from Phase 1, this phase focuses on:
- Designing the prompt matrix (what questions to ask)
- Building the template engine (variable substitution)
- Creating the collection runner (orchestration)
- Storing responses in Supabase

---

## Prompt Matrix Design

The prompt matrix consists of three dimensions:

### Categories
- **Discovery**: "What is the best [X]?" type questions
- **Comparison**: "[Brand A] vs [Brand B]" questions
- **Review**: "What do people say about [Brand]?" questions

### Intent Types
| Intent | Example Template |
|--------|------------------|
| `best_in_category` | "What is the best {category} software?" |
| `brand_recommendation` | "Should I use {brand}?" |
| `brand_vs_competitor` | "How does {brand} compare to {competitor}?" |
| `brand_review` | "What are the pros and cons of {brand}?" |
| `category_leaders` | "Who are the top players in {category}?" |

### Variables
- `{brand}` — The tracked brand name
- `{category}` — The brand's category (e.g., "CRM", "email marketing")
- `{competitor}` — A competitor brand name

---

## Template Engine

Simple string interpolation using JavaScript template literals or regex replacement.

```typescript
function renderPrompt(template: string, variables: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => variables[key] || `{${key}}`);
}
```

---

## Collection Runner Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    COLLECTION RUNNER                     │
├─────────────────────────────────────────────────────────┤
│  1. Load brand + competitors from DB                    │
│  2. Load active prompts from DB                         │
│  3. Generate prompt instances (template + variables)    │
│  4. Queue prompts for each target LLM model             │
│  5. Execute with rate limiting (parallel with limits)   │
│  6. Store responses in DB                               │
│  7. Update collection status                            │
└─────────────────────────────────────────────────────────┘
```

---

## Rate Limiting Strategy

OpenRouter has per-model rate limits. Strategy:
- Use `p-limit` or similar for concurrency control
- Max 3 concurrent requests per model
- Exponential backoff on 429 errors
- Store failed requests for retry

---

## API Routes Needed

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/prompts` | GET/POST | CRUD for prompt templates |
| `/api/brands` | GET/POST | CRUD for brands |
| `/api/collections` | POST | Start a new collection run |
| `/api/collections/[id]` | GET | Get collection status/results |

---

## Decisions

✅ **Template syntax**: Use `{variable}` format (simple, readable)
✅ **Concurrency**: Use `p-limit` for rate limiting
✅ **Storage**: Use existing Supabase tables from Phase 1
✅ **Trigger**: Manual API call for MVP (scheduled cron in later phase)
