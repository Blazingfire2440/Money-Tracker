import { parseISO } from 'date-fns'
import type { CreditCardTransaction } from '@/types'

export type BudgetColor = 'good' | 'warn' | 'bad'

export interface MonthlyBudgetStats {
  totalCharges: number
  reimbursableTotal: number
  expenseTotal: number
  netCharges: number
  remainingBudget: number
  percentUsed: number
  color: BudgetColor
  isOverBudget: boolean
  overBy: number
}

export function getMonthKey(date: Date): string {
  const budgetStart = date.getDate() < 19
    ? new Date(date.getFullYear(), date.getMonth() - 1, 1)
    : date
  const y = budgetStart.getFullYear()
  const m = String(budgetStart.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function filterTransactionsByMonth(
  transactions: CreditCardTransaction[],
  monthKey: string,
): CreditCardTransaction[] {
  return transactions.filter((transaction) => dateToMonthKey(transaction.date) === monthKey)
}

export function colorForPercent(percentUsed: number): BudgetColor {
  if (percentUsed > 90) return 'bad'
  if (percentUsed >= 75) return 'warn'
  return 'good'
}

export function computeMonthlyBudgetStats(
  transactionsInMonth: CreditCardTransaction[],
  monthlyBudget: number,
  expenseTotal = 0,
): MonthlyBudgetStats {
  const charges = transactionsInMonth.filter(
    (transaction) =>
      transaction.category !== 'Payment' &&
      transaction.reimbursementStatus !== 'Expense',
  )
  const totalCharges = charges.reduce((sum, transaction) => sum + transaction.amount, 0)
  const reimbursableTotal = charges
    .filter((transaction) => transaction.reimbursementStatus === 'Reimbursable')
    .reduce((sum, t) => sum + t.amount, 0)
  const netCharges = totalCharges - reimbursableTotal + expenseTotal
  const remainingBudget = monthlyBudget - netCharges
  const percentUsed = monthlyBudget > 0 ? (netCharges / monthlyBudget) * 100 : 0

  return {
    totalCharges,
    reimbursableTotal,
    expenseTotal,
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
