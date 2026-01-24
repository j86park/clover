import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { success, notFound, serverError } from '@/lib/api/response';
import { getCollectionMetrics } from '@/lib/metrics/pipeline';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/metrics/[id] - Get metrics for a collection
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Try to get metrics from pipeline function
        const metrics = await getCollectionMetrics(id);

        if (!metrics) {
            // Fallback to direct database query
            const supabase = await createClient();

            const { data: dbMetrics, error: dbError } = await supabase
                .from('metrics')
                .select('*')
                .eq('collection_id', id);

            if (dbError || !dbMetrics || dbMetrics.length === 0) {
                return notFound('Metrics not found. Run metrics calculation first.');
            }

            return success({ metrics: dbMetrics });
        }

        // Calculate competitive rankings
        const allBrands = [metrics.brand_metrics, ...metrics.competitor_metrics];

        const asovRanked = [...allBrands].sort((a, b) => b.asov - a.asov);
        const aigvrRanked = [...allBrands].sort((a, b) => b.aigvr - a.aigvr);
        const sentimentRanked = [...allBrands].sort((a, b) =>
            b.sentiment_score - a.sentiment_score
        );

        const rankings = {
            asov_rank: asovRanked.findIndex(
                b => b.brand_id === metrics.brand_metrics.brand_id
            ) + 1,
            aigvr_rank: aigvrRanked.findIndex(
                b => b.brand_id === metrics.brand_metrics.brand_id
            ) + 1,
            sentiment_rank: sentimentRanked.findIndex(
                b => b.brand_id === metrics.brand_metrics.brand_id
            ) + 1,
        };

        return success({
            ...metrics,
            comparison: {
                rankings,
                total_brands: allBrands.length,
            },
        });
    } catch (err) {
        console.error('Error in GET /api/v1/metrics/[id]:', err);
        return serverError('Internal server error');
    }
}
