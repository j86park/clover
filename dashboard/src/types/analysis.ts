/**
 * Analysis Types
 * Types for brand extraction, sentiment analysis, and citations
 */

export interface BrandMention {
    brand_name: string;
    context: string;
    is_recommended: boolean;
    sentiment: 'positive' | 'neutral' | 'negative';
    position: number;
}

export interface Citation {
    url: string;
    domain: string;
    source_type: 'owned' | 'earned' | 'external';
}

export interface AnalysisResult {
    id: string;
    response_id: string;
    mentions: BrandMention[];
    citations: Citation[];
    summary: string | null;
    analyzed_at: string;
    created_at: string;
}

// Input types for analyzer
export interface AnalyzeOptions {
    trackedBrand: string;
    brandDomain?: string;
    competitors?: string[];
    competitorDomains?: string[];
}

// LLM extraction response schema
export interface LLMExtractionResult {
    mentions: BrandMention[];
    summary: string;
}
