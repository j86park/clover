/**
 * Single Metrics API Route
 * GET: Get detailed metrics for a specific collection
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCollectionMetrics } from '@/lib/metrics/pipeline';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params;
        const metrics = await getCollectionMetrics(id);

        if (!metrics) {
            return NextResponse.json(
                { error: 'Metrics not found. Run metrics calculation first.' },
                { status: 404 }
            );
        }

        // Calculate competitive rankings
        const allBrands = [metrics.brand_metrics, ...metrics.competitor_metrics];

        // Sort by different metrics to determine rankings
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

        return NextResponse.json({
            ...metrics,
            comparison: {
                rankings,
                total_brands: allBrands.length,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch metrics' },
            { status: 500 }
        );
    }
}
