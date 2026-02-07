/**
 * Model-by-Model Breakdown Calculator
 * Aggregates metrics per LLM model to show how different AI systems perceive brands
 */

import { createServerClient } from '@/lib/supabase';
import { AVAILABLE_MODELS } from '@/lib/openrouter/models';
import {
    calculateASoV,
    calculateAIGVR,
    calculateSentimentScore,
} from './calculators';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ModelMetrics {
    model: string;           // Raw model ID (e.g., "openai/gpt-4o")
    displayName: string;     // Friendly name (e.g., "GPT-4o")
    provider: string;        // Provider name (e.g., "OpenAI")
    asov: number;            // Answer Share of Voice for this model
    aigvr: number;           // AI-Generated Visibility Rate for this model
    sentiment: number;       // Sentiment score from this model
    mentionCount: number;    // Total brand mentions from this model
    responseCount: number;   // Total responses from this model
}

export interface ModelBreakdownSummary {
    models: ModelMetrics[];
    bestModel: string | null;      // Model with highest ASoV
    worstModel: string | null;     // Model with lowest ASoV (where asov > 0)
    totalModels: number;
}

// Map model IDs to their display info
const MODEL_DISPLAY_MAP = new Map<string, { name: string; provider: string }>();
Object.values(AVAILABLE_MODELS).forEach(model => {
    MODEL_DISPLAY_MAP.set(model.id, { name: model.name, provider: model.provider });
});

// ═══════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════

/**
 * Get metrics broken down by LLM model for a brand
 * @param brandId - The brand to get metrics for
 * @param collectionId - Optional: limit to a specific collection
 * @returns ModelBreakdownSummary with per-model metrics
 */
export async function getMetricsByModel(
    brandId: string,
    collectionId?: string
): Promise<ModelBreakdownSummary> {
    const supabase = await createServerClient();

    // Build query for analysis results joined with their responses
    let query = supabase
        .from('analysis')
        .select(`
            id,
            mentions,
            responses!inner (
                model,
                collection_id,
                collections!inner (
                    brand_id
                )
            )
        `)
        .eq('responses.collections.brand_id', brandId);

    if (collectionId) {
        query = query.eq('responses.collection_id', collectionId);
    }

    const { data: analyses, error } = await query;

    if (error) {
        console.error('Error fetching analysis data for model breakdown:', error);
        return { models: [], bestModel: null, worstModel: null, totalModels: 0 };
    }

    if (!analyses || analyses.length === 0) {
        return { models: [], bestModel: null, worstModel: null, totalModels: 0 };
    }

    // Aggregate by model
    const modelAggregations = new Map<string, {
        responseCount: number;
        mentionCount: number;
        responsesWithBrand: number;
        positive: number;
        neutral: number;
        negative: number;
    }>();

    // Calculate total mentions across all models for ASoV calculation
    let totalMentionsAcrossModels = 0;

    for (const analysis of analyses) {
        // Safe casting to handle Supabase join result type
        const responseData = analysis.responses as any;
        const model = responseData?.model || 'unknown';
        const mentions = (analysis.mentions || []) as any[];

        if (!modelAggregations.has(model)) {
            modelAggregations.set(model, {
                responseCount: 0,
                mentionCount: 0,
                responsesWithBrand: 0,
                positive: 0,
                neutral: 0,
                negative: 0,
            });
        }

        const agg = modelAggregations.get(model)!;
        agg.responseCount++;

        if (mentions.length > 0) {
            agg.responsesWithBrand++;
            agg.mentionCount += mentions.length;
            totalMentionsAcrossModels += mentions.length;

            // Count sentiment from mentions
            for (const mention of mentions) {
                switch (mention.sentiment) {
                    case 'positive': agg.positive++; break;
                    case 'neutral': agg.neutral++; break;
                    case 'negative': agg.negative++; break;
                }
            }
        }
    }

    // Convert aggregations to ModelMetrics
    const modelMetrics: ModelMetrics[] = [];

    for (const [model, agg] of modelAggregations) {
        const displayInfo = MODEL_DISPLAY_MAP.get(model) || {
            name: model.split('/').pop() || model,
            provider: model.split('/')[0] || 'Unknown'
        };

        modelMetrics.push({
            model,
            displayName: displayInfo.name,
            provider: displayInfo.provider,
            asov: calculateASoV(agg.mentionCount, totalMentionsAcrossModels),
            aigvr: calculateAIGVR(agg.responsesWithBrand, agg.responseCount),
            sentiment: calculateSentimentScore(agg.positive, agg.neutral, agg.negative),
            mentionCount: agg.mentionCount,
            responseCount: agg.responseCount,
        });
    }

    // Sort by ASoV descending
    modelMetrics.sort((a, b) => b.asov - a.asov);

    // Determine best and worst models
    const modelsWithData = modelMetrics.filter(m => m.mentionCount > 0);
    const bestModel = modelsWithData.length > 0 ? modelsWithData[0].displayName : null;
    const worstModel = modelsWithData.length > 1
        ? modelsWithData[modelsWithData.length - 1].displayName
        : null;

    return {
        models: modelMetrics,
        bestModel,
        worstModel,
        totalModels: modelMetrics.length,
    };
}

/**
 * Get model display information from a raw model ID
 */
export function getModelDisplayInfo(modelId: string): { name: string; provider: string } {
    return MODEL_DISPLAY_MAP.get(modelId) || {
        name: modelId.split('/').pop() || modelId,
        provider: modelId.split('/')[0] || 'Unknown'
    };
}
