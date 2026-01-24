import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { compareVariants } from '@/lib/testing/ab-test';
import type { ABTestResult } from '@/types/testing';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const testId = params.id;

        const { data: test, error } = await supabase
            .from('ab_tests')
            .select('*')
            .eq('id', testId)
            .single();

        if (error || !test) {
            return NextResponse.json({ error: 'Test not found' }, { status: 404 });
        }

        let comparison = null;
        if (test.status === 'completed' && test.results) {
            try {
                comparison = compareVariants(test.results as ABTestResult[]);
            } catch (e) {
                console.warn('Failed to generate comparison:', e);
            }
        }

        return NextResponse.json({
            test,
            comparison
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
