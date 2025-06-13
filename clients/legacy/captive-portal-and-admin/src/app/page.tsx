// app/page.tsx
"use server"
import ConnectCard from '@/components/home-page/connect-card';
import { NewsCarousel } from '@/components/home-page/news-carousel';
import { getMikroTikDataFromCookie } from '@/lib/mikrotik/mikrotik-lib';
import { getUserSession } from '@/lib/mikrotik/mikrotik-service';
import { redirect } from 'next/navigation';

export default async function Home() {
  // Get Posted Mikrotik Data
  const mikrotikRaw = await getMikroTikDataFromCookie();
  if (!mikrotikRaw) {
    redirect("/");
  }
  console.log("Raw data: ", mikrotikRaw)

  // Check if user is already logged in & redirect to "/welcome" if they are
  const userSession = await getUserSession(mikrotikRaw)
  if (userSession.success && userSession.data) {
    redirect("/welcome")
  }

  return (
    <>
      <nav className="flex items-center justify-center w-full">
        <div className="w-full flex items-center justify-start pt-8 p-4 max-w-md">
          <a href="index.html" className="w-28">
            {/* eslint-disable @next/next/no-img-element  */}
            <img src="pluxnet-logo.svg" alt="PluxNet logo" width="auto" height="auto" />
          </a>
        </div>
      </nav>
      <main className="flex items-center justify-center ">
        <div className="p-4 w-full space-y-6">
          {/* Connect Card */}
          {mikrotikRaw && (
            <ConnectCard mikrotikData={mikrotikRaw} backgroundImage="/internet-claim-bg.png" />
          )}
          {/* <ConnectCard mikrotikData={{
            loginlink: 'http://charles.hotspot/login',
            nasid: 'Charles-MT',
            link_status: 'http://charles.hotspot/status',
            link_login_only: 'http://charles.hotspot/login',
            link_logout: 'http://charles.hotspot/logout',
            mac: '98%3ABD%3A80%3ACE%3AD8%3A35',
            type: 'mikrotik',
            ssid: 'dev'

          }} backgroundImage="/internet-claim-bg.png" /> */}

          <section className="mt-2 flex flex-col justify-start items-center gap-3 w-full">
            <h4 className="flex items-center justify-between w-full max-w-md">
              <span className="text-base font-bold">Latest news</span>
              <a href="#" className="text-sm font-medium text-[#301358]">View all</a>
            </h4>

            <NewsCarousel />
          </section>
        </div>
      </main>
    </>
  );
}
