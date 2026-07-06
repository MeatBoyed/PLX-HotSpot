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
  durationDays: number
  dataLimitEnabled: boolean
  dataAmount?: number | null
  dataUnit?: string | null
  dataReset?: string | null
  dataCap?: string | null
  timeLimitEnabled: boolean
  timeAmount?: number | null
  timeUnit?: string | null
  timeReset?: string | null
  timeCap?: string | null
  speedLimitEnabled: boolean
  speedUploadAmount?: number | null
  speedUploadUnit?: string | null
  speedDownloadAmount?: number | null
  speedDownloadUnit?: string | null
  sessionLimitEnabled: boolean
  sessionLimit?: number | null
  createdAt: string
  updatedAt: string
}

export interface PackageCredentials {
  rdUsername: string
  rdPassword: string
  gatewayUrl: string | null
}

export interface CreatePackageInput {
  name: string
  description?: string | null
  price: number
  sortOrder?: number
  durationDays?: number
  dataLimitEnabled?: boolean
  dataAmount?: number | null
  dataUnit?: string | null
  dataReset?: string | null
  dataCap?: string | null
  timeLimitEnabled?: boolean
  timeAmount?: number | null
  timeUnit?: string | null
  timeReset?: string | null
  timeCap?: string | null
  speedLimitEnabled?: boolean
  speedUploadAmount?: number | null
  speedUploadUnit?: string | null
  speedDownloadAmount?: number | null
  speedDownloadUnit?: string | null
  sessionLimitEnabled?: boolean
  sessionLimit?: number | null
}

export interface UpdatePackageInput {
  name?: string | null
  description?: string | null
  price?: number | null
  radiusProfileId?: number | null
  isActive?: boolean | null
  sortOrder?: number | null
  durationDays?: number | null
  dataLimitEnabled?: boolean | null
  dataAmount?: number | null
  dataUnit?: string | null
  dataReset?: string | null
  dataCap?: string | null
  timeLimitEnabled?: boolean | null
  timeAmount?: number | null
  timeUnit?: string | null
  timeReset?: string | null
  timeCap?: string | null
  speedLimitEnabled?: boolean | null
  speedUploadAmount?: number | null
  speedUploadUnit?: string | null
  speedDownloadAmount?: number | null
  speedDownloadUnit?: string | null
  sessionLimitEnabled?: boolean | null
  sessionLimit?: number | null
}
