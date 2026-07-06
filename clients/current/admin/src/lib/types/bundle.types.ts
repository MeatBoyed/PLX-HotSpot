export interface Bundle {
  id: string
  siteId: string
  tenantId: string
  name: string
  description?: string
  priceCents: number
  durationSeconds?: number   // null = data-only
  dataLimitMb?: number       // null = unlimited
  radiusProfile: string
  isActive: boolean
  sortOrder: number
}

export interface BundlePurchase {
  id: string
  userId: string
  bundleId: string
  bundleName: string
  pricePaidCents: number
  status: 'pending_activation' | 'active' | 'expired' | 'revoked'
  radiusSessionId?: string
  purchasedAt: string
  activatedAt?: string
  expiresAt?: string
}
