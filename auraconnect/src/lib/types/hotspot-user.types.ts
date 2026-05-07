export interface ActiveBundle {
  id: string
  name: string
  purchasedAt: string
  expiresAt: string
  dataUsedMb: number
  dataLimitMb?: number
  durationSeconds?: number
}

export interface HotspotUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  tenantId: string
  siteId: string
  walletBalanceCents: number
  activeBundle?: ActiveBundle
  registeredAt: string
  lastLoginAt?: string
  status: 'active' | 'suspended'
  radiusId?: string
  marketingOptIn: boolean
}

export interface WalletAdjustInput {
  userId: string
  amountCents: number  // positive = credit, negative = debit
  reason: string
}
