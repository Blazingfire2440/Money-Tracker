import type { ReimbursementStatus } from './creditCard'

export interface DebitCardTransaction {
  id: string
  date: string
  checkNumber: string
  description: string
  amount: number
  endingBalance: number
  reason: string
  reimbursementStatus: ReimbursementStatus
  isSettled?: boolean
  settledDate?: string
}
