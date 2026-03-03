"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme-provider";

export default function Footer() {
  const pathname = usePathname();
  const { theme } = useTheme();

  // Existing image logic
  let defaultSrc = "/footer-branding.png";
  if (pathname.includes("splash")) defaultSrc = "/branding-footer-light.png";

  // DB-driven switch (no enums, no crashes)
  const brandText = `${theme?.name ?? ""} ${theme?.heading ?? ""}`.toLowerCase();
  const isPronet = brandText.includes("pronet") || brandText.includes("joburg");

  return (
    <footer className="w-full py-4 flex flex-row items-center justify-center gap-3 text-center">
      <Link href="/" className="flex items-center gap-2">
        {isPronet ? (
          <span className="text-[11px] uppercase tracking-wide opacity-80">
            Powered by Pronet
          </span>
        ) : (
          <img
            src={defaultSrc}
            alt="Powered by"
            className="h-5 w-auto opacity-80"
            draggable={false}
          />
        )}
      </Link>
    </footer>
  );
}