"use client"
import { PlanCard } from '@/components/plan-card';
import { useTheme } from "@/components/theme-provider";
import AdSection from "@/components/ad-section";
import { imageUrl } from "@/lib/image-url";
import VoucherCTA from '@/components/voucher-cta';
import AuthMethodsCard from '@/components/home-page/AuthMethodsCard';

export default function HomePage() {
  const { theme } = useTheme()

  return (
    <div
      className="relative flex flex-col items-center max-w-md w-full h-screen overflow-hidden"
      style={{ background: theme.brandPrimary }}
    >
      {/* Animated background orbs using venue colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 animate-pulse"
          style={{
            background: theme.brandPrimaryHover,
            filter: 'blur(40px)',
            animationDuration: '3s'
          }}
        />
        <div
          className="absolute top-32 -left-16 w-48 h-48 rounded-full opacity-15 animate-pulse"
          style={{
            background: theme.buttonPrimaryText,
            filter: 'blur(50px)',
            animationDuration: '4s',
            animationDelay: '1s'
          }}
        />
        <div
          className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 animate-pulse"
          style={{
            background: theme.brandAccent,
            filter: 'blur(60px)',
            animationDuration: '5s',
            animationDelay: '0.5s'
          }}
        />
      </div>

      {/* Top section — compact on mobile, roomier on larger screens */}
      <div className="relative z-10 w-full flex flex-col items-center px-5 pt-4 pb-8 sm:px-6 sm:pt-8 sm:pb-16">

        {/* Logo with glass pill navbar */}
        <div
          className="flex items-center gap-3 px-4 py-2 sm:px-5 sm:py-3 rounded-full mb-4 sm:mb-10 w-full justify-between"
          style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <div className="bg-white rounded-full p-1.5 sm:p-2 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl(theme.logo, theme.ssid)}
              alt="Brand logo"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
            />
          </div>
          <span className="text-sm font-semibold tracking-wide" style={{ color: theme.textPrimary }}>
            {theme.name}
          </span>
          <div
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: theme.brandAccent, color: '#fff' }}
          >
            Free WiFi
          </div>
        </div>

        {/* Hero text */}
        <div className="text-center mb-1 sm:mb-2">
          <h1
            className="text-2xl sm:text-4xl font-bold leading-tight mb-2 sm:mb-4"
            style={{ color: theme.textPrimary, textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}
          >
            {theme.heading || `Welcome to ${theme.name}`}
          </h1>
          {theme.subheading && (
            <p className="text-xs sm:text-sm opacity-75" style={{ color: theme.textPrimary }}>
              {theme.subheading}
            </p>
          )}
        </div>
      </div>

      {/* Wave SVG divider */}
      <div className="relative z-10 w-full -mt-4 sm:-mt-8">
        <svg
          viewBox="0 0 428 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
          style={{ display: 'block', height: '32px' }}
        >
          <path
            d="M0 48 C80 10, 160 0, 214 20 C268 40, 348 50, 428 20 L428 48 Z"
            fill={theme.brandSecondary}
          />
        </svg>
      </div>

      {/* Bottom card section — fits remaining space without scrolling */}
      <div
        className="relative z-10 w-full flex-1 flex flex-col px-5 pb-4 pt-1 sm:pb-6 sm:pt-2 overflow-hidden"
        style={{ background: theme.brandSecondary }}
      >
        {/* Section label */}
        <div className="flex items-center gap-3 mb-3 sm:mb-5">
          <div className="flex-1 h-px opacity-20" style={{ background: theme.textSecondary }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.textSecondary }}>
            Get Started
          </span>
          <div className="flex-1 h-px opacity-20" style={{ background: theme.textSecondary }} />
        </div>

        <AuthMethodsCard />
        {/* Signal strength decorative element */}
        <div className="flex items-center justify-center gap-1 mt-3 sm:mt-6 mb-2 sm:mb-4">
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className="rounded-full"
              style={{
                width: '4px',
                height: `${bar * 6}px`,
                background: theme.brandPrimary,
                opacity: 0.4 + bar * 0.15,
              }}
            />
          ))}
          <span className="text-xs ml-2 font-medium" style={{ color: theme.textSecondary }}>
            Strong signal
          </span>
        </div>

        {/* Ad pinned to bottom of viewport */}
        <div className="mt-4">
          <AdSection />
        </div>
      </div>
    </div>
  );
}



