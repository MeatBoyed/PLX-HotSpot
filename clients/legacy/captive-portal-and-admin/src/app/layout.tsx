import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AdBanner from "@/components/home-page/ad-banner";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { appConfig } from "@/lib/config";
import { hotspotAPI } from "@/lib/hotspotAPI";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// Get theme from config - could be environment variable or build-time setting
const theme = appConfig.theme.selectedTheme || 'pluxnet';

export const metadata: Metadata = {
  title: appConfig.site.title,
  description: appConfig.site.description,
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
    <html lang="en" data-theme={theme} >
      <body
        className={`antialiased min-h-screen bg-gray-50`}
      >
        <ThemeProvider initialTheme={results.res} >
          <div className="flex flex-col justify-between min-h-screen">
            {/* Theme Switcher for testing */}
            {appConfig.useSeedData && (
              <ThemeSwitcher />
            )}
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
