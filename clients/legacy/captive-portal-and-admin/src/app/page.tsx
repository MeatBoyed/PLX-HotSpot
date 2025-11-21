"use client"
import { PlanCard } from '@/components/plan-card';
import { useTheme } from "@/components/theme-provider";
import AdSection from "@/components/ad-section";
// import VoucherCTA from '@/components/voucher-cta';
import { Navbar } from '@/components/home-page/head';
import VoucherCTA from '@/components/voucher-cta';
import PackagesPlanList from '@/components/packages-plan-list';


export default function HomePage() {
  const { theme } = useTheme()
  return (
    <div style={{ background: theme.brandPrimary }} className="flex items-center justify-center flex-col max-w-md w-full" >
      <Navbar />

      {/* Welcome Text */}
      <div className="flex flex-col items-center mt-8 mb-6 w-full">
        <h1 className="text-2xl font-semibold text-center" style={{ color: theme.textPrimary }}>
          {/* Welcome to Pluxnet <br /> Public WiFi */}
          {theme.heading}
        </h1>
      </div>

      {/* Main Card Section */}
      <div className="bg-white rounded-t-3xl pt-6 pb-3 px-4 min-h-[50vh] w-full">
        {/* Plans */}
        <h2 className="text-gray-500 text-md font-medium mb-4">
          Pick a plan to get started
        </h2>

        <div className="flex justify-center gap-3 overflow-x-auto pb-3">
          {theme.authMethods.includes("free") && (
            <PlanCard variant="free" totalData='24 Hrs • 1.5 GB' tag='Promotion' />
          )}
        </div>

        {theme.authMethods.includes("voucher") && (
          <>
            <VoucherCTA />
            <PackagesPlanList ssid={theme.ssid} />
          </>
        )}

        {theme.authMethods.includes("pu-login") && (
          <div className="flex justify-center gap-3 overflow-x-auto pb-3">
            {/* {theme.authMethods.includes("pu-login") && ( */}
            <PlanCard variant="pu-login" />
            {/* )} */}
          </div>
        )}


        {/* Banner
        <div className="rounded-xl overflow-hidden">
          <img
            src="https://images.samsung.com/is/image/samsung/p6pim/levant/sm-s918bzsamea/gallery/levant-galaxy-s23-ultra-s918-sm-s918bzsamea-thumb-534402570?$344_344_PNG$"
            alt="Galaxy S25 Ultra"
            className="w-full h-32 object-cover"
          />
          <div className="absolute p-4">
            <span className="text-white text-xs font-medium">Galaxy S25 Ultra <br /> Galaxy AI <span role="img" aria-label="star">✨</span></span>
          </div>
        </div> */}
      </div>

      <AdSection />

      {/* Bottom Nav */}
      {/* <nav className="fixed bottom-0 left-0 w-full bg-black border-t flex justify-between px-6 py-2">
        <div className="flex flex-col items-center" style={{ color: theme.brandPrimary }} >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 3l9.5 8.5-1.42 1.42L12 5.84l-8.08 7.08L2.5 11.5z" fill="currentColor" /></svg>
          <span className="text-xs">Home</span>
        </div>
        <div className="flex flex-col items-center text-gray-400">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" /></svg>
          <span className="text-xs">Weather</span>
        </div>
        <div className="flex flex-col items-center text-gray-400">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="currentColor" /><circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" /></svg>
          <span className="text-xs">Around me</span>
        </div>
        <div className="flex flex-col items-center text-gray-400">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="3" fill="currentColor" /></svg>
          <span className="text-xs">More</span>
        </div>
      </nav> */}
    </div>
  );
}
