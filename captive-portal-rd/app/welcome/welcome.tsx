import ConnectCard from "~/components/connect-card";
import { NewsCarousel } from "~/components/news-carousel";

export function Welcome() {
  return (
    <main className="flex items-center justify-center mb-10">
      <div className="p-4 w-full space-y-6">
        {/* Connect Card */}
        <ConnectCard backgroundImage="/internet-claim-bg.png" />

        <section className="news-section mt-2">
          <div className="container">
            <h4 className="flex items-center justify-between">
              <span className="text-base font-bold">Latest news</span>
              <a href="#" className="text-sm font-medium text-[#301358]">View all</a>
            </h4>

            <NewsCarousel />
          </div>
        </section>
      </div>
    </main>
  );
}
