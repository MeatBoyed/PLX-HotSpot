import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { env } from "@/env";
import Footer from "@/components/footer";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Theme will load client-side (with spinner) & poll for updates
  console.log("RootLayout env.NEXT_PUBLIC_SSID: ", env.NEXT_PUBLIC_SSID);
  return (
    <html lang="en">
      <body
        className={`antialiased min-h-screen flex flex-col justify-between bg-gray-50`}
      >
        <ThemeProvider ssid={env.NEXT_PUBLIC_SSID} showInitialSpinner>
          <div className="flex flex-col justify-center" >
            {children}
            {/* Make Static and fixed to bottm */}
            {/* <AdSection /> */}
          </div>
          <Footer />
          {/* <footer className="w-full py-4 flex flex-row items-center justify-center gap-3 text-center bg-gray-300">
            <span className="text-[10px] uppercase tracking-wide text-gray-500">Powered By</span>
            <img
              src="/pluxnet-logo.svg"
              alt="PluxNet"
              className="h-5 w-auto opacity-80"
              draggable={false}
            />
          </footer> */}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body >
    </html >

  );
}
