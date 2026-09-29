import type { BudgetExpense, CreditCardTransaction } from '@/types'

type LegacyCreditCardTransaction = Omit<
  CreditCardTransaction,
  'reimbursementStatus' | 'paymentMethod'
> & {
  reimbursementStatus?: string
  paymentMethod?: string
}

export function migrateLegacyBudgetExpenses<T extends LegacyCreditCardTransaction>(
  transactions: T[],
  existingExpenses: BudgetExpense[],
): { creditCardTransactions: T[]; budgetExpenses: BudgetExpense[] } {
  const legacyExpenses = transactions.filter(
    (transaction) =>
      transaction.reimbursementStatus === 'Expense' || transaction.paymentMethod === 'Expense',
  )
  const migratedExpenses = legacyExpenses.map((transaction) => ({
    id: transaction.id,
    date: transaction.date,
    description: transaction.location,
    amount: Math.abs(transaction.amount),
    reason: transaction.reason,
  }))

  return {
    creditCardTransactions: transactions.filter(
      (transaction) => !legacyExpenses.includes(transaction),
    ),
    budgetExpenses: [
      ...existingExpenses,
      ...migratedExpenses.filter(
        (expense) => !existingExpenses.some((stored) => stored.id === expense.id),
      ),
    ],
  }
}
