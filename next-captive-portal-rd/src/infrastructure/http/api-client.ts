/**
 * API Client - Minimal fetch wrapper
 * Server-side only, handles all HTTP communication with ASP.NET API
 */

import { ApiError, API_ERROR_CODES } from './api-error';

interface ApiClientOptions {
    headers?: Record<string, string>;
    ssid?: string;
}

interface ApiRequestOptions extends RequestInit {
    ssid?: string;
    headers?: Record<string, string>;
}

export class ApiClient {
    private baseUrl: string;
    private defaultTimeout: number = 10000; // 10 seconds

    constructor(
        baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5299/api',
        timeout: number = 10000
    ) {
        this.baseUrl = baseUrl;
        this.defaultTimeout = timeout;
    }

    /**
     * Generic request handler
     */
    private async request<T>(
        endpoint: string,
        options: ApiRequestOptions = {}
    ): Promise<T> {
        const { ssid, headers: customHeaders, ...fetchOptions } = options;
        const url = this.buildUrl(endpoint, ssid);
        const headers = this.buildHeaders(customHeaders, ssid);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

            const response = await fetch(url, {
                ...fetchOptions,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Handle non-200 responses
            if (!response.ok) {
                await this.handleErrorResponse(response);
            }

            // Parse and return response
            const data = await response.json();
            return data as T;
        } catch (error) {
            return this.handleNetworkError(error);
        }
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, options?: ApiClientOptions): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'GET',
            ssid: options?.ssid,
            headers: options?.headers,
        });
    }

    /**
     * POST request
     */
    async post<T>(
        endpoint: string,
        body?: unknown,
        options?: ApiClientOptions
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
            ssid: options?.ssid,
            headers: options?.headers,
        });
    }

    /**
     * PUT request
     */
    async put<T>(
        endpoint: string,
        body?: unknown,
        options?: ApiClientOptions
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
            ssid: options?.ssid,
            headers: options?.headers,
        });
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string, options?: ApiClientOptions): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
            ssid: options?.ssid,
            headers: options?.headers,
        });
    }

    /**
     * Build full URL with query parameters
     */
    private buildUrl(endpoint: string, ssid?: string): URL {
        const url = new URL(endpoint, this.baseUrl);

        // Add SSID as query param if provided
        // (also passed via header, but query param is fallback)
        if (ssid) {
            url.searchParams.set('ssid', ssid);
        }

        return url;
    }

    /**
     * Build request headers
     */
    private buildHeaders(
        customHeaders?: Record<string, string>,
        ssid?: string
    ): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'captive-portal/1.0',
            ...customHeaders,
        };

        // Add X-SSID header if provided
        if (ssid) {
            headers['X-SSID'] = ssid;
        }

        return headers;
    }

    /**
     * Handle HTTP error responses
     */
    private async handleErrorResponse(response: Response): Promise<never> {
        let errorData;
        let requestId: string | undefined;

        try {
            errorData = await response.json();
            requestId = response.headers.get('X-Request-ID') || undefined;
        } catch {
            // Response is not JSON
            errorData = null;
        }

        // If response follows API error format
        if (errorData?.error) {
            throw new ApiError({
                code: errorData.error.code || API_ERROR_CODES.UNKNOWN,
                message: errorData.error.message || `HTTP ${response.status}`,
                status: response.status,
                details: errorData.error.details,
                requestId: requestId || errorData.error.requestId,
            });
        }

        // Generic HTTP error
        throw new ApiError({
            code: this.getErrorCodeFromStatus(response.status),
            message: response.statusText || `HTTP ${response.status}`,
            status: response.status,
            requestId,
        });
    }

    /**
     * Handle network errors (timeout, no internet, etc.)
     */
    private handleNetworkError(error: unknown): never {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new ApiError({
                    code: API_ERROR_CODES.TIMEOUT,
                    message: 'Request timeout - API server took too long to respond',
                    status: 408,
                    originalError: error,
                });
            }

            if (error.message.includes('fetch')) {
                throw new ApiError({
                    code: API_ERROR_CODES.NETWORK_ERROR,
                    message: 'Network error - unable to reach API server',
                    status: 0,
                    originalError: error,
                });
            }
        }

        throw new ApiError({
            code: API_ERROR_CODES.UNKNOWN,
            message: 'Unknown error occurred',
            status: 0,
            originalError: error instanceof Error ? error : new Error(String(error)),
        });
    }

    /**
     * Map HTTP status to error code
     */
    private getErrorCodeFromStatus(status: number): string {
        switch (status) {
            case 404:
                return API_ERROR_CODES.SITE_NOT_FOUND;
            case 429:
                return API_ERROR_CODES.RATE_LIMITED;
            case 408:
                return API_ERROR_CODES.TIMEOUT;
            case 500:
            case 502:
            case 503:
            case 504:
                return API_ERROR_CODES.NETWORK_ERROR;
            default:
                return API_ERROR_CODES.UNKNOWN;
        }
    }
}

/**
 * Singleton instance
 */
export const apiClient = new ApiClient();
