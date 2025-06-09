import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AdBanner from "@/components/home-page/ad-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PluxNet Fibre HotSpot",
  description: "PluxNet Fibre HotSpot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}
      >
        <div className="flex flex-col justify-between min-h-screen">

          {/* Logo / Navbar */}
          {children}
          {/* Ads Manager */}
          <AdBanner />
        </div>
      </body>
    </html>

  );
}
