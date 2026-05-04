import Link from 'next/link';
import { listSitesForTenant, getSiteBranding, updateSiteBranding } from './actions';

export const dynamic = 'force-dynamic';

interface BrandingPageProps {
  params: { tenantId: string };
  searchParams?: { siteId?: string };
}

export default async function SiteBrandingPage({ params, searchParams }: BrandingPageProps) {
  const tenantId = params.tenantId;
  const sites = await listSitesForTenant(tenantId);
  const chosenSiteId = searchParams?.siteId ?? sites[0]?.id;
  const selectedSite = sites.find((site) => site.id === chosenSiteId);
  const branding = chosenSiteId ? await getSiteBranding(chosenSiteId) : null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Site Branding</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Branding for Tenant</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Choose a site and update its branding colors and text through the API.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/tenants" className="rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                Back to Tenants
              </Link>
              <Link href={`/admin/tenants/${tenantId}/sites/adsconfig?siteId=${chosenSiteId ?? ''}`} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                Ads config
              </Link>
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-[1fr_220px] sm:items-end">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Select a site</h2>
              <p className="mt-1 text-sm text-slate-600">The form below updates the chosen site directly.</p>
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
                Select site
              </button>
            </form>
          </div>
        </section>

        {selectedSite && branding ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Branding settings for {selectedSite.name}</h2>
            <form action={updateSiteBranding} className="mt-6 space-y-6">
              <input type="hidden" name="tenantId" value={tenantId} />
              <input type="hidden" name="siteId" value={selectedSite.id} />

              <div className="grid gap-6 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Brand primary
                  <input name="brandPrimary" type="color" defaultValue={branding.brandPrimary ?? '#301358'} className="mt-2 block h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Brand secondary
                  <input name="brandSecondary" type="color" defaultValue={branding.brandSecondary ?? '#F2F2F2'} className="mt-2 block h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Accent color
                  <input name="brandAccent" type="color" defaultValue={branding.brandAccent ?? '#FF6B35'} className="mt-2 block h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Button primary
                  <input name="buttonPrimary" type="color" defaultValue={branding.buttonPrimary ?? '#301358'} className="mt-2 block h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none" />
                </label>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Text primary
                  <input name="textPrimary" type="color" defaultValue={branding.textPrimary ?? '#000000'} className="mt-2 block h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Text secondary
                  <input name="textSecondary" type="color" defaultValue={branding.textSecondary ?? '#424242'} className="mt-2 block h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Surface card
                  <input name="surfaceCard" type="color" defaultValue={branding.surfaceCard ?? '#FFFFFF'} className="mt-2 block h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Surface border
                  <input name="surfaceBorder" type="color" defaultValue={branding.surfaceBorder ?? '#E0E0E0'} className="mt-2 block h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none" />
                </label>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Heading
                  <input name="heading" defaultValue={branding.heading ?? ''} className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Button text
                  <input name="buttonText" defaultValue={branding.buttonText ?? ''} className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none" />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Terms links
                <input name="termsLinks" defaultValue={branding.termsLinks ?? ''} className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none" />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">Updates are applied through the API and reflected on the selected site.</p>
                <button type="submit" className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                  Save Branding
                </button>
              </div>
            </form>
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-600">Select a tenant and site to load branding data.</p>
          </section>
        )}
      </div>
    </div>
  );
}
