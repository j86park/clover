# JOURNAL.md — Development Log

## Format

```
## YYYY-MM-DD: [Session Title]
- What happened
- Key decisions
- Blockers encountered
```

---

## 2026-01-21: Project Initialization

### Session Summary
- Ran `/new-project` workflow
- Completed deep questioning phase with user
- Researched Clover Labs (website, thesis) to understand target integration
- Created project specification and roadmap

### Key Decisions
- OpenRouter for LLM access (flexibility across providers)
- Focus on data collection + analysis engine for MVP (frontend can iterate)
- Build NER from scratch (fine-tune existing models)
- Vercel for hosting

### Context Gathered
- Clover builds "AI agents that solve distribution"
- Current product: 1Price (dynamic pricing agent)
- This dashboard would be a new "leaf" — AI visibility/distribution monitoring
- User wants this as portfolio piece for Clover application
- Timeline: ASAP but no corners cut

### Next Session
- Run `/plan 1` to detail Phase 1 implementation
- Begin foundation setup

---

## 2026-02-01: Phase 13 — Competitor Management & Validation

### Session Summary
- Implemented core competitor tracking infrastructure.
- Created server actions for adding/deleting competitors with brand ownership verification.
- Integrated competitor data into `getBrand` and `startCollection` workflows.
- Added proactive UI alerts in `NewCollectionPage` to prevent empty collection runs.
- Enhanced `generator.ts` with defensive logging for missing competitor data.
- **Hotfix**: Resolved "Parsing ecmascript source code failed" build error in `brand.ts` caused by a missing catch block.

### Key Decisions
- **Pre-flight Validation**: Decided to validate query generation feasibility in the server action before creating the collection record to avoid "completed: 0" confusion.
- **Defensive Logging**: Added specific console warnings in the generator to help diagnose skipped prompts.

### Blockers Encountered
- **Empty Collections**: Identified that comparison prompts were being skipped when no competitors existed, leading to empty runs. Resolved via validation and UI warnings.

### Next Session
- Monitor UI feedback on competitor management.
- Explore batch processing optimizations.

---

## 2026-02-01: Phase 14 — Auto-Reload for Collections

### Session Summary
- Implemented auto-reloading for the collections page using Supabase Realtime.
- Enabled realtime publication for the `collections` table.
- Modified `CollectionList` to subscribe to status updates and trigger a UI refresh and server data refresh (`router.refresh()`).

### Key Decisions
- **Supabase Realtime**: Used for immediate UI feedback without the overhead of periodic polling.
- **router.refresh()**: Used in combination with local state updates to ensure the entire page's server-side data stays in sync when a run completes.
