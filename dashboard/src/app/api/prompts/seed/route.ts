import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_PROMPTS } from '@/lib/prompts';

/**
 * POST /api/prompts/seed
 * Seeds the prompts table with DEFAULT_PROMPTS if empty
 * Useful for new users to bootstrap their prompt library
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user already has prompts
        const { count, error: countError } = await supabase
            .from('prompts')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (countError) {
            console.error('Error checking prompts:', countError);
            return NextResponse.json(
                { error: 'Failed to check existing prompts' },
                { status: 500 }
            );
        }

        // If user already has prompts, don't seed
        if (count && count > 0) {
            return NextResponse.json({
                success: true,
                message: 'User already has prompts, skipping seed',
                existing_count: count,
                seeded: 0,
            });
        }

        // Seed with DEFAULT_PROMPTS
        const promptsToInsert = DEFAULT_PROMPTS.map((prompt) => ({
            user_id: user.id,
            category: prompt.category,
            intent: prompt.intent,
            template: prompt.template,
            is_active: true,
        }));

        const { data: insertedPrompts, error: insertError } = await supabase
            .from('prompts')
            .insert(promptsToInsert)
            .select('id');

        if (insertError) {
            console.error('Error seeding prompts:', insertError);
            return NextResponse.json(
                { error: 'Failed to seed prompts', details: insertError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Prompts seeded successfully',
            seeded: insertedPrompts?.length || 0,
        });
    } catch (error) {
        console.error('Seed prompts error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/prompts/seed
 * Returns info about the default prompts available
 */
export async function GET() {
    return NextResponse.json({
        available: DEFAULT_PROMPTS.length,
        categories: [...new Set(DEFAULT_PROMPTS.map((p) => p.category))],
        prompts: DEFAULT_PROMPTS.map((p) => ({
            category: p.category,
            intent: p.intent,
            description: p.description,
        })),
    });
}
