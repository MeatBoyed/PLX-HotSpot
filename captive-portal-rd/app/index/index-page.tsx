import ConnectCard from "~/index/connect-card";
import { NewsCarousel } from "./news-carousel";
import { useSearchParams } from "react-router";

export function IndexPage() {
  const [params] = useSearchParams();

  const mac = params.get('mac');
  const loginLink = params.get('loginlink');
  const nasid = params.get('nasid');

  console.log(`mac: ${mac}, loginLink: ${loginLink}, nasid: ${nasid}`);

  return (
    <>
      <nav className="flex items-center justify-center w-full">
        <div className="w-full flex items-center justify-start pt-8 p-4 max-w-md">
          <a href="index.html" className="w-28">
            <img src="pluxnet-logo.svg" alt="PluxNet logo" width="auto" height="auto" />
          </a>
        </div>
      </nav>
      <main className="flex items-center justify-center ">
        <div className="p-4 w-full space-y-6">
          {/* Connect Card */}
          <ConnectCard backgroundImage="/internet-claim-bg.png" />

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
