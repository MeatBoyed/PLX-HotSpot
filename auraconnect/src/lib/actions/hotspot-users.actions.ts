'use server'

import { hotspotUserService } from '@/lib/services/hotspot-user.service'
import { walletApi } from '@/lib/infrastructure/api/wallet.api'
import type { PackageCredentials } from '@/lib/types/package.types'

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

export async function getUserPackageCredentialsAction(userPackageId: string): Promise<PackageCredentials> {
  const data = await walletApi.getUserPackageCredentials(userPackageId)
  return {
    rdUsername: data.rdUsername ?? '',
    rdPassword: data.rdPassword ?? '',
    gatewayUrl: data.gatewayUrl ?? null,
  }
}

export async function disableUserPackageAction(userPackageId: string) {
  return walletApi.disableUserPackage(userPackageId)
}

export async function enableUserPackageAction(userPackageId: string) {
  return walletApi.enableUserPackage(userPackageId)
}
