import { useMemo } from 'react'
import { MonthSelector } from './MonthSelector'
import { MonthlyBudgetPanel } from './MonthlyBudgetPanel'
import { CategoryBreakdownPanel } from './CategoryBreakdownPanel'
import { ReimbursableTracker } from './ReimbursableTracker'
import { useCreditCardStore } from '@/store/useCreditCardStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useUIStore } from '@/store/useUIStore'
import { computeMonthlyBudgetStats, filterTransactionsByMonth } from '@/utils/calculations/creditCardBudget'
import { computeCategoryBreakdown } from '@/utils/calculations/categoryBreakdown'
import { formatBudgetPeriodLabel } from '@/utils/formatters'

export function CreditCardDashboard() {
  const transactions = useCreditCardStore((s) => s.transactions)
  const settings = useSettingsStore((s) => s.settings)
  const selectedMonth = useUIStore((s) => s.selectedMonth)
  const setSelectedMonth = useUIStore((s) => s.setSelectedMonth)

  const transactionsInMonth = useMemo(
    () => filterTransactionsByMonth(transactions, selectedMonth),
    [transactions, selectedMonth],
  )

  const budgetStats = useMemo(
    () => computeMonthlyBudgetStats(transactionsInMonth, settings.monthlyCreditCardBudget),
    [transactionsInMonth, settings.monthlyCreditCardBudget],
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
      <MonthlyBudgetPanel
        stats={budgetStats}
        monthlyBudget={settings.monthlyCreditCardBudget}
        budgetPeriod={formatBudgetPeriodLabel(selectedMonth)}
      />
      <CategoryBreakdownPanel stats={categoryStats} />
      <ReimbursableTracker />
    </div>
  )
}
