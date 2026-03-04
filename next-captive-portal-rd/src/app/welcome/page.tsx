"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { Navbar } from "@/components/home-page/head";
import AdSection from "@/components/ad-section";

function normalizeName(value: string | null | undefined) {
    if (!value) return "";
    const cleaned = decodeURIComponent(value).replace(/[_+]/g, " ").trim();
    return cleaned
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
}

export default function WelcomePage() {
    const { theme } = useTheme();
    const searchParams = useSearchParams();
    const [storedName, setStoredName] = useState("");

    useEffect(() => {
        try {
            const fromStorage = localStorage.getItem("pu-phonename-display") || "";
            setStoredName(normalizeName(fromStorage));
        } catch {
            setStoredName("");
        }
    }, []);

    const displayName = useMemo(() => {
        const fromName = normalizeName(searchParams.get("name"));
        if (fromName) return fromName;

        const fromUsername = normalizeName(searchParams.get("username"));
        if (fromUsername && /[a-zA-Z]/.test(fromUsername)) return fromUsername;

        if (storedName) return storedName;

        return "Guest";
    }, [searchParams, storedName]);

    return (
        <div style={{ background: theme.background }} className="flex items-center justify-center flex-col max-w-md w-full min-h-[80vh]">
            <Navbar />

            <div className="w-full mt-8">
                <div className="bg-white rounded-t-3xl px-5 pt-8 pb-8 min-h-[42vh] flex flex-col justify-center">
                    <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>
                        Welcome to {theme.name}
                    </p>
                    <h1 className="text-2xl font-semibold leading-tight" style={{ color: theme.textPrimary }}>
                        Hello, {displayName}
                    </h1>
                    <p className="mt-3 text-sm" style={{ color: theme.textSecondary }}>
                        You are now connected. Enjoy your internet access.
                    </p>
                </div>
            </div>

            <AdSection />
        </div>
    );
}
