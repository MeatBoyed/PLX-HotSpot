import type { Bundle } from '@/lib/types/bundle.types'

const sites = [
  'site_joburg_main', 'site_joburg_cafe', 'site_joburg_parking',
  'site_kwa_beach', 'site_kwa_restaurant',
  'site_sandton_l1', 'site_sandton_l2', 'site_sandton_food',
  'site_zoo_entrance', 'site_zoo_picnic',
]

const tenantBySite: Record<string, string> = {
  site_joburg_main: 'tenant_joburg', site_joburg_cafe: 'tenant_joburg',
  site_joburg_parking: 'tenant_joburg', site_kwa_beach: 'tenant_kwamaimai',
  site_kwa_restaurant: 'tenant_kwamaimai', site_sandton_l1: 'tenant_sandton',
  site_sandton_l2: 'tenant_sandton', site_sandton_food: 'tenant_sandton',
  site_zoo_entrance: 'tenant_pta_zoo', site_zoo_picnic: 'tenant_pta_zoo',
}

function bundlesForSite(siteId: string, i: number): Bundle[] {
  const tenantId = tenantBySite[siteId]
  return [
    {
      id: `bundle_${i}_24h`, siteId, tenantId,
      name: '24hr Access', description: 'Full access for 24 hours',
      priceCents: 1000, durationSeconds: 86400, radiusProfile: '24hr_basic',
      isActive: true, sortOrder: 1,
    },
    {
      id: `bundle_${i}_7d`, siteId, tenantId,
      name: '7-Day Plan', description: '7 days of access — 5 GB data',
      priceCents: 5000, durationSeconds: 604800, dataLimitMb: 5120, radiusProfile: '7day_standard',
      isActive: true, sortOrder: 2,
    },
    {
      id: `bundle_${i}_30d`, siteId, tenantId,
      name: '30-Day Plan', description: '30 days of access — 20 GB data',
      priceCents: 15000, durationSeconds: 2592000, dataLimitMb: 20480, radiusProfile: '30day_premium',
      isActive: true, sortOrder: 3,
    },
  ]
}

export const mockBundles: Bundle[] = sites.flatMap((siteId, i) => bundlesForSite(siteId, i))
