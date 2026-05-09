import { apiClient } from '@/infrastructure/http'
import type { ApiPortalPackage, ApiPortalPackagesList } from '../types'

export type { ApiPortalPackage }

export const portalPackagesApi = {
  async list(ssid: string): Promise<ApiPortalPackage[]> {
    const data = await apiClient.get<ApiPortalPackagesList>('/portal/packages', { ssid })
    return data.packages ?? []
  },
}
