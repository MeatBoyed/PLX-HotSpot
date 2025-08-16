// This file contains versions of mikrotik-service functions that use cookies instead of HTTP requests
import { getMikrotikStatusDataFromCookie } from "./mikrotik-lib";
import { StatusResponse } from "./mikrotik-types";

/**
 * Gets the user session data from the cookie instead of making an HTTP request
 * Used as a replacement for getUserSession in mikrotik-service.ts
 */
export async function getUserSessionFromCookie(): Promise<StatusResponse> {
    try {
        const status = await getMikrotikStatusDataFromCookie();

        if (!status) {
            return {
                success: false,
                message: "No session data found in cookie"
            };
        }

        return {
            success: true,
            data: status
        };
    } catch (err) {
        console.error("Error reading session from cookie:", err);
        return {
            success: false,
            message: "Failed to parse status from cookie"
        };
    }
}
