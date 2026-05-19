'use server'

import { siteService } from '@/lib/services/site.service'
import type { CreateSiteInput, UpdateSiteInput } from '@/lib/types/site.types'

export async function createSiteAction(input: CreateSiteInput) {
  return siteService.create(input)
}

export async function updateSiteAction(id: string, input: UpdateSiteInput) {
  return siteService.update(id, input)
}

export async function updateSiteStatusAction(id: string, status: number) {
  return siteService.updateStatus(id, status)
}

export async function deleteSiteAction(id: string) {
  return siteService.delete(id)
}
