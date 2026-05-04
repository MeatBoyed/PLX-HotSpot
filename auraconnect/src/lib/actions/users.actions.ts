'use server'

import { userService } from '@/lib/services/user.service'
import type { AdminUser, InviteUserInput } from '@/lib/types/user.types'

export async function inviteUserAction(input: InviteUserInput) {
  return userService.invite(input)
}

export async function updateUserRoleAction(id: string, role: AdminUser['role'], tenantIds: string[]) {
  return userService.updateRole(id, role, tenantIds)
}

export async function suspendUserAction(id: string) {
  return userService.suspend(id)
}

export async function deleteUserAction(id: string) {
  return userService.delete(id)
}
