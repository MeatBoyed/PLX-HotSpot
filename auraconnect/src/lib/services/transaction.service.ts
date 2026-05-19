import { walletApi } from '@/lib/infrastructure/api/wallet.api'
import type { components } from '@/lib/infrastructure/api/schema'
import type { Transaction, PagedTransactions } from '@/lib/types/transaction.types'
import type { TransactionListParams } from '@/lib/infrastructure/api/wallet.api'

type ApiTransaction = components['schemas']['WalletTransactionResponse']

function toTransaction(api: ApiTransaction): Transaction {
  return {
    id: api.id ?? '',
    type: api.type ?? '',
    amount: Number(api.amount ?? 0),
    currency: api.currency ?? 'ZAR',
    reference: api.reference ?? '',
    status: api.status ?? '',
    createdAt: api.createdAt ?? '',
    updatedAt: api.updatedAt,
    payFastPaymentId: api.payFastPaymentId,
    amountFee: api.amountFee != null ? Number(api.amountFee) : null,
    amountNet: api.amountNet != null ? Number(api.amountNet) : null,
  }
}

export const transactionService = {
  async getAll(params: TransactionListParams = {}): Promise<PagedTransactions> {
    const paged = await walletApi.getTransactions(params)
    return {
      items: (paged.items ?? []).map(toTransaction),
      page: Number(paged.page ?? 1),
      pageSize: Number(paged.pageSize ?? 25),
      totalCount: Number(paged.totalCount ?? 0),
      totalPages: Number(paged.totalPages ?? 1),
      hasNextPage: paged.hasNextPage ?? false,
      hasPreviousPage: paged.hasPreviousPage ?? false,
    }
  },
}
