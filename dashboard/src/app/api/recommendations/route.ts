/**
 * Recommendations API
 * GET /api/recommendations - Get personalized recommendations for the user
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { generateRecommendations } from '@/lib/recommendations';

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

        // Generate recommendations
        const result = await generateRecommendations(brand.id);

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error generating recommendations:', error);
        return NextResponse.json(
            { error: 'Failed to generate recommendations' },
            { status: 500 }
        );
    }
}
