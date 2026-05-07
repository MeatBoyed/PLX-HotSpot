import type { HotspotUser } from '@/lib/types/hotspot-user.types'

export const mockHotspotUsers: HotspotUser[] = [
  // ── Joburg Theatre — Main Hall ──────────────────────────────────
  {
    id: 'hu_001', email: 'thabo.molefe@gmail.com', firstName: 'Thabo', lastName: 'Molefe',
    phone: '+27 82 345 6789', tenantId: 'tenant_joburg', siteId: 'site_joburg_main',
    walletBalanceCents: 4550, registeredAt: '2025-01-10T09:15:00Z', lastLoginAt: '2025-05-04T18:30:00Z',
    status: 'active', radiusId: 'radius_hu001', marketingOptIn: true,
    activeBundle: {
      id: 'bp_001', name: '24hr Access', purchasedAt: '2025-05-04T18:30:00Z',
      expiresAt: '2025-05-05T18:30:00Z', dataUsedMb: 342, durationSeconds: 86400,
    },
  },
  {
    id: 'hu_002', email: 'nomvula.dlamini@outlook.com', firstName: 'Nomvula', lastName: 'Dlamini',
    phone: '+27 73 891 2345', tenantId: 'tenant_joburg', siteId: 'site_joburg_main',
    walletBalanceCents: 15000, registeredAt: '2025-02-03T14:20:00Z', lastLoginAt: '2025-05-03T20:10:00Z',
    status: 'active', radiusId: 'radius_hu002', marketingOptIn: false,
    activeBundle: {
      id: 'bp_002', name: '30-Day Plan', purchasedAt: '2025-05-01T10:00:00Z',
      expiresAt: '2025-05-31T10:00:00Z', dataUsedMb: 4820, dataLimitMb: 20480,
    },
  },
  {
    id: 'hu_003', email: 'priya.naidoo@yahoo.com', firstName: 'Priya', lastName: 'Naidoo',
    phone: '+27 61 234 5678', tenantId: 'tenant_joburg', siteId: 'site_joburg_main',
    walletBalanceCents: 1000, registeredAt: '2025-03-15T11:00:00Z', lastLoginAt: '2025-04-28T17:45:00Z',
    status: 'active', radiusId: 'radius_hu003', marketingOptIn: true,
  },
  {
    id: 'hu_004', email: 'brendan.osullivan@gmail.com', firstName: 'Brendan', lastName: "O'Sullivan",
    phone: '+27 84 567 8901', tenantId: 'tenant_joburg', siteId: 'site_joburg_main',
    walletBalanceCents: 7500, registeredAt: '2025-01-22T16:30:00Z', lastLoginAt: '2025-05-02T21:00:00Z',
    status: 'active', radiusId: 'radius_hu004', marketingOptIn: true,
  },

  // ── Joburg Theatre — Café Area ───────────────────────────────────
  {
    id: 'hu_005', email: 'ayanda.zulu@gmail.com', firstName: 'Ayanda', lastName: 'Zulu',
    phone: '+27 79 012 3456', tenantId: 'tenant_joburg', siteId: 'site_joburg_cafe',
    walletBalanceCents: 3000, registeredAt: '2025-02-18T10:00:00Z', lastLoginAt: '2025-05-04T12:20:00Z',
    status: 'active', radiusId: 'radius_hu005', marketingOptIn: false,
    activeBundle: {
      id: 'bp_005', name: '7-Day Plan', purchasedAt: '2025-04-30T12:00:00Z',
      expiresAt: '2025-05-07T12:00:00Z', dataUsedMb: 1240, dataLimitMb: 5120,
    },
  },
  {
    id: 'hu_006', email: 'ravi.pillay@gmail.com', firstName: 'Ravi', lastName: 'Pillay',
    phone: '+27 82 678 9012', tenantId: 'tenant_joburg', siteId: 'site_joburg_cafe',
    walletBalanceCents: 0, registeredAt: '2025-04-01T09:30:00Z', lastLoginAt: '2025-04-15T14:10:00Z',
    status: 'suspended', radiusId: 'radius_hu006', marketingOptIn: false,
  },
  {
    id: 'hu_007', email: 'michelle.vdberg@gmail.com', firstName: 'Michelle', lastName: 'van der Berg',
    tenantId: 'tenant_joburg', siteId: 'site_joburg_cafe',
    walletBalanceCents: 9800, registeredAt: '2025-01-05T08:00:00Z', lastLoginAt: '2025-05-03T19:45:00Z',
    status: 'active', radiusId: 'radius_hu007', marketingOptIn: true,
  },

  // ── Joburg Theatre — Parking Garage ─────────────────────────────
  {
    id: 'hu_008', email: 'johan.botha@outlook.com', firstName: 'Johan', lastName: 'Botha',
    phone: '+27 71 890 1234', tenantId: 'tenant_joburg', siteId: 'site_joburg_parking',
    walletBalanceCents: 5000, registeredAt: '2025-03-08T13:00:00Z', lastLoginAt: '2025-04-20T16:00:00Z',
    status: 'active', radiusId: 'radius_hu008', marketingOptIn: false,
  },

  // ── Kwamaimai Beach ──────────────────────────────────────────────
  {
    id: 'hu_009', email: 'fatima.patel@gmail.com', firstName: 'Fatima', lastName: 'Patel',
    phone: '+27 83 901 2345', tenantId: 'tenant_kwamaimai', siteId: 'site_kwa_beach',
    walletBalanceCents: 12000, registeredAt: '2025-02-14T11:30:00Z', lastLoginAt: '2025-05-04T14:00:00Z',
    status: 'active', radiusId: 'radius_hu009', marketingOptIn: true,
    activeBundle: {
      id: 'bp_009', name: '24hr Access', purchasedAt: '2025-05-04T14:00:00Z',
      expiresAt: '2025-05-05T14:00:00Z', dataUsedMb: 180, durationSeconds: 86400,
    },
  },
  {
    id: 'hu_010', email: 'kagiso.motsepe@gmail.com', firstName: 'Kagiso', lastName: 'Motsepe',
    tenantId: 'tenant_kwamaimai', siteId: 'site_kwa_beach',
    walletBalanceCents: 2000, registeredAt: '2025-04-10T09:00:00Z', lastLoginAt: '2025-04-10T09:15:00Z',
    status: 'active', radiusId: 'radius_hu010', marketingOptIn: true,
  },
  {
    id: 'hu_011', email: 'lindiwe.khumalo@yahoo.com', firstName: 'Lindiwe', lastName: 'Khumalo',
    phone: '+27 72 123 4567', tenantId: 'tenant_kwamaimai', siteId: 'site_kwa_restaurant',
    walletBalanceCents: 6500, registeredAt: '2025-03-01T10:00:00Z', lastLoginAt: '2025-04-29T19:30:00Z',
    status: 'active', radiusId: 'radius_hu011', marketingOptIn: false,
  },
  {
    id: 'hu_012', email: 'pedro.dasilva@gmail.com', firstName: 'Pedro', lastName: 'da Silva',
    phone: '+27 81 234 5678', tenantId: 'tenant_kwamaimai', siteId: 'site_kwa_restaurant',
    walletBalanceCents: 0, registeredAt: '2025-01-30T14:00:00Z', lastLoginAt: '2025-02-01T10:00:00Z',
    status: 'suspended', radiusId: 'radius_hu012', marketingOptIn: false,
  },

  // ── Sandton City ─────────────────────────────────────────────────
  {
    id: 'hu_013', email: 'zanele.mokoena@gmail.com', firstName: 'Zanele', lastName: 'Mokoena',
    phone: '+27 83 345 6789', tenantId: 'tenant_sandton', siteId: 'site_sandton_l1',
    walletBalanceCents: 20000, registeredAt: '2024-12-01T09:00:00Z', lastLoginAt: '2025-05-04T11:30:00Z',
    status: 'active', radiusId: 'radius_hu013', marketingOptIn: true,
    activeBundle: {
      id: 'bp_013', name: '30-Day Plan', purchasedAt: '2025-05-01T09:00:00Z',
      expiresAt: '2025-05-31T09:00:00Z', dataUsedMb: 8200, dataLimitMb: 20480,
    },
  },
  {
    id: 'hu_014', email: 'thandeka.ndlovu@outlook.com', firstName: 'Thandeka', lastName: 'Ndlovu',
    tenantId: 'tenant_sandton', siteId: 'site_sandton_l1',
    walletBalanceCents: 5000, registeredAt: '2025-01-15T12:00:00Z', lastLoginAt: '2025-05-02T13:45:00Z',
    status: 'active', radiusId: 'radius_hu014', marketingOptIn: true,
  },
  {
    id: 'hu_015', email: 'kefilwe.sithole@gmail.com', firstName: 'Kefilwe', lastName: 'Sithole',
    phone: '+27 74 456 7890', tenantId: 'tenant_sandton', siteId: 'site_sandton_l2',
    walletBalanceCents: 8750, registeredAt: '2025-02-20T10:30:00Z', lastLoginAt: '2025-05-04T15:20:00Z',
    status: 'active', radiusId: 'radius_hu015', marketingOptIn: false,
    activeBundle: {
      id: 'bp_015', name: '7-Day Plan', purchasedAt: '2025-05-02T15:00:00Z',
      expiresAt: '2025-05-09T15:00:00Z', dataUsedMb: 620, dataLimitMb: 5120,
    },
  },
  {
    id: 'hu_016', email: 'yashvir.singh@gmail.com', firstName: 'Yashvir', lastName: 'Singh',
    phone: '+27 82 567 8901', tenantId: 'tenant_sandton', siteId: 'site_sandton_food',
    walletBalanceCents: 3500, registeredAt: '2025-03-12T11:45:00Z', lastLoginAt: '2025-05-03T12:00:00Z',
    status: 'active', radiusId: 'radius_hu016', marketingOptIn: true,
  },
  {
    id: 'hu_017', email: 'sarah.ferreira@gmail.com', firstName: 'Sarah', lastName: 'Ferreira',
    phone: '+27 79 678 9012', tenantId: 'tenant_sandton', siteId: 'site_sandton_food',
    walletBalanceCents: 1500, registeredAt: '2025-04-05T08:30:00Z', lastLoginAt: '2025-05-01T11:00:00Z',
    status: 'active', radiusId: 'radius_hu017', marketingOptIn: false,
  },

  // ── Pretoria Zoo ─────────────────────────────────────────────────
  {
    id: 'hu_018', email: 'dumisani.cele@gmail.com', firstName: 'Dumisani', lastName: 'Cele',
    phone: '+27 83 789 0123', tenantId: 'tenant_pta_zoo', siteId: 'site_zoo_entrance',
    walletBalanceCents: 10000, registeredAt: '2025-02-28T10:00:00Z', lastLoginAt: '2025-05-04T09:30:00Z',
    status: 'active', radiusId: 'radius_hu018', marketingOptIn: true,
    activeBundle: {
      id: 'bp_018', name: '24hr Access', purchasedAt: '2025-05-04T09:30:00Z',
      expiresAt: '2025-05-05T09:30:00Z', dataUsedMb: 95, durationSeconds: 86400,
    },
  },
  {
    id: 'hu_019', email: 'nkosi.williams@outlook.com', firstName: 'Nkosi', lastName: 'Williams',
    tenantId: 'tenant_pta_zoo', siteId: 'site_zoo_entrance',
    walletBalanceCents: 4000, registeredAt: '2025-03-25T14:00:00Z', lastLoginAt: '2025-04-30T10:45:00Z',
    status: 'active', radiusId: 'radius_hu019', marketingOptIn: true,
  },
  {
    id: 'hu_020', email: 'amara.okonkwo@gmail.com', firstName: 'Amara', lastName: 'Okonkwo',
    phone: '+27 71 890 1234', tenantId: 'tenant_pta_zoo', siteId: 'site_zoo_picnic',
    walletBalanceCents: 2500, registeredAt: '2025-04-18T11:00:00Z', lastLoginAt: '2025-04-18T11:15:00Z',
    status: 'active', radiusId: 'radius_hu020', marketingOptIn: false,
  },
]
