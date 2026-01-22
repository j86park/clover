import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { success, error, serverError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

const CreateBrandSchema = z.object({
    name: z.string().min(1).max(255),
    domain: z.string().url().optional(),
    keywords: z.array(z.string()).optional(),
});

/**
 * GET /api/v1/brands - List all brands
 */
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: brands, error: dbError } = await supabase
            .from('brands')
            .select('*')
            .order('created_at', { ascending: false });

        if (dbError) {
            console.error('Failed to fetch brands:', dbError);
            return serverError('Failed to fetch brands');
        }

        return success(brands || []);
    } catch (err) {
        console.error('Error in GET /api/v1/brands:', err);
        return serverError('Internal server error');
    }
}

/**
 * POST /api/v1/brands - Create a new brand
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validated = CreateBrandSchema.safeParse(body);

        if (!validated.success) {
            return error('Validation failed', 400, validated.error.issues);
        }

        const { name, domain, keywords } = validated.data;
        const supabase = await createClient();

        const { data: brand, error: dbError } = await supabase
            .from('brands')
            .insert({ name, domain, keywords })
            .select()
            .single();

        if (dbError) {
            console.error('Failed to create brand:', dbError);
            return error('Failed to create brand', 500);
        }

        return success(brand, 201);
    } catch (err) {
        console.error('Error in POST /api/v1/brands:', err);
        return serverError('Internal server error');
    }
}
