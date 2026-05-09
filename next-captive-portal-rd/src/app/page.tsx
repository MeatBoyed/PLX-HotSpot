import { sitesService } from '@/application/services';
import { pluxnetTheme } from '@/lib/theme';
import Link from 'next/link';

export default async function RootPage() {
  let sites: Awaited<ReturnType<typeof sitesService.list>> = [];
  try {
    sites = await sitesService.list();
  } catch {
    // show empty state below
  }

  const theme = pluxnetTheme;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: theme.brandPrimary }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div
            className="rounded-2xl p-3 shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.95)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pluxnet-logo.svg" alt="Logo" className="w-12 h-12 object-contain" />
          </div>
        </div>

        <h1
          className="text-2xl font-black text-center mb-2"
          style={{ color: theme.textPrimary }}
        >
          Select your location
        </h1>
        <p
          className="text-sm text-center mb-8"
          style={{ color: `${theme.textPrimary}99` }}
        >
          Choose a WiFi hotspot to connect to
        </p>

        {sites.length === 0 ? (
          <div
            className="rounded-2xl p-6 text-center text-sm"
            style={{ background: 'rgba(255,255,255,0.12)', color: theme.textPrimary }}
          >
            No hotspot locations are currently available.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {sites.map((site) => (
              <li key={site.ssid}>
                <Link
                  href={`/${site.ssid}/splash`}
                  className="flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  }}
                >
                  {site.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={site.logoUrl}
                      alt=""
                      className="w-10 h-10 rounded-xl object-contain flex-shrink-0"
                      style={{ background: '#f5f5f5', padding: '4px' }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: theme.brandPrimary }}
                    >
                      {(site.displayName ?? site.ssid).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-sm" style={{ color: theme.brandPrimary }}>
                    {site.displayName || site.ssid}
                  </span>
                  <span className="ml-auto text-lg" style={{ color: theme.brandPrimary }}>→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
