/**
 * Citation Network API
 * GET /api/citations/network - Get citation network graph data
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { buildCitationNetwork } from '@/lib/visualization/citation-network';

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

        // Build citation network
        const network = await buildCitationNetwork(brand.id);

        return NextResponse.json(network);

    } catch (error) {
        console.error('Error building citation network:', error);
        return NextResponse.json(
            { error: 'Failed to build citation network' },
            { status: 500 }
        );
    }
}
