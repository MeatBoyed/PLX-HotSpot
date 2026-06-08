'use server'

import { siteService } from '@/lib/services/site.service'
import { logger } from '@/lib/utils/logger'
import type { CreateSiteInput, UpdateSiteInput } from '@/lib/types/site.types'

export async function createSiteAction(input: CreateSiteInput) {
  return siteService.create(input)
}

export async function updateSiteAction(id: string, input: UpdateSiteInput) {
  // Fetch the current site so we can merge — the API requires name + ssid
  // to be present even on a partial update.
  const site = await siteService.getById(id)
  if (!site) throw new Error('Site not found')

  const merged: UpdateSiteInput = {
    name:           input.name           ?? site.name,
    ssid:           input.ssid           ?? site.ssid,
    domain:         'domain'        in input ? (input.domain  ?? null) : (site.domain ?? null),
    sortOrder:      input.sortOrder      ?? site.sortOrder ?? 0,
    marketingOptIn: input.marketingOptIn ?? site.marketingOptIn,
  }

  logger.info('sites.actions', `updateSiteAction ${id}`, {
    body: JSON.stringify(merged),
  })

  await siteService.update(id, merged)
  // Return nothing — avoids potential serialisation issues with the Site object.
}

export async function updateSiteStatusAction(id: string, status: number) {
  return siteService.updateStatus(id, status)
}

export async function deleteSiteAction(id: string) {
  return siteService.delete(id)
}

