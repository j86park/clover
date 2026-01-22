import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { success, error, serverError } from '@/lib/api/response';
import { runCollection } from '@/lib/collector/runner';
import { AVAILABLE_MODELS, type ModelKey } from '@/lib/openrouter/models';

export const dynamic = 'force-dynamic';

const StartCollectionSchema = z.object({
    brandId: z.string().uuid(),
    models: z.array(z.string()).min(1).max(8),
    promptIds: z.array(z.string().uuid()).optional(),
});

/**
 * GET /api/v1/collections - List all collections
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const brandId = searchParams.get('brand_id');
        const limit = parseInt(searchParams.get('limit') || '50', 10);

        const supabase = await createClient();

        let query = supabase
            .from('collections')
            .select(`*, brands (name)`)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (brandId) {
            query = query.eq('brand_id', brandId);
        }

        const { data: collections, error: dbError } = await query;

        if (dbError) {
            console.error('Failed to fetch collections:', dbError);
            return serverError('Failed to fetch collections');
        }

        return success(collections || []);
    } catch (err) {
        console.error('Error in GET /api/v1/collections:', err);
        return serverError('Internal server error');
    }
}

/**
 * POST /api/v1/collections - Start a new collection run
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validated = StartCollectionSchema.safeParse(body);

        if (!validated.success) {
            return error('Validation failed', 400, validated.error.issues);
        }

        const { brandId, models, promptIds } = validated.data;

        // Validate all models exist
        const validModels = models.filter(m => m in AVAILABLE_MODELS) as ModelKey[];
        if (validModels.length === 0) {
            return error('No valid models provided', 400, {
                availableModels: Object.keys(AVAILABLE_MODELS),
            });
        }

        // Run collection
        const result = await runCollection({
            brandId,
            models: validModels,
            promptIds,
            concurrency: 3,
        });

        return success(result, 201);
    } catch (err) {
        console.error('Error in POST /api/v1/collections:', err);
        return serverError(
            err instanceof Error ? err.message : 'Failed to start collection'
        );
    }
}
