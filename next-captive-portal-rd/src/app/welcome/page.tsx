"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { imageUrl } from "@/lib/image-url";
import AdSection from "@/components/ad-section";
import { Youtube, Instagram, Facebook } from "lucide-react";
import MarketingOptInCard from "@/components/marketing-optin-card";

function normalizeName(value: string | null | undefined) {
  if (!value) return "";
  const cleaned = decodeURIComponent(value).replace(/[_+]/g, " ").trim();
  return cleaned.split(/\s+/).filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ");
}

export default function WelcomePage() {
  const { theme } = useTheme();
  const [storedName, setStoredName] = useState("");

  const socialLinks = [
    { name: "YouTube", href: "https://www.youtube.com", Icon: Youtube },
    { name: "Instagram", href: "https://www.instagram.com", Icon: Instagram },
    { name: "Facebook", href: "https://www.facebook.com", Icon: Facebook },
  ];

  useEffect(() => {
    try {
      const fromStorage = localStorage.getItem("pu-phonename-display") || "";
      setStoredName(normalizeName(fromStorage));
    } catch { setStoredName(""); }
  }, []);

  const displayName = useMemo(() => storedName || "Guest", [storedName]);

  return (
    <div className="relative flex flex-col items-center max-w-md w-full h-screen overflow-hidden"
      style={{ background: theme.brandPrimary }}>

      {/* Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 animate-pulse"
          style={{ background: theme.brandPrimaryHover, filter: 'blur(40px)', animationDuration: '3s' }} />
        <div className="absolute top-32 -left-16 w-48 h-48 rounded-full opacity-15 animate-pulse"
          style={{ background: theme.buttonPrimaryText, filter: 'blur(50px)', animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 animate-pulse"
          style={{ background: theme.brandAccent, filter: 'blur(60px)', animationDuration: '5s', animationDelay: '0.5s' }} />
      </div>

      {/* Top section — ultra compact */}
      <div className="relative z-10 w-full flex flex-col items-center px-5 pt-4 pb-7">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full mb-3 w-full justify-between"
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div className="bg-white rounded-full p-1.5 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl(theme.logo, theme.ssid)} alt="Brand logo" className="w-6 h-6 object-contain" />
          </div>
          <span className="text-sm font-semibold tracking-wide" style={{ color: theme.textPrimary }}>{theme.name}</span>
          {/* <div className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: theme.brandAccent, color: '#fff' }}>
            Connected ✓
          </div> */}
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold leading-tight mb-0.5"
            style={{ color: theme.textPrimary, textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}>
            Welcome, {displayName}
          </h1>
          <p className="text-xs opacity-75" style={{ color: theme.textPrimary }}>to {theme.name}</p>
        </div>
      </div>

      {/* Wave */}
      <div className="relative z-10 w-full -mt-4">
        <svg viewBox="0 0 428 48" fill="none" xmlns="http://www.w3.org/2000/svg"
          className="w-full" preserveAspectRatio="none" style={{ display: 'block', height: '40px' }}>
          <path d="M0 48 C80 10, 160 0, 214 20 C268 40, 348 50, 428 20 L428 48 Z" fill={theme.brandSecondary} />
        </svg>
      </div>

      {/* Bottom */}
      <div className="relative z-10 w-full flex-1 px-5 pb-4 pt-2 overflow-y-auto"
        style={{ background: theme.brandSecondary }}>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px opacity-20" style={{ background: theme.textSecondary }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.textSecondary }}>Enjoy Browsing</span>
          <div className="flex-1 h-px opacity-20" style={{ background: theme.textSecondary }} />
        </div>

        <div className="rounded-2xl p-3 mb-3 text-center shadow-lg"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.6)' }}>
          <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>
            You are now connected to the internet. Enjoy your browsing experience!
          </p>
        </div>

        <p className="text-xs font-bold tracking-widest uppercase mb-1.5" style={{ color: theme.textSecondary }}>More of us</p>
        <div className="flex items-center justify-center gap-4 mb-3">
          {socialLinks.map(({ name, href, Icon }) => (
            <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={name}
              className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.85)', color: theme.brandPrimary }}>
              <Icon size={20} />
            </a>
          ))}
        </div>

        {theme.marketingOptIn && <MarketingOptInCard />}

        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px opacity-20" style={{ background: theme.textSecondary }} />
        </div>

        <AdSection />
      </div>
    </div>
  );
}
