"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { imageUrl } from "@/lib/image-url";
import AdSection from "@/components/ad-section";
import { Youtube, Instagram, Facebook } from "lucide-react";

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
  const [storedName, setStoredName] = useState("");

  const socialLinks = [
    { name: "YouTube", href: "https://www.youtube.com", Icon: Youtube },
    { name: "Instagram", href: "https://www.instagram.com", Icon: Instagram },
    { name: "Facebook", href: "https://www.facebook.com", Icon: Facebook },
  ];

  const affiliateImages = [
    { name: "SAP 2000-2008", src: "https://ditsong.org.za/en/wp-content/uploads/2026/01/Article-Cover.jpg" },
    { name: "Pride of the Zulu", src: "https://ditsong.org.za/en/wp-content/uploads/2025/12/Picture-3-1.jpg" },
    { name: "Military Role", src: "https://ditsong.org.za/en/wp-content/uploads/2026/01/Picture-2.jpg" },
  ];

  useEffect(() => {
    try {
      const fromStorage = localStorage.getItem("pu-phonename-display") || "";
      setStoredName(normalizeName(fromStorage));
    } catch {
      setStoredName("");
    }
  }, []);

  const displayName = useMemo(() => storedName || "Guest", [storedName]);

  return (
    <div
      className="relative flex flex-col items-center max-w-md w-full h-screen overflow-hidden"
      style={{ background: theme.brandPrimary }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 animate-pulse"
          style={{ background: theme.brandPrimaryHover, filter: 'blur(40px)', animationDuration: '3s' }} />
        <div className="absolute top-32 -left-16 w-48 h-48 rounded-full opacity-15 animate-pulse"
          style={{ background: theme.buttonPrimaryText, filter: 'blur(50px)', animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 animate-pulse"
          style={{ background: theme.brandAccent, filter: 'blur(60px)', animationDuration: '5s', animationDelay: '0.5s' }} />
      </div>

      {/* Top section */}
      <div className="relative z-10 w-full flex flex-col items-center px-6 pt-8 pb-16">
        {/* Glass pill navbar */}
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-full mb-10 w-full justify-between"
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <div className="bg-white rounded-full p-2 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl(theme.logo, theme.ssid)} alt="Brand logo" className="w-8 h-8 object-contain" />
          </div>
          <span className="text-sm font-semibold tracking-wide" style={{ color: theme.textPrimary }}>{theme.name}</span>
          <div className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: theme.brandAccent, color: '#fff' }}>
            Connected ✓
          </div>
        </div>

        {/* Hero text */}
        <div className="text-center mb-2">
          <p className="text-sm font-medium tracking-widest uppercase mb-3 opacity-70" style={{ color: theme.textPrimary }}>
            You're online
          </p>
          <h1 className="text-4xl font-bold leading-tight mb-2" style={{ color: theme.textPrimary, textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}>
            Welcome,<br />{displayName}
          </h1>
          <p className="text-sm opacity-75" style={{ color: theme.textPrimary }}>
            to {theme.name}
          </p>
        </div>
      </div>

      {/* Wave SVG divider */}
      <div className="relative z-10 w-full -mt-8">
        <svg viewBox="0 0 428 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none" style={{ display: 'block', height: '48px' }}>
          <path d="M0 48 C80 10, 160 0, 214 20 C268 40, 348 50, 428 20 L428 48 Z" fill={theme.brandSecondary} />
        </svg>
      </div>

      {/* Bottom section */}
      <div className="relative z-10 w-full flex-1 px-5 pb-6 pt-2 overflow-y-auto" style={{ background: theme.brandSecondary }}>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px opacity-20" style={{ background: theme.textSecondary }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.textSecondary }}>Enjoy Browsing</span>
          <div className="flex-1 h-px opacity-20" style={{ background: theme.textSecondary }} />
        </div>

        <div
          className="rounded-2xl p-4 mb-5 text-center shadow-lg"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.6)' }}
        >
          <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
            You are now connected to the internet. Enjoy your browsing experience!
          </p>
        </div>

        {/* Affiliates */}
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: theme.textSecondary }}>Our affiliates</p>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {affiliateImages.map(({ name, src }) => (
            <div key={name} className="w-full rounded-xl overflow-hidden shadow-md" style={{ border: '1px solid rgba(255,255,255,0.4)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={name} className="w-full h-auto" loading="lazy" />
            </div>
          ))}
        </div>

        {/* Social links */}
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: theme.textSecondary }}>More of us</p>
        <div className="flex items-center justify-center gap-4 mb-4">
          {socialLinks.map(({ name, href, Icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              className="h-11 w-11 shrink-0 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.85)', color: theme.brandPrimary }}
            >
              <Icon size={22} />
            </a>
          ))}
        </div>

        <AdSection />
      </div>
    </div>
  );
}
