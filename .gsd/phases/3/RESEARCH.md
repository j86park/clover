# Phase 3 Research: Analysis Engine (NER & Sentiment)

> **Discovery Level**: Level 2 — Standard Research
> **Date**: 2026-01-21

## Summary

Phase 3 extracts insights from raw LLM responses. Key challenges:
1. **Brand Extraction (NER)**: Identify brand mentions in unstructured text
2. **Sentiment Analysis**: Determine if mentions are positive/neutral/negative
3. **Citation Extraction**: Parse URLs and sources from responses
4. **Source Classification**: Categorize sources as owned/earned/external

---

## Approach Decision: LLM-Based Analysis

Given the SPEC requirement to leverage LLMs and the complexity of brand NER (brand names are often common words like "Notion", "Slack", "Zoom"), we'll use **LLM-based extraction** rather than traditional NER models.

### Why LLM over spaCy/Traditional NER:

| Approach | Pros | Cons |
|----------|------|------|
| **LLM-based** | Understands context, handles ambiguous brand names, can follow instructions | Slower, costs money per call |
| **spaCy NER** | Fast, free, works offline | Poor on brand names, needs training data |
| **Regex** | Fast, deterministic | No context understanding, high false positives |

**Decision**: Use **LLM-as-analyzer** approach. Query a smaller/faster model (GPT-4o-mini or Claude Haiku) with structured output prompts.

---

## Analysis Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ANALYSIS PIPELINE                         │
├─────────────────────────────────────────────────────────────┤
│  Input: Raw LLM response text                                │
│                                                              │
│  1. Brand Extraction                                         │
│     → Query LLM: "Extract all brand/product mentions"        │
│     → Return: [{name, context, isRecommended}]               │
│                                                              │
│  2. Sentiment Analysis                                       │
│     → For each brand mention                                 │
│     → Query LLM: "What is the sentiment of this mention?"    │
│     → Return: positive | neutral | negative                  │
│                                                              │
│  3. Citation Extraction                                      │
│     → Regex for URLs                                         │
│     → LLM for source attribution                             │
│     → Return: [{url, domain, type}]                          │
│                                                              │
│  4. Source Classification                                    │
│     → Match domain against brand's owned domains             │
│     → Classify: owned | earned | external                    │
│                                                              │
│  Output: AnalysisResult stored in DB                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Structured Output with Zod

Use Zod schemas for LLM structured output:

```typescript
const BrandMentionSchema = z.object({
  brand_name: z.string(),
  context: z.string().describe("The sentence/phrase mentioning this brand"),
  is_recommended: z.boolean().describe("Is this brand recommended?"),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  position: z.number().describe("Order of mention (1 = first mentioned)"),
});

const AnalysisResultSchema = z.object({
  mentions: z.array(BrandMentionSchema),
  citations: z.array(z.object({
    url: z.string(),
    domain: z.string(),
    source_type: z.enum(['owned', 'earned', 'external']),
  })),
  summary: z.string().describe("One-line summary of the response"),
});
```

---

## Database Schema Addition

New table for storing analysis results:

```sql
CREATE TABLE analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
  mentions JSONB NOT NULL DEFAULT '[]',
  citations JSONB NOT NULL DEFAULT '[]',
  summary TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analysis_response ON analysis(response_id);
```

---

## Decisions

✅ **LLM-based extraction**: More accurate for brand names than regex/spaCy
✅ **Structured output**: Use Zod schemas for type-safe parsing
✅ **Batch processing**: Analyze multiple responses per API call when possible
✅ **Caching**: Cache analysis results to avoid re-processing
