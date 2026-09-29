export interface BudgetExpense {
  id: string
  date: string
  description: string
  amount: number
  reason: string
  isSettled?: boolean
  settledDate?: string
}
