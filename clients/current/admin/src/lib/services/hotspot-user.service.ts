import { profilesApi } from '@/lib/infrastructure/api/profiles.api'
import { walletApi } from '@/lib/infrastructure/api/wallet.api'
import type { components } from '@/lib/infrastructure/api/schema'
import type {
  HotspotUser,
  HotspotUserDetail,
  UserPackage,
  PagedProfiles,
} from '@/lib/types/hotspot-user.types'
import type { ProfileListParams } from '@/lib/infrastructure/api/profiles.api'

type ApiListItem = components['schemas']['AdminProfileListItem']
type ApiDetail = components['schemas']['AdminProfileDetail']
type ApiPackage = components['schemas']['UserPackageResponse']
type ApiMembership = components['schemas']['AdminMembershipSummary']

function toHotspotUser(item: ApiListItem): HotspotUser {
  return {
    id: item.id ?? '',
    email: item.email ?? '',
    firstName: item.firstName ?? '',
    lastName: item.lastName ?? '',
    displayName: item.displayName ?? '',
    phoneNumber: item.phoneNumber,
    balance: Number(item.balance ?? 0),
    status: item.status ?? 'active',
    createdAt: item.createdAt ?? '',
    siteIds: item.siteIds ?? [],
  }
}

function toHotspotUserDetail(detail: ApiDetail): HotspotUserDetail {
  return {
    id: detail.id ?? '',
    email: detail.email ?? '',
    firstName: detail.firstName ?? '',
    lastName: detail.lastName ?? '',
    displayName: detail.displayName ?? '',
    phoneNumber: detail.phoneNumber,
    balance: Number(detail.balance ?? 0),
    status: detail.status ?? 'active',
    createdAt: detail.createdAt ?? '',
    updatedAt: detail.updatedAt ?? '',
    memberships: (detail.memberships ?? []).map((m: ApiMembership) => ({
      siteId: m.siteId ?? '',
      siteName: m.siteName ?? '',
      tenantId: m.tenantId ?? '',
      firstVisitAt: m.firstVisitAt ?? '',
      lastVisitAt: m.lastVisitAt ?? '',
    })),
  }
}

function toUserPackage(api: ApiPackage): UserPackage {
  return {
    id: api.id ?? '',
    packageId: api.packageId ?? '',
    packageName: api.packageName ?? '',
    siteId: api.siteId ?? '',
    amountPaid: Number(api.amountPaid ?? 0),
    currency: api.currency ?? 'ZAR',
    status: api.status ?? '',
    purchasedAt: api.purchasedAt ?? '',
    expiresAt: api.expiresAt,
  }
}

export const hotspotUserService = {
  async getAll(params: ProfileListParams = {}): Promise<PagedProfiles> {
    const paged = await profilesApi.getAll(params)
    return {
      items: (paged.items ?? []).map(toHotspotUser),
      page: Number(paged.page ?? 1),
      pageSize: Number(paged.pageSize ?? 20),
      totalCount: Number(paged.totalCount ?? 0),
      totalPages: Number(paged.totalPages ?? 1),
      hasNextPage: paged.hasNextPage ?? false,
      hasPreviousPage: paged.hasPreviousPage ?? false,
    }
  },

  async getById(profileId: string): Promise<HotspotUserDetail | null> {
    const detail = await profilesApi.getById(profileId)
    if (!detail) return null
    return toHotspotUserDetail(detail)
  },

  async getPackages(profileId: string): Promise<UserPackage[]> {
    const packages = await walletApi.getProfilePackages(profileId)
    return packages.map(toUserPackage)
  },

  async updateStatus(profileId: string, status: string): Promise<HotspotUserDetail> {
    const detail = await profilesApi.updateStatus(profileId, { status })
    return toHotspotUserDetail(detail)
  },

  async update(profileId: string, firstName: string, lastName: string, phoneNumber?: string | null): Promise<HotspotUserDetail> {
    const detail = await profilesApi.update(profileId, { firstName, lastName, phoneNumber })
    return toHotspotUserDetail(detail)
  },

  async softDelete(profileId: string): Promise<void> {
    await profilesApi.softDelete(profileId)
  },

  async hardDelete(profileId: string): Promise<void> {
    await profilesApi.hardDelete(profileId)
  },
}
