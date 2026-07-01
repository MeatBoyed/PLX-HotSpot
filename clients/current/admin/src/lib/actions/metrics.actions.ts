'use server'

import { metricsService } from '@/lib/services/metrics.service'

export async function getActiveSessionsAction(params?: { siteId?: string; tenantId?: string }) {
  return metricsService.getActiveSessions(params)
}
