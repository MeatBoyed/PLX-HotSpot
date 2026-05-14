'use server'

import { hotspotUserService } from '@/lib/services/hotspot-user.service'

export async function updateProfileStatusAction(profileId: string, status: string) {
  return hotspotUserService.updateStatus(profileId, status)
}

export async function updateProfileAction(
  profileId: string,
  firstName: string,
  lastName: string,
  phoneNumber?: string | null,
) {
  return hotspotUserService.update(profileId, firstName, lastName, phoneNumber)
}

export async function softDeleteProfileAction(profileId: string) {
  return hotspotUserService.softDelete(profileId)
}

export async function hardDeleteProfileAction(profileId: string) {
  return hotspotUserService.hardDelete(profileId)
}
