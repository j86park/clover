/**
 * Metrics Types
 * Types for ASoV, AIGVR, and other calculated metrics
 */

export interface BrandMetrics {
    brand_id: string;
    brand_name: string;
    asov: number;              // Answer Share of Voice (0-100)
    asov_weighted: number;     // Weighted by recommendations (0-100)
    aigvr: number;             // AI-Generated Visibility Rate (0-100)
    authority_score: number;   // Source authority (1-3)
    sentiment_score: number;   // Average sentiment (-1 to 1)
    recommendation_rate: number; // % of mentions that recommend (0-100)
    total_mentions: number;
    total_responses: number;
}

export interface StoredMetrics extends BrandMetrics {
    id: string;
    collection_id: string;
    created_at: string;
}

export interface CollectionMetrics {
    collection_id: string;
    brand_metrics: BrandMetrics;
    competitor_metrics: BrandMetrics[];
    created_at: string;
}

export interface MetricsTrend {
    date: string;
    asov: number;
    aigvr: number;
    sentiment_score: number;
}

export interface CompetitorComparison {
    brand: BrandMetrics;
    competitors: BrandMetrics[];
    rankings: {
        asov_rank: number;        // 1 = best
        aigvr_rank: number;
        sentiment_rank: number;
    };
}
