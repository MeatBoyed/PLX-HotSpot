"use server"
// Must run Client side to use Browser's Fetch/Network to access Mikrotik Hotspot on the network
import { parseMikroTikStatus } from "./mikrotik-lib";
import { LoginFormState, MikroTikData, RadiusDeskUsageResponse, StatusResponse, } from "./mikrotik-types";
import { appConfig } from "@/lib/config";

const Default_Username = appConfig.mikrotik.defaultUsername;
const Default_Password = appConfig.mikrotik.defaultPassword;

interface MikroTikLoginResponse {
    logged_in?: string;
    error?: string;
    error_orig?: string;
    [key: string]: string | undefined;
}

export async function loginToHotspot(mikrotikData: MikroTikData, voucherCode?: string): Promise<LoginFormState> {
    // Credential logic: if voucher code provided, use it as username, otherwise use defaults
    const username = voucherCode || Default_Username;
    const password = voucherCode ? voucherCode : Default_Password;

    console.log("Credentials: ", { username, password });
    // Use provided Mikrotik login link and supply credentials
    const url = `${mikrotikData.loginlink}?${new URLSearchParams({ username, password })}`;

    try {
        const res = await fetch(url, {
            method: "GET",
            redirect: "follow",
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const text = await res.text();

        console.log("Login response:", text);

        // Parse the MikroTik response - it's in a specific format like ({...})
        let parsedResponse: MikroTikLoginResponse | null = null;
        try {
            // Remove the outer parentheses and parse as JavaScript object
            const cleanedText = text.trim().replace(/^\(\s*/, '').replace(/\s*\)$/, '');
            // Convert single quotes to double quotes for valid JSON
            const jsonText = cleanedText.replace(/'/g, '"');
            parsedResponse = JSON.parse(jsonText) as MikroTikLoginResponse;
            console.log("Parsed response:", parsedResponse);
        } catch (parseError) {
            console.error("Failed to parse MikroTik response:", parseError);
            // Fallback to text analysis if JSON parsing fails
        }

        // Check for success based on parsed response or text content
        let success = false;
        let errorMessage = "Login failed. Please try again.";

        if (parsedResponse) {
            // Check if logged_in is 'yes' and no error exists
            success = parsedResponse.logged_in === 'yes' && !parsedResponse.error;

            if (!success && parsedResponse.error) {
                errorMessage = parsedResponse.error;
            } else if (!success && parsedResponse.error_orig) {
                errorMessage = parsedResponse.error_orig;
            } else if (!success) {
                errorMessage = "Authentication failed - not logged in";
            }
        } else {
            // Fallback to text analysis
            success = res.ok && /logged_in['"]*:\s*['"]*yes/i.test(text) && !/error['"]*:\s*['"]*[^'"]+/i.test(text);

            if (!success) {
                // Try to extract error message from response
                const errorMatch = text.match(/error['"]*:\s*['"]*([^'",\n}]+)/i);
                if (errorMatch) {
                    errorMessage = errorMatch[1].trim();
                }
            }
        }

        if (!success) {
            return { success: false, message: errorMessage };
        }

        console.log("Login result: ", success);
        return { success: true };
    } catch (err) {
        console.error("Login error:", err);
        const message = (err as Error).message || "An error occurred during login.";
        return { success: false, message: message };
    }
}


export async function getUserSession(mikrotikData?: MikroTikData): Promise<StatusResponse> {
    const baseUrl = mikrotikData?.link_status ?? "http://10.5.50.1/status";
    const url = new URL(baseUrl);

    // Optional: add cache buster
    url.searchParams.set("_", Date.now().toString());

    try {
        const res = await fetch(url.toString(), { method: "GET" });
        const rawText = await res.text();

        const status = await parseMikroTikStatus(rawText);
        console.log("Hotspot Status:", status);

        if (!status) return { success: false, message: "Failed to parse status" };

        return { success: true, data: status };
    } catch (err) {
        console.error("Fetch error:", err);
        return { success: false, message: "Request failed" };
    }
}

// Check User's Usage Status (Before login)
export async function checkUserUsage(mikrotikData: MikroTikData): Promise<RadiusDeskUsageResponse> {
    const username = Default_Username;
    const macRaw = mikrotikData.mac;

    if (!username || !macRaw) {
        return {
            success: false,
            message: "Missing username or MAC address in MikroTik data"
        };
    }

    // Convert MAC to hyphen format if needed
    const mac = macRaw.replace(/%3A|:/g, "-").toLowerCase();

    const url = new URL(`${appConfig.mikrotik.radiusDeskBaseUrl}/cake4/rd_cake/radaccts/get-usage.json`);
    url.searchParams.set("mac", mac);
    url.searchParams.set("username", username);

    try {
        const res = await fetch(url.toString(), { method: "GET" });

        if (!res.ok) {
            return {
                success: false,
                message: `HTTP error: ${res.status} ${res.statusText}`
            };
        }

        const json = await res.json();

        if (typeof json !== "object" || !("success" in json)) {
            return {
                success: false,
                message: "Unexpected response format"
            };
        }

        return json as RadiusDeskUsageResponse;

    } catch (err) {
        console.error("RadiusDesk usage fetch error:", err);
        return {
            success: false,
            message: "Failed to fetch RadiusDesk usage"
        };
    }
}

export async function getReviveAdData() {

}