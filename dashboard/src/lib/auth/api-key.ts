import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';

export interface ApiKeyRecord {
    id: string;
    user_id: string;
    permissions: string[];
}

export interface AuthError {
    status: number;
    message: string;
}

/**
 * Authenticate an API request using the X-API-Key header.
 * Returns the key record on success, throws AuthError on failure.
 */
export async function authenticateApiKey(request: Request): Promise<ApiKeyRecord> {
    const apiKey = request.headers.get('X-API-Key');

    if (!apiKey) {
        throw { status: 401, message: 'Missing API key' } as AuthError;
    }

    // Hash the provided key
    const keyHash = createHash('sha256').update(apiKey).digest('hex');

    // Use service role client for API auth (bypasses RLS)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Look up the key
    const { data: keyRecord, error } = await supabase
        .from('api_keys')
        .select('id, user_id, permissions')
        .eq('key_hash', keyHash)
        .is('revoked_at', null)
        .single();

    if (error || !keyRecord) {
        throw { status: 401, message: 'Invalid API key' } as AuthError;
    }

    // Update last_used_at (fire and forget)
    supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', keyRecord.id)
        .then(() => { });

    return keyRecord as ApiKeyRecord;
}

/**
 * Check if the key record has the required permission.
 */
export function hasPermission(keyRecord: ApiKeyRecord, requiredPermission: string): boolean {
    return keyRecord.permissions.includes(requiredPermission);
}
