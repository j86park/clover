/**
 * API Key Authentication Utilities
 * Handles key generation, hashing, and validation
 */

import { createClient } from '@/lib/supabase/server';

const KEY_PREFIX = 'clv_';
const KEY_LENGTH = 32;

export interface ApiKeyInfo {
    id: string;
    tenantId: string;
    name: string;
    permissions: string[];
    rateLimit: number;
}

export interface GeneratedApiKey {
    key: string;       // Full unhashed key (show only once)
    keyPrefix: string; // First 8 chars for display
    keyHash: string;   // SHA-256 hash for storage
}

/**
 * Generates a new API key
 * Returns the full key (to show user once), prefix (for display), and hash (for storage)
 */
export async function generateApiKey(): Promise<GeneratedApiKey> {
    // Generate random bytes
    const randomBytes = new Uint8Array(KEY_LENGTH);
    crypto.getRandomValues(randomBytes);

    // Convert to base64url for URL-safe key
    const randomPart = btoa(String.fromCharCode(...randomBytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
        .substring(0, KEY_LENGTH);

    const key = `${KEY_PREFIX}${randomPart}`;
    const keyPrefix = key.substring(0, 12) + '...';
    const keyHash = await hashApiKey(key);

    return { key, keyPrefix, keyHash };
}

/**
 * Hashes an API key using SHA-256
 */
export async function hashApiKey(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates an API key and returns tenant info if valid
 * Returns null if invalid or expired
 */
export async function validateApiKey(key: string): Promise<ApiKeyInfo | null> {
    if (!key || !key.startsWith(KEY_PREFIX)) {
        return null;
    }

    const keyHash = await hashApiKey(key);
    const supabase = await createClient();

    const { data: apiKey, error } = await supabase
        .from('api_keys')
        .select('id, tenant_id, name, permissions, rate_limit, is_active, expires_at')
        .eq('key_hash', keyHash)
        .single();

    if (error || !apiKey) {
        return null;
    }

    // Check if key is active
    if (!apiKey.is_active) {
        return null;
    }

    // Check if key is expired
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
        return null;
    }

    // Update last_used_at
    await supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', apiKey.id);

    return {
        id: apiKey.id,
        tenantId: apiKey.tenant_id,
        name: apiKey.name,
        permissions: apiKey.permissions || ['read'],
        rateLimit: apiKey.rate_limit || 1000,
    };
}

/**
 * Creates a new API key in the database
 */
export async function createApiKey(
    tenantId: string,
    name: string,
    options?: {
        permissions?: string[];
        rateLimit?: number;
        expiresAt?: Date;
    }
): Promise<{ key: string; id: string } | null> {
    const { key, keyPrefix, keyHash } = await generateApiKey();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('api_keys')
        .insert({
            key_hash: keyHash,
            key_prefix: keyPrefix,
            name,
            tenant_id: tenantId,
            permissions: options?.permissions || ['read'],
            rate_limit: options?.rateLimit || 1000,
            expires_at: options?.expiresAt?.toISOString(),
        })
        .select('id')
        .single();

    if (error || !data) {
        console.error('Failed to create API key:', error);
        return null;
    }

    return { key, id: data.id };
}

/**
 * Revokes an API key
 */
export async function revokeApiKey(keyId: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId);

    return !error;
}
