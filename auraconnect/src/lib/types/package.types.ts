export interface Package {
  id: string
  siteId: string
  name: string
  description?: string | null
  price: number
  radiusProfile: string
  radiusProfileId?: number | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreatePackageInput {
  name: string
  description?: string | null
  price: number
  radiusProfile: string
  radiusProfileId?: number | null
  sortOrder?: number
}

export interface UpdatePackageInput {
  name?: string | null
  description?: string | null
  price?: number | null
  radiusProfile?: string | null
  radiusProfileId?: number | null
  isActive?: boolean | null
  sortOrder?: number | null
}
