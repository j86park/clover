/**
 * Prompt Effectiveness API Route
 * Returns prompt effectiveness metrics for the authenticated user's brand
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getPromptRanking } from '@/lib/analysis/prompt-effectiveness';

/**
 * GET /api/analysis/prompts
 * Get prompt effectiveness ranking for the user's brand
 */
export async function GET() {
    const supabase = await createServerClient();

    // Authenticate user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get user's brand
        const { data: brand, error: brandError } = await supabase
            .from('brands')
            .select('id, name')
            .eq('user_id', user.id)
            .single();

        if (brandError || !brand) {
            return NextResponse.json({
                prompts: [],
                summary: {
                    bestPrompt: null,
                    worstPrompt: null,
                    avgMentionRate: 0,
                },
                message: 'No brand found. Please set up your brand first.',
            });
        }

        // Get prompt ranking
        const result = await getPromptRanking(brand.id);

        if (result.prompts.length === 0) {
            return NextResponse.json({
                ...result,
                message: 'No prompt data available yet. Run a collection to see effectiveness metrics.',
            });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Prompt effectiveness API error:', error);
        return NextResponse.json(
            { error: 'Failed to calculate prompt effectiveness' },
            { status: 500 }
        );
    }
}
