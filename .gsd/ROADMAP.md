# ROADMAP.md

> **Current Phase**: Phase 6 — BAAS (Backend as a Service)  
> **Milestone**: v1.0 — MVP Dashboard

## Must-Haves (from SPEC)

- [x] Multi-LLM data collection via OpenRouter
- [ ] NER-based brand extraction
- [ ] Sentiment analysis on mentions
- [ ] Citation source classification
- [ ] ASoV and AIGVR metrics
- [ ] Web dashboard on Vercel
- [ ] Ground truth testing framework

---

## Phases

### Phase 1: Foundation & Infrastructure
**Status**: ✅ Complete  
**Objective**: Set up project structure, database, and OpenRouter integration

**Deliverables:**
- Next.js project with TypeScript ✓
- Database schema (PostgreSQL via Supabase) ✓
- OpenRouter API integration with model abstraction ✓
- Environment configuration for Vercel deployment ✓
- Basic project scaffolding ✓

---

### Phase 2: Data Collection Engine
**Status**: ✅ Complete  
**Objective**: Build the prompt orchestration system that collects LLM responses

**Deliverables:**
- Prompt matrix schema (category, brand, intent types) ✓
- Prompt template engine ✓
- Scheduled job runner for automated collection ✓
- Response storage and normalization ✓
- Rate limiting and error handling for API calls ✓

---

### Phase 3: Analysis Engine (NER & Sentiment)
**Status**: ✅ Complete  
**Objective**: Extract brands, analyze sentiment, and map citations from LLM responses

**Deliverables:**
- NER model for brand extraction (LLM-based) ✓
- Sentiment classifier for mention context (positive/neutral/negative) ✓
- Citation extractor and URL parser ✓
- Source classification logic (owned/earned/external) ✓
- Analysis pipeline connecting all components ✓

---

### Phase 4: Metrics Calculation
**Status**: ✅ Complete  
**Objective**: Compute core metrics from analyzed data

**Deliverables:**
- Answer Share of Voice (ASoV) calculator ✓
- AI-Generated Visibility Rate (AIGVR) calculator ✓
- Source authority scoring algorithm ✓
- Competitor comparison calculations ✓
- Historical trend tracking ✓

---

### Phase 5: Visualization Dashboard
**Status**: ✅ Complete  
**Objective**: Build the web UI to display all metrics and insights

**Deliverables:**
- Dashboard layout with Clover-aligned design ✓
- ASoV charts and trend visualization ✓
- AIGVR metrics display ✓
- Source authority heatmap ✓
- Brand/competitor comparison views ✓
- Settings and configuration UI (basic)

---

### Phase 6: BAAS (Backend as a Service)
**Status**: ✅ Complete  
**Objective**: Transform dashboard into pluggable API service for Clover portfolio

**Deliverables:**
- REST API v1 endpoints (/api/v1/*) ✓
- API key authentication middleware ✓
- Multi-tenant data isolation ✓
- Admin dashboard for API key management ✓
- Usage tracking per API key ✓
- Webhook notifications (stretch - deferred)

---

### Phase 7: Testing Framework & Validation
**Status**: ⬜ Not Started  
**Objective**: Build ground truth testing and validation tools

**Deliverables:**
- Correlation test module (LLM mentions vs. branded search volume)
- A/B content test framework
- LLM-as-a-Judge semantic relevance scoring
- Test result visualization
- Automated validation reports

---

### Phase 8: Polish & Launch Prep
**Status**: ⬜ Not Started  
**Objective**: Final touches, documentation, and deployment

**Deliverables:**
- Performance optimization
- Error handling and edge cases
- User onboarding flow
- Documentation for Clover review
- Production deployment on Vercel

