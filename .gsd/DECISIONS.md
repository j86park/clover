# DECISIONS.md — Architecture Decision Records

## Format

Each decision follows this structure:

```
### ADR-XXX: [Title]
**Date:** YYYY-MM-DD  
**Status:** Proposed | Accepted | Deprecated  
**Context:** Why we needed to decide  
**Decision:** What we decided  
**Consequences:** What this means  
```

---

## Decisions

### ADR-001: Use OpenRouter for LLM Access
**Date:** 2026-01-21  
**Status:** Accepted  
**Context:** Need to query multiple LLMs (GPT-4, Claude, Gemini, Perplexity). Direct API integration with each provider would require multiple API keys and different client libraries.  
**Decision:** Use OpenRouter as a unified gateway to all LLM providers.  
**Consequences:** 
- Single API integration point
- Easy model switching without code changes
- May have slightly higher latency vs. direct APIs
- OpenRouter pricing applies

### ADR-002: Vercel for Hosting
**Date:** 2026-01-21  
**Status:** Accepted  
**Context:** Need reliable hosting for web dashboard with serverless functions for backend logic.  
**Decision:** Use Vercel for both frontend and serverless functions.  
**Consequences:**
- Easy Next.js deployment
- Built-in CI/CD
- May need edge functions for time-sensitive operations
- Serverless function timeout limits apply

### ADR-003: Build NER from Scratch
**Date:** 2026-01-21  
**Status:** Accepted  
**Context:** Need to extract brand entities from LLM responses. Pre-trained NER models focus on general entities (people, places, organizations) but not specifically product brands.  
**Decision:** Build custom NER pipeline, potentially fine-tuning existing transformers models on brand-specific data.  
**Consequences:**
- More accurate brand extraction for our use case
- Requires training data collection
- Higher initial development effort
- Can improve over time with user feedback
