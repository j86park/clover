# TODO.md — Captured Items

> Quick capture for ideas, improvements, and deferred work.

## Format
- `[ ]` — Open
- `[x]` — Done
- `[-]` — Won't do

---

## Backlog

### High Priority
- [ ] Research Clover's design system for UI alignment
- [ ] Investigate existing NER models for brand extraction (possible starting points)
- [ ] Research OpenRouter rate limits and pricing

### Ideas for Later
- [ ] Virtual browser scraping for Google AI Overviews (v2)
- [ ] Chrome extension for real-time brand monitoring
- [ ] Slack/Discord integration for alerts
- [ ] API for third-party integrations

### Technical Debt
(None yet)

### Infrastructure Hardening (Post-MVP)
- [ ] Implement job queue (Inngest/BullMQ) for long-running tests
- [ ] Add persistent `test_runs` and `audit_logs` tables
- [ ] Replace fire-and-forget API handlers with background workers
