"use client"
import ReviveAd from '@/lib/revive-ad';
import { usePathname } from 'next/navigation';
import { appConfig } from '@/lib/config';

export default function AdBanner() {
    const path = usePathname();
    // Only apply bg color if not on the home page
    const isHomePage = path === '/';

    return (
        <section className="w-full flex items-center justify-center"
            style={{ backgroundColor: isHomePage ? '' : 'var(--brand-primary)' }}
        >
            <div className="w-full max-w-md">

                <div className="w-full relative">
                    <ReviveAd
                        zoneId={appConfig.ads.zoneId}
                        reviveId={appConfig.ads.reviveId}
                    />
                    {/* <!-- Revive Adserver Hosted edition Javascript Tag - Generated with Revive Adserver v5.5.2 --> */}

                    {/* <img src="add-img-1.png" className="" width="100%" height="auto" alt="add image" /> */}
                    {/* Top Right close icon */}
                    {/* <span className="absolute top-2 right-2 hover:cursor-pointer hover:bg-gray-800 p-1 rounded-full">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M14.8289 9.1709L9.17188 14.8279M9.17188 9.1709L14.8289 14.8279" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span> */}
                </div>
            </div>
        </section>
    )
}