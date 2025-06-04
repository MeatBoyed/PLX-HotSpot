import CurrentPlanCard from "./current-plan-card";
import PlanCard from "./plan-card";

export function WelcomePage() {
    return (
        <div className="flex flex-col items-center justify-start bg-[#301358]">
            <section className="relative w-full text-white">
                <img
                    src={"banner-overlay.png"}
                    alt="Background overlay"
                    className="absolute inset-0 w-full h-full bg-top-right object-cover bg-no-repeat "
                />
                <div className="strokeWidth">
                    <div className="flex w-full bg-gradient-to-b ">
                        <div className="w-full flex flex-col items-start justify-center pt-8 p-4 max-w-sm">
                            <a href="index.html" className="logo d-flex align-items-center">
                                <img src="pluxnet-logo-white.svg" alt="PluxNet logo" width="auto" height="auto" />
                            </a>
                            <h3 className="mt-7 font-bold text-2xl">Welcome 👋🏼</h3>
                            <p className="mt-1.5 text-base opacity-70 font-medium">View your connection details below</p>
                        </div>
                    </div>
                </div>
            </section>

            <main className="flex items-start justify-start bg-white w-full rounded-t-[20px] pt-3 pb-20">
                <section className="p-4 w-full space-y-6">
                    {/* Current Plan */}
                    <div className="flex flex-col items-start justify-start gap-4 w-full">
                        <h4 className="text-lg font-bold text-[#7A7A7A]">Current plan</h4>
                        <CurrentPlanCard />
                    </div>

                    {/* Available Plans */}
                    <div className="flex flex-col items-start justify-start gap-4 w-full">
                        <h4 className="text-lg font-bold text-[#7A7A7A]">Plans</h4>
                        <div className="flex justify-between items-start gap-4 w-full">
                            <PlanCard />
                            <PlanCard />
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

