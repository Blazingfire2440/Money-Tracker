import { useMemo } from 'react'
import { MonthSelector } from '@/components/creditCard/MonthSelector'
import { MonthlyBudgetPanel } from '@/components/creditCard/MonthlyBudgetPanel'
import { ReimbursableTracker } from '@/components/creditCard/ReimbursableTracker'
import { QuickEntryBudgetExpense } from '@/components/budget/QuickEntryBudgetExpense'
import { useCreditCardStore } from '@/store/useCreditCardStore'
import { useBudgetExpenseStore } from '@/store/useBudgetExpenseStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useUIStore } from '@/store/useUIStore'
import {
  computeMonthlyBudgetStats,
  dateToMonthKey,
  filterTransactionsByMonth,
} from '@/utils/calculations/creditCardBudget'
import { formatBudgetPeriodLabel } from '@/utils/formatters'

export function BudgetPage() {
  const transactions = useCreditCardStore((state) => state.transactions)
  const expenses = useBudgetExpenseStore((state) => state.expenses)
  const monthlyBudget = useSettingsStore((state) => state.settings.monthlyCreditCardBudget)
  const selectedMonth = useUIStore((state) => state.selectedMonth)
  const setSelectedMonth = useUIStore((state) => state.setSelectedMonth)

  const transactionsInMonth = useMemo(
    () => filterTransactionsByMonth(transactions, selectedMonth),
    [transactions, selectedMonth],
  )
  const expensesInMonth = useMemo(
    () =>
      expenses.filter(
        (expense) => dateToMonthKey(expense.date) === selectedMonth,
      ),
    [expenses, selectedMonth],
  )
  const expenseTotal = expensesInMonth.reduce(
    (sum, expense) => sum + Math.abs(expense.amount),
    0,
  )
  const stats = useMemo(
    () => computeMonthlyBudgetStats(transactionsInMonth, monthlyBudget, expenseTotal),
    [transactionsInMonth, monthlyBudget, expenseTotal],
  )

  return (
    <div className="flex flex-col gap-4">
      <QuickEntryBudgetExpense />
      <div className="flex justify-end">
        <MonthSelector monthKey={selectedMonth} onChange={setSelectedMonth} />
      </div>
      <MonthlyBudgetPanel
        stats={stats}
        monthlyBudget={monthlyBudget}
        budgetPeriod={formatBudgetPeriodLabel(selectedMonth)}
      />
      <ReimbursableTracker />
    </div>
  )
}
