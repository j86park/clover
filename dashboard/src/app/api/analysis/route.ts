import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { runAnalysisPipeline } from '@/lib/analysis/pipeline';

export const dynamic = 'force-dynamic';

const startAnalysisSchema = z.object({
    collectionId: z.string().uuid(),
    brandDomain: z.string().optional(),
    competitorDomains: z.array(z.string()).optional(),
    trackedBrand: z.string().optional(),
});

// GET /api/analysis?collectionId=xxx - Get analysis results
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const collectionId = searchParams.get('collectionId');

        const supabase = await createClient();

        let query = supabase
            .from('analysis')
            .select(`
        *,
        responses (
          id,
          model,
          prompt_text
        )
      `)
            .order('created_at', { ascending: false });

        if (collectionId) {
            // Get analysis for specific collection
            const { data: responses } = await supabase
                .from('responses')
                .select('id')
                .eq('collection_id', collectionId);

            if (responses && responses.length > 0) {
                const responseIds = responses.map(r => r.id);
                query = query.in('response_id', responseIds);
            }
        }

        const { data: analyses, error } = await query.limit(100);

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch analyses' },
                { status: 500 }
            );
        }

        // Calculate aggregate stats
        let totalMentions = 0;
        let totalCitations = 0;
        const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
        const brandMentionCounts: Record<string, number> = {};

        for (const analysis of analyses || []) {
            const mentions = analysis.mentions as Array<{ brand_name: string; sentiment: string }>;
            const citations = analysis.citations as Array<unknown>;

            totalMentions += mentions.length;
            totalCitations += citations.length;

            for (const mention of mentions) {
                sentimentCounts[mention.sentiment as keyof typeof sentimentCounts]++;
                brandMentionCounts[mention.brand_name] = (brandMentionCounts[mention.brand_name] || 0) + 1;
            }
        }

        return NextResponse.json({
            success: true,
            data: analyses || [],
            stats: {
                total: analyses?.length || 0,
                totalMentions,
                totalCitations,
                sentimentCounts,
                topBrands: Object.entries(brandMentionCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10),
            },
        });
    } catch (error) {
        console.error('Error fetching analyses:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch analyses' },
            { status: 500 }
        );
    }
}

// POST /api/analysis - Start analysis for a collection
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { collectionId, brandDomain, competitorDomains, trackedBrand } =
            startAnalysisSchema.parse(body);

        const result = await runAnalysisPipeline({
            collectionId,
            brandDomain,
            competitorDomains,
            trackedBrand,
            concurrency: 2,
        });

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid request', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Error starting analysis:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to start analysis',
            },
            { status: 500 }
        );
    }
}
