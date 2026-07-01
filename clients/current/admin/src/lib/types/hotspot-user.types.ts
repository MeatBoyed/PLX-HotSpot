export interface HotspotUser {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  phoneNumber?: string | null
  balance: number
  status: string
  createdAt: string
  siteIds: string[]
}

export interface MembershipSummary {
  siteId: string
  siteName: string
  tenantId: string
  firstVisitAt: string
  lastVisitAt: string
}

export interface HotspotUserDetail {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  phoneNumber?: string | null
  balance: number
  status: string
  createdAt: string
  updatedAt: string
  memberships: MembershipSummary[]
}

export interface UserPackage {
  id: string
  packageId: string
  packageName: string
  siteId: string
  amountPaid: number
  currency: string
  status: string
  purchasedAt: string
  expiresAt?: string | null
}

export interface PagedProfiles {
  items: HotspotUser[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
