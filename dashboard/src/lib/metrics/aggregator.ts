/**
 * Metrics Aggregator
 * Aggregates analysis data and calculates brand metrics for a collection
 */

import { AnalysisResult } from '@/types/analysis';
import { BrandMetrics } from '@/types/metrics';
import {
    calculateASoV,
    calculateWeightedASoV,
    calculateAIGVR,
    calculateAuthorityScore,
    calculateSentimentScore,
    calculateRecommendationRate,
} from './calculators';

interface BrandAggregation {
    brand_id: string;
    brand_name: string;
    mentions: number;
    recommendations: number;
    responses_with_brand: Set<string>;
    owned_citations: number;
    earned_citations: number;
    external_citations: number;
    positive: number;
    neutral: number;
    negative: number;
}

/**
 * Aggregate analysis results into per-brand statistics
 */
export function aggregateByBrand(
    analyses: AnalysisResult[],
    targetBrandId: string,
    targetBrandName: string
): Map<string, BrandAggregation> {
    const aggregations = new Map<string, BrandAggregation>();

    // Initialize with target brand (even if no mentions)
    aggregations.set(targetBrandId, {
        brand_id: targetBrandId,
        brand_name: targetBrandName,
        mentions: 0,
        recommendations: 0,
        responses_with_brand: new Set(),
        owned_citations: 0,
        earned_citations: 0,
        external_citations: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
    });

    for (const analysis of analyses) {
        for (const mention of analysis.mentions) {
            const brandKey = mention.brand_name.toLowerCase();

            // Try to find existing aggregation or create new one
            let agg = [...aggregations.values()].find(a => {
                const existingName = a.brand_name.toLowerCase();
                const currentName = brandKey;

                // Exact match
                if (existingName === currentName) return true;

                // Fuzzy/Partial Match (e.g. "Clover" for "Clover Labs")
                // Only do this for names longer than 3 chars to avoid false positives
                if (existingName.length > 3 && currentName.length > 3) {
                    if (existingName.includes(currentName) || currentName.includes(existingName)) {
                        return true;
                    }
                }

                return false;
            });

            if (!agg) {
                agg = {
                    brand_id: brandKey,
                    brand_name: mention.brand_name,
                    mentions: 0,
                    recommendations: 0,
                    responses_with_brand: new Set(),
                    owned_citations: 0,
                    earned_citations: 0,
                    external_citations: 0,
                    positive: 0,
                    neutral: 0,
                    negative: 0,
                };
                aggregations.set(agg.brand_id, agg);
            }

            // Count mentions and recommendations
            agg.mentions++;
            if (mention.is_recommended) agg.recommendations++;
            agg.responses_with_brand.add(analysis.response_id);

            // Count sentiment
            switch (mention.sentiment) {
                case 'positive': agg.positive++; break;
                case 'neutral': agg.neutral++; break;
                case 'negative': agg.negative++; break;
            }
        }

        // Aggregate citations - assign to target brand since citations aren't brand-specific
        for (const citation of analysis.citations) {
            const agg = aggregations.get(targetBrandId);
            if (agg) {
                switch (citation.source_type) {
                    case 'owned': agg.owned_citations++; break;
                    case 'earned': agg.earned_citations++; break;
                    case 'external': agg.external_citations++; break;
                }
            }
        }
    }

    return aggregations;
}

/**
 * Calculate metrics for all brands from aggregated data
 */
export function calculateBrandMetrics(
    aggregations: Map<string, BrandAggregation>,
    totalResponses: number
): BrandMetrics[] {
    // Calculate totals across all brands
    let totalMentions = 0;
    let totalRecommendations = 0;

    for (const agg of aggregations.values()) {
        totalMentions += agg.mentions;
        totalRecommendations += agg.recommendations;
    }

    const metrics: BrandMetrics[] = [];

    for (const agg of aggregations.values()) {
        metrics.push({
            brand_id: agg.brand_id,
            brand_name: agg.brand_name,
            asov: calculateASoV(agg.mentions, totalMentions),
            asov_weighted: calculateWeightedASoV(
                agg.recommendations,
                agg.mentions,
                totalMentions,
                totalRecommendations
            ),
            aigvr: calculateAIGVR(agg.responses_with_brand.size, totalResponses),
            authority_score: calculateAuthorityScore(
                agg.owned_citations,
                agg.earned_citations,
                agg.external_citations
            ),
            sentiment_score: calculateSentimentScore(
                agg.positive,
                agg.neutral,
                agg.negative
            ),
            recommendation_rate: calculateRecommendationRate(
                agg.recommendations,
                agg.mentions
            ),
            total_mentions: agg.mentions,
            total_responses: agg.responses_with_brand.size,
            owned_citations: agg.owned_citations,
            earned_citations: agg.earned_citations,
            external_citations: agg.external_citations,
        });
    }

    return metrics;
}
