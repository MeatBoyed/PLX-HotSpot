import type { ConnectionDataPoint, PackageUsage, ActivityEntry } from '@/lib/types/dashboard.types'

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

export function generateConnectionData(siteId: string): ConnectionDataPoint[] {
  return getLast7Days().map((date) => ({
    date,
    connections: rand(40, 400),
    label: new Date(date).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric' }),
  }))
}

export const mockTopPackages: PackageUsage[] = [
  { packageId: 'pkg_kwa_beach_day', packageName: 'Full Day Pass', siteId: 'site_kwa_beach', siteName: 'Kwamaimai Beach', count: 142, revenue: 9798 },
  { packageId: 'pkg_joburg_main_premium', packageName: 'Premium 24hr', siteId: 'site_joburg_main', siteName: 'Main Hall', count: 98, revenue: 4802 },
  { packageId: 'pkg_kwa_beach_1hr', packageName: '1 Hour Surf', siteId: 'site_kwa_beach', siteName: 'Kwamaimai Beach', count: 87, revenue: 1305 },
  { packageId: 'pkg_sandton_l1_premium', packageName: 'Premium Shopper', siteId: 'site_sandton_l1', siteName: 'Level 1', count: 76, revenue: 2964 },
  { packageId: 'pkg_sandton_l1_30min', packageName: '30 Min Shopper', siteId: 'site_sandton_l1', siteName: 'Level 1', count: 312, revenue: 0 },
]

export const mockRecentActivity: ActivityEntry[] = [
  { id: 'act_1', type: 'connection', message: 'New user connected at Kwamaimai Beach Front', tenantId: 'tenant_kwamaimai', siteId: 'site_kwa_beach', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
  { id: 'act_2', type: 'package_purchase', message: 'Full Day Pass purchased at Kwamaimai Beach', tenantId: 'tenant_kwamaimai', siteId: 'site_kwa_beach', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { id: 'act_3', type: 'config_change', message: 'Branding updated for Sandton City Level 1', tenantId: 'tenant_sandton', siteId: 'site_sandton_l1', timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
  { id: 'act_4', type: 'user_signup', message: '5 new users registered at Joburg Theatre Main Hall', tenantId: 'tenant_joburg', siteId: 'site_joburg_main', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
  { id: 'act_5', type: 'connection', message: '23 active sessions at Sandton City Food Court', tenantId: 'tenant_sandton', siteId: 'site_sandton_food', timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString() },
  { id: 'act_6', type: 'package_purchase', message: 'Premium 24hr purchased at Joburg Theatre', tenantId: 'tenant_joburg', siteId: 'site_joburg_main', timestamp: new Date(Date.now() - 62 * 60 * 1000).toISOString() },
]

export const SITE_METRICS: Record<string, { activeConnections: number; newUsersToday: number; dataUsageGb: number }> = {
  site_joburg_main: { activeConnections: rand(80, 350), newUsersToday: rand(20, 90), dataUsageGb: parseFloat((Math.random() * 40 + 5).toFixed(1)) },
  site_joburg_cafe: { activeConnections: rand(20, 80), newUsersToday: rand(5, 30), dataUsageGb: parseFloat((Math.random() * 10 + 1).toFixed(1)) },
  site_joburg_parking: { activeConnections: 0, newUsersToday: 0, dataUsageGb: 0 },
  site_kwa_beach: { activeConnections: rand(100, 600), newUsersToday: rand(40, 150), dataUsageGb: parseFloat((Math.random() * 80 + 10).toFixed(1)) },
  site_kwa_restaurant: { activeConnections: 0, newUsersToday: 0, dataUsageGb: 0 },
  site_sandton_l1: { activeConnections: rand(200, 700), newUsersToday: rand(60, 200), dataUsageGb: parseFloat((Math.random() * 100 + 20).toFixed(1)) },
  site_sandton_l2: { activeConnections: rand(150, 500), newUsersToday: rand(50, 150), dataUsageGb: parseFloat((Math.random() * 80 + 15).toFixed(1)) },
  site_sandton_food: { activeConnections: rand(300, 900), newUsersToday: rand(80, 250), dataUsageGb: parseFloat((Math.random() * 120 + 30).toFixed(1)) },
  site_zoo_entrance: { activeConnections: rand(50, 300), newUsersToday: rand(20, 80), dataUsageGb: parseFloat((Math.random() * 30 + 5).toFixed(1)) },
  site_zoo_picnic: { activeConnections: rand(30, 150), newUsersToday: rand(10, 50), dataUsageGb: parseFloat((Math.random() * 15 + 2).toFixed(1)) },
}
