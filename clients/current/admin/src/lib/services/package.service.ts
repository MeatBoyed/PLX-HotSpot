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
    durationDays: Number(api.durationDays ?? 0),
    dataLimitEnabled: api.dataLimitEnabled ?? false,
    dataAmount: api.dataAmount != null ? Number(api.dataAmount) : null,
    dataUnit: api.dataUnit ?? null,
    dataReset: api.dataReset ?? null,
    dataCap: api.dataCap ?? null,
    timeLimitEnabled: api.timeLimitEnabled ?? false,
    timeAmount: api.timeAmount != null ? Number(api.timeAmount) : null,
    timeUnit: api.timeUnit ?? null,
    timeReset: api.timeReset ?? null,
    timeCap: api.timeCap ?? null,
    speedLimitEnabled: api.speedLimitEnabled ?? false,
    speedUploadAmount: api.speedUploadAmount != null ? Number(api.speedUploadAmount) : null,
    speedUploadUnit: api.speedUploadUnit ?? null,
    speedDownloadAmount: api.speedDownloadAmount != null ? Number(api.speedDownloadAmount) : null,
    speedDownloadUnit: api.speedDownloadUnit ?? null,
    sessionLimitEnabled: api.sessionLimitEnabled ?? false,
    sessionLimit: api.sessionLimit != null ? Number(api.sessionLimit) : null,
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
      sortOrder: input.sortOrder,
      durationDays: input.durationDays,
      dataLimitEnabled: input.dataLimitEnabled,
      dataAmount: input.dataAmount,
      dataUnit: input.dataUnit,
      dataReset: input.dataReset,
      dataCap: input.dataCap,
      timeLimitEnabled: input.timeLimitEnabled,
      timeAmount: input.timeAmount,
      timeUnit: input.timeUnit,
      timeReset: input.timeReset,
      timeCap: input.timeCap,
      speedLimitEnabled: input.speedLimitEnabled,
      speedUploadAmount: input.speedUploadAmount,
      speedUploadUnit: input.speedUploadUnit,
      speedDownloadAmount: input.speedDownloadAmount,
      speedDownloadUnit: input.speedDownloadUnit,
      sessionLimitEnabled: input.sessionLimitEnabled,
      sessionLimit: input.sessionLimit,
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
