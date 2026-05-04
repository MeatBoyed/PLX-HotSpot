import { mockPackages } from '@/lib/mock-data/packages'
import type { Package, CreatePackageInput, UpdatePackageInput } from '@/lib/types/package.types'

let packages = [...mockPackages]

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const packageService = {
  async getBySiteId(siteId: string): Promise<Package[]> {
    await delay()
    return packages
      .filter((p) => p.siteId === siteId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  },

  async getById(id: string): Promise<Package | null> {
    await delay()
    return packages.find((p) => p.id === id) ?? null
  },

  async create(input: CreatePackageInput): Promise<Package> {
    await delay()
    const now = new Date().toISOString()
    const existing = packages.filter((p) => p.siteId === input.siteId)
    const pkg: Package = {
      id: `pkg_${Date.now()}`,
      ...input,
      currency: input.currency ?? 'ZAR',
      active: input.active ?? true,
      sortOrder: input.sortOrder ?? existing.length + 1,
      createdAt: now,
      updatedAt: now,
    }
    packages = [...packages, pkg]
    return pkg
  },

  async update(id: string, input: UpdatePackageInput): Promise<Package> {
    await delay()
    const idx = packages.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error(`Package ${id} not found`)
    const updated = { ...packages[idx], ...input, updatedAt: new Date().toISOString() }
    packages = packages.map((p) => (p.id === id ? updated : p))
    return updated
  },

  async delete(id: string): Promise<void> {
    await delay()
    packages = packages.filter((p) => p.id !== id)
  },

  async deleteMany(ids: string[]): Promise<void> {
    await delay()
    packages = packages.filter((p) => !ids.includes(p.id))
  },

  async toggleActive(id: string): Promise<Package> {
    await delay()
    const pkg = packages.find((p) => p.id === id)
    if (!pkg) throw new Error(`Package ${id} not found`)
    return this.update(id, { active: !pkg.active })
  },
}
