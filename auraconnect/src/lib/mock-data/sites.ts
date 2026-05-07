import type { Site } from '@/lib/types/site.types'

export const mockSites: Site[] = [
  // Joburg Theatre
  { id: 'site_joburg_main', tenantId: 'tenant_joburg', name: 'Main Hall',
    ssid: 'JoTheatre-MainHall', domain: 'main.joburg-theatre.co.za', sortOrder: 1,
    status: 'active', createdAt: '2024-01-20T08:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'site_joburg_cafe', tenantId: 'tenant_joburg', name: 'Café Area',
    ssid: 'JoTheatre-Cafe', domain: 'cafe.joburg-theatre.co.za', sortOrder: 2,
    status: 'active', createdAt: '2024-01-20T08:00:00Z', updatedAt: '2024-11-15T09:30:00Z' },
  { id: 'site_joburg_parking', tenantId: 'tenant_joburg', name: 'Parking Garage',
    ssid: 'JoTheatre-Parking', domain: null, sortOrder: 3,
    status: 'suspended', createdAt: '2024-01-20T08:00:00Z', updatedAt: '2024-10-05T14:00:00Z' },

  // Kwamaimai Beach
  { id: 'site_kwa_beach', tenantId: 'tenant_kwamaimai', name: 'Beach Front',
    ssid: 'Kwamaimai-Beach', domain: 'beach.kwamaimai.co.za', sortOrder: 1,
    status: 'active', createdAt: '2024-02-15T09:00:00Z', updatedAt: '2024-12-05T11:00:00Z' },
  { id: 'site_kwa_restaurant', tenantId: 'tenant_kwamaimai', name: 'Restaurant',
    ssid: 'Kwamaimai-Restaurant', domain: null, sortOrder: 2,
    status: 'maintenance', createdAt: '2024-02-15T09:00:00Z', updatedAt: '2024-12-08T08:00:00Z' },

  // Sandton City
  { id: 'site_sandton_l1', tenantId: 'tenant_sandton', name: 'Level 1',
    ssid: 'SandtonCity-L1', domain: 'l1.sandtoncity.com', sortOrder: 1,
    status: 'active', createdAt: '2024-03-10T07:30:00Z', updatedAt: '2024-12-10T15:00:00Z' },
  { id: 'site_sandton_l2', tenantId: 'tenant_sandton', name: 'Level 2',
    ssid: 'SandtonCity-L2', domain: 'l2.sandtoncity.com', sortOrder: 2,
    status: 'active', createdAt: '2024-03-10T07:30:00Z', updatedAt: '2024-12-10T15:00:00Z' },
  { id: 'site_sandton_food', tenantId: 'tenant_sandton', name: 'Food Court',
    ssid: 'SandtonCity-FoodCourt', domain: 'food.sandtoncity.com', sortOrder: 3,
    status: 'active', createdAt: '2024-03-10T07:30:00Z', updatedAt: '2024-12-10T15:00:00Z' },

  // Pretoria Zoo
  { id: 'site_zoo_entrance', tenantId: 'tenant_pta_zoo', name: 'Main Entrance',
    ssid: 'PreZoo-Entrance', domain: 'entrance.prezoo.org.za', sortOrder: 1,
    status: 'active', createdAt: '2024-04-25T11:00:00Z', updatedAt: '2024-11-20T10:00:00Z' },
  { id: 'site_zoo_picnic', tenantId: 'tenant_pta_zoo', name: 'Picnic Grounds',
    ssid: 'PreZoo-Picnic', domain: null, sortOrder: 2,
    status: 'active', createdAt: '2024-04-25T11:00:00Z', updatedAt: '2024-11-20T10:00:00Z' },
]
