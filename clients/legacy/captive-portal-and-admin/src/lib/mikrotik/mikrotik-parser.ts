/**
 * Simplified MikroTik Response Parser
 * Extracts data from MikroTik responses in format: "({...})" or error messages
 */

export interface MikroTikErrorResponse {
    errorType: string;
    message: string;
    originalError?: string;
    variables?: Record<string, string>;
}

export interface MikroTikParseResult {
    success: boolean;
    data?: Record<string, string>;
    error?: MikroTikErrorResponse;
    rawResponse: string;
}

export class MikroTikResponseParser {
    /**
     * Parse MikroTik response - handles both object format and error messages
     */
    static parse(responseText: string): MikroTikParseResult {
        const trimmed = responseText.trim();

        if (!trimmed) {
            return {
                success: false,
                error: {
                    errorType: 'empty-response',
                    message: 'Empty response received'
                },
                rawResponse: responseText
            };
        }

        // Check if it's an object response: "({...})" or "{...}"
        if (this.isObjectResponse(trimmed)) {
            return this.parseObjectResponse(trimmed);
        }

        // Otherwise, treat as error message
        return this.parseErrorResponse(trimmed);
    }

    /**
     * Check if response is in object format
     */
    private static isObjectResponse(response: string): boolean {
        const cleaned = response.trim();
        return (cleaned.startsWith('({') && cleaned.endsWith('})')) ||
            (cleaned.startsWith('{') && cleaned.endsWith('}'));
    }

    /**
     * Parse object response: "({key: 'value', ...})"
     */
    private static parseObjectResponse(response: string): MikroTikParseResult {
        try {
            // Clean the response for JSON parsing
            let cleaned = response.trim();

            // Remove outer parentheses: "({...})" → "{...}"
            if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
                cleaned = cleaned.slice(1, -1).trim();
            }

            // Convert single quotes to double quotes
            cleaned = cleaned.replace(/'/g, '"');

            // Remove trailing commas
            cleaned = cleaned.replace(/,(\s*})/g, '$1');

            const data = JSON.parse(cleaned) as Record<string, string>;

            return {
                success: true,
                data,
                rawResponse: response
            };

        } catch {
            // Fallback: manual extraction
            console.log("JSON Error: ", jsonError)
            return this.extractKeyValuePairs(response);
        }
    }

    /**
     * Manual key-value extraction fallback
     */
    private static extractKeyValuePairs(response: string): MikroTikParseResult {
        const data: Record<string, string> = {};

        // Match patterns: 'key': 'value' or "key": "value" 
        const regex = /['"]?(\w+)['"]?\s*:\s*['"]([^'"]*)['"]/g;
        let match;

        while ((match = regex.exec(response)) !== null) {
            const [, key, value] = match;
            if (key && value !== undefined) {
                data[key] = value;
            }
        }

        if (Object.keys(data).length > 0) {
            return {
                success: true,
                data,
                rawResponse: response
            };
        }

        return {
            success: false,
            error: {
                errorType: 'parse-failed',
                message: 'Could not extract key-value pairs from response'
            },
            rawResponse: response
        };
    }

    /**
     * Parse error response from RouterOS error format
     */
    private static parseErrorResponse(response: string): MikroTikParseResult {
        // Match format: "error-type = error message with $(variables)"
        const errorMatch = response.match(/^([^=]+?)\s*=\s*(.+)$/);

        if (errorMatch) {
            const [, errorType, message] = errorMatch;
            const variables = this.extractVariables(message);

            return {
                success: false,
                error: {
                    errorType: errorType.trim(),
                    message: message.trim(),
                    variables
                },
                rawResponse: response
            };
        }

        // If no pattern match, treat entire response as error message
        return {
            success: false,
            error: {
                errorType: 'unknown-error',
                message: response
            },
            rawResponse: response
        };
    }

    /**
     * Extract variables from error message: $(variable-name)
     */
    private static extractVariables(message: string): Record<string, string> | undefined {
        const variables: Record<string, string> = {};
        const variableRegex = /\$\(([^)]+)\)/g;
        let match;

        while ((match = variableRegex.exec(message)) !== null) {
            const [fullMatch, varName] = match;
            variables[varName] = fullMatch; // Keep original format for now
        }

        return Object.keys(variables).length > 0 ? variables : undefined;
    }

    /**
     * Helper: Check if user is logged in
     */
    static isLoggedIn(result: MikroTikParseResult): boolean {
        return result.success && result.data?.logged_in === 'yes';
    }

    /**
     * Helper: Get error message
     */
    static getErrorMessage(result: MikroTikParseResult): string {
        return result.error?.message || 'Unknown error occurred';
    }
}