/**
 * Recommendation Rules
 * Rule definitions that trigger specific recommendations based on metrics
 */

import type { BrandMetrics } from '@/types/metrics';
import type { Recommendation, RecommendationPriority } from './types';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface RecommendationRule {
    id: string;
    name: string;
    trigger: string;
    check: (metrics: BrandMetrics, competitors?: BrandMetrics[]) => boolean;
    generate: (metrics: BrandMetrics, competitors?: BrandMetrics[]) => Omit<Recommendation, 'id'>;
}

// ═══════════════════════════════════════════════════════════════
// RULES
// ═══════════════════════════════════════════════════════════════

export const RECOMMENDATION_RULES: RecommendationRule[] = [
    // Rule 1: LOW_CITATION - Brand rarely cited
    {
        id: 'LOW_CITATION',
        name: 'Low Citation Rate',
        trigger: 'Owned citations < 5',
        check: (metrics) => (metrics.owned_citations || 0) < 5,
        generate: (metrics) => ({
            type: 'content',
            priority: 'high' as RecommendationPriority,
            title: 'Increase Your Citation Footprint',
            description: `Your brand has only ${metrics.owned_citations || 0} owned citations. LLMs reference source material when generating answers.`,
            action: 'Publish more authoritative content on your owned domains (blog posts, whitepapers, case studies).',
            reason: `Brands with 10+ owned citations see 2-3x higher visibility in LLM responses.`,
            metrics: {
                current: metrics.owned_citations || 0,
                target: 10,
                unit: 'owned citations',
            },
        }),
    },

    // Rule 2: COMPETITOR_DOMINANCE - Competitor 2x more recommended
    {
        id: 'COMPETITOR_DOMINANCE',
        name: 'Competitor Dominance',
        trigger: 'Any competitor ASoV > 2x brand ASoV',
        check: (metrics, competitors) => {
            if (!competitors || competitors.length === 0) return false;
            const topCompetitor = competitors.reduce((max, c) => c.asov > max.asov ? c : max, competitors[0]);
            return topCompetitor.asov > metrics.asov * 2;
        },
        generate: (metrics, competitors) => {
            const topCompetitor = competitors!.reduce((max, c) => c.asov > max.asov ? c : max, competitors![0]);
            return {
                type: 'competitive',
                priority: 'high' as RecommendationPriority,
                title: `${topCompetitor.brand_name} Dominates Your Space`,
                description: `${topCompetitor.brand_name} has ${topCompetitor.asov.toFixed(1)}% share of voice compared to your ${metrics.asov.toFixed(1)}%.`,
                action: `Analyze ${topCompetitor.brand_name}'s content strategy. What topics are they covering that you're not?`,
                reason: 'Competitor dominance in LLM responses often reflects their SEO and content authority.',
                metrics: {
                    current: metrics.asov,
                    target: topCompetitor.asov,
                    unit: '% ASoV',
                },
            };
        },
    },

    // Rule 3: NEGATIVE_SENTIMENT - Negative sentiment detected
    {
        id: 'NEGATIVE_SENTIMENT',
        name: 'Negative Sentiment Alert',
        trigger: 'Sentiment score < -0.2',
        check: (metrics) => metrics.sentiment_score < -0.2,
        generate: (metrics) => ({
            type: 'reputation',
            priority: 'high' as RecommendationPriority,
            title: 'Address Negative Perception',
            description: `Your brand has a negative sentiment score of ${metrics.sentiment_score.toFixed(2)}. LLMs may be associating your brand with negative content.`,
            action: 'Publish positive case studies, testimonials, and success stories. Monitor and address negative press.',
            reason: 'Negative sentiment in LLM responses can influence potential customer perception.',
            metrics: {
                current: metrics.sentiment_score,
                target: 0.5,
                unit: 'sentiment',
            },
        }),
    },

    // Rule 4: LOW_ASOV - ASoV below 10%
    {
        id: 'LOW_ASOV',
        name: 'Low Share of Voice',
        trigger: 'ASoV < 10%',
        check: (metrics) => metrics.asov < 10,
        generate: (metrics) => ({
            type: 'visibility',
            priority: 'medium' as RecommendationPriority,
            title: 'Expand Your Keyword Coverage',
            description: `Your Answer Share of Voice is only ${metrics.asov.toFixed(1)}%. This means your brand is mentioned in less than 10% of relevant conversations.`,
            action: 'Identify high-intent keywords in your industry and create comprehensive content targeting them.',
            reason: 'Higher ASoV correlates with increased brand awareness and lead generation.',
            metrics: {
                current: metrics.asov,
                target: 25,
                unit: '% ASoV',
            },
        }),
    },

    // Rule 5: CITATION_OPPORTUNITY - Cited externally but not on owned
    {
        id: 'CITATION_OPPORTUNITY',
        name: 'Citation Reclaim Opportunity',
        trigger: 'Earned citations > owned citations',
        check: (metrics) => (metrics.earned_citations || 0) > (metrics.owned_citations || 0),
        generate: (metrics) => ({
            type: 'content',
            priority: 'medium' as RecommendationPriority,
            title: 'Reclaim Your Mentions',
            description: `You have ${metrics.earned_citations || 0} earned citations but only ${metrics.owned_citations || 0} owned. Others are talking about you more than you are.`,
            action: 'Create content on your domains that covers the same topics where you\'re being mentioned externally.',
            reason: 'Owned citations give you more control over the narrative and boost domain authority.',
            metrics: {
                current: metrics.owned_citations || 0,
                target: metrics.earned_citations || 0,
                unit: 'owned citations',
            },
        }),
    },

    // Rule 6: LOW_AIGVR - Visibility rate below 20%
    {
        id: 'LOW_AIGVR',
        name: 'Low Visibility Rate',
        trigger: 'AIGVR < 20%',
        check: (metrics) => metrics.aigvr < 20,
        generate: (metrics) => ({
            type: 'visibility',
            priority: 'medium' as RecommendationPriority,
            title: 'Boost Your LLM Visibility',
            description: `Your brand only appears in ${metrics.aigvr.toFixed(1)}% of LLM responses. Most queries don't mention you at all.`,
            action: 'Focus on becoming the authority for specific long-tail topics in your niche.',
            reason: 'Higher visibility means more opportunities for users to discover your brand.',
            metrics: {
                current: metrics.aigvr,
                target: 40,
                unit: '% AIGVR',
            },
        }),
    },

    // Rule 7: GREAT_PERFORMANCE - Everything looks good
    {
        id: 'GREAT_PERFORMANCE',
        name: 'Strong Performance',
        trigger: 'ASoV > 30% and sentiment > 0.3 and AIGVR > 40%',
        check: (metrics) => metrics.asov > 30 && metrics.sentiment_score > 0.3 && metrics.aigvr > 40,
        generate: (metrics) => ({
            type: 'success',
            priority: 'low' as RecommendationPriority,
            title: 'Great Work! Stay Ahead',
            description: `Your brand is performing well with ${metrics.asov.toFixed(1)}% ASoV, ${metrics.aigvr.toFixed(1)}% visibility, and positive sentiment.`,
            action: 'Monitor competitor movements and continue publishing high-quality content.',
            reason: 'Maintaining leadership requires consistent effort as competitors evolve.',
            metrics: {
                current: metrics.asov,
                target: 50,
                unit: '% ASoV',
            },
        }),
    },
];
