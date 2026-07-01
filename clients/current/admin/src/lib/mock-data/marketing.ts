import type { MarketingEntry } from '@/lib/types/marketing.types'

const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com']
const firstNames = ['Sipho', 'Zanele', 'Thabo', 'Nomvula', 'Lerato', 'Kagiso', 'Ayanda', 'Mpho', 'Palesa', 'Lwazi', 'Sarah', 'James', 'Emma', 'David', 'Lisa']
const lastNames = ['Nkosi', 'Dlamini', 'Khumalo', 'Mokoena', 'Mahlangu', 'Ndlovu', 'Zulu', 'Sithole', 'Mthembu', 'Smith', 'Jones', 'Brown', 'Williams', 'Taylor']
const userAgents = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/604.1',
]

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomIp(): string {
  return `102.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`
}

function randomDate(daysBack: number): string {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack))
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))
  return d.toISOString()
}

function generateEntries(siteId: string, count: number, startIndex: number): MarketingEntry[] {
  return Array.from({ length: count }, (_, i) => {
    const firstName = randomFrom(firstNames)
    const lastName = randomFrom(lastNames)
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 99)}@${randomFrom(domains)}`
    const unsubscribed = Math.random() < 0.15
    const createdAt = randomDate(30)
    return {
      id: `mkt_${siteId}_${startIndex + i}`,
      siteId,
      email,
      agreed: Math.random() > 0.05,
      ipAddress: randomIp(),
      userAgent: randomFrom(userAgents),
      createdAt,
      unsubscribed,
      unsubscribedAt: unsubscribed ? randomDate(10) : undefined,
    }
  })
}

const seed = (): MarketingEntry[] => {
  const siteIds = [
    'site_joburg_main',
    'site_joburg_cafe',
    'site_kwa_beach',
    'site_sandton_l1',
    'site_sandton_l2',
    'site_sandton_food',
    'site_zoo_entrance',
  ]
  let entries: MarketingEntry[] = []
  siteIds.forEach((siteId) => {
    const count = 20 + Math.floor(Math.random() * 31)
    entries = entries.concat(generateEntries(siteId, count, entries.length))
  })
  return entries
}

export const mockMarketing: MarketingEntry[] = seed()
