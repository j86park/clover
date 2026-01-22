import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const createCompetitorSchema = z.object({
    name: z.string().min(1).max(200),
    domain: z.string().url().optional().or(z.literal('')),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/brands/[id]/competitors - List competitors for a brand
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data: competitors, error } = await supabase
            .from('competitors')
            .select('*')
            .eq('brand_id', id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch competitors' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: competitors || [],
        });
    } catch (error) {
        console.error('Error fetching competitors:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch competitors' },
            { status: 500 }
        );
    }
}

// POST /api/brands/[id]/competitors - Add competitor to brand
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, domain } = createCompetitorSchema.parse(body);

        const supabase = await createClient();

        // Verify brand exists
        const { data: brand } = await supabase
            .from('brands')
            .select('id')
            .eq('id', id)
            .single();

        if (!brand) {
            return NextResponse.json(
                { success: false, error: 'Brand not found' },
                { status: 404 }
            );
        }

        const { data: competitor, error } = await supabase
            .from('competitors')
            .insert({
                brand_id: id,
                name,
                domain: domain || null,
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to add competitor' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: competitor,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid request', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Error adding competitor:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to add competitor' },
            { status: 500 }
        );
    }
}

// DELETE /api/brands/[id]/competitors - Delete all competitors (for cleanup)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const competitorId = searchParams.get('competitorId');

        if (!competitorId) {
            return NextResponse.json(
                { success: false, error: 'competitorId query param required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        const { error } = await supabase
            .from('competitors')
            .delete()
            .eq('id', competitorId)
            .eq('brand_id', id);

        if (error) {
            return NextResponse.json(
                { success: false, error: 'Failed to delete competitor' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Competitor deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting competitor:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete competitor' },
            { status: 500 }
        );
    }
}
