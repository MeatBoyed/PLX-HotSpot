"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";
import { LoginFormState, RadiusDeskUsageResponse } from "@/lib/mikrotik/mikrotik-types";
import { appConfig } from "@/lib/config";

interface ConnectContextType {
    connect: (voucherCode?: string) => Promise<LoginFormState>;
    showAd: boolean;
    adUrl: string;
    isDepleted: boolean;
    isLoading: boolean;
    onAdComplete: () => void;
}

const ConnectContext = createContext<ConnectContextType | undefined>(undefined);

export function useConnect() {
    const context = useContext(ConnectContext);
    if (!context) {
        throw new Error("useConnect must be used within ConnectProvider");
    }
    return context;
}

export function ConnectProvider({ children, userUsage, mikrotikLoginUrl }: { children: ReactNode, userUsage?: RadiusDeskUsageResponse, mikrotikLoginUrl?: string }) {
    const [showAd, setShowAd] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingVoucherCode, setPendingVoucherCode] = useState<string | undefined>(undefined);

    const isDepleted = userUsage?.data?.depleted || false;
    const adUrl = "https://servedby.revive-adserver.net/fc.php?script=apVideo:vast2&zoneid=24615";
    const loginUrl = mikrotikLoginUrl || "http://10.5.50.1/login";

    // Main Connect method - This method will handle the login process and show the ad if it's the first login
    const connect = async (voucherCode?: string): Promise<LoginFormState> => {
        if (isLoading) {
            return { success: false, message: "Authentication in progress" };
        }

        // Store voucher code for later use
        setPendingVoucherCode(voucherCode);

        // IsDepleted False: User hasn't used up Free data (Show Ad), True: User has used up Free data (Don't Show Ad)
        if (!isDepleted) {
            setShowAd(true);
            return { success: false, message: "Waiting for ad to complete" };
        }

        return await doLogin(voucherCode);
    };

    // Main Login method - Authenticates with Mikrotik using browser navigation
    const doLogin = async (voucherCode?: string): Promise<LoginFormState> => {
        setIsLoading(true);

        const loadingToast = toast.loading(appConfig.messages.loadingConnect);

        try {
            // Determine credentials
            const username = voucherCode || appConfig.mikrotik.defaultUsername;
            const password = voucherCode || appConfig.mikrotik.defaultPassword;

            // Construct the final URL
            const finalUrl = `${loginUrl}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

            console.log("ConnectContext navigating to:", finalUrl);

            // Dismiss loading toast before navigation
            toast.dismiss(loadingToast);
            toast.success(appConfig.messages.successConnect);

            // Small delay then navigate
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.location.href = finalUrl;

            return { success: true, message: "Redirecting to authentication..." };
        } catch (error) {
            console.error("Login error:", error);

            // Dismiss loading toast
            toast.dismiss(loadingToast);

            const errorResult = {
                success: false,
                message: error instanceof Error ? error.message : "Authentication failed"
            };

            toast.error(errorResult.message);
            return errorResult;
        } finally {
            setIsLoading(false);
        }
    };

    // Callback for when the Ad completes playing
    const onAdComplete = async () => {
        setShowAd(false);
        await doLogin(pendingVoucherCode);
        setPendingVoucherCode(undefined);
    };

    return (
        <ConnectContext.Provider value={{
            connect,
            showAd,
            adUrl,
            onAdComplete,
            isDepleted,
            isLoading
        }}>
            {children}
        </ConnectContext.Provider>
    );
}
