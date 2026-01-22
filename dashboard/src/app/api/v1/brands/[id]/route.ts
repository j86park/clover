import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { success, error, notFound, serverError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ id: string }>;
}

const UpdateBrandSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    domain: z.string().url().optional().nullable(),
    keywords: z.array(z.string()).optional().nullable(),
});

/**
 * GET /api/v1/brands/[id] - Get a single brand
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data: brand, error: dbError } = await supabase
            .from('brands')
            .select('*')
            .eq('id', id)
            .single();

        if (dbError || !brand) {
            return notFound('Brand not found');
        }

        return success(brand);
    } catch (err) {
        console.error('Error in GET /api/v1/brands/[id]:', err);
        return serverError('Internal server error');
    }
}

/**
 * PUT /api/v1/brands/[id] - Update a brand
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const validated = UpdateBrandSchema.safeParse(body);

        if (!validated.success) {
            return error('Validation failed', 400, validated.error.issues);
        }

        const supabase = await createClient();

        const { data: brand, error: dbError } = await supabase
            .from('brands')
            .update({ ...validated.data, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (dbError || !brand) {
            return notFound('Brand not found');
        }

        return success(brand);
    } catch (err) {
        console.error('Error in PUT /api/v1/brands/[id]:', err);
        return serverError('Internal server error');
    }
}

/**
 * DELETE /api/v1/brands/[id] - Delete a brand
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { error: dbError } = await supabase
            .from('brands')
            .delete()
            .eq('id', id);

        if (dbError) {
            console.error('Failed to delete brand:', dbError);
            return error('Failed to delete brand', 500);
        }

        return success({ deleted: true });
    } catch (err) {
        console.error('Error in DELETE /api/v1/brands/[id]:', err);
        return serverError('Internal server error');
    }
}
