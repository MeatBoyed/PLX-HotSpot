import Link from 'next/link';
import { listTenants, listSites, createTenant, deleteTenant, createSite, deleteSite } from './actions';

export const dynamic = 'force-dynamic';

interface TenantsPageProps {
  searchParams?: { tenantId?: string };
}

export default async function TenantsPage({ searchParams }: TenantsPageProps) {
  const tenants = await listTenants();
  const selectedTenantId = searchParams?.tenantId;
  const selectedTenant = tenants.find((tenant) => tenant.id === selectedTenantId);
  const sites = selectedTenant ? await listSites(selectedTenant.id) : [];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Admin Panel</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Tenant &amp; Site Management</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Manage tenants, add or remove sites, and open site branding or ads config pages with server-side API updates.
              </p>
            </div>
            <Link href="/admin" className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100">
              Back to Admin dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Tenants</h2>
                <p className="text-sm text-slate-600">Select a tenant to manage its sites and configuration.</p>
              </div>
            </div>

            <div className="space-y-4">
              {tenants.length > 0 ? (
                tenants.map((tenant) => (
                  <div key={tenant.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-slate-900">{tenant.name}</p>
                        <p className="text-sm text-slate-600">Slug: {tenant.slug}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/tenants?tenantId=${tenant.id}`} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                          Manage sites
                        </Link>
                        <Link href={`/admin/tenants/${tenant.id}/sites/branding`} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                          Branding
                        </Link>
                        <Link href={`/admin/tenants/${tenant.id}/sites/adsconfig`} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                          Ads config
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600">
                  No tenants found yet.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Create Tenant</h2>
            <p className="mt-2 text-sm text-slate-600">Add a new tenant and then assign sites to it.</p>

            <form action={createTenant} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Tenant Name
                <input name="name" required className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Tenant Slug
                <input name="slug" required className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <button type="submit" className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Create tenant
              </button>
            </form>
          </section>
        </div>

        {selectedTenant ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Sites for {selectedTenant.name}</h2>
                <p className="text-sm text-slate-600">Add or remove sites for the selected tenant.</p>
              </div>
              <form action={deleteTenant} className="inline-flex">
                <input type="hidden" name="tenantId" value={selectedTenant.id} />
                <button type="submit" className="rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 transition hover:bg-red-100">
                  Delete tenant
                </button>
              </form>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Add a new site</h3>
              <form action={createSite} className="mt-4 grid gap-4">
                <input type="hidden" name="tenantId" value={selectedTenant.id} />
                <label className="block text-sm text-slate-700">
                  Site SSID
                  <input name="ssid" required className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
                <label className="block text-sm text-slate-700">
                  Site Name
                  <input name="name" required className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
                <label className="block text-sm text-slate-700">
                  Domain (optional)
                  <input name="domain" className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
                <label className="block text-sm text-slate-700">
                  Sort order
                  <input name="sortOrder" type="number" className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
                <button type="submit" className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                  Add site
                </button>
              </form>
            </div>

            <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-700">
                  <tr>
                    <th className="px-4 py-3">SSID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Domain</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {sites.length > 0 ? (
                    sites.map((site) => (
                      <tr key={site.id}>
                        <td className="px-4 py-3 text-slate-900">{site.ssid}</td>
                        <td className="px-4 py-3 text-slate-700">{site.name}</td>
                        <td className="px-4 py-3 text-slate-500">{site.domain ?? '—'}</td>
                        <td className="px-4 py-3 space-x-2">
                          <Link href={`/admin/tenants/${selectedTenant.id}/sites/branding?siteId=${site.id}`} className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                            Branding
                          </Link>
                          <Link href={`/admin/tenants/${selectedTenant.id}/sites/adsconfig?siteId=${site.id}`} className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                            Ads
                          </Link>
                          <form action={deleteSite} className="inline-block">
                            <input type="hidden" name="siteId" value={site.id} />
                            <button type="submit" className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100">
                              Remove
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                        Select a tenant to view its sites.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-600">
              Choose a tenant from the list to manage its sites, branding, and ads configuration.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
