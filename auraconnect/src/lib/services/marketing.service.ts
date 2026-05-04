import { mockMarketing } from '@/lib/mock-data/marketing'
import type { MarketingEntry, MarketingFilter } from '@/lib/types/marketing.types'

let entries = [...mockMarketing]

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const marketingService = {
  async getBySiteId(siteId: string, filter?: MarketingFilter): Promise<MarketingEntry[]> {
    await delay()
    let results = entries.filter((e) => e.siteId === siteId)

    if (filter?.search) {
      const search = filter.search.toLowerCase()
      results = results.filter((e) => e.email.toLowerCase().includes(search))
    }

    if (filter?.unsubscribed !== undefined && filter.unsubscribed !== null) {
      results = results.filter((e) => e.unsubscribed === filter.unsubscribed)
    }

    if (filter?.dateFrom) {
      results = results.filter((e) => e.createdAt >= filter.dateFrom!)
    }

    if (filter?.dateTo) {
      const dateTo = filter.dateTo + 'T23:59:59Z'
      results = results.filter((e) => e.createdAt <= dateTo)
    }

    return results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  async getCountBySiteId(siteId: string): Promise<number> {
    return entries.filter((e) => e.siteId === siteId).length
  },
}
