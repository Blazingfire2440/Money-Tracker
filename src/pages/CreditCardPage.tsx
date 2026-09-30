import { useMemo } from 'react'
import { QuickEntryCreditCard } from '@/components/creditCard/QuickEntryCreditCard'
import { CreditCardDashboard } from '@/components/creditCard/CreditCardDashboard'
import { CreditCardTransactionTable } from '@/components/creditCard/CreditCardTransactionTable'
import { useCreditCardStore } from '@/store/useCreditCardStore'
import { useUIStore } from '@/store/useUIStore'
import { filterTransactionsByMonth } from '@/utils/calculations/creditCardBudget'

export function CreditCardPage() {
  const transactions = useCreditCardStore((s) => s.transactions)
  const selectedMonth = useUIStore((s) => s.selectedMonth)
  const transactionsInMonth = useMemo(
    () => filterTransactionsByMonth(transactions, selectedMonth),
    [transactions, selectedMonth],
  )

  return (
    <div className="flex flex-col gap-6">
      <QuickEntryCreditCard />
      <CreditCardDashboard />
      <CreditCardTransactionTable rows={transactionsInMonth} />
    </div>
  )
}
