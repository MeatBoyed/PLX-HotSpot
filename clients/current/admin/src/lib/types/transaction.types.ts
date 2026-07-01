export interface Transaction {
  id: string
  type: string
  amount: number
  currency: string
  reference: string
  status: string
  createdAt: string
  updatedAt?: string
  payFastPaymentId?: string | null
  amountFee?: number | null
  amountNet?: number | null
}

export interface PagedTransactions {
  items: Transaction[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
