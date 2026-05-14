import { packagesApi } from '@/lib/infrastructure/api/packages.api'
import type { components } from '@/lib/infrastructure/api/schema'
import type { Package, CreatePackageInput, UpdatePackageInput } from '@/lib/types/package.types'

type ApiPackage = components['schemas']['PackageResponse']

function toPackage(api: ApiPackage): Package {
  return {
    id: api.id ?? '',
    siteId: api.siteId ?? '',
    name: api.name ?? '',
    description: api.description,
    price: Number(api.price ?? 0),
    radiusProfile: api.radiusProfile ?? '',
    radiusProfileId: api.radiusProfileId != null ? Number(api.radiusProfileId) : null,
    isActive: api.isActive ?? true,
    sortOrder: Number(api.sortOrder ?? 0),
    createdAt: api.createdAt ?? '',
    updatedAt: api.updatedAt ?? '',
  }
}

export const packageService = {
  async getBySiteId(siteId: string): Promise<Package[]> {
    const results = await packagesApi.getBySiteId(siteId)
    return results.map(toPackage).sort((a, b) => a.sortOrder - b.sortOrder)
  },

  async getById(siteId: string, packageId: string): Promise<Package | null> {
    const result = await packagesApi.getById(siteId, packageId)
    return result ? toPackage(result) : null
  },

  async create(siteId: string, input: CreatePackageInput): Promise<Package> {
    const result = await packagesApi.create(siteId, {
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      radiusProfile: input.radiusProfile,
      radiusProfileId: input.radiusProfileId ?? null,
      sortOrder: input.sortOrder,
    })
    return toPackage(result)
  },

  async update(siteId: string, packageId: string, input: UpdatePackageInput): Promise<Package> {
    const result = await packagesApi.update(siteId, packageId, input)
    return toPackage(result)
  },

  async delete(siteId: string, packageId: string): Promise<void> {
    await packagesApi.delete(siteId, packageId)
  },

  async deleteMany(siteId: string, packageIds: string[]): Promise<void> {
    await Promise.all(packageIds.map((id) => packagesApi.delete(siteId, id)))
  },

  async toggleActive(siteId: string, packageId: string, currentIsActive: boolean): Promise<Package> {
    const result = await packagesApi.update(siteId, packageId, { isActive: !currentIsActive })
    return toPackage(result)
  },
}
