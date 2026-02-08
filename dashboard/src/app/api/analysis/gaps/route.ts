/**
 * Content Gap Analysis API
 * GET /api/analysis/gaps - Get content gaps for the user's brand
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { analyzeContentGaps } from '@/lib/analysis/content-gaps';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createServerClient();

        // Authenticate user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user's brand
        const { data: brand, error: brandError } = await supabase
            .from('brands')
            .select('id, name')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (brandError || !brand) {
            return NextResponse.json(
                { error: 'No brand found. Set up your brand first.' },
                { status: 404 }
            );
        }

        // Analyze content gaps
        const result = await analyzeContentGaps(brand.id);

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error analyzing content gaps:', error);
        return NextResponse.json(
            { error: 'Failed to analyze content gaps' },
            { status: 500 }
        );
    }
}
