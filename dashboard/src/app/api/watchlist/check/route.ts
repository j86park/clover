/**
 * Watchlist Check API Route
 * Performs quick competitor analysis and updates watchlist entry
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { quickCheckCompetitor, calculateTrend } from '@/lib/watchlist';

/**
 * POST /api/watchlist/check
 * Run quick check for a watchlist entry
 */
export async function POST(request: NextRequest) {
    const supabase = await createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { entryId } = body;

        if (!entryId || typeof entryId !== 'string') {
            return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
        }

        // Fetch the watchlist entry
        const { data: entry, error: fetchError } = await supabase
            .from('watchlist')
            .select('*')
            .eq('id', entryId)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !entry) {
            return NextResponse.json({ error: 'Watchlist entry not found' }, { status: 404 });
        }

        // Perform quick check
        const category = entry.category || 'software';
        const result = await quickCheckCompetitor(entry.competitor_name, category);

        // Calculate trend based on previous ASoV
        const trendDirection = calculateTrend(result.asov, entry.latest_asov);

        // Update the watchlist entry
        const { data: updatedEntry, error: updateError } = await supabase
            .from('watchlist')
            .update({
                latest_asov: result.asov,
                latest_aigvr: result.aigvr,
                latest_sentiment: result.sentiment,
                trend_direction: trendDirection,
                last_checked_at: result.checkedAt,
            })
            .eq('id', entryId)
            .select()
            .single();

        if (updateError) {
            console.error('Failed to update watchlist entry:', updateError);
            return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
        }

        return NextResponse.json({
            entry: updatedEntry,
            result,
        });
    } catch (error) {
        console.error('Quick check failed:', error);
        return NextResponse.json(
            { error: 'Quick check failed. Please try again.' },
            { status: 500 }
        );
    }
}
