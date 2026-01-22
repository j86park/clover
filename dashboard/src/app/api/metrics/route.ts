/**
 * Metrics API Route
 * GET: List metrics, optionally filter by collection
 * POST: Calculate metrics for a collection
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { runMetricsPipeline } from '@/lib/metrics/pipeline';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const PostSchema = z.object({
    collection_id: z.string().uuid(),
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const collectionId = searchParams.get('collection_id');

        const supabase = await createServerClient();

        let query = supabase.from('metrics').select('*');

        if (collectionId) {
            query = query.eq('collection_id', collectionId);
        }

        const { data, error } = await query.order('asov', { ascending: false });

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ metrics: data });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch metrics' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { collection_id } = PostSchema.parse(body);

        const result = await runMetricsPipeline(collection_id);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            collection_id: result.collection_id,
            metrics_count: result.metrics_count,
            message: `Calculated metrics for ${result.metrics_count} brands`,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', issues: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to calculate metrics' },
            { status: 500 }
        );
    }
}
