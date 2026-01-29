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
            .select('*')
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
