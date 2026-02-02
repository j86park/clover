# Clover — AI Visibility & Distribution Agent

Clover is a suite of AI agents designed to solve distribution in the age of generative AI. This dashboard is a core component that monitors brand narratives, citations, and visibility metrics across major LLMs.

## 🚀 Vision
Built for modern marketing and growth teams, Clover tracks **what LLMs say about your brand**, moving beyond traditional SEO into the era of Generative Engine Optimization (GEO).

## ✨ Key Features
- **Prompt Matrix Engine**: Automated orchestration across OpenAI, Anthropic, Google, and Perplexity via OpenRouter.
- **Analysis Pipeline**: LLM-powered NER (Named Entity Recognition) to extract brand mentions and analyze sentiment/context.
- **Metric Dashboard**: Real-time tracking of:
  - **ASoV** (Answer Share of Voice)
  - **AIGVR** (AI-Generated Visibility Rate)
  - **Source Authority** heatmaps
- **Programmable Access**: Service-role API access for integration with terminal scripts and internal tools.
- **Testing Framework**: Native support for A/B content tests and correlation studies.

## 🛠️ Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS.
- **Database**: Supabase (PostgreSQL with Realtime capabilities).
- **Processing**: Inngest for background job orchestration.
- **LLMs**: OpenRouter (Unified API for multi-model access).

## ⚡ Quick Start

### Prerequisites
- Node.js 20+
- Supabase account & project
- OpenRouter API Key

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies (Dashboard)
cd dashboard
npm install
```

### Development
```bash
# Start the development server
npm run dev

# Start Inngest dev server (for background workers)
npx inngest-cli@latest dev
```

## 📂 Project Structure
- `/dashboard`: Main Next.js application.
- `/dashboard/src/app`: App router pages and API routes.
- `/dashboard/src/lib`: Core logic (analysis, collector, metrics).
- `/scripts`: System utilities and diagnostic tools.
- `.gsd`: GSD Methodology state and planning.

## 📄 License
Private — Clover Labs.