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

        // Get the user's brand and competitors
        const { data: brand, error: brandError } = await supabase
            .from('brands')
            .select('id, name, keywords, competitors(id)')
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

        // Validate prompt/competitor logic if promptIds are provided
        if (data.promptIds && data.promptIds.length > 0) {
            const { data: prompts } = await supabase
                .from('prompts')
                .select('id, template')
                .in('id', data.promptIds);

            if (prompts) {
                const competitorsCount = brand.competitors?.length || 0;
                let willGenerateQueries = false;

                for (const p of prompts) {
                    const needsCompetitor = p.template.includes('{competitor}');
                    if (!needsCompetitor || (needsCompetitor && competitorsCount > 0)) {
                        willGenerateQueries = true;
                        break;
                    }
                }

                if (!willGenerateQueries) {
                    return {
                        success: false,
                        error: competitorsCount === 0
                            ? 'The selected prompts require competitors to compare against. Please add competitors in Brand Settings first.'
                            : 'No valid queries could be generated with the selected prompts.'
                    };
                }
            }
        }

        // 1. Create collection record immediately so it shows up in the UI
        const { data: collection, error: createError } = await supabase
            .from('collections')
            .insert({
                brand_id: brand.id,
                status: 'running',
                started_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (createError || !collection) {
            console.error('Failed to create collection record:', createError);
            return { success: false, error: 'Failed to initialize collection' };
        }

        // 2. Dispatch the collection.start event to Inngest
        // We pass the existing collectionId so the function doesn't have to create one
        await inngest.send({
            name: 'collection.start',
            data: {
                collectionId: collection.id,
                brandId: brand.id,
                models: data.models,
                promptIds: data.promptIds || [],
            },
        });

        return {
            success: true,
            collectionId: collection.id,
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

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        // If not logged in, we can still show global prompts (or return error)
        // For now, let's fetch based on user if available, otherwise just global
        let query = supabase
            .from('prompts')
            .select('id, category, intent, template, user_id')
            .eq('is_active', true);

        if (user) {
            query = query.or(`user_id.is.null,user_id.eq.${user.id}`);
        } else {
            query = query.is('user_id', null);
        }

        const { data: prompts, error } = await query
            .order('category', { ascending: true });

        if (error) {
            console.error('Error fetching prompts:', error);
            return { success: false, error: 'Failed to fetch prompts' };
        }

        return { success: true, prompts };
    } catch (error) {
        console.error('Error fetching prompts:', error);
        return { success: false, error: 'Unexpected error' };
    }
}

/**
 * Delete a collection run and all its associated data.
 */
export async function deleteCollection(id: string) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Verify ownership: Get the collection and its brand, check if brand belongs to user
        const { data: collection, error: fetchError } = await supabase
            .from('collections')
            .select(`
                id,
                brands!inner (
                    user_id
                )
            `)
            .eq('id', id)
            .single();

        if (fetchError || !collection) {
            return { success: false, error: 'Collection not found' };
        }

        // Check if the brand belongs to the user
        // @ts-ignore - Supabase join types can be tricky
        if (collection.brands.user_id !== user.id) {
            return { success: false, error: 'Unauthorized' };
        }

        // Delete the collection (cascade will handle child records)
        const { error: deleteError } = await supabase
            .from('collections')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting collection:', deleteError);
            return { success: false, error: 'Failed to delete collection' };
        }

        return { success: true };
    } catch (error) {
        console.error('Unexpected error in deleteCollection:', error);
        return { success: false, error: 'Unexpected error' };
    }
}
