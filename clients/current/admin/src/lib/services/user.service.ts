import { mockUsers } from '@/lib/mock-data/users'
import type { AdminUser, InviteUserInput } from '@/lib/types/user.types'

let users = [...mockUsers]

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const userService = {
  async getAll(): Promise<AdminUser[]> {
    await delay()
    return [...users]
  },

  async getById(id: string): Promise<AdminUser | null> {
    await delay()
    return users.find((u) => u.id === id) ?? null
  },

  async invite(input: InviteUserInput): Promise<AdminUser> {
    await delay()
    const user: AdminUser = {
      id: `user_${Date.now()}`,
      ...input,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    users = [...users, user]
    return user
  },

  async updateRole(id: string, role: AdminUser['role'], tenantIds: string[]): Promise<AdminUser> {
    await delay()
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error(`User ${id} not found`)
    const updated = { ...users[idx], role, tenantIds }
    users = users.map((u) => (u.id === id ? updated : u))
    return updated
  },

  async suspend(id: string): Promise<AdminUser> {
    await delay()
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error(`User ${id} not found`)
    const updated = { ...users[idx], status: 'suspended' as const }
    users = users.map((u) => (u.id === id ? updated : u))
    return updated
  },

  async delete(id: string): Promise<void> {
    await delay()
    users = users.filter((u) => u.id !== id)
  },
}
