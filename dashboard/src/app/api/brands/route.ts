import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const createBrandSchema = z.object({
    name: z.string().min(1).max(200),
    domain: z.string().url().optional().or(z.literal('')),
    keywords: z.array(z.string()).optional(),
});

// GET /api/brands - List all brands with competitors
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: brands, error } = await supabase
            .from('brands')
            .select(`
        *,
        competitors (*)
      `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch brands' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: brands || [],
        });
    } catch (error) {
        console.error('Error fetching brands:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch brands' },
            { status: 500 }
        );
    }
}

// POST /api/brands - Create new brand
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, domain, keywords } = createBrandSchema.parse(body);

        const supabase = await createClient();

        const { data: brand, error } = await supabase
            .from('brands')
            .insert({
                name,
                domain: domain || null,
                keywords: keywords || [],
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to create brand' },
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

        console.error('Error creating brand:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create brand' },
            { status: 500 }
        );
    }
}
