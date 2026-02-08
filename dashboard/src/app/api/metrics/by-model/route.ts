/**
 * Model Breakdown API Route
 * Returns metrics broken down by LLM model for brand analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getMetricsByModel } from '@/lib/metrics/model-breakdown';

export const dynamic = 'force-dynamic';

// Simple in-memory cache (5 minute TTL)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * GET /api/metrics/by-model
 * Query params:
 *   - collectionId (optional): Filter to specific collection
 */
export async function GET(request: NextRequest) {
    const supabase = await createServerClient();

    // Authenticate
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's brand
    const { data: brand, error: brandError } = await supabase
        .from('brands')
        .select('id')
        .limit(1)
        .single();

    if (brandError || !brand) {
        return NextResponse.json(
            { error: 'No brand found. Please set up your brand first.' },
            { status: 404 }
        );
    }

    const brandId = brand.id;
    const collectionId = request.nextUrl.searchParams.get('collectionId') || undefined;

    // Check cache
    const cacheKey = `${brandId}:${collectionId || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json(cached.data);
    }

    try {
        const breakdown = await getMetricsByModel(brandId, collectionId);

        const response = {
            models: breakdown.models,
            summary: {
                bestModel: breakdown.bestModel,
                worstModel: breakdown.worstModel,
                totalModels: breakdown.totalModels,
            },
        };

        // Store in cache
        cache.set(cacheKey, { data: response, timestamp: Date.now() });

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching model breakdown:', error);
        return NextResponse.json(
            { error: 'Failed to fetch model breakdown' },
            { status: 500 }
        );
    }
}
