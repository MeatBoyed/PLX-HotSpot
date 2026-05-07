import { mockTransactions } from '@/lib/mock-data/transactions'
import type { Transaction } from '@/lib/types/transaction.types'

let transactions = [...mockTransactions]

function delay(ms = 400): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    await delay()
    return [...transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getByTenantId(tenantId: string): Promise<Transaction[]> {
    await delay()
    return transactions
      .filter((t) => t.tenantId === tenantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getBySiteId(siteId: string): Promise<Transaction[]> {
    await delay()
    return transactions
      .filter((t) => t.siteId === siteId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getByUserId(userId: string): Promise<Transaction[]> {
    await delay()
    return transactions
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },
}
