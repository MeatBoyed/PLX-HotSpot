export type UserRole = 'super_admin' | 'admin'

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  tenantIds: string[]
  status: 'active' | 'pending' | 'suspended'
  createdAt: string
  lastSignInAt?: string
}

export interface UserMetadata {
  role: UserRole
  tenantIds: string[]
}

export interface InviteUserInput {
  email: string
  firstName: string
  lastName: string
  role: UserRole
  tenantIds: string[]
}
