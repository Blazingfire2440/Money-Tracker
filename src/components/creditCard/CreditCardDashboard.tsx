import { useMemo } from 'react'
import { MonthSelector } from './MonthSelector'
import { CategoryBreakdownPanel } from './CategoryBreakdownPanel'
import { useCreditCardStore } from '@/store/useCreditCardStore'
import { useUIStore } from '@/store/useUIStore'
import { filterTransactionsByMonth } from '@/utils/calculations/creditCardBudget'
import { computeCategoryBreakdown } from '@/utils/calculations/categoryBreakdown'

export function CreditCardDashboard() {
  const transactions = useCreditCardStore((s) => s.transactions)
  const selectedMonth = useUIStore((s) => s.selectedMonth)
  const setSelectedMonth = useUIStore((s) => s.setSelectedMonth)

  const transactionsInMonth = useMemo(
    () => filterTransactionsByMonth(transactions, selectedMonth),
    [transactions, selectedMonth],
  )

  const categoryStats = useMemo(
    () => computeCategoryBreakdown(transactionsInMonth),
    [transactionsInMonth],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <MonthSelector monthKey={selectedMonth} onChange={setSelectedMonth} />
      </div>
      <CategoryBreakdownPanel stats={categoryStats} />
    </div>
  )
}
