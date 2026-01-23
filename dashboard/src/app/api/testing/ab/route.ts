import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createABTest } from '@/lib/testing/ab-test';
import type { ABTestConfig } from '@/types/testing';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const config = body as ABTestConfig;

        // Basic validation
        if (!config.name || !config.variants || config.variants.length < 2) {
            return NextResponse.json(
                { error: 'Invalid config: Name and at least 2 variants required' },
                { status: 400 }
            );
        }

        const testId = await createABTest(config);

        return NextResponse.json({ testId, status: 'created' });
    } catch (error) {
        console.error('Failed to create A/B test:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    const supabase = await createClient();

    // List all tests
    const { data, error } = await supabase
        .from('ab_tests')
        .select('id, name, status, created_at, completed_at')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tests: data });
}
