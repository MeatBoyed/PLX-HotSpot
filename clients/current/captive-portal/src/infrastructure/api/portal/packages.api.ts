import { apiClient } from '@/infrastructure/http';
import { env } from '@/env';
import type { ApiPortalPackage } from '../types';

export type { ApiPortalPackage };

export const portalPackagesApi = {
  async list(ssid: string): Promise<ApiPortalPackage[]> {
    const tenantId = env.TENANT_ID;
    if (!tenantId) throw new Error('TENANT_ID is not configured');
    return apiClient.get<ApiPortalPackage[]>(`/portal/${tenantId}/packages`, { ssid });
  },
};
