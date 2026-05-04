import Link from 'next/link';
import { listSitesForTenant, getSiteAdsConfig, updateSiteAdsConfig } from './actions';

export const dynamic = 'force-dynamic';

interface AdsConfigPageProps {
  params: { tenantId: string };
  searchParams?: { siteId?: string };
}

export default async function SiteAdsConfigPage({ params, searchParams }: AdsConfigPageProps) {
  const tenantId = params.tenantId;
  const sites = await listSitesForTenant(tenantId);
  const chosenSiteId = searchParams?.siteId ?? sites[0]?.id;
  const selectedSite = sites.find((site) => site.id === chosenSiteId);
  const adsConfig = chosenSiteId ? await getSiteAdsConfig(chosenSiteId) : null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Ads Configuration</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Ad Settings for Tenant</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Update ad server settings and enable or disable ad delivery for a chosen site.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/tenants" className="rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                Back to Tenants
              </Link>
              <Link href={`/admin/tenants/${tenantId}/sites/branding?siteId=${chosenSiteId ?? ''}`} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                Branding
              </Link>
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-[1fr_220px] sm:items-end">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Select a site</h2>
              <p className="mt-1 text-sm text-slate-600">Pick a site to edit its ad delivery settings.</p>
            </div>
            <form method="get" className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <input type="hidden" name="tenantId" value={tenantId} />
              <label className="grid gap-2 text-sm text-slate-700">
                Site
                <select name="siteId" defaultValue={chosenSiteId} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>{site.name} ({site.ssid})</option>
                  ))}
                </select>
              </label>
              <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                Choose
              </button>
            </form>
          </div>
        </section>

        {selectedSite && adsConfig ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Ads configuration for {selectedSite.name}</h2>
            <form action={updateSiteAdsConfig} className="mt-6 space-y-6">
              <input type="hidden" name="tenantId" value={tenantId} />
              <input type="hidden" name="siteId" value={selectedSite.id} />

              <div className="grid gap-6 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Revive server URL
                  <input name="reviveServerUrl" defaultValue={adsConfig.reviveServerUrl ?? ''} className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Zone ID
                  <input name="reviveZoneId" defaultValue={adsConfig.reviveZoneId ?? ''} className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Publisher ID
                  <input name="reviveId" defaultValue={adsConfig.reviveId ?? ''} className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  VAST URL
                  <input name="vastUrl" defaultValue={adsConfig.vastUrl ?? ''} className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
              </div>

              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input name="isEnabled" type="checkbox" defaultChecked={adsConfig.isEnabled ?? false} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                Enable ads for this site
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">This updates the site ad config through the API.</p>
                <button type="submit" className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                  Save ads config
                </button>
              </div>
            </form>
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-600">Select a tenant and site to load ad configuration.</p>
          </section>
        )}
      </div>
    </div>
  );
}
