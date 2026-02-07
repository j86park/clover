import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { AlertConfig, AlertConfigRow, AlertTriggers } from '@/types/alerts';

/**
 * GET /api/alerts
 * List user's alert configurations
 */
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: alerts, error } = await supabase
            .from('alerts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching alerts:', error);
            return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
        }

        return NextResponse.json({ alerts: alerts || [] });
    } catch (error) {
        console.error('GET /api/alerts error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/alerts
 * Create a new alert configuration
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { brand_id, destination, triggers } = body as {
            brand_id: string;
            destination: string;
            triggers: AlertTriggers;
        };

        // Validate required fields
        if (!brand_id || !destination) {
            return NextResponse.json({ error: 'brand_id and destination are required' }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(destination)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        const { data: alert, error } = await supabase
            .from('alerts')
            .insert({
                user_id: user.id,
                brand_id,
                channel: 'email',
                destination,
                triggers: triggers || {},
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating alert:', error);
            return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
        }

        return NextResponse.json({ alert }, { status: 201 });
    } catch (error) {
        console.error('POST /api/alerts error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PATCH /api/alerts
 * Update an existing alert configuration
 */
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, destination, triggers, is_active } = body as {
            id: string;
            destination?: string;
            triggers?: AlertTriggers;
            is_active?: boolean;
        };

        if (!id) {
            return NextResponse.json({ error: 'Alert id is required' }, { status: 400 });
        }

        // Build update object
        const updates: Partial<AlertConfigRow> = {};
        if (destination !== undefined) updates.destination = destination;
        if (triggers !== undefined) updates.triggers = triggers;
        if (is_active !== undefined) updates.is_active = is_active;

        const { data: alert, error } = await supabase
            .from('alerts')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id) // Ensure user owns the alert
            .select()
            .single();

        if (error) {
            console.error('Error updating alert:', error);
            return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
        }

        return NextResponse.json({ alert });
    } catch (error) {
        console.error('PATCH /api/alerts error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/alerts
 * Delete an alert configuration
 */
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Alert id is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('alerts')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id); // Ensure user owns the alert

        if (error) {
            console.error('Error deleting alert:', error);
            return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/alerts error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
