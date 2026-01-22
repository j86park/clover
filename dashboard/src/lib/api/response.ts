import { NextResponse } from 'next/server';

/**
 * Standard API response helpers for consistent v1 API responses
 */

export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
}

export interface ApiErrorResponse {
    success: false;
    error: string;
    details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Returns a success response with data
 */
export function success<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json({ success: true, data }, { status });
}

/**
 * Returns an error response
 */
export function error(message: string, status = 400, details?: unknown): NextResponse<ApiErrorResponse> {
    const responseBody: ApiErrorResponse = { success: false as const, error: message };
    if (details !== undefined) {
        responseBody.details = details;
    }
    return NextResponse.json(responseBody, { status });
}

/**
 * Returns a 404 Not Found response
 */
export function notFound(message = 'Resource not found'): NextResponse<ApiErrorResponse> {
    return error(message, 404);
}

/**
 * Returns a 401 Unauthorized response
 */
export function unauthorized(message = 'Unauthorized'): NextResponse<ApiErrorResponse> {
    return error(message, 401);
}

/**
 * Returns a 403 Forbidden response
 */
export function forbidden(message = 'Forbidden'): NextResponse<ApiErrorResponse> {
    return error(message, 403);
}

/**
 * Returns a 500 Internal Server Error response
 */
export function serverError(message = 'Internal server error'): NextResponse<ApiErrorResponse> {
    return error(message, 500);
}
