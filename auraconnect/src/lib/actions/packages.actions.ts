'use server'

import { packageService } from '@/lib/services/package.service'
import type { CreatePackageInput, UpdatePackageInput } from '@/lib/types/package.types'

export async function createPackageAction(input: CreatePackageInput) {
  return packageService.create(input)
}

export async function updatePackageAction(id: string, input: UpdatePackageInput) {
  return packageService.update(id, input)
}

export async function deletePackageAction(id: string) {
  return packageService.delete(id)
}

export async function deleteManyPackagesAction(ids: string[]) {
  return packageService.deleteMany(ids)
}

export async function togglePackageActiveAction(id: string) {
  return packageService.toggleActive(id)
}
