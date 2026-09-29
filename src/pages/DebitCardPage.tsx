import { useMemo } from 'react'
import { DebitCardTransactionTable } from '@/components/debitCard/DebitCardTransactionTable'
import { DebitStatementSelector } from '@/components/debitCard/DebitStatementSelector'
import { DebitStatementSummary } from '@/components/debitCard/DebitStatementSummary'
import { QuickEntryDebitCard } from '@/components/debitCard/QuickEntryDebitCard'
import { useDebitCardStore } from '@/store/useDebitCardStore'
import { useUIStore } from '@/store/useUIStore'
import {
  computeDebitStatementStats,
  filterTransactionsByDebitStatement,
} from '@/utils/calculations/debitCardStatements'

export function DebitCardPage() {
  const transactions = useDebitCardStore((state) => state.transactions)
  const statementMonth = useUIStore((state) => state.selectedDebitStatementMonth)
  const setStatementMonth = useUIStore((state) => state.setSelectedDebitStatementMonth)
  const statementTransactions = useMemo(
    () => filterTransactionsByDebitStatement(transactions, statementMonth),
    [transactions, statementMonth],
  )
  const statementStats = useMemo(
    () => computeDebitStatementStats(transactions, statementTransactions),
    [transactions, statementTransactions],
  )

  return (
    <div className="flex flex-col gap-6">
      <QuickEntryDebitCard />
      <div className="flex justify-end">
        <DebitStatementSelector monthKey={statementMonth} onChange={setStatementMonth} />
      </div>
      <DebitStatementSummary stats={statementStats} />
      <DebitCardTransactionTable rows={statementTransactions} />
    </div>
  )
}
