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
    <div style={{ background: theme.brandPrimary }} className="flex items-center justify-between flex-col max-w-md w-full min-h-[80vh]">
      <Navbar />

      {/* Welcome Text */}
      <div className="flex flex-col items-center mt-8 mb-6 w-full">
        <h1 className="text-2xl font-semibold text-center" style={{ color: theme.textPrimary }}>
          {/* Welcome to Pluxnet <br /> Public WiFi */}
          Welcome {storedName ? storedName : displayName},
          <br />
          {/* {theme.heading} */}
          {/* </h1>
        <h1 className="text-2xl font-semibold text-center" style={{ color: theme.textPrimary }}> */}
          to Joburg Theatre Wi-Fi
          {/* {theme.heading} */}
        </h1>
      </div>

      {/* Main Card Section */}
      {/* <div className="bg-white rounded-t-3xl pt-6 pb-3 px-4 min-h-[50vh] w-full"> */}
      {/* Plans */}
      {/* <h2 className="text-gray-500 text-md font-medium mb-4">
          Get Started
        </h2> */}

      {/* </div> */}
      <AdSection />
    </div>
  );
}
