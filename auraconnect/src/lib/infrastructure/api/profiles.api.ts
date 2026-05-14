import { apiClient } from './client'
import type { components } from './schema'

type AdminProfileListItem = components['schemas']['AdminProfileListItem']
type AdminProfileDetail = components['schemas']['AdminProfileDetail']
type PagedProfileList = components['schemas']['PagedResultOfAdminProfileListItem']
type UpdateProfileBody = components['schemas']['UpdateProfileRequest']
type UpdateStatusBody = components['schemas']['UpdateProfileStatusRequest']
type UpdateWalletIdsBody = components['schemas']['UpdateWalletIdsRequest']

export interface ProfileListParams {
  page?: number
  pageSize?: number
  tenantId?: string
  siteId?: string
}

export const profilesApi = {
  async getAll(params: ProfileListParams = {}): Promise<PagedProfileList> {
    const { data, response } = await apiClient.GET('/api/admin/profiles', {
      params: {
        query: {
          page: params.page,
          pageSize: params.pageSize,
          tenantId: params.tenantId,
          siteId: params.siteId,
        },
      },
    })
    if (!response.ok) throw new Error(`Failed to fetch profiles: ${response.status}`)
    return data as unknown as PagedProfileList
  },

  async getById(profileId: string): Promise<AdminProfileDetail | null> {
    const { data, response } = await apiClient.GET('/api/admin/profiles/{profileId}', {
      params: { path: { profileId } },
    })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Failed to fetch profile ${profileId}: ${response.status}`)
    return data as unknown as AdminProfileDetail
  },

  async update(profileId: string, body: UpdateProfileBody): Promise<AdminProfileDetail> {
    const { data, response } = await apiClient.PATCH('/api/admin/profiles/{profileId}', {
      params: { path: { profileId } },
      body,
    })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Failed to update profile ${profileId}: ${response.status} — ${text}`)
    }
    return data as unknown as AdminProfileDetail
  },

  async updateStatus(profileId: string, body: UpdateStatusBody): Promise<AdminProfileDetail> {
    const { data, response } = await apiClient.PATCH('/api/admin/profiles/{profileId}/status', {
      params: { path: { profileId } },
      body,
    })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Failed to update profile status ${profileId}: ${response.status} — ${text}`)
    }
    return data as unknown as AdminProfileDetail
  },

  async updateWalletIds(profileId: string, body: UpdateWalletIdsBody): Promise<AdminProfileDetail> {
    const { data, response } = await apiClient.PATCH('/api/admin/profiles/{profileId}/wallet', {
      params: { path: { profileId } },
      body,
    })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Failed to update wallet IDs for ${profileId}: ${response.status} — ${text}`)
    }
    return data as unknown as AdminProfileDetail
  },

  async softDelete(profileId: string): Promise<void> {
    const { response } = await apiClient.DELETE('/api/admin/profiles/{profileId}', {
      params: { path: { profileId } },
    })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Failed to delete profile ${profileId}: ${response.status} — ${text}`)
    }
  },

  async hardDelete(profileId: string): Promise<void> {
    const { response } = await apiClient.DELETE('/api/admin/profiles/{profileId}/permanent', {
      params: { path: { profileId } },
    })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Failed to permanently delete profile ${profileId}: ${response.status} — ${text}`)
    }
  },
}
