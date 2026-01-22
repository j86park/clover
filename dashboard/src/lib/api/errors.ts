/**
 * Custom API Error classes for consistent error handling
 */

export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly details?: unknown;

    constructor(message: string, statusCode = 400, details?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.details = details;
    }
}

export class ValidationError extends ApiError {
    constructor(message: string, details?: unknown) {
        super(message, 400, details);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends ApiError {
    constructor(message = 'Resource not found') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}
