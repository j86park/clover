import { NextRequest, NextResponse } from 'next/server';
import { runABTest } from '@/lib/testing/ab-test';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const testId = params.id;

        // Run async (don't await completion for the response)
        // In a real production app, use a queue (Bull/Inngest)
        // Here we'll start it and return immediate success
        runABTest(testId).catch(err => {
            console.error(`Background test run failed for ${testId}:`, err);
        });

        return NextResponse.json({
            status: 'started',
            message: 'Test execution started in background'
        });
    } catch (error) {
        console.error('Failed to start test:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
