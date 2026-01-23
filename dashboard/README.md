# LLM SEO Dashboard

AI-powered brand visibility dashboard that monitors how brands are perceived and recommended by Large Language Models.

## Overview

Unlike traditional SEO that tracks blue links, this dashboard tracks **narratives, citations, and share of voice within AI conversations**. Key metrics include:

- **Answer Share of Voice (ASoV)** — Percentage of brand mentions vs. competitors
- **AI-Generated Visibility Rate (AIGVR)** — How often your brand appears in AI responses
- **Source Authority** — Classification of cited sources (owned/earned/external)
- **Sentiment Analysis** — Positive/neutral/negative context of mentions

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database)
- OpenRouter API key (for LLM access)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd dashboard

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# OpenRouter (LLM API)
OPENROUTER_API_KEY=your_openrouter_api_key

# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **LLM Access**: OpenRouter API
- **UI**: Tailwind CSS + Custom Components
- **Charts**: Recharts
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── api/              # API routes
│   │   ├── v1/           # Public API (API key auth)
│   │   └── testing/      # Testing framework endpoints
│   ├── (dashboard)/      # Dashboard pages
│   └── onboarding/       # Onboarding flow
├── components/           # React components
│   ├── charts/           # Visualization components
│   ├── dashboard/        # Dashboard-specific components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility libraries
│   ├── analysis/         # Brand extraction & sentiment
│   ├── metrics/          # ASoV, AIGVR calculators
│   ├── testing/          # Testing framework (judge, correlation)
│   └── supabase/         # Database client
└── types/                # TypeScript definitions
```

## API Documentation

### Authentication

API endpoints under `/api/v1/*` require API key authentication:

```bash
curl -H "x-api-key: YOUR_API_KEY" https://your-domain.com/api/v1/brands
```

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/brands` | GET | List all brands |
| `/api/v1/metrics/:id` | GET | Get metrics for a collection |
| `/api/v1/analysis/:id` | GET | Get analysis results |
| `/api/testing/ab` | POST | Create A/B test |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual Build

```bash
npm run build
npm run start
```

## Testing Framework

The dashboard includes a built-in testing framework:

- **LLM-as-a-Judge**: Semantic relevance scoring using AI evaluation
- **Correlation Tests**: Compare mentions with external metrics
- **A/B Testing**: Test content variations for optimal AI visibility

Access the testing dashboard at `/testing`.

## License

Proprietary - Clover AI
