'use server';

import { createClient } from '@/lib/supabase/server';

export interface UpdateBrandResult {
    success: boolean;
    error?: string;
}

/**
 * Update the current user's brand details (domain and keywords).
 */
export async function updateBrand(data: {
    name?: string;
    domain?: string;
    keywords?: string[];
}): Promise<UpdateBrandResult> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Get the user's brand
        const { data: brand, error: brandError } = await supabase
            .from('brands')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (brandError) {
            return { success: false, error: 'Failed to fetch brand' };
        }

        if (!brand) {
            return { success: false, error: 'No brand found for user' };
        }

        // Update the brand
        const { error: updateError } = await supabase
            .from('brands')
            .update({
                ...(data.name && { name: data.name }),
                ...(data.domain && { domain: data.domain }),
                ...(data.keywords && { keywords: data.keywords }),
                updated_at: new Date().toISOString(),
            })
            .eq('id', brand.id);

        if (updateError) {
            console.error('Failed to update brand:', updateError);
            return { success: false, error: 'Failed to update brand' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating brand:', error);
        return { success: false, error: 'Unexpected error' };
    }
}

/**
 * Get the current user's brand details.
 */
export async function getBrand() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { data: brand, error: brandError } = await supabase
            .from('brands')
            .select('*, competitors(*)')
            .eq('user_id', user.id)
            .maybeSingle();

        if (brandError) {
            return { success: false, error: 'Failed to fetch brand' };
        }

        return { success: true, brand };
    } catch (error) {
        console.error('Error fetching brand:', error);
        return { success: false, error: 'Unexpected error' };
    }
}

/**
 * Add a new competitor for the user's brand
 */
export async function addCompetitor(data: { name: string; domain?: string }) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Get the user's brand first
        const { data: brand, error: brandError } = await supabase
            .from('brands')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (brandError || !brand) {
            return { success: false, error: 'No brand found' };
        }

        const { error: insertError } = await supabase
            .from('competitors')
            .insert({
                brand_id: brand.id,
                name: data.name,
                domain: data.domain || null,
            });

        if (insertError) {
            console.error('Failed to add competitor:', insertError);
            return { success: false, error: 'Failed to add competitor' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error adding competitor:', error);
        return { success: false, error: 'Unexpected error' };
    }
}

/**
 * Delete a competitor
 */
export async function deleteCompetitor(id: string) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Verify brand ownership before deletion
        const { data: competitor, error: fetchError } = await supabase
            .from('competitors')
            .select('brands!inner(user_id)')
            .eq('id', id)
            .single();

        if (fetchError || !competitor) {
            return { success: false, error: 'Competitor not found' };
        }

        // @ts-ignore
        if (competitor.brands.user_id !== user.id) {
            return { success: false, error: 'Unauthorized' };
        }

        const { error: deleteError } = await supabase
            .from('competitors')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Failed to delete competitor:', deleteError);
            return { success: false, error: 'Failed to delete competitor' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting competitor:', error);
        return { success: false, error: 'Unexpected error' };
    }
}
