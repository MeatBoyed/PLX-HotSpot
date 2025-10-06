import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { env } from "@/env";
import Footer from "@/components/footer";
import { BrandingService } from "@/lib/services/branding-service";
import { ClerkProvider } from "@clerk/nextjs";
// Removed server-side fetch; ThemeProvider will fetch client-side for runtime updates

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const ssid = env.NEXT_PUBLIC_SSID;
  let branding = undefined;
  try {
    branding = await BrandingService.get(ssid);
  } catch (e) {
    if (env.NODE_ENV !== 'production') {
      console.debug('RootLayout branding fetch failed, falling back', e);
    }
  }
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased min-h-screen flex flex-col justify-between bg-gray-50">
          <ThemeProvider ssid={ssid} initialTheme={branding} showInitialSpinner={!branding}>
            <div className="flex flex-col justify-center items-center ">
              {children}
            </div>
            <Footer />
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
