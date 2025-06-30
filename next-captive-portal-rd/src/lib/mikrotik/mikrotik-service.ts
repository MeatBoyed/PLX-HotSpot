"use server"
// Must run Client side to use Brower's Fetch/Network to access Mikrotik Hotspot on the network
import { parseMikroTikStatus } from "./mikrotik-lib";
import { LoginFormState, MikroTikData, RadiusDeskUsageResponse, StatusResponse, } from "./mikrotik-types";

const Default_Username = "click_to_connect@dev";

export async function loginToHotspot(mikrotikData: MikroTikData, voucherCode?: string): Promise<LoginFormState> {
    // Default credentials (No Registration)
    const username = voucherCode ?? Default_Username;
    const password = voucherCode ?? "click_to_connect";

    console.log("Credentials: ", { username, password });
    // Use provided Mikrotik login link and supply credentials
    const url = `${mikrotikData.loginlink}?${new URLSearchParams({ username, password })}`;

    try {
        const res = await fetch(url, { method: "GET", redirect: "follow" });
        const text = await res.text();
        const success = res.ok && /already|logged/i.test(text);

        if (!success) {
            return { success: false, message: "Login failed. Please try again." };
        }

        return { success: true };
    } catch (err) {
        // console.error("Login error:", err);
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

        // console.log("Response: ", res)
        // console.log("Raw Text res: ", rawText);

        const status = await parseMikroTikStatus(rawText);
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

    const url = new URL("https://radiusdesk.pluxnet.co.za/cake4/rd_cake/radaccts/get-usage.json");
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

