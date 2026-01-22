import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/analysis/[id] - Get single analysis with full details
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data: analysis, error } = await supabase
            .from('analysis')
            .select(`
        *,
        responses (
          id,
          model,
          prompt_text,
          response_text,
          tokens_used,
          latency_ms
        )
      `)
            .eq('id', id)
            .single();

        if (error || !analysis) {
            return NextResponse.json(
                { success: false, error: 'Analysis not found' },
                { status: 404 }
            );
        }

        // Parse and enrich the data
        const mentions = analysis.mentions as Array<{
            brand_name: string;
            sentiment: string;
            is_recommended: boolean;
            position: number;
        }>;

        const citations = analysis.citations as Array<{
            url: string;
            domain: string;
            source_type: string;
        }>;

        // Calculate mention stats
        const mentionStats = {
            total: mentions.length,
            recommended: mentions.filter(m => m.is_recommended).length,
            bysentiment: {
                positive: mentions.filter(m => m.sentiment === 'positive').length,
                neutral: mentions.filter(m => m.sentiment === 'neutral').length,
                negative: mentions.filter(m => m.sentiment === 'negative').length,
            },
        };

        // Calculate citation stats
        const citationStats = {
            total: citations.length,
            byType: {
                owned: citations.filter(c => c.source_type === 'owned').length,
                earned: citations.filter(c => c.source_type === 'earned').length,
                external: citations.filter(c => c.source_type === 'external').length,
            },
        };

        return NextResponse.json({
            success: true,
            data: {
                ...analysis,
                mentionStats,
                citationStats,
            },
        });
    } catch (error) {
        console.error('Error fetching analysis:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch analysis' },
            { status: 500 }
        );
    }
}
