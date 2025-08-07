// Must run Client side to use Browser's Fetch/Network to access Mikrotik Hotspot on the network
import { parseMikroTikStatus } from "./mikrotik-lib";
// import { MikroTikResponseParser } from "./mikrotik-parser";
import { LoginFormState, MikroTikData, RadiusDeskUsageResponse, StatusResponse, } from "./mikrotik-types";
import { appConfig } from "@/lib/config";

const Default_Username = appConfig.mikrotik.defaultUsername;
const Default_Password = appConfig.mikrotik.defaultPassword;
const Default_MikrotikBaseUrl = appConfig.mikrotik.baseUrl;

// interface MikroTikLoginResponse {
//     logged_in?: string;
//     error?: string;
//     error_orig?: string;
//     [key: string]: string | undefined;
// }

/**
 * Attempts to log in to a MikroTik Hotspot using provided credentials or a voucher code.
 *
 * If a voucher code is supplied, it is used as both the username and password.
 * Otherwise, default credentials are used. The function constructs the login URL
 * using the provided MikroTik data or a default base URL, then performs a GET request
 * to authenticate the user.
 *
 * The function currently assumes success if the fetch does not throw an error,
 * but contains commented-out logic for parsing and validating the MikroTik response.
 *
 * @param mikrotikData - The MikroTik connection data, including the login link.
 * @param voucherCode - (Optional) A voucher code to use as credentials.
 * @returns A promise resolving to a `LoginFormState` indicating success or failure.
 */
export async function loginToHotspot(mikrotikData: MikroTikData, voucherCode?: string): Promise<LoginFormState> {
    // Credential logic: if voucher code provided, use it as username, otherwise use defaults
    const username = voucherCode || Default_Username;
    const password = voucherCode ? voucherCode : Default_Password;
    const baseUrl = mikrotikData?.loginlink || `${Default_MikrotikBaseUrl}/login`;

    console.log("Default Credentials: ", { username: Default_Username, password: Default_Password });
    console.log("Credentials: ", { username, password });
    // Use provided Mikrotik login link and supply credentials
    const url = `${baseUrl}?${new URLSearchParams({ username, password })}`;

    try {
        await fetch(url, {
            method: "GET",
            redirect: "follow",
            mode: "no-cors", // NECESSARY if using HTTPS in configs
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                // "Content-Type": "text/html"
            }
        });
        // const body = await res.body;
        // const text = await res.text();

        // // console.log("Full Response:", res);
        // console.log("Text response:", text);
        // // console.log("Body Response: ", body);

        // // PROBLEM AREA - We need some smart parsing
        // const result = MikroTikResponseParser.parse(text);
        // console.log("Parse result:", result);
        // // Parse the MikroTik response - it's in a specific format like ({...})
        // let parsedResponse: MikroTikLoginResponse | null = null;
        // try {
        //     // Remove the outer parentheses and parse as JavaScript object
        //     const cleanedText = text.trim().replace(/^\(\s*/, '').replace(/\s*\)$/, '');
        //     // Convert single quotes to double quotes for valid JSON
        //     const jsonText = cleanedText.replace(/'/g, '"');
        //     parsedResponse = JSON.parse(jsonText) as MikroTikLoginResponse;
        //     console.log("Parsed response:", parsedResponse);
        // } catch (parseError) {
        //     console.error("Failed to parse MikroTik response:", parseError);
        //     // Fallback to text analysis if JSON parsing fails
        // }
        // // if (MikroTikResponseParser.isLoggedIn(result)) {
        // //     return { success: true };
        // // } else {
        // //     const errorMessage = MikroTikResponseParser.getErrorMessage(result);
        // //     return { success: false, message: errorMessage };
        // // }
        // // Check for success based on parsed response or text content
        // let success = false;
        // let errorMessage = "Login failed. Please try again.";

        // if (parsedResponse) {
        //     // Check if logged_in is 'yes' and no error exists
        //     success = parsedResponse.logged_in === 'yes' && !parsedResponse.error;

        //     if (!success && parsedResponse.error) {
        //         errorMessage = parsedResponse.error;
        //     } else if (!success && parsedResponse.error_orig) {
        //         errorMessage = parsedResponse.error_orig;
        //     } else if (!success) {
        //         errorMessage = "Authentication failed - not logged in";
        //     }
        // } else {
        //     // Fallback to text analysis
        //     success = res.ok && /logged_in['"]*:\s*['"]*yes/i.test(text) && !/error['"]*:\s*['"]*[^'"]+/i.test(text);

        //     if (!success) {
        //         // Try to extract error message from response
        //         const errorMatch = text.match(/error['"]*:\s*['"]*([^'",\n}]+)/i);
        //         if (errorMatch) {
        //             errorMessage = errorMatch[1].trim();
        //         }
        //     }
        // }

        // if (!success) {
        //     return { success: false, message: errorMessage };
        // }

        // console.log("Login result: ", success);
        return { success: true };
    } catch (err) {
        console.error("Login error:", err);
        const message = (err as Error).message || "An error occurred during login.";
        return { success: false, message: message };
    }
}


/**
 * Retrieves the current user session status from a MikroTik device.
 *
 * @param mikrotikData - Optional data containing the MikroTik status link or configuration.
 * @returns A promise that resolves to a `StatusResponse` object containing the session status or an error message.
 *
 * @remarks
 * - If `mikrotikData` is provided and contains a `link_status`, it will be used as the base URL for the request.
 * - If not provided, a default base URL is used.
 * - The function fetches the status, parses it, and returns the result.
 * - In case of errors (fetch or parsing), it returns a failure response with an appropriate message.
 */
export async function getUserSession(mikrotikData?: MikroTikData): Promise<StatusResponse> {
    const baseUrl = mikrotikData?.link_status || `${Default_MikrotikBaseUrl}/status`;
    // const baseUrl = mikrotikData?.link_status ?? "http://10.5.50.1/status";
    const url = new URL(baseUrl);



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

// Check User's Usage Status
/**
 * Checks the usage information for a user on a RadiusServer by querying the RadiusDesk API.
 *
 * This function formats the MAC address, constructs the appropriate API URL, and fetches
 * usage data for the specified user and MAC address. It handles errors and unexpected
 * response formats gracefully, returning a standardized response object.
 *
 * @param mikrotikData - An object containing MikroTik device data, including the MAC address.
 * @returns A promise that resolves to a `RadiusDeskUsageResponse` object indicating
 *          the success status and usage information or an error message.
 */
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
