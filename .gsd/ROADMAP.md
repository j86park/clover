# ROADMAP.md

> **Current Phase**: Launch Ready (Post-Phase 9)  
> **Milestone**: v1.0 — MVP Dashboard Complete

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
**Status**: ✅ Complete
**Objective**: Build ground truth testing and validation tools

**Deliverables:**
- Correlation test module (LLM mentions vs. branded search volume)
- A/B content test framework
- LLM-as-a-Judge semantic relevance scoring
- Test result visualization
- Automated validation reports

---

### Phase 8: Polish & Launch Prep
**Status**: ✅ Complete
**Objective**: Final touches, documentation, and deployment

**Deliverables:**
- Performance optimization
- Error handling and edge cases
- User onboarding flow
- Documentation for Clover review
- Production deployment on Vercel

---

### Phase 9: Infrastructure Hardening (Post-MVP)
**Status**: ✅ Complete
**Objective**: Transition from MVP fire-and-forget patterns to production-grade reliable systems

**Deliverables:**
- Job queue system (Inngest or BullMQ) for long-running processes
- Persistent `test_runs` and `audit_logs` database tables
- Background worker architecture for A/B tests and data collection
- Robust error recovery and retry mechanisms

---

### Phase 10: Bug Squashing & UX Refinement
**Status**: 🚧 In Progress
**Objective**: Resolve high-priority UI/UX bugs and ensure feature parity across pages

**Deliverables:**
- Fix Citation Drill-down Modal (detect and resolve event blocking)
- Restore Analysis Page (create missing route and implement data view)
- Verify data consistency between Dashboard and Analysis views
- General UX polish (tooltips, loading states)
### Phase 11: User Auth & Identity
**Status**: ✅ Complete
**Objective**: Implement secure authentication and multi-tenancy foundation

**Deliverables:**
- Supabase Auth integration (login/signup/logout) ✓
- Middleware guard for protected routes ✓
- RLS migration for brand ownership ✓
- User-to-Brand profile resolution ✓

---

### Phase 12: Programmable API Access
**Status**: ✅ Complete
**Objective**: Enable real API key generation and programmatic JSON endpoints for terminal/script access to metrics

**Deliverables:**
- `api_keys` table with SHA-256 hashed key storage ✓
- Key generation UI with secure one-time display ✓
- API authentication middleware (`X-API-Key` header) ✓
- `/api/v1/metrics` JSON endpoint for ASoV, AIGVR, Sentiment, Competitors ✓
- Scoped permissions (`metrics:read`) ✓
- Usage tracking (`last_used_at`) ✓

---

### Phase 13: Technical Audit & Production Hardening
**Status**: ✅ Complete
**Objective**: Comprehensive audit of codebase, structural refactoring, and documentation overhaul.

**Deliverables:**
- [x] Immediate deletion of redundant/dead files
- [x] Structural reorganization (scripts consolidated)
- [x] Enhanced root-level configuration (.gitignore, linting)
- [x] High-fidelity README.md with system architecture
- [x] Code quality polish (refactoring smells identified)

---

### Phase 14: Aesthetic & Technical Blueprinting
**Status**: ✅ Complete
**Objective**: Perform a technical and aesthetic teardown of cloverlabs.ai to replicate its professional aesthetic.

**Deliverables:**
- [x] Design Audit & Implementation Guide
- [x] Corrected Emerald theme blueprint based on screenshots
- [x] Actionable CSS/Tailwind snippets for mesh background and components
- [x] App-wide implementation of Deep Emerald visual foundation

---

### Phase 15: Remotion Video Showcase
**Status**: 🚧 In Progress
**Objective**: Create a professional video demonstration of the Clover dashboard using Remotion

**Deliverables:**
- Remotion project setup in `video-showcase/` directory
- Stylized intro/outro animations with emerald branding
- Hybrid feature showcase scenes (stylized + dashboard screenshots)
- Data collection, analysis, dashboard, and testing scenes
- Rendered 60-90 second showcase video

---

### Phase 16: MVP Feature Enhancements
**Status**: ✅ Complete
**Objective**: Add high-impact, low-effort features to enhance MVP value proposition

**Deliverables:**
- Prompt Library Templates with pre-built, research-backed templates ✓
- Email Alerts for significant metric changes ✓
- Export to PDF/CSV for shareable reports ✓
- Competitor Watchlist for quick competitor monitoring ✓

---

### Phase 17: Tier 2 — Medium-Impact Differentiators
**Status**: ✅ Complete
**Objective**: Add medium-effort features that differentiate the product and provide deeper insights

**Deliverables:**
- **17.1: Prompt Effectiveness Scoring** — Analyze which prompts generate the most favorable brand mentions ✓
- **17.2: "Why Did They Say That?" Explainer** — Follow-up LLM call explaining reasoning behind each recommendation ✓
- **17.3: Prompt Builder Wizard** — Guided UI to construct effective prompts with category → intent → brand/competitor toggles ✓
- **17.4: Model-by-Model Breakdown** — Radar charts and heatmaps showing how GPT-4, Claude, Gemini perceive brands differently ✓

---

### Phase 18: Tier 3 — Advanced Intelligence Features
**Status**: 🆕 Planned
**Objective**: Add advanced features that require significant development effort but provide unique value

**Deliverables:**
- **18.1: Recommendations Engine** — Actionable suggestions to improve brand visibility ("Your brand is rarely cited. Consider publishing more on owned domains.")
- **18.2: Content Gap Analysis** — Identify topics where competitors are mentioned but you're not
- **18.3: Citation Network Visualization** — Interactive graph showing which sources cite your brand (owned/earned/external)
- **18.4: Scheduled Collections** — Automated daily/weekly data collection runs via Inngest cron
- **18.5: Natural Language Query Interface** — Ask questions about your data in plain English ("What was my best week?")
