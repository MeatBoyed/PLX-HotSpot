export interface MarketingEntry {
  id: string
  siteId: string
  email: string
  agreed: boolean
  ipAddress: string
  userAgent: string
  createdAt: string
  unsubscribed: boolean
  unsubscribedAt?: string
}

export interface MarketingFilter {
  search?: string
  unsubscribed?: boolean | null
  dateFrom?: string
  dateTo?: string
}
