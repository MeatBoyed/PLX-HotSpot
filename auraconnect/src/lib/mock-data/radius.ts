import type { RadiusConfig } from '@/lib/types/radius.types'

export const mockRadiusConfigs: RadiusConfig[] = [
  {
    id: 'radius_joburg_main',
    siteId: 'site_joburg_main',
    serverHost: '197.80.100.10',
    authPort: 1812,
    acctPort: 1813,
    secret: 'sup3rs3cr3t!',
    timeout: 5,
    retries: 3,
    nasIdentifier: 'joburg-main-ap',
    nasIpAddress: '192.168.1.1',
    updatedAt: '2024-12-01T10:00:00Z',
  },
  {
    id: 'radius_kwa_beach',
    siteId: 'site_kwa_beach',
    serverHost: '197.80.200.55',
    authPort: 1812,
    acctPort: 1813,
    secret: 'kwa_r4d1us!',
    timeout: 5,
    retries: 2,
    nasIdentifier: 'kwa-beach-ap',
    nasIpAddress: '10.0.0.1',
    updatedAt: '2024-12-05T11:00:00Z',
  },
]

export function getMockRadiusConfigBySiteId(siteId: string): RadiusConfig | undefined {
  return mockRadiusConfigs.find((r) => r.siteId === siteId)
}
