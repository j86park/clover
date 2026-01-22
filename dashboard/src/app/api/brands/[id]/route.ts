import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const updateBrandSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    domain: z.string().url().optional().or(z.literal('')),
    keywords: z.array(z.string()).optional(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/brands/[id] - Get single brand with competitors
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data: brand, error } = await supabase
            .from('brands')
            .select(`
        *,
        competitors (*)
      `)
            .eq('id', id)
            .single();

        if (error || !brand) {
            return NextResponse.json(
                { success: false, error: 'Brand not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: brand,
        });
    } catch (error) {
        console.error('Error fetching brand:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch brand' },
            { status: 500 }
        );
    }
}

// PATCH /api/brands/[id] - Update brand
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const updates = updateBrandSchema.parse(body);

        const supabase = await createClient();

        const { data: brand, error } = await supabase
            .from('brands')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error || !brand) {
            return NextResponse.json(
                { success: false, error: 'Failed to update brand' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: brand,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid request', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Error updating brand:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update brand' },
            { status: 500 }
        );
    }
}

// DELETE /api/brands/[id] - Delete brand
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { error } = await supabase
            .from('brands')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json(
                { success: false, error: 'Failed to delete brand' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Brand deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting brand:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete brand' },
            { status: 500 }
        );
    }
}
