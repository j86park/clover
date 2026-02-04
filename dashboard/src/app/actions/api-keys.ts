'use server';

import { createClient } from '@/lib/supabase/server';
import { randomBytes, createHash } from 'crypto';

export interface ApiKey {
    id: string;
    key_prefix: string;
    name: string;
    permissions: string[];
    last_used_at: string | null;
    created_at: string;
}

export interface GenerateKeyResult {
    success: boolean;
    rawKey?: string;
    keyPrefix?: string;
    error?: string;
}

/**
 * Generate a new API key for the current user.
 * Returns the raw key ONLY ONCE - it cannot be retrieved again.
 */
export async function generateApiKey(name: string): Promise<GenerateKeyResult> {
    try {
        const supabase = await createClient();

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Generate a secure random key with prefix
        const randomPart = randomBytes(32).toString('hex');
        const rawKey = `clv_live_${randomPart}`;

        // Compute SHA-256 hash of the full key
        const keyHash = createHash('sha256').update(rawKey).digest('hex');

        // Extract prefix for display (first 12 chars including "clv_live_")
        const keyPrefix = rawKey.substring(0, 12) + '...';

        // Insert into database
        const { error: insertError } = await supabase
            .from('api_keys')
            .insert({
                user_id: user.id,
                key_hash: keyHash,
                key_prefix: keyPrefix,
                name: name || 'Unnamed Key',
                permissions: ['metrics:read'],
            });

        if (insertError) {
            console.error('Failed to insert API key:', insertError);
            return { success: false, error: 'Failed to create API key' };
        }

        // Return the raw key (only time it's available)
        return {
            success: true,
            rawKey,
            keyPrefix,
        };
    } catch (error) {
        console.error('Error generating API key:', error);
        return { success: false, error: 'Unexpected error' };
    }
}

/**
 * List all non-revoked API keys for the current user.
 */
export async function listApiKeys(): Promise<{ success: boolean; keys?: ApiKey[]; error?: string }> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { data: keys, error: fetchError } = await supabase
            .from('api_keys')
            .select('id, key_prefix, name, permissions, last_used_at, created_at')
            .eq('user_id', user.id)
            .is('revoked_at', null)
            .order('created_at', { ascending: false });

        if (fetchError) {
            console.error('Failed to fetch API keys:', fetchError);
            return { success: false, error: 'Failed to fetch API keys' };
        }

        return { success: true, keys: keys || [] };
    } catch (error) {
        console.error('Error listing API keys:', error);
        return { success: false, error: 'Unexpected error' };
    }
}

/**
 * Revoke an API key (soft delete by setting revoked_at).
 */
export async function revokeApiKey(keyId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { error: updateError } = await supabase
            .from('api_keys')
            .update({ revoked_at: new Date().toISOString() })
            .eq('id', keyId)
            .eq('user_id', user.id); // Ensure user owns this key

        if (updateError) {
            console.error('Failed to revoke API key:', updateError);
            return { success: false, error: 'Failed to revoke API key' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error revoking API key:', error);
        return { success: false, error: 'Unexpected error' };
    }
}
