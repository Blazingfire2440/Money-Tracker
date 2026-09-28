import { parseISO } from 'date-fns'
import type { CreditCardTransaction } from '@/types'

export type BudgetColor = 'good' | 'warn' | 'bad'

export interface MonthlyBudgetStats {
  totalCharges: number
  reimbursableTotal: number
  netCharges: number
  remainingBudget: number
  percentUsed: number
  color: BudgetColor
  isOverBudget: boolean
  overBy: number
}

export function getMonthKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function filterTransactionsByMonth(
  transactions: CreditCardTransaction[],
  monthKey: string,
): CreditCardTransaction[] {
  return transactions.filter((t) => t.date.slice(0, 7) === monthKey)
}

export function colorForPercent(percentUsed: number): BudgetColor {
  if (percentUsed > 90) return 'bad'
  if (percentUsed >= 75) return 'warn'
  return 'good'
}

export function computeMonthlyBudgetStats(
  transactionsInMonth: CreditCardTransaction[],
  monthlyBudget: number,
): MonthlyBudgetStats {
  const totalCharges = transactionsInMonth.reduce((sum, t) => sum + t.amount, 0)
  const reimbursableTotal = transactionsInMonth
    .filter((t) => t.isReimbursable)
    .reduce((sum, t) => sum + t.amount, 0)
  const netCharges = totalCharges - reimbursableTotal
  const remainingBudget = monthlyBudget - netCharges
  const percentUsed = monthlyBudget > 0 ? (netCharges / monthlyBudget) * 100 : 0

  return {
    totalCharges,
    reimbursableTotal,
    netCharges,
    remainingBudget,
    percentUsed,
    color: colorForPercent(percentUsed),
    isOverBudget: percentUsed > 100,
    overBy: percentUsed > 100 ? netCharges - monthlyBudget : 0,
  }
}

// Kept for callers that have raw Date values rather than pre-parsed month keys.
export function dateToMonthKey(isoDate: string): string {
  return getMonthKey(parseISO(isoDate))
}

export interface ReimbursableStats {
  items: CreditCardTransaction[]
  totalOwed: number
  totalSettled: number
}

export function computeReimbursableStats(
  transactions: CreditCardTransaction[],
): ReimbursableStats {
  const items = transactions
    .filter((t) => t.isReimbursable)
    .sort((a, b) => b.date.localeCompare(a.date))

  const totalOwed = items
    .filter((t) => !t.isSettled)
    .reduce((sum, t) => sum + t.amount, 0)
  const totalSettled = items
    .filter((t) => t.isSettled)
    .reduce((sum, t) => sum + t.amount, 0)

  return { items, totalOwed, totalSettled }
}
