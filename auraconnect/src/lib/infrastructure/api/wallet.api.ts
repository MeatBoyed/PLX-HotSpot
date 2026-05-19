import { apiClient } from './client'
import type { components } from './schema'

type WalletBalanceResponse = components['schemas']['WalletBalanceResponse']
type WalletTransactionResponse = components['schemas']['WalletTransactionResponse']
type PagedTransactions = components['schemas']['PagedResultOfWalletTransactionResponse']
type UserPackageResponse = components['schemas']['UserPackageResponse']

export interface TransactionListParams {
  page?: number
  pageSize?: number
  profileId?: string
  tenantId?: string
  siteId?: string
}

export const walletApi = {
  async getTransactions(params: TransactionListParams = {}): Promise<PagedTransactions> {
    const { data, response } = await apiClient.GET('/api/admin/wallet/transactions', {
      params: {
        query: {
          page: params.page,
          pageSize: params.pageSize,
          profileId: params.profileId,
          tenantId: params.tenantId,
          siteId: params.siteId,
        },
      },
    })
    if (!response.ok) throw new Error(`Failed to fetch transactions: ${response.status}`)
    return data as unknown as PagedTransactions
  },

  async getTransactionById(transactionId: string): Promise<WalletTransactionResponse | null> {
    const { data, response } = await apiClient.GET('/api/admin/wallet/transactions/{transactionId}', {
      params: { path: { transactionId } },
    })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Failed to fetch transaction ${transactionId}: ${response.status}`)
    return data as unknown as WalletTransactionResponse
  },

  async getProfileBalance(profileId: string): Promise<WalletBalanceResponse | null> {
    const { data, response } = await apiClient.GET('/api/admin/wallet/profiles/{profileId}', {
      params: { path: { profileId } },
    })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Failed to fetch balance for ${profileId}: ${response.status}`)
    return data as unknown as WalletBalanceResponse
  },

  async getProfilePackages(profileId: string): Promise<UserPackageResponse[]> {
    const { data, response } = await apiClient.GET('/api/admin/wallet/profiles/{profileId}/packages', {
      params: { path: { profileId } },
    })
    if (!response.ok) throw new Error(`Failed to fetch packages for ${profileId}: ${response.status}`)
    return (data as unknown as UserPackageResponse[]) ?? []
  },
}
