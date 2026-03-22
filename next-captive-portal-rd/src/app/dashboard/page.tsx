
// Must run on Server otherwise RadiusDesk requests fails
// import UserSession from '@/components/welcome-page/user-session';
// import InfoCard from '@/components/welcome-page/info-card';

// export default function DashboardPage() {

//     return (
//         <div className="w-full flex flex-col">
//             <div className="flex flex-col items-center justify-start" >
//                 <InfoCard />

//                 <main className="flex items-start justify-start bg-white w-full rounded-t-[20px] pt-3 pb-10 md:items-center md:justify-center max-w-md">
//                     {/* {authState.userSession && ( */}
//                     <UserSession
//                     // status={authState.userSession}
//                     // userUsage={authState.userUsage}
//                     />
//                     {/* )} */}
//                 </main>
//             </div>
//         </div>
//     );
// }

// Must run on Server otherwise RadiusDesk requests fails
"use client";

import React from "react";
import { useTheme } from "@/components/theme-provider";
import { imageUrl } from "@/lib/image-url";
import AdSection from "@/components/ad-section";
import PackagesPlanList from "@/components/packages-plan-list";

export default function Dashboard() {
  const { theme } = useTheme();

  return (
    <div
      className="relative flex flex-col items-center max-w-md w-full h-screen overflow-hidden"
      style={{ background: theme.brandPrimary }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 animate-pulse"
          style={{ background: theme.brandPrimaryHover, filter: 'blur(40px)', animationDuration: '3s' }} />
        <div className="absolute top-32 -left-16 w-48 h-48 rounded-full opacity-15 animate-pulse"
          style={{ background: theme.buttonPrimaryText, filter: 'blur(50px)', animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 animate-pulse"
          style={{ background: theme.brandAccent, filter: 'blur(60px)', animationDuration: '5s', animationDelay: '0.5s' }} />
      </div>

      {/* Top section */}
      <div className="relative z-10 w-full flex flex-col items-center px-6 pt-8 pb-16">
        {/* Glass pill navbar */}
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-full mb-10 w-full justify-between"
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <div className="bg-white rounded-full p-2 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl(theme.logo, theme.ssid)} alt="Brand logo" className="w-8 h-8 object-contain" />
          </div>
          <span className="text-sm font-semibold tracking-wide" style={{ color: theme.textPrimary }}>{theme.name}</span>
          <div className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: theme.brandAccent, color: '#fff' }}>
            My Usage
          </div>
        </div>

        {/* Hero text */}
        <div className="text-center mb-2">
          <p className="text-sm font-medium tracking-widest uppercase mb-3 opacity-70" style={{ color: theme.textPrimary }}>
            Dashboard
          </p>
          <h1 className="text-4xl font-bold leading-tight mb-2" style={{ color: theme.textPrimary, textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}>
            Welcome back 👋
          </h1>
          <p className="text-sm opacity-75" style={{ color: theme.textPrimary }}>
            View your usage details below
          </p>
        </div>
      </div>

      {/* Wave SVG divider */}
      <div className="relative z-10 w-full -mt-8">
        <svg viewBox="0 0 428 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none" style={{ display: 'block', height: '48px' }}>
          <path d="M0 48 C80 10, 160 0, 214 20 C268 40, 348 50, 428 20 L428 48 Z" fill={theme.brandSecondary} />
        </svg>
      </div>

      {/* Bottom section */}
      <div className="relative z-10 w-full flex-1 px-5 pb-6 pt-2 overflow-y-auto" style={{ background: theme.brandSecondary }}>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px opacity-20" style={{ background: theme.textSecondary }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.textSecondary }}>Current Plan</span>
          <div className="flex-1 h-px opacity-20" style={{ background: theme.textSecondary }} />
        </div>

        {/* Current plan card */}
        <div
          className="rounded-2xl p-4 flex flex-col gap-2 mb-5 shadow-lg"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.6)' }}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: theme.textSecondary }}>Free plan</span>
            <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>R0.00</span>
          </div>
          <div className="text-3xl font-bold" style={{ color: theme.brandPrimary }}>
            1.41 <span className="text-lg">GB</span>
          </div>
          <div className="text-xs mb-1" style={{ color: theme.textSecondary }}>left of 2.0 GB</div>
          <div className="w-full h-2 rounded-full mb-2" style={{ background: 'rgba(0,0,0,0.1)' }}>
            <div className="h-2 rounded-full" style={{ width: "70%", background: theme.brandPrimary }} />
          </div>
          <div className="flex justify-between text-xs" style={{ color: theme.textSecondary }}>
            <span>Expires on <br /><span className="font-semibold" style={{ color: theme.textPrimary }}>4th Apr, 2025</span></span>
            <span>Speed <br /><span className="font-semibold" style={{ color: theme.textPrimary }}>10 Mbps</span></span>
          </div>
        </div>

        {/* Change plan */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px opacity-20" style={{ background: theme.textSecondary }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.textSecondary }}>Change Plan</span>
          <div className="flex-1 h-px opacity-20" style={{ background: theme.textSecondary }} />
        </div>

        <PackagesPlanList ssid={theme.ssid} />
        <AdSection />
      </div>
    </div>
  );
}


