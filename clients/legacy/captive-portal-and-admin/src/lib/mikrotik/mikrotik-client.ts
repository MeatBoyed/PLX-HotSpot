"use client";

// Client-side wrapper for authentication services
import { LoginFormState } from "./mikrotik-types";

export async function clientLoginToHotspot(voucherCode?: string): Promise<LoginFormState> {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ voucherCode }),
        });

        if (!response.ok) {
            return { success: false, message: 'Network request failed' };
        }

        return await response.json();
    } catch {
        return { success: false, message: 'Login request failed' };
    }
}
