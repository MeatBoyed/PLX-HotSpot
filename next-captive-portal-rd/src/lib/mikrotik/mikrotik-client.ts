// "use client";
// // Client-side wrapper for authentication services
// import { authenticateUser } from "../auth/auth-service";
import { LoginFormState } from "./mikrotik-types";

export async function clientLoginToHotspot(voucherCode?: string): Promise<LoginFormState> {
    try {
        console.log("API Request to /api/login initiated")

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ voucherCode }),
        });

        if (!response.ok) {
            console.log("API Request Failed...")
            return { success: false, message: 'Network request failed' };
        }
        console.log("API Request completed...")

        return await response.json();
        // const result = await authenticateUser(voucherCode);
        // return result
    } catch {
        return { success: false, message: 'Login request failed' };
    }
}
