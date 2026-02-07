/**
 * Recommendations Engine
 * Generates actionable recommendations based on brand metrics
 */

import { createServerClient } from '@/lib/supabase';
import { RECOMMENDATION_RULES } from './rules';
import type { BrandMetrics } from '@/types/metrics';
import type {
    Recommendation,
    RecommendationsResult,
    RecommendationPriority,
} from './types';

// Re-export types for external consumers
export type {
    Recommendation,
    RecommendationsResult,
    RecommendationPriority,
    RecommendationType,
} from './types';

const PRIORITY_ORDER: Record<RecommendationPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
};

// ═══════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════

/**
 * Generate recommendations for a brand based on their current metrics
 * @param brandId - The brand to generate recommendations for
 * @returns Sorted list of recommendations (highest priority first)
 */
export async function generateRecommendations(
    brandId: string
): Promise<RecommendationsResult> {
    const supabase = await createServerClient();

    // 1. Get brand info
    const { data: brand, error: brandError } = await supabase
        .from('brands')
        .select('id, name')
        .eq('id', brandId)
        .single();

    if (brandError || !brand) {
        console.error('Error fetching brand:', brandError);
        return {
            recommendations: [],
            brandName: 'Unknown',
            generatedAt: new Date().toISOString(),
        };
    }

    // 2. Get latest metrics for this brand
    const { data: metrics, error: metricsError } = await supabase
        .from('metrics')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (metricsError || !metrics) {
        // No metrics yet - recommend running a collection
        return {
            recommendations: [{
                id: 'NO_DATA',
                type: 'content',
                priority: 'high',
                title: 'Run Your First Collection',
                description: 'You haven\'t collected any data yet. Run a collection to get insights about your brand visibility.',
                action: 'Go to Collections and start your first data collection.',
                reason: 'Recommendations require data to analyze.',
                metrics: {
                    current: 0,
                    target: 1,
                    unit: 'collections',
                },
            }],
            brandName: brand.name,
            generatedAt: new Date().toISOString(),
        };
    }

    // 3. Get competitor metrics (if any)
    const { data: competitorMetrics } = await supabase
        .from('metrics')
        .select('*')
        .neq('brand_id', brandId)
        .order('created_at', { ascending: false });

    // Deduplicate to get latest per competitor
    const competitorMap = new Map<string, BrandMetrics>();
    for (const cm of (competitorMetrics || [])) {
        if (!competitorMap.has(cm.brand_id)) {
            competitorMap.set(cm.brand_id, cm as BrandMetrics);
        }
    }
    const competitors = Array.from(competitorMap.values());

    // 4. Run all rules and collect matching recommendations
    const recommendations: Recommendation[] = [];

    for (const rule of RECOMMENDATION_RULES) {
        try {
            if (rule.check(metrics as BrandMetrics, competitors)) {
                const rec = rule.generate(metrics as BrandMetrics, competitors);
                recommendations.push({
                    id: rule.id,
                    ...rec,
                });
            }
        } catch (error) {
            console.error(`Error running rule ${rule.id}:`, error);
        }
    }

    // 5. Sort by priority
    recommendations.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

    return {
        recommendations,
        brandName: brand.name,
        generatedAt: new Date().toISOString(),
    };
}

/**
 * Get recommendations for the current user's brand
 */
export async function getRecommendationsForUser(): Promise<RecommendationsResult | null> {
    const supabase = await createServerClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return null;
    }

    // Get user's brand
    const { data: brand, error: brandError } = await supabase
        .from('brands')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (brandError || !brand) {
        return null;
    }

    return generateRecommendations(brand.id);
}
