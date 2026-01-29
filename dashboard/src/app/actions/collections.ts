'use server';

import { inngest } from '@/lib/inngest/client';
import { createClient } from '@/lib/supabase/server';

export interface StartCollectionResult {
    success: boolean;
    collectionId?: string;
    error?: string;
}

/**
 * Start a new data collection run by dispatching to Inngest.
 */
export async function startCollection(data: {
    models: string[];
    promptIds?: string[];
}): Promise<StartCollectionResult> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Get the user's brand
        const { data: brand, error: brandError } = await supabase
            .from('brands')
            .select('id, name, keywords')
            .eq('user_id', user.id)
            .maybeSingle();

        if (brandError || !brand) {
            return { success: false, error: 'No brand found for user' };
        }

        // Validate that the brand has keywords
        if (!brand.keywords || brand.keywords.length === 0) {
            return {
                success: false,
                error: 'Please add tracking keywords in Brand Settings before starting a collection'
            };
        }

        // Dispatch the collection.start event to Inngest
        await inngest.send({
            name: 'collection.start',
            data: {
                brandId: brand.id,
                models: data.models,
                promptIds: data.promptIds || [],
            },
        });

        return {
            success: true,
            collectionId: 'pending', // The actual ID will be created by the Inngest function
        };
    } catch (error) {
        console.error('Error starting collection:', error);
        return { success: false, error: 'Failed to start collection' };
    }
}

/**
 * Get available prompts for collection.
 */
export async function getAvailablePrompts() {
    try {
        const supabase = await createClient();

        const { data: prompts, error } = await supabase
            .from('prompts')
            .select('id, category, intent, template')
            .eq('is_active', true)
            .order('category', { ascending: true });

        if (error) {
            return { success: false, error: 'Failed to fetch prompts' };
        }

        return { success: true, prompts };
    } catch (error) {
        console.error('Error fetching prompts:', error);
        return { success: false, error: 'Unexpected error' };
    }
}
