import { apiClient } from './client'
import type { components } from './schema'

type WalletBalanceResponse = components['schemas']['WalletBalanceResponse']
type WalletTransactionResponse = components['schemas']['WalletTransactionResponse']
type PagedTransactions = components['schemas']['PagedResultOfWalletTransactionResponse']
type UserPackageResponse = components['schemas']['UserPackageResponse']
type PackageCredentialsResponse = components['schemas']['PackageCredentialsResponse']

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

  async getUserPackageCredentials(userPackageId: string): Promise<PackageCredentialsResponse> {
    const { data, response } = await apiClient.GET('/api/admin/user-packages/{userPackageId}/credentials', {
      params: { path: { userPackageId } },
    })
    if (response.status === 404) throw new Error('User package not found')
    if (!response.ok) throw new Error(`Failed to fetch credentials: ${response.status}`)
    return data as unknown as PackageCredentialsResponse
  },

  async disableUserPackage(userPackageId: string): Promise<void> {
    const { response } = await apiClient.POST('/api/admin/user-packages/{userPackageId}/disable', {
      params: { path: { userPackageId } },
    })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Failed to disable user package: ${text || response.status}`)
    }
  },

  async enableUserPackage(userPackageId: string): Promise<void> {
    const { response } = await apiClient.POST('/api/admin/user-packages/{userPackageId}/enable', {
      params: { path: { userPackageId } },
    })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Failed to enable user package: ${text || response.status}`)
    }
  },
}
