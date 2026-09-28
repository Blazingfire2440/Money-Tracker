import { useMemo } from 'react'
import { Printer } from 'lucide-react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { EmptyState } from '@/components/common/EmptyState'
import { useCreditCardStore } from '@/store/useCreditCardStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useUIStore } from '@/store/useUIStore'
import {
  computeReimbursableStats,
  filterTransactionsByMonth,
} from '@/utils/calculations/creditCardBudget'
import { formatBudgetPeriodLabel, formatCurrency, formatDate } from '@/utils/formatters'

export function ReimbursableTracker() {
  const transactions = useCreditCardStore((s) => s.transactions)
  const toggleSettled = useCreditCardStore((s) => s.toggleSettled)
  const selectedMonth = useUIStore((s) => s.selectedMonth)
  const monthlyBudget = useSettingsStore((s) => s.settings.monthlyCreditCardBudget)

  const { items, totalOwed, totalSettled, totalExpenses } =
    computeReimbursableStats(transactions)
  const periodTransactions = useMemo(
    () => filterTransactionsByMonth(transactions, selectedMonth),
    [transactions, selectedMonth],
  )
  const periodItems = periodTransactions.filter(
    (transaction) => transaction.reimbursementStatus === 'Reimbursable',
  )
  const periodExpenses = periodTransactions.filter(
    (transaction) => transaction.reimbursementStatus === 'Expense',
  )
  const periodOwed = periodItems
    .filter((transaction) => !transaction.isSettled)
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const periodExpenseTotal = periodExpenses.reduce(
    (sum, transaction) => sum + Math.abs(transaction.amount),
    0,
  )
  const periodNetTotal = periodOwed - periodExpenseTotal
  const reportRows = [
    ...periodItems.map((transaction) => ({ ...transaction, reportType: 'Reimbursable' })),
    ...periodExpenses.map((transaction) => ({ ...transaction, reportType: 'Expense' })),
  ].sort((a, b) => b.date.localeCompare(a.date))
  const trackerRows = [
    ...items.map((transaction) => ({ ...transaction, trackerType: 'Reimbursable' })),
    ...transactions
      .filter((transaction) => transaction.reimbursementStatus === 'Expense')
      .map((transaction) => ({ ...transaction, trackerType: 'Expense' })),
  ].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Reimbursable / Payback Tracker</h3>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer size={16} />
          Print / Save PDF
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <div className="text-xs text-slate-500">Net Owed Back</div>
          <div className="text-lg font-semibold tabular-nums text-warn-700">
            {formatCurrency(totalOwed)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Expenses Deducted</div>
          <div className="text-lg font-semibold tabular-nums text-slate-900">
            {formatCurrency(totalExpenses)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Total Settled</div>
          <div className="text-lg font-semibold tabular-nums text-good-700">
            {formatCurrency(totalSettled)}
          </div>
        </div>
      </div>

      {trackerRows.length === 0 ? (
        <EmptyState title="No reimbursable items or expenses" />
      ) : (
        <ul className="divide-y divide-slate-100">
          {trackerRows.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <div className="font-medium text-slate-900">{item.location}</div>
                <div className="text-xs text-slate-500">
                  {formatDate(item.date)} · {item.reason || item.trackerType}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular-nums font-semibold">
                  {item.trackerType === 'Expense' ? '−' : ''}
                  {formatCurrency(Math.abs(item.amount))}
                </span>
                {item.trackerType === 'Expense' ? (
                  <Badge tone="bad">Expense</Badge>
                ) : (
                  <button onClick={() => toggleSettled(item.id)}>
                    <Badge tone={item.isSettled ? 'good' : 'warn'}>
                      {item.isSettled ? 'Settled' : 'Unsettled'}
                    </Badge>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="payback-print-report">
        <h1>Payback Tracker</h1>
        <p className="payback-print-period">{formatBudgetPeriodLabel(selectedMonth)}</p>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Merchant / Description</th>
              <th>Reason</th>
              <th>Status</th>
              <th className="amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.map((transaction) => (
              <tr key={transaction.id}>
                <td>{formatDate(transaction.date)}</td>
                <td>{transaction.reportType}</td>
                <td>{transaction.location}</td>
                <td>{transaction.reason || '—'}</td>
                <td>
                  {transaction.reportType === 'Expense'
                    ? 'Expense'
                    : transaction.isSettled
                      ? 'Settled'
                      : 'Unsettled'}
                </td>
                <td className="amount">
                  {transaction.reportType === 'Expense' ? '−' : ''}
                  {formatCurrency(
                    transaction.reportType === 'Expense'
                      ? Math.abs(transaction.amount)
                      : transaction.amount,
                  )}
                </td>
              </tr>
            ))}
            {reportRows.length === 0 && (
              <tr>
                <td colSpan={6}>No reimbursable transactions or expenses for this period.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="payback-print-totals">
          <p>
            Outstanding reimbursement: <strong>{formatCurrency(periodOwed)}</strong>
          </p>
          <p>
            Expenses deducted: <strong>−{formatCurrency(periodExpenseTotal)}</strong>
          </p>
          <p>
            Net payback: <strong>{formatCurrency(periodNetTotal)}</strong>
          </p>
          <p>
            Net payback + monthly budget ({formatCurrency(monthlyBudget)}):{' '}
            <strong>{formatCurrency(periodNetTotal + monthlyBudget)}</strong>
          </p>
        </div>
      </div>
    </Card>
  )
}
