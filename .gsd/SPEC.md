# SPEC.md — LLM SEO Dashboard (GEO/LLMO)

> **Status**: `FINALIZED`

## Vision

Build an AI-powered brand visibility dashboard that monitors how brands are perceived and recommended by LLMs. Unlike traditional SEO that tracks blue links, this tracks **narratives, citations, and share of voice within AI conversations**. This becomes a new "leaf" in Clover's AI growth agent portfolio, solving **distribution visibility in the age of generative AI**.

## Goals

1. **Data Collection Engine** — Automated prompt orchestration across multiple LLMs (via OpenRouter) to capture brand mentions, competitor analysis, and category responses
2. **Analysis Engine** — NER-based brand extraction, sentiment analysis, and citation mapping to understand how LLMs perceive and recommend brands
3. **Visualization Dashboard** — Real-time metrics including Answer Share of Voice (ASoV), AI-Generated Visibility Rate (AIGVR), and source authority heatmaps
4. **Testing Framework** — Built-in ground truth validation: correlation tests, A/B content tests, and LLM-as-a-Judge scoring

## Non-Goals (Out of Scope for v1)

- Virtual browser scraping for AI Overviews (defer to v2)
- Multi-tenant enterprise features
- Historical data migration from other tools
- Mobile app
- White-label/agency features

## Users

**Primary:** Clover's existing customers — SaaS companies and software businesses already using Clover's growth suite (1Price, etc.) who want to understand and optimize their AI visibility.

**Usage:** Marketing/growth teams monitor their brand's presence in LLM responses, track competitor mentions, and optimize content to improve AI recommendations.

## Constraints

- **LLM Access:** OpenRouter API for model flexibility (GPT-4, Claude, Gemini, Perplexity)
- **Hosting:** Vercel for frontend and serverless functions
- **Integration:** Must align with Clover's design patterns for future suite integration
- **NER:** Build from scratch using best available frameworks (likely spaCy/transformers)
- **Timeline:** Quality over speed — no corners cut, but ship incrementally

## Success Criteria

- [ ] Successfully collect responses from 3+ LLM providers via OpenRouter
- [ ] Accurately extract brand mentions with >85% precision
- [ ] Calculate and display ASoV metrics for tracked brands
- [ ] Citation source classification working (owned/earned/external)
- [ ] Ground truth testing framework operational
- [ ] Dashboard provides actionable insights that Clover would consider integrating

## Technical Architecture (High-Level)

```
┌─────────────────────────────────────────────────────────────────┐
│                     VISUALIZATION TIER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ ASoV Charts │  │ AIGVR Metrics│  │ Source Authority Heatmap│ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ▲
┌─────────────────────────────────────────────────────────────────┐
│                      ANALYSIS ENGINE                             │
│  ┌─────────────┐  ┌─────────────────┐  ┌───────────────────┐   │
│  │ NER Brand   │  │ Sentiment/Context│  │ Citation Mapper   │   │
│  │ Extraction  │  │ Analysis         │  │ (owned/earned/ext)│   │
│  └─────────────┘  └─────────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ▲
┌─────────────────────────────────────────────────────────────────┐
│                    DATA COLLECTION TIER                          │
│  ┌─────────────────────────┐  ┌────────────────────────────┐   │
│  │ Prompt Matrix Engine    │  │ OpenRouter Orchestration   │   │
│  │ (category/brand/intent) │  │ (GPT-4, Claude, Gemini...) │   │
│  └─────────────────────────┘  └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```
