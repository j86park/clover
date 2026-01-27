import { NextResponse } from 'next/server';
import { authenticateApiKey, hasPermission, AuthError } from '@/lib/auth/api-key';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    try {
        // Authenticate the API key
        const keyRecord = await authenticateApiKey(request);

        // Check for required permission
        if (!hasPermission(keyRecord, 'metrics:read')) {
            return NextResponse.json(
                { error: 'Forbidden', message: 'Missing required permission: metrics:read' },
                { status: 403 }
            );
        }

        // Use service role client to fetch data
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get the user's brand
        const { data: brand, error: brandError } = await supabase
            .from('brands')
            .select('id, name')
            .eq('user_id', keyRecord.user_id)
            .single();

        if (brandError || !brand) {
            return NextResponse.json(
                { error: 'Not Found', message: 'No brand found for this user' },
                { status: 404 }
            );
        }

        // Get the latest metrics for this brand
        const { data: metrics, error: metricsError } = await supabase
            .from('metrics')
            .select('*')
            .eq('brand_id', brand.id)
            .order('calculated_at', { ascending: false })
            .limit(1)
            .single();

        // Get competitors for this brand
        const { data: competitors } = await supabase
            .from('competitors')
            .select('name')
            .eq('brand_id', brand.id);

        // Get competitor metrics if available
        const competitorMetrics = [];
        if (competitors && competitors.length > 0) {
            for (const comp of competitors) {
                // For now, return placeholder ASoV for competitors
                // In a full implementation, this would calculate from analysis data
                competitorMetrics.push({
                    name: comp.name,
                    asov: Math.round(Math.random() * 30 * 10) / 10, // Placeholder
                });
            }
        }

        // Build the response
        const response = {
            brand: brand.name,
            timestamp: new Date().toISOString(),
            metrics: {
                asov: metrics?.answer_share_of_voice ?? 0,
                aigvr: metrics?.visibility_rate ?? 0,
                sentiment: {
                    positive: metrics?.sentiment_positive ?? 0,
                    neutral: metrics?.sentiment_neutral ?? 0,
                    negative: metrics?.sentiment_negative ?? 0,
                },
                authority: {
                    owned: metrics?.authority_owned ?? 0,
                    earned: metrics?.authority_earned ?? 0,
                    external: metrics?.authority_external ?? 0,
                },
            },
            competitors: competitorMetrics,
        };

        return NextResponse.json(response);
    } catch (error) {
        // Handle authentication errors
        if ((error as AuthError).status) {
            const authError = error as AuthError;
            return NextResponse.json(
                { error: 'Unauthorized', message: authError.message },
                { status: authError.status }
            );
        }

        // Handle unexpected errors
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
