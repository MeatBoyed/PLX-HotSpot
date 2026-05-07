import { mockHotspotUsers } from '@/lib/mock-data/hotspot-users'
import { mockTransactions } from '@/lib/mock-data/transactions'
import type { HotspotUser, WalletAdjustInput } from '@/lib/types/hotspot-user.types'
import type { Transaction } from '@/lib/types/transaction.types'

let users = [...mockHotspotUsers]
let transactions = [...mockTransactions]

function delay(ms = 400): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export const hotspotUserService = {
  async getAll(): Promise<HotspotUser[]> {
    await delay()
    return [...users]
  },

  async getByTenantId(tenantId: string): Promise<HotspotUser[]> {
    await delay()
    return users.filter((u) => u.tenantId === tenantId)
  },

  async getBySiteId(siteId: string): Promise<HotspotUser[]> {
    await delay()
    return users.filter((u) => u.siteId === siteId)
  },

  async getById(id: string): Promise<HotspotUser | null> {
    await delay()
    return users.find((u) => u.id === id) ?? null
  },

  async getTransactions(userId: string): Promise<Transaction[]> {
    await delay()
    return transactions
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async suspend(id: string): Promise<HotspotUser> {
    await delay()
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error(`User ${id} not found`)
    users = users.map((u) => (u.id === id ? { ...u, status: 'suspended' as const } : u))
    return users[idx]
  },

  async adjustWallet({ userId, amountCents, reason }: WalletAdjustInput): Promise<HotspotUser> {
    await delay()
    const idx = users.findIndex((u) => u.id === userId)
    if (idx === -1) throw new Error(`User ${userId} not found`)
    const user = users[idx]
    const newBalance = Math.max(0, user.walletBalanceCents + amountCents)
    users = users.map((u) => (u.id === userId ? { ...u, walletBalanceCents: newBalance } : u))
    // Create audit transaction
    const txn: Transaction = {
      id: `txn_adj_${Date.now()}`,
      userId,
      userEmail: user.email,
      userFullName: `${user.firstName} ${user.lastName}`,
      tenantId: user.tenantId,
      siteId: user.siteId,
      type: 'adjustment',
      amountCents,
      status: 'completed',
      paymentGateway: 'manual',
      description: `Manual adjustment: ${reason}`,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    }
    transactions = [...transactions, txn]
    return { ...users[idx], walletBalanceCents: newBalance }
  },
}
