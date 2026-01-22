# DECISIONS.md — Project Decision Log

> Decisions made during planning and execution

---

## Phase 6: BAAS (Backend as a Service)

**Date:** 2026-01-21  
**Context:** Discussion about making the LLM SEO Dashboard pluggable for Clover's portfolio

### Scope
- Build an API-first layer on top of the dashboard
- Enable any Clover "Leaf" company to integrate via REST API
- Includes admin dashboard for API key management

### Approach
- **Chosen**: Simple API keys (not full Supabase Auth)
- **Reason**: Faster to implement, sufficient for B2B use case, each Leaf gets a key

### Priority
- **Position**: Phase 6 (after Phase 5 Dashboard UI)
- **Reason**: Core dashboard needs to work first, then expose as service

### Key Features
- REST API v1 endpoints (`/api/v1/*`)
- API key authentication middleware
- Multi-tenant data isolation
- Simple admin dashboard for key management
- Usage tracking per API key
- Webhook notifications (optional)

### Constraints
- MVP: Focus on analyze endpoint + API key management
- Rate limiting: Basic implementation (can enhance later)
