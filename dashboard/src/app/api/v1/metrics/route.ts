import { NextResponse } from 'next/server';
import { authenticateApiKey, hasPermission, AuthError, logApiUsage } from '@/lib/auth/api-key';
import { createClient } from '@supabase/supabase-js';


export async function GET(request: Request) {
    const startTime = Date.now();
    let keyRecord: any = null;

    try {
        // Authenticate the API key
        keyRecord = await authenticateApiKey(request);

        // Check for required permission
        if (!hasPermission(keyRecord, 'metrics:read')) {
            const duration = Date.now() - startTime;
            logApiUsage(keyRecord.user_id, keyRecord.id, '/api/v1/metrics', 403, duration);
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
            const duration = Date.now() - startTime;
            logApiUsage(keyRecord.user_id, keyRecord.id, '/api/v1/metrics', 404, duration);
            return NextResponse.json(
                { error: 'Not Found', message: 'No brand found for this user' },
                { status: 404 }
            );
        }

        // Get the latest completed collection for this brand
        const { data: collection, error: collError } = await supabase
            .from('collections')
            .select('id')
            .eq('brand_id', brand.id)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (collError || !collection) {
            const duration = Date.now() - startTime;
            logApiUsage(keyRecord.user_id, keyRecord.id, '/api/v1/metrics', 404, duration);
            return NextResponse.json(
                { error: 'Not Found', message: 'No completed collections found for this brand' },
                { status: 404 }
            );
        }

        // Get all metrics for this collection (brand + competitors)
        const { data: allMetrics, error: metricsError } = await supabase
            .from('metrics')
            .select('*')
            .eq('collection_id', collection.id);

        if (metricsError || !allMetrics) {
            const duration = Date.now() - startTime;
            logApiUsage(keyRecord.user_id, keyRecord.id, '/api/v1/metrics', 500, duration);
            return NextResponse.json(
                { error: 'Internal Server Error', message: 'Failed to fetch metrics results' },
                { status: 500 }
            );
        }

        // Identify the target brand metric
        const brandMetric = allMetrics.find(m => m.brand_id === brand.id);

        // Identify competitor metrics
        const competitorMetrics = allMetrics
            .filter(m => m.brand_id !== brand.id)
            .map(m => ({
                name: m.brand_name,
                asov: m.asov ?? 0,
                aigvr: m.aigvr ?? 0,
            }));

        // Build the response
        const response = {
            brand: brand.name,
            timestamp: brandMetric?.created_at || new Date().toISOString(),
            metrics: {
                asov: brandMetric?.asov ?? 0,
                aigvr: brandMetric?.aigvr ?? 0,
                sentiment: {
                    score: brandMetric?.sentiment_score ?? 0,
                },
                authority: {
                    score: brandMetric?.authority_score ?? 0,
                    owned: brandMetric?.owned_citations ?? 0,
                    earned: brandMetric?.earned_citations ?? 0,
                    external: brandMetric?.external_citations ?? 0,
                },
            },
            competitors: competitorMetrics,
        };

        const duration = Date.now() - startTime;
        logApiUsage(keyRecord.user_id, keyRecord.id, '/api/v1/metrics', 200, duration);
        return NextResponse.json(response);
    } catch (error) {
        const duration = Date.now() - startTime;
        if (keyRecord) {
            logApiUsage(keyRecord.user_id, keyRecord.id, '/api/v1/metrics', (error as AuthError).status || 500, duration);
        }

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
