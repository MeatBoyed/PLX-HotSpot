"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Navbar } from "@/components/home-page/head";
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
    {
      name: "SAP 2000-2008",
      src: "https://ditsong.org.za/en/wp-content/uploads/2026/01/Article-Cover.jpg",
    },
    {
      name: "THE PRIDE OF THE ZULU: A LEGACY OF STRENGTH AND CULTURE",
      src: "https://ditsong.org.za/en/wp-content/uploads/2025/12/Picture-3-1.jpg",
    },
    {
      name: "THE MILITARY ROLE OF A NEW SOUTH AFRICA (1998-2000)",
      src: "https://ditsong.org.za/en/wp-content/uploads/2026/01/Picture-2.jpg",
    },
  ];

  useEffect(() => {
    try {
      const fromStorage = localStorage.getItem("pu-phonename-display") || "";
      setStoredName(normalizeName(fromStorage));
    } catch {
      setStoredName("");
    }
  }, []);

  const displayName = useMemo(() => {
    if (storedName) return storedName;

    return "Guest";
  }, [storedName]);

  return (
    <div style={{ background: theme.brandPrimary }} className="flex items-center justify-between flex-col max-w-md w-full min-h-[95vh]">
      <Navbar />

      {/* Welcome Text */}
      <div className="flex flex-col items-center mt-8 mb-6 w-full">
        <h1 className="text-3xl font-semibold text-center" style={{ color: theme.textPrimary }}>
          Welcome {storedName ? storedName : displayName},
          <br />
          to {theme.name} 
        </h1>
      </div>


      {/* Main Card Section */}
      <div className="rounded-t-3xl pt-6 pb-3 px-4 min-h-[50vh] w-full" style={{ background: theme.brandSecondary }}>
        {/* Plans */}
        <h2 className="text-white text-xl text-center  font-medium mb-4">
          You are now connected to the internet. Enjoy your browsing experience!
        </h2>

        <div className="w-full mt-10">
          <p className="text-center text-lg font-medium text-black-500 mb-3">Our affiliates</p>
          <div className="w-full overflow-hidden">
            <div className="grid grid-cols-3 gap-2">
              {affiliateImages.map(({ name, src }) => (
                <div key={name} className="w-full">
                  <img
                    src={src}
                    alt={name}
                    className="w-full h-auto rounded-lg border border-black-200"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 w-full">
          <p className="text-center text-lg font-medium text-black-500 mb-4">More of us</p>
          <div className="w-full overflow-hidden">
            <div className="flex flex-nowrap items-center justify-center gap-4">
              {socialLinks.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  title={name}
                  className="h-11 w-11 shrink-0 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors duration-200 flex items-center justify-center"
                >
                  <Icon size={25} />
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>

      <AdSection />
    </div>
  );
}
