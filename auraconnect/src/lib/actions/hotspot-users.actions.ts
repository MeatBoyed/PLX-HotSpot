'use server'

import { hotspotUserService } from '@/lib/services/hotspot-user.service'
import type { WalletAdjustInput } from '@/lib/types/hotspot-user.types'

export async function suspendHotspotUserAction(id: string) {
  return hotspotUserService.suspend(id)
}

export async function adjustWalletAction(input: WalletAdjustInput) {
  return hotspotUserService.adjustWallet(input)
}
