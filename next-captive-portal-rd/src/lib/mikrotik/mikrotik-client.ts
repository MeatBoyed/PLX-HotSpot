"use client";
// Client-side wrapper for authentication services
import { LoginFormState, MikroTikData } from "./mikrotik-types";
import { appConfig } from "@/lib/config";

const Default_Username = appConfig.mikrotik.defaultUsername;
const Default_Password = appConfig.mikrotik.defaultPassword;

// Global references for iframe login
let iframeElement: HTMLIFrameElement | null = null;
let formElement: HTMLFormElement | null = null;

function createLoginElements(): { iframe: HTMLIFrameElement; form: HTMLFormElement } {
    // Create iframe if it doesn't exist
    if (!iframeElement) {
        iframeElement = document.createElement('iframe');
        iframeElement.name = 'mikrotik-login-frame';
        iframeElement.style.cssText = 'position: absolute; left: -9999px; width: 1px; height: 1px; visibility: hidden;';
        document.body.appendChild(iframeElement);
    }

    // Create form if it doesn't exist
    if (!formElement) {
        formElement = document.createElement('form');
        formElement.method = 'GET';
        formElement.target = 'mikrotik-login-frame';
        formElement.style.display = 'none';

        // Add username input
        const usernameInput = document.createElement('input');
        usernameInput.type = 'hidden';
        usernameInput.name = 'username';
        formElement.appendChild(usernameInput);

        // Add password input
        const passwordInput = document.createElement('input');
        passwordInput.type = 'hidden';
        passwordInput.name = 'password';
        formElement.appendChild(passwordInput);

        document.body.appendChild(formElement);
    }

    return { iframe: iframeElement, form: formElement };
}

function parseIframeResponse(iframe: HTMLIFrameElement): LoginFormState {
    try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

        if (!iframeDoc) {
            return { success: false, message: "Unable to access login response" };
        }

        const bodyText = iframeDoc.body?.textContent || iframeDoc.body?.innerText || '';
        const bodyHTML = iframeDoc.body?.innerHTML || '';

        console.log("Login response text:", bodyText);

        // Check for success indicators
        if (/logged.?in['"]*:\s*['"]*yes/i.test(bodyText) || /logged.?in['"]*:\s*['"]*yes/i.test(bodyHTML)) {
            return { success: true };
        }

        // Check for known error patterns
        if (/used.*daily.*data.*allowance/i.test(bodyText)) {
            return { success: false, message: "You have used your daily data allowance" };
        }

        if (/invalid.*credentials/i.test(bodyText) || /authentication.*failed/i.test(bodyText)) {
            return { success: false, message: "Invalid credentials" };
        }

        if (/expired.*voucher/i.test(bodyText)) {
            return { success: false, message: "Voucher has expired" };
        }

        if (/voucher.*not.*found/i.test(bodyText)) {
            return { success: false, message: "Voucher not found" };
        }

        // Try to extract error message from response
        const errorMatch = bodyText.match(/error['"]*:\s*['"]*([^'",\n}]+)/i);
        if (errorMatch) {
            return { success: false, message: errorMatch[1].trim() };
        }

        // Default fallback
        return { success: false, message: "Login failed. Please try again." };

    } catch (error) {
        console.error("Error parsing login response:", error);
        return { success: false, message: "Failed to parse login response" };
    }
}

async function getMikroTikData(): Promise<MikroTikData | null> {
    try {
        const response = await fetch('/api/status', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch MikroTik data');
        }

        const result = await response.json();

        if (result.success && result.mikrotikData) {
            return result.mikrotikData as MikroTikData;
        }

        throw new Error('No MikroTik data available');
    } catch (error) {
        console.error("Error getting MikroTik data:", error);
        return null;
    }
}

export async function clientLoginToHotspot(voucherCode?: string): Promise<LoginFormState> {
    try {
        // Get MikroTik data to know the login URL
        const mikrotikData = await getMikroTikData();

        if (!mikrotikData) {
            // Fallback to API approach if no MikroTik data available
            return await clientLoginToHotspotAPI(voucherCode);
        }

        // Use iframe-based login for client-side CORS bypass
        return await loginWithIframe(mikrotikData, voucherCode);

    } catch (error) {
        console.error("Client login error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Login failed"
        };
    }
}

async function loginWithIframe(mikrotikData: MikroTikData, voucherCode?: string): Promise<LoginFormState> {
    return new Promise((resolve) => {
        const { iframe, form } = createLoginElements();

        // Set credentials
        const username = voucherCode || Default_Username;
        const password = voucherCode ? voucherCode : Default_Password;

        console.log("Logging in with credentials:", { username, password });

        // Set form action and inputs
        form.action = mikrotikData.loginlink;
        (form.querySelector('input[name="username"]') as HTMLInputElement).value = username;
        (form.querySelector('input[name="password"]') as HTMLInputElement).value = password;

        // Set up timeout
        const timeout = setTimeout(() => {
            resolve({ success: false, message: "Login timeout. Please try again." });
        }, 10000);

        // Set up iframe load handler
        iframe.onload = () => {
            clearTimeout(timeout);
            const result = parseIframeResponse(iframe);
            resolve(result);
        };

        // Submit the form
        form.submit();
    });
}

// Fallback to original API approach
async function clientLoginToHotspotAPI(voucherCode?: string): Promise<LoginFormState> {
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
