import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_PROMPTS } from '@/lib/prompts/templates';

export const dynamic = 'force-dynamic';

const createPromptSchema = z.object({
    category: z.enum(['discovery', 'comparison', 'review']),
    intent: z.string().min(1).max(100),
    template: z.string().min(10).max(1000),
});

// GET /api/prompts - List all prompts
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: prompts, error } = await supabase
            .from('prompts')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            // Return default prompts if DB fails
            return NextResponse.json({
                success: true,
                data: DEFAULT_PROMPTS.map((p, i) => ({
                    id: `default-${i}`,
                    ...p,
                    is_active: true,
                    created_at: new Date().toISOString(),
                })),
                source: 'defaults',
            });
        }

        // If no prompts in DB, return defaults
        if (!prompts || prompts.length === 0) {
            return NextResponse.json({
                success: true,
                data: DEFAULT_PROMPTS.map((p, i) => ({
                    id: `default-${i}`,
                    ...p,
                    is_active: true,
                    created_at: new Date().toISOString(),
                })),
                source: 'defaults',
            });
        }

        return NextResponse.json({
            success: true,
            data: prompts,
            source: 'database',
        });
    } catch (error) {
        console.error('Error fetching prompts:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch prompts' },
            { status: 500 }
        );
    }
}

// POST /api/prompts - Create new prompt
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { category, intent, template } = createPromptSchema.parse(body);

        const supabase = await createClient();

        const { data: prompt, error } = await supabase
            .from('prompts')
            .insert({
                category,
                intent,
                template,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to create prompt' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: prompt,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid request', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Error creating prompt:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create prompt' },
            { status: 500 }
        );
    }
}
