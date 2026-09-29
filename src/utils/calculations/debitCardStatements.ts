import { parseISO } from 'date-fns'
import type { DebitCardTransaction } from '@/types'

export function getDebitStatementMonthKey(date: Date): string {
  const statementEndMonth =
    date.getDate() > 16 ? new Date(date.getFullYear(), date.getMonth() + 1, 1) : date
  return `${statementEndMonth.getFullYear()}-${String(
    statementEndMonth.getMonth() + 1,
  ).padStart(2, '0')}`
}

export function filterTransactionsByDebitStatement(
  transactions: DebitCardTransaction[],
  monthKey: string,
): DebitCardTransaction[] {
  const [year, month] = monthKey.split('-').map(Number)
  const start = new Date(year, month - 2, 17)
  const end = new Date(year, month - 1, 16)
  const startKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
  const endKey = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`

  return transactions.filter((transaction) => {
    const date = parseISO(transaction.date)
    return transaction.date >= startKey && transaction.date <= endKey && !Number.isNaN(date.getTime())
  })
}

export interface DebitStatementStats {
  currentBalance: number | null
  totalWithdrawals: number
  totalDeposits: number
}

export function computeDebitStatementStats(
  transactions: DebitCardTransaction[],
  statementTransactions: DebitCardTransaction[],
): DebitStatementStats {
  const latestTransaction = [...transactions]
    .filter((transaction) => !Number.isNaN(parseISO(transaction.date).getTime()))
    .sort((a, b) => b.date.localeCompare(a.date))[0]

  return {
    currentBalance: latestTransaction?.endingBalance ?? null,
    totalWithdrawals: statementTransactions.reduce(
      (sum, transaction) => sum + (transaction.amount < 0 ? Math.abs(transaction.amount) : 0),
      0,
    ),
    totalDeposits: statementTransactions.reduce(
      (sum, transaction) => sum + (transaction.amount > 0 ? transaction.amount : 0),
      0,
    ),
  }
}
