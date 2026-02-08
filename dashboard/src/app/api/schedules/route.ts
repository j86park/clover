/**
 * Schedule Management API
 * CRUD operations for collection schedules
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { CollectionSchedule } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * Calculate initial next_run_at based on schedule config
 */
function calculateNextRun(
    scheduleType: 'daily' | 'weekly' | 'custom',
    timeUtc: string,
    dayOfWeek?: number
): Date {
    const now = new Date();
    const [hours, minutes] = timeUtc.split(':').map(Number);

    const nextRun = new Date(now);
    nextRun.setUTCHours(hours, minutes, 0, 0);

    if (scheduleType === 'daily') {
        if (nextRun <= now) {
            nextRun.setUTCDate(nextRun.getUTCDate() + 1);
        }
    } else if (scheduleType === 'weekly') {
        const targetDay = dayOfWeek ?? 1;
        const currentDay = nextRun.getUTCDay();

        let daysUntil = targetDay - currentDay;
        if (daysUntil < 0) daysUntil += 7;
        if (daysUntil === 0 && nextRun <= now) daysUntil = 7;

        nextRun.setUTCDate(nextRun.getUTCDate() + daysUntil);
    }

    return nextRun;
}

/**
 * GET /api/schedules - List user's schedules
 */
export async function GET() {
    try {
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: schedules, error } = await supabase
            .from('schedules')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching schedules:', error);
            return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
        }

        return NextResponse.json({ schedules: schedules || [] });

    } catch (error) {
        console.error('Error in GET /api/schedules:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/schedules - Create new schedule
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { schedule_type, time_utc, day_of_week } = body;

        // Validate required fields
        if (!schedule_type || !time_utc) {
            return NextResponse.json(
                { error: 'schedule_type and time_utc are required' },
                { status: 400 }
            );
        }

        // Get user's brand
        const { data: brand, error: brandError } = await supabase
            .from('brands')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (brandError || !brand) {
            return NextResponse.json({ error: 'No brand found' }, { status: 404 });
        }

        // Calculate next run
        const nextRun = calculateNextRun(schedule_type, time_utc, day_of_week);

        // Create schedule
        const { data: schedule, error } = await supabase
            .from('schedules')
            .upsert({
                user_id: user.id,
                brand_id: brand.id,
                schedule_type,
                time_utc,
                day_of_week: schedule_type === 'weekly' ? day_of_week : null,
                is_active: true,
                next_run_at: nextRun.toISOString(),
            }, {
                onConflict: 'user_id,brand_id',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating schedule:', error);
            return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
        }

        return NextResponse.json({ schedule });

    } catch (error) {
        console.error('Error in POST /api/schedules:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PATCH /api/schedules - Update schedule (toggle active, update time)
 */
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, is_active, schedule_type, time_utc, day_of_week } = body;

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        // Build update object
        const updates: Partial<CollectionSchedule> = {};

        if (typeof is_active === 'boolean') {
            updates.is_active = is_active;
        }
        if (schedule_type) {
            updates.schedule_type = schedule_type;
        }
        if (time_utc) {
            updates.time_utc = time_utc;
        }
        if (typeof day_of_week === 'number') {
            updates.day_of_week = day_of_week;
        }

        // Recalculate next run if time/schedule changed
        if (time_utc || schedule_type) {
            const { data: existing } = await supabase
                .from('schedules')
                .select('schedule_type, time_utc, day_of_week')
                .eq('id', id)
                .eq('user_id', user.id)
                .single();

            if (existing) {
                const nextRun = calculateNextRun(
                    schedule_type || existing.schedule_type,
                    time_utc || existing.time_utc,
                    day_of_week ?? existing.day_of_week
                );
                updates.next_run_at = nextRun.toISOString();
            }
        }

        const { data: schedule, error } = await supabase
            .from('schedules')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating schedule:', error);
            return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
        }

        return NextResponse.json({ schedule });

    } catch (error) {
        console.error('Error in PATCH /api/schedules:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/schedules - Delete schedule
 */
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('schedules')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting schedule:', error);
            return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in DELETE /api/schedules:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
