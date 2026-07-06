'use server'

import { packageService } from '@/lib/services/package.service'
import type { CreatePackageInput, UpdatePackageInput } from '@/lib/types/package.types'

export async function createPackageAction(siteId: string, input: CreatePackageInput) {
  return packageService.create(siteId, input)
}

export async function updatePackageAction(siteId: string, packageId: string, input: UpdatePackageInput) {
  return packageService.update(siteId, packageId, input)
}

export async function deletePackageAction(siteId: string, packageId: string) {
  return packageService.delete(siteId, packageId)
}

export async function deleteManyPackagesAction(siteId: string, packageIds: string[]) {
  return packageService.deleteMany(siteId, packageIds)
}

export async function togglePackageActiveAction(siteId: string, packageId: string, currentIsActive: boolean) {
  return packageService.toggleActive(siteId, packageId, currentIsActive)
}
