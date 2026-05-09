// Portal-facing API types.
// PortalBrandingResponse is generated from the OpenAPI schema — see schema.d.ts.
// Run `npm run api:types` to regenerate after API changes.

import type { BrandingConfig } from '@/lib/types'

export type { BrandingConfig }

export interface ApiPortalPackage {
  id: number
  ssid: string
  name: string
  description?: string | null
  price: number
  radiusProfileId: number
  radiusProfile: string
  radiusRealmId?: string | null
  radiusCloudId?: string | null
}

export interface ApiPortalPackagesList {
  packages: ApiPortalPackage[]
}

export interface ApiPortalSubVenue {
  ssid: string
  name: string
  venueLabel?: string | null
  venueRoute?: string | null
  sortOrder?: number | null
  parentSsid?: string | null
}
