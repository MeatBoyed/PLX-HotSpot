import { sitesService } from '@/application/services';
import PoweredByFooter from '@/components/PoweredByFooter';
import Link from 'next/link';

export default async function RootPage() {
  let sites: Awaited<ReturnType<typeof sitesService.list>> = [];
  try {
    sites = await sitesService.list();
  } catch {
    // show empty state below
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-between px-4 py-8">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/AuraConnect.png" alt="AuraConnect" className="w-auto" draggable={false} />
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Select your location</h1>
            <p className="text-sm text-gray-500">Choose a WiFi hotspot to connect to</p>
          </div>

          {sites.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-400">No hotspot locations are currently available.</p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-gray-50">
              {sites.map((site) => (
                <li key={site.ssid}>
                  <Link
                    href={`/${site.ssid}/splash`}
                    className="flex items-center gap-3 py-3.5 hover:bg-gray-50 transition-colors rounded-xl px-2 -mx-2"
                  >
                    {site.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={site.logoUrl}
                        alt=""
                        className="w-9 h-9 rounded-xl object-contain flex-shrink-0 bg-gray-50 p-1"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center bg-blue-600 text-white font-bold text-sm">
                        {(site.displayName ?? site.ssid).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold text-sm text-gray-800 flex-1">
                      {site.displayName || site.ssid}
                    </span>
                    <span className="text-gray-300 text-base">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* <PoweredByFooter /> */}
    </div>
  );
}
