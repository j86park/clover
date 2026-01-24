/**
 * Metrics Pipeline
 * Orchestrates metrics calculation for collections
 */

import { createServerClient } from '@/lib/supabase';
import { AnalysisResult } from '@/types/analysis';
import { BrandMetrics, CollectionMetrics } from '@/types/metrics';
import { aggregateByBrand, calculateBrandMetrics } from './aggregator';

interface PipelineResult {
    success: boolean;
    collection_id: string;
    metrics_count: number;
    error?: string;
}

/**
 * Run the metrics pipeline for a collection
 * Fetches analyses, calculates metrics, and stores results
 */
export async function runMetricsPipeline(
    collectionId: string
): Promise<PipelineResult> {
    const supabase = await createServerClient();

    try {
        // 1. Get collection info
        const { data: collection, error: collectionError } = await supabase
            .from('collections')
            .select('*, brand:brands(*)')
            .eq('id', collectionId)
            .single();

        if (collectionError || !collection) {
            return {
                success: false,
                collection_id: collectionId,
                metrics_count: 0,
                error: `Collection not found: ${collectionError?.message}`,
            };
        }

        // 2. Get all analyses for this collection
        const { data: analyses, error: analysisError } = await supabase
            .from('analysis')
            .select('*')
            .eq('collection_id', collectionId);

        if (analysisError) {
            return {
                success: false,
                collection_id: collectionId,
                metrics_count: 0,
                error: `Failed to fetch analyses: ${analysisError.message}`,
            };
        }

        if (!analyses || analyses.length === 0) {
            return {
                success: false,
                collection_id: collectionId,
                metrics_count: 0,
                error: 'No analyses found. Run analysis pipeline first.',
            };
        }

        // 3. Get total responses count
        const { count: totalResponses } = await supabase
            .from('responses')
            .select('*', { count: 'exact', head: true })
            .eq('collection_id', collectionId);

        // 4. Aggregate and calculate metrics
        const aggregations = aggregateByBrand(
            analyses as AnalysisResult[],
            collection.brand.id,
            collection.brand.name
        );

        const brandMetrics = calculateBrandMetrics(
            aggregations,
            totalResponses || 0
        );

        // 5. Store metrics in database
        // First, delete existing metrics for this collection
        await supabase
            .from('metrics')
            .delete()
            .eq('collection_id', collectionId);

        // Insert new metrics
        const metricsToInsert = brandMetrics.map(m => ({
            collection_id: collectionId,
            brand_id: m.brand_id.includes('-') ? m.brand_id : null, // Only UUID brand_ids
            brand_name: m.brand_name,
            asov: m.asov,
            asov_weighted: m.asov_weighted,
            aigvr: m.aigvr,
            authority_score: m.authority_score,
            sentiment_score: m.sentiment_score,
            recommendation_rate: m.recommendation_rate,
            total_mentions: m.total_mentions,
            total_responses: m.total_responses,
        }));

        const { error: insertError } = await supabase
            .from('metrics')
            .insert(metricsToInsert);

        if (insertError) {
            return {
                success: false,
                collection_id: collectionId,
                metrics_count: 0,
                error: `Failed to store metrics: ${insertError.message}`,
            };
        }

        return {
            success: true,
            collection_id: collectionId,
            metrics_count: brandMetrics.length,
        };

    } catch (error) {
        return {
            success: false,
            collection_id: collectionId,
            metrics_count: 0,
            error: `Pipeline error: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Get calculated metrics for a collection
 */
export async function getCollectionMetrics(
    collectionId: string
): Promise<CollectionMetrics | null> {
    const supabase = await createServerClient();

    // Get collection with brand info
    const { data: collection } = await supabase
        .from('collections')
        .select('*, brand:brands(*)')
        .eq('id', collectionId)
        .single();

    if (!collection) return null;

    // Get stored metrics
    const { data: metrics } = await supabase
        .from('metrics')
        .select('*')
        .eq('collection_id', collectionId);

    if (!metrics || metrics.length === 0) return null;

    // Separate brand from competitors
    const brandMetric = metrics.find(
        m => m.brand_id === collection.brand.id
    );
    const competitorMetrics = metrics.filter(
        m => m.brand_id !== collection.brand.id
    );

    return {
        collection_id: collectionId,
        brand_metrics: brandMetric as BrandMetrics,
        competitor_metrics: competitorMetrics as BrandMetrics[],
        created_at: brandMetric?.created_at,
    };
}
