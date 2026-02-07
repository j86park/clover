/**
 * Watchlist API Route
 * Manages user's competitor watchlist entries
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { WatchlistEntry } from '@/types';

/**
 * GET /api/watchlist
 * Fetch all watchlist entries for the current user
 */
export async function GET() {
    const supabase = await createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch watchlist:', error);
        return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
    }

    return NextResponse.json({ entries: data as WatchlistEntry[] });
}

/**
 * POST /api/watchlist
 * Add a competitor to the watchlist
 */
export async function POST(request: NextRequest) {
    const supabase = await createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { competitor_name, competitor_domain, category } = body;

        if (!competitor_name || typeof competitor_name !== 'string') {
            return NextResponse.json({ error: 'Competitor name is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('watchlist')
            .insert({
                user_id: user.id,
                competitor_name: competitor_name.trim(),
                competitor_domain: competitor_domain?.trim() || null,
                category: category?.trim() || null,
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'This competitor is already in your watchlist' },
                    { status: 409 }
                );
            }
            console.error('Failed to add to watchlist:', error);
            return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 });
        }

        return NextResponse.json({ entry: data as WatchlistEntry }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}

/**
 * DELETE /api/watchlist?id={entryId}
 * Remove a competitor from the watchlist
 */
export async function DELETE(request: NextRequest) {
    const supabase = await createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');

    if (!entryId) {
        return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id);

    if (error) {
        console.error('Failed to delete from watchlist:', error);
        return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
