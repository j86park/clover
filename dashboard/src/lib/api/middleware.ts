/**
 * API Authentication Middleware
 * Wraps route handlers to require and validate API key authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, ApiKeyInfo } from './auth';
import { unauthorized, forbidden, error } from './response';

export interface AuthenticatedRequest extends NextRequest {
    tenant: ApiKeyInfo;
}

export interface AuthContext {
    tenant: ApiKeyInfo;
}

type RouteHandler = (
    request: NextRequest,
    context: AuthContext & { params?: Promise<Record<string, string>> }
) => Promise<NextResponse>;

/**
 * Higher-order function that wraps route handlers with API key authentication
 * Extracts key from Authorization header (Bearer) or X-API-Key header
 */
export function withApiAuth(handler: RouteHandler) {
    return async (
        request: NextRequest,
        routeContext?: { params?: Promise<Record<string, string>> }
    ): Promise<NextResponse> => {
        // Extract API key from headers
        const authHeader = request.headers.get('authorization');
        const apiKeyHeader = request.headers.get('x-api-key');

        let apiKey: string | null = null;

        if (authHeader?.startsWith('Bearer ')) {
            apiKey = authHeader.substring(7);
        } else if (apiKeyHeader) {
            apiKey = apiKeyHeader;
        }

        if (!apiKey) {
            return unauthorized('API key required. Provide via Authorization: Bearer <key> or X-API-Key header.');
        }

        // Validate the API key
        const keyInfo = await validateApiKey(apiKey);

        if (!keyInfo) {
            return unauthorized('Invalid or expired API key.');
        }

        // Create authenticated context
        const authContext: AuthContext & { params?: Promise<Record<string, string>> } = {
            tenant: keyInfo,
            params: routeContext?.params,
        };

        // Call the wrapped handler with tenant context
        return handler(request, authContext);
    };
}

/**
 * Middleware to check specific permissions
 */
export function requirePermission(permission: string, keyInfo: ApiKeyInfo): NextResponse | null {
    if (!keyInfo.permissions.includes(permission) && !keyInfo.permissions.includes('admin')) {
        return forbidden(`Missing required permission: ${permission}`);
    }
    return null;
}

/**
 * Checks if request is within rate limit
 * Note: Full rate limiting would need Redis or similar for distributed tracking
 * This is a placeholder for the basic structure
 */
export async function checkRateLimit(keyInfo: ApiKeyInfo): Promise<{ allowed: boolean; remaining: number }> {
    // In a production environment, this would check against Redis or a rate limiting service
    // For now, we just return allowed
    return {
        allowed: true,
        remaining: keyInfo.rateLimit,
    };
}
