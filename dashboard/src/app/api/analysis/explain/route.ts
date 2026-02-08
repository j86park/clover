/**
 * Explain API Route
 * Generates explanations for why a brand was mentioned in a response
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { explainMention } from '@/lib/analysis/explainer';

/**
 * POST /api/analysis/explain
 * Get explanation for a brand mention in a specific response
 */
export async function POST(request: NextRequest) {
    const supabase = await createServerClient();

    // Authenticate user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { responseId, brandName } = body;

        if (!responseId || !brandName) {
            return NextResponse.json(
                { error: 'Missing required fields: responseId, brandName' },
                { status: 400 }
            );
        }

        // Fetch response and verify user ownership
        const { data: response, error: responseError } = await supabase
            .from('responses')
            .select(`
        id,
        prompt_text,
        response_text,
        collections!inner(
          brand_id,
          brands!inner(user_id)
        )
      `)
            .eq('id', responseId)
            .eq('collections.brands.user_id', user.id)
            .single();

        if (responseError || !response) {
            return NextResponse.json(
                { error: 'Response not found or access denied' },
                { status: 404 }
            );
        }

        // Check for cached explanation
        const { data: cached } = await supabase
            .from('explanation_cache')
            .select('explanation')
            .eq('response_id', responseId)
            .eq('brand_name', brandName.toLowerCase())
            .single();

        if (cached?.explanation) {
            return NextResponse.json(cached.explanation);
        }

        // Generate explanation
        const explanation = await explainMention({
            originalPrompt: response.prompt_text,
            originalResponse: response.response_text,
            mentionedBrand: brandName,
        });

        // Cache the explanation (fire and forget)
        void supabase
            .from('explanation_cache')
            .insert({
                response_id: responseId,
                brand_name: brandName.toLowerCase(),
                explanation,
            })
            .then(() => { });

        return NextResponse.json(explanation);
    } catch (error) {
        console.error('Explain API error:', error);
        return NextResponse.json(
            { error: 'Failed to generate explanation' },
            { status: 500 }
        );
    }
}
