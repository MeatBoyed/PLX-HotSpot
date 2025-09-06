"use client"
import { PlanCard } from '@/components/plan-card';
import { useTheme } from "@/components/theme-provider";
import AdSection from "@/components/ad-section";


// export default async function Home() {
//   // Get auth state and redirect if needed
//   return (
//     <div className="w-full flex flex-col">
//       <nav className="flex items-center justify-center w-full">
//         <Head />
//       </nav>
//       <main className="flex items-center justify-center">
//         <div className="p-4 w-full space-y-6 max-w-md">
//           {/* Convert to Pure HTML (FORM) implemenation */}
//           <ConnectProvider userUsage={undefined} >
//             <ConnectCard />
//           </ConnectProvider>

//           <section className="mt-2 flex flex-col justify-start items-center gap-3 w-full">
//             {/* <h4 className="flex items-center justify-between w-full">
//               <span className="text-base font-bold">Latest news</span>
//               <a href="#" className="text-sm font-medium" style={{ color: theme.color.primary }}>View all</a>
//             </h4> */}

//           </section>
//         </div>
//       </main>
//     </div>
//   );
// }

export function Navbar() {
  return (
    <div className="flex items-center justify-between px-5 pt-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="bg-[#F55C7A] rounded-full w-6 h-6 flex items-center justify-center">
          <span className="text-white font-bold">N</span>
        </div>
        <span className="text-white text-lg font-semibold">PluxNet</span>
      </div>
      <button className="border border-white rounded-full px-4 py-1 text-white text-sm">Log in</button>
    </div>
  )
}

export default function PluxNetWiFi() {
  const { theme } = useTheme()
  return (
    <div style={{ background: theme.brandPrimary }}>
      <Navbar />

      {/* Welcome Text */}
      <div className="flex flex-col items-center mt-8 mb-6">
        <h1 className="text-white text-2xl font-semibold text-center">
          {/* Welcome to Pluxnet <br /> Public WiFi */}
          {theme.heading}
        </h1>
      </div>

      {/* Main Card Section */}
      <div className="bg-white rounded-t-3xl pt-6 pb-3 px-4 min-h-[60vh]">
        {/* Plans */}
        <h2 className="text-gray-500 text-lg font-medium mb-4">
          Pick a plan to get started
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-3">
          <PlanCard price='Free' total_data='24 Hrs • 1.5 GB' tag='Promotion' />
          <PlanCard price='$8.00' total_data='50 Hrs • 2GB' tag='Mini' />
        </div>

        {/* Voucher Section */}
        <div className="bg-white border rounded-xl flex items-center justify-between px-4 py-3 mt-4 mb-4">
          <div className="flex items-center gap-2">
            <div className={`text-white rounded-full p-2`} style={{ backgroundColor: theme.brandPrimary }}>
              {/* Icon: use a placeholder */}
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" /></svg>
            </div>
            <span className="text-gray-700 text-sm font-medium">Got a voucher? Redeem now.</span>
          </div>
          <span className={`text-xl`} style={{ color: theme.brandPrimary }} >&#8594;</span>
        </div>

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
        <AdSection />
      </div>

      {/* Bottom Nav */}
      {/* <nav className="fixed bottom-0 left-0 w-full bg-black border-t flex justify-between px-6 py-2">
        <div className={`flex flex-col items-center text-[#${theme.buttonPrimary}]`} >
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
