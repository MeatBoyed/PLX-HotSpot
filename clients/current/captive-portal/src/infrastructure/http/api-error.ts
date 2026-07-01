/**
 * API Error Handler - Matches ASP.NET API error format
 * Provides structured error handling and logging
 */

export interface ApiErrorResponse {
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
        requestId?: string;
    };
}

export interface ApiErrorOptions {
    code: string;
    message: string;
    status: number;
    details?: Record<string, unknown>;
    requestId?: string;
    originalError?: Error;
}

export class ApiError extends Error {
    readonly code: string;
    readonly status: number;
    readonly details: Record<string, unknown>;
    readonly requestId?: string;
    readonly originalError?: Error;

    constructor(options: ApiErrorOptions) {
        super(options.message);
        this.name = 'ApiError';
        this.code = options.code;
        this.status = options.status;
        this.details = options.details || {};
        this.requestId = options.requestId;
        this.originalError = options.originalError;

        // Capture stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

        // Log error
        this.log();
    }

    /**
     * Structured logging with context
     */
    private log(): void {
        const isDev = process.env.NODE_ENV !== 'production';

        const errorContext = {
            timestamp: new Date().toISOString(),
            name: this.name,
            code: this.code,
            status: this.status,
            message: this.message,
            requestId: this.requestId,
            details: this.details,
            ...(isDev && { stack: this.stack }),
            ...(isDev && this.originalError && { originalStack: this.originalError.stack }),
        };

        // Log to console in development — warn for 4xx (expected), error for 5xx+
        if (isDev) {
            if (this.status >= 400 && this.status < 500) {
                console.warn('[ApiError]', errorContext);
            } else {
                console.error('[ApiError]', errorContext);
            }
        }

        // TODO: Send to external logging service (Sentry, Datadog, etc.)
        // logger.error('API Error', errorContext);
    }

    /**
     * Serialize to API response format
     */
    toResponse(): ApiErrorResponse {
        return {
            error: {
                code: this.code,
                message: this.message,
                details: this.details,
                requestId: this.requestId,
            },
        };
    }

    /**
     * Check if this is a specific error code
     */
    isCode(code: string): boolean {
        return this.code === code;
    }

    /**
     * Is this a client error (4xx)?
     */
    isClientError(): boolean {
        return this.status >= 400 && this.status < 500;
    }

    /**
     * Is this a server error (5xx)?
     */
    isServerError(): boolean {
        return this.status >= 500;
    }

    /**
     * Is this retryable?
     */
    isRetryable(): boolean {
        // Retryable: server errors, timeout, too many requests
        return this.status === 408 || this.status === 429 || this.status >= 500;
    }
}

/**
 * Parse API response and throw ApiError if error
 */
export function parseApiResponse<T>(response: ApiErrorResponse | T): T {
    if (response && typeof response === 'object' && 'error' in response) {
        const errorResponse = response as ApiErrorResponse;
        throw new ApiError({
            code: errorResponse.error.code,
            message: errorResponse.error.message,
            status: 400, // Default, should be overridden by caller
            details: errorResponse.error.details,
            requestId: errorResponse.error.requestId,
        });
    }
    return response as T;
}

/**
 * Common API error codes
 */
export const API_ERROR_CODES = {
    // Client errors
    SITE_NOT_FOUND: 'SITE_NOT_FOUND',
    INVALID_OTP: 'INVALID_OTP',
    MAX_ATTEMPTS_EXCEEDED: 'MAX_ATTEMPTS_EXCEEDED',
    VOUCHER_INVALID: 'VOUCHER_INVALID',
    VOUCHER_ALREADY_USED: 'VOUCHER_ALREADY_USED',
    SESSION_ACTIVE: 'SESSION_ACTIVE',
    INVALID_PACKAGE: 'INVALID_PACKAGE',
    SMS_SEND_FAILED: 'SMS_SEND_FAILED',
    RATE_LIMITED: 'RATE_LIMITED',

    // Server errors
    RADIUS_CONNECTION_FAILED: 'RADIUS_CONNECTION_FAILED',
    RADIUS_REJECTED: 'RADIUS_REJECTED',

    // Network errors
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
    UNKNOWN: 'UNKNOWN',
} as const;
