import ConnectCard from '@/components/home-page/connect-card';
import PureHtmlConnectCard from '@/components/home-page/pure-html-connect-card';
import { ConnectProvider } from '@/components/home-page/ConnectContext';
import { NewsCarousel } from '@/components/home-page/news-carousel';
import { requireAuth } from '@/lib/auth/auth-service';
import { seedAuthState } from '@/lib/seed';
import { appConfig } from '@/lib/config';
import Head from '@/components/home-page/head';

export default async function Home() {
  // Get auth state and redirect if needed
  console.log("Use Theme: ", appConfig.theme);

  let authState = null
  if (appConfig.useSeedData) {
    authState = seedAuthState;
  } else {
    authState = await requireAuth();
  }
  // const authState = appConfig.useSeedData ? seedAuthState : await requireAuth();

  // If already authenticated, redirect to welcome page
  if (authState.isAuthenticated) {
    const { redirect } = await import('next/navigation');
    redirect("https://pluxnet.co.za");
  }

  // console.log("Auth state: ", authState);

  return (
    <>
      <nav className="flex items-center justify-center w-full">
        <Head />
      </nav>
      <main className="flex items-center justify-center">
        <div className="p-4 w-full space-y-6 max-w-md">
          {/* Iframe-based Connect Card */}
          <ConnectProvider userUsage={authState.userUsage ?? undefined} >
            <div className="space-y-2">
              <h3 className="text-center text-sm font-semibold opacity-75">Iframe Implementation</h3>
              <ConnectCard />
            </div>
          </ConnectProvider>

          {/* Pure HTML Form Connect Card */}
          <div className="space-y-2">
            <h3 className="text-center text-sm font-semibold opacity-75">Pure HTML Form Implementation</h3>
            <PureHtmlConnectCard mikrotikLoginUrl={authState.mikrotikData?.loginlink} />
          </div>

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
