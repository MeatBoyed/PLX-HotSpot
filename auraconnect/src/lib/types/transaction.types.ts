export type TransactionType = 'topup' | 'purchase' | 'refund' | 'adjustment'
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type PaymentGateway = 'payfast' | 'manual'

export interface Transaction {
  id: string
  userId: string
  userEmail: string
  userFullName: string
  tenantId: string
  siteId: string
  type: TransactionType
  amountCents: number  // positive = credit, negative = debit
  status: TransactionStatus
  paymentGateway?: PaymentGateway
  description: string
  gatewayTransactionId?: string
  createdAt: string
  completedAt?: string
}
