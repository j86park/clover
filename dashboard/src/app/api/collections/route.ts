import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { inngest } from '@/lib/inngest/client';
import { AVAILABLE_MODELS, type ModelKey } from '@/lib/openrouter/models';

export const dynamic = 'force-dynamic';

const startCollectionSchema = z.object({
    brandId: z.string().uuid(),
    models: z.array(z.string()).min(1).max(8),
    promptIds: z.array(z.string().uuid()).optional(),
});

// GET /api/collections - List all collections
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: collections, error } = await supabase
            .from('collections')
            .select(`
        *,
        brands (name)
      `)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch collections' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: collections || [],
        });
    } catch (error) {
        console.error('Error fetching collections:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch collections' },
            { status: 500 }
        );
    }
}

// POST /api/collections - Start new collection
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { brandId, models, promptIds } = startCollectionSchema.parse(body);

        // Validate all models exist
        const validModels = models.filter(m => m in AVAILABLE_MODELS) as ModelKey[];
        if (validModels.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No valid models provided',
                    availableModels: Object.keys(AVAILABLE_MODELS),
                },
                { status: 400 }
            );
        }

        // Dispatch background job via Inngest
        // This responds immediately to the client, preventing Vercel timeouts
        await inngest.send({
            name: 'collection.start',
            data: {
                brandId,
                models: validModels,
                promptIds,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Data collection started in background',
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid request', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Error starting collection:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to start collection',
            },
            { status: 500 }
        );
    }
}
