import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/collections/[id] - Get collection details with responses
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // Get collection details
        const { data: collection, error: collectionError } = await supabase
            .from('collections')
            .select(`
        *,
        brands (name, domain)
      `)
            .eq('id', id)
            .single();

        if (collectionError || !collection) {
            return NextResponse.json(
                { success: false, error: 'Collection not found' },
                { status: 404 }
            );
        }

        // Get responses for this collection
        const { data: responses, error: responsesError } = await supabase
            .from('responses')
            .select(`
        *,
        prompts (category, intent)
      `)
            .eq('collection_id', id)
            .order('created_at', { ascending: true });

        if (responsesError) {
            console.error('Error fetching responses:', responsesError);
        }

        // Calculate stats
        const responseList = responses || [];
        const stats = {
            total: responseList.length,
            byModel: {} as Record<string, number>,
            byCategory: {} as Record<string, number>,
            avgLatency: 0,
            totalTokens: 0,
        };

        let totalLatency = 0;
        for (const response of responseList) {
            // By model
            stats.byModel[response.model] = (stats.byModel[response.model] || 0) + 1;

            // By category
            const category = response.prompts?.category || 'unknown';
            stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

            // Latency
            if (response.latency_ms) {
                totalLatency += response.latency_ms;
            }

            // Tokens
            if (response.tokens_used) {
                stats.totalTokens += response.tokens_used;
            }
        }

        stats.avgLatency = responseList.length > 0
            ? Math.round(totalLatency / responseList.length)
            : 0;

        return NextResponse.json({
            success: true,
            data: {
                collection,
                responses: responseList,
                stats,
            },
        });
    } catch (error) {
        console.error('Error fetching collection:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch collection' },
            { status: 500 }
        );
    }
}
