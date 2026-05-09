import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { env } from "@/env";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: env.SITE_TITLE,
  description: env.SITE_DESCRIPTION,
};

// Root layout — shell only. Per-site branding is loaded by [ssid]/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col justify-between bg-gray-50">
        <ThemeProvider ssid="" showInitialSpinner={false}>
          <div className="flex flex-col justify-center items-center">
            {children}
          </div>
          <Footer />
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
