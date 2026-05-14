export interface Transaction {
  id: string
  blnkTransactionId?: string | null
  type: string
  amount: number
  currency: string
  reference: string
  status: string
  createdAt: string
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
