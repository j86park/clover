/**
 * Standardized API Error Handling
 * Consistent error format for all API routes
 */

import { NextResponse } from 'next/server';

export class ApiError extends Error {
    public readonly status: number;
    public readonly code: string;

    constructor(message: string, status: number = 500, code?: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code || this.generateCode(status);
    }

    private generateCode(status: number): string {
        switch (status) {
            case 400: return 'BAD_REQUEST';
            case 401: return 'UNAUTHORIZED';
            case 403: return 'FORBIDDEN';
            case 404: return 'NOT_FOUND';
            case 409: return 'CONFLICT';
            case 422: return 'UNPROCESSABLE_ENTITY';
            case 429: return 'RATE_LIMITED';
            default: return 'INTERNAL_ERROR';
        }
    }

    toJSON() {
        return {
            error: {
                message: this.message,
                code: this.code,
            },
        };
    }
}

/**
 * 404 Not Found Error
 */
export class NotFoundError extends ApiError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

/**
 * 403 Forbidden Error
 */
export class ForbiddenError extends ApiError {
    constructor(message: string = 'Access forbidden') {
        super(message, 403, 'FORBIDDEN');
        this.name = 'ForbiddenError';
    }
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
    error: unknown,
    defaultStatus: number = 500
): NextResponse {
    if (error instanceof ApiError) {
        return NextResponse.json(error.toJSON(), { status: error.status });
    }

    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    const apiError = new ApiError(message, defaultStatus);

    return NextResponse.json(apiError.toJSON(), { status: defaultStatus });
}

/**
 * Handle errors in API routes
 * Usage: catch (error) { return handleApiError(error); }
 */
export function handleApiError(error: unknown): NextResponse {
    console.error('API Error:', error);
    return createErrorResponse(error);
}
