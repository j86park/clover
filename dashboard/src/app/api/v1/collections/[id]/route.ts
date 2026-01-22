import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { success, notFound, serverError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/collections/[id] - Get a single collection with details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // Get collection with brand info
        const { data: collection, error: collectionError } = await supabase
            .from('collections')
            .select(`*, brands (name, domain)`)
            .eq('id', id)
            .single();

        if (collectionError || !collection) {
            return notFound('Collection not found');
        }

        // Get response count
        const { count: responseCount } = await supabase
            .from('llm_responses')
            .select('*', { count: 'exact', head: true })
            .eq('collection_id', id);

        // Get metrics if available
        const { data: metrics } = await supabase
            .from('metrics')
            .select('*')
            .eq('collection_id', id);

        return success({
            ...collection,
            response_count: responseCount || 0,
            metrics: metrics || [],
        });
    } catch (err) {
        console.error('Error in GET /api/v1/collections/[id]:', err);
        return serverError('Internal server error');
    }
}
