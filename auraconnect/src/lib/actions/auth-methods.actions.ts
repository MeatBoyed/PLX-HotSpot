'use server'

import { authMethodsService } from '@/lib/services/auth-methods.service'

export async function updateAuthMethodsAction(siteId: string, authMethods: string[]): Promise<void> {
  return authMethodsService.update(siteId, authMethods)
}
