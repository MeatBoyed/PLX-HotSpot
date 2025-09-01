import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AdBanner from "@/components/home-page/ad-banner";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { env } from "@/env";
import { hotspotAPI } from "@/lib/hotspotAPI";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: env.SITE_TITLE,
  description: env.SITE_DESCRIPTION,
};

async function getBrandConfig() {
  // TODO: Load SSID from .env
  return await hotspotAPI.getApiportalconfig({ queries: { ssid: "Jozi-wifi" } });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const results = await getBrandConfig();
  // console.log("Results: ", results)

  return (
    <html lang="en" data-theme={"pluxnet"} >
      <body
        className={`antialiased min-h-screen bg-gray-50`}
      >
        <ThemeProvider initialTheme={results.res} >
          <div className="flex flex-col justify-between min-h-screen">
            {children}
            {/* Make Static and fixed to bottm */}
            <AdBanner />
          </div>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>

  );
}
