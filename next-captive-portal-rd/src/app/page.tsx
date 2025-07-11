"use server"

import ConnectCard from '@/components/home-page/connect-card';
import { ConnectProvider } from '@/components/home-page/ConnectContext';
import { NewsCarousel } from '@/components/home-page/news-carousel';
import { ClientThemeSwitcher } from '@/components/client-theme-switcher';
import { AuthState, requireAuth } from '@/lib/auth/auth-service';
import { authState } from '@/lib/seed';

export default async function Home() {
  // Get auth state and redirect if needed
  // const authState = await requireAuth();

  // If already authenticated, redirect to welcome page
  // if (authState.isAuthenticated) {
  //   const { redirect } = await import('next/navigation');
  //   redirect("/welcome");
  // }

  console.log("Auth state: ", authState);

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
      <main className="flex items-center justify-center">
        <div className="p-4 w-full space-y-6 max-w-md">
          {/* Connect Card */}
          <ConnectProvider userUsage={authState.userUsage ?? undefined} >
            <ConnectCard backgroundImage="/internet-claim-bg.png" />
          </ConnectProvider>

          <section className="mt-2 flex flex-col justify-start items-center gap-3 w-full">
            <h4 className="flex items-center justify-between w-full">
              <span className="text-base font-bold">Latest news</span>
              <a href="#" className="text-sm font-medium" style={{ color: 'var(--brand-primary)' }}>View all</a>
            </h4>

            <NewsCarousel />
          </section>
        </div>
      </main>
    </>
  );
}
