export type PackageDurationType = 'minutes' | 'hours' | 'days' | 'unlimited'

export interface Package {
  id: string
  siteId: string
  name: string
  description?: string
  price: number
  currency: string
  durationValue: number
  durationType: PackageDurationType
  dataLimitMb?: number
  downloadSpeedKbps?: number
  uploadSpeedKbps?: number
  radiusProfile: string
  active: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreatePackageInput {
  siteId: string
  name: string
  description?: string
  price: number
  currency?: string
  durationValue: number
  durationType: PackageDurationType
  dataLimitMb?: number
  downloadSpeedKbps?: number
  uploadSpeedKbps?: number
  radiusProfile: string
  active?: boolean
  sortOrder?: number
}

export interface UpdatePackageInput extends Partial<Omit<CreatePackageInput, 'siteId'>> {}
