import ConnectCard from '@/components/home-page/connect-card';
import { ConnectProvider } from '@/components/home-page/ConnectContext';
import Head from '@/components/home-page/head';


export default async function Home() {
  // Get auth state and redirect if needed
  return (
    <div className="w-full flex flex-col">
      <nav className="flex items-center justify-center w-full">
        <Head />
      </nav>
      <main className="flex items-center justify-center">
        <div className="p-4 w-full space-y-6 max-w-md">
          {/* Convert to Pure HTML (FORM) implemenation */}
          <ConnectProvider userUsage={undefined} >
            <ConnectCard />
          </ConnectProvider>

          <section className="mt-2 flex flex-col justify-start items-center gap-3 w-full">
            {/* <h4 className="flex items-center justify-between w-full">
              <span className="text-base font-bold">Latest news</span>
              <a href="#" className="text-sm font-medium" style={{ color: theme.color.primary }}>View all</a>
            </h4> */}

          </section>
        </div>
      </main>
    </div>
  );
}
