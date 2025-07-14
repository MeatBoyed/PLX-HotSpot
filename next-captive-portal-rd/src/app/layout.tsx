import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AdBanner from "@/components/home-page/ad-banner";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ClientThemeSwitcher } from "@/components/client-theme-switcher";
import { appConfig } from "@/lib/config";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: appConfig.site.title,
  description: appConfig.site.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}
        className={`antialiased min-h-screen bg-gray-50`}
      // style={{ backgroundColor: 'var(--brand-primary)' }}
      >
        <ThemeProvider>
          <div className="flex flex-col justify-between min-h-screen">
            {/* Theme Switcher for testing */}
            <ClientThemeSwitcher />

            {/* Logo / Navbar */}
            {children}
            {/* Ads Manager */}
            <AdBanner />
            <Toaster position="top-center" richColors />
          </div>
        </ThemeProvider>
      </body>
    </html>

  );
}
