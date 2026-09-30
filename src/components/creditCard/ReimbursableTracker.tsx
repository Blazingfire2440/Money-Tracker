import { useMemo } from 'react'
import { Printer, Trash2 } from 'lucide-react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { EmptyState } from '@/components/common/EmptyState'
import { useBudgetExpenseStore } from '@/store/useBudgetExpenseStore'
import { useCreditCardStore } from '@/store/useCreditCardStore'
import { useDebitCardStore } from '@/store/useDebitCardStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useUIStore } from '@/store/useUIStore'
import { dateToMonthKey } from '@/utils/calculations/creditCardBudget'
import { formatBudgetPeriodLabel, formatCurrency, formatDate } from '@/utils/formatters'

type ReimbursementRow = {
  id: string
  date: string
  description: string
  reason: string
  amount: number
  source: 'Credit Card' | 'Debit Card' | 'Expense'
  isSettled?: boolean
}

export function ReimbursableTracker() {
  const creditTransactions = useCreditCardStore((state) => state.transactions)
  const debitTransactions = useDebitCardStore((state) => state.transactions)
  const expenses = useBudgetExpenseStore((state) => state.expenses)
  const toggleCreditSettled = useCreditCardStore((state) => state.toggleSettled)
  const toggleDebitSettled = useDebitCardStore((state) => state.toggleSettled)
  const toggleExpenseSettled = useBudgetExpenseStore((state) => state.toggleSettled)
  const removeExpense = useBudgetExpenseStore((state) => state.remove)
  const selectedMonth = useUIStore((state) => state.selectedMonth)
  const monthlyBudget = useSettingsStore((state) => state.settings.monthlyCreditCardBudget)

  const reimbursableRows = useMemo<ReimbursementRow[]>(
    () => [
      ...creditTransactions
        .filter((transaction) => transaction.reimbursementStatus === 'Reimbursable')
        .map((transaction) => ({
          id: transaction.id,
          date: transaction.date,
          description: transaction.location,
          reason: transaction.reason,
          amount: transaction.amount,
          source: 'Credit Card' as const,
          isSettled: transaction.isSettled,
        })),
      ...debitTransactions
        .filter((transaction) => transaction.reimbursementStatus === 'Reimbursable')
        .map((transaction) => ({
          id: transaction.id,
          date: transaction.date,
          description: transaction.description,
          reason: transaction.reason,
          amount: Math.abs(transaction.amount),
          source: 'Debit Card' as const,
          isSettled: transaction.isSettled,
        })),
    ],
    [creditTransactions, debitTransactions],
  )

  const trackerRows = useMemo<ReimbursementRow[]>(
    () =>
      [
        ...reimbursableRows,
        ...expenses.map((expense) => ({
          id: expense.id,
          date: expense.date,
          description: expense.description,
          reason: expense.reason,
          amount: Math.abs(expense.amount),
          source: 'Expense' as const,
          isSettled: expense.isSettled,
        })),
      ].sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, reimbursableRows],
  )

  const periodRows = trackerRows.filter(
    (row) => dateToMonthKey(row.date) === selectedMonth,
  )
  const reportRows = [
    ...periodRows.filter((row) => row.source !== 'Debit Card'),
    ...reimbursableRows.filter((row) => row.source === 'Debit Card'),
  ]
    .filter((row) => !row.isSettled)
    .sort((a, b) => b.date.localeCompare(a.date))
  const netReimbursable = reimbursableRows
    .filter((row) => !row.isSettled)
    .reduce((sum, row) => sum + row.amount, 0)
  const netExpenses = expenses
    .filter((expense) => !expense.isSettled)
    .reduce((sum, expense) => sum + Math.abs(expense.amount), 0)
  const netOwedBack = netReimbursable - netExpenses
  const reportReimbursable = reportRows
    .filter((row) => row.source !== 'Expense')
    .reduce((sum, row) => sum + row.amount, 0)
  const reportExpenses = reportRows
    .filter((row) => row.source === 'Expense')
    .reduce((sum, row) => sum + row.amount, 0)
  const reportNetOwedBack = reportReimbursable - reportExpenses
  async function toggleSettled(row: ReimbursementRow) {
    if (row.source === 'Credit Card') await toggleCreditSettled(row.id)
    if (row.source === 'Debit Card') await toggleDebitSettled(row.id)
    if (row.source === 'Expense') await toggleExpenseSettled(row.id)
  }

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Reimbursable Funds & Payback</h3>
          <p className="mt-1 text-xs text-slate-500">
            Live ledger of reimbursable credit- and debit-card transactions and budget expenses.
          </p>
        </div>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer size={16} />
          Print / Save PDF
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <div className="text-xs text-slate-500">Net Reimbursable</div>
          <div className="text-lg font-semibold tabular-nums text-warn-700">
            {formatCurrency(netReimbursable)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Net Expenses</div>
          <div className="text-lg font-semibold tabular-nums text-slate-900">
            {formatCurrency(netExpenses)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Net Owed Back</div>
          <div className="text-lg font-semibold tabular-nums text-good-700">
            {formatCurrency(netOwedBack)}
          </div>
        </div>
      </div>

      {trackerRows.length === 0 ? (
        <EmptyState title="No reimbursable items or expenses" />
      ) : (
        <ul className="divide-y divide-slate-100">
          {trackerRows.map((row) => (
            <li
              key={`${row.source}-${row.id}`}
              className={`flex items-center justify-between py-2 text-sm ${row.isSettled ? 'opacity-60' : ''}`}
            >
              <div>
                <div className="font-medium text-slate-900">{row.description}</div>
                <div className="text-xs text-slate-500">
                  {formatDate(row.date)} · {row.source} · {row.reason || row.source}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular-nums font-semibold">
                  {row.source === 'Expense' ? '−' : ''}
                  {formatCurrency(row.amount)}
                </span>
                {row.source === 'Expense' ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => void toggleSettled(row)}>
                      <Badge tone={row.isSettled ? 'good' : 'warn'}>
                        {row.isSettled ? 'Settled expense' : 'Unsettled expense'}
                      </Badge>
                    </button>
                    <button
                      onClick={() => void removeExpense(row.id)}
                      className="rounded p-1 text-slate-400 hover:bg-bad-50 hover:text-bad-600"
                      aria-label={`Delete expense ${row.description}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => void toggleSettled(row)}>
                    <Badge tone={row.isSettled ? 'good' : 'warn'}>
                      {row.isSettled ? 'Settled' : 'Unsettled'}
                    </Badge>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="payback-print-report">
        <h2>Payback Report</h2>
        <p className="payback-print-period">
          {formatBudgetPeriodLabel(selectedMonth)} · all debit-card reimbursements included
        </p>
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
            {reportRows.map((row) => (
              <tr key={`${row.source}-${row.id}`}>
                <td>{formatDate(row.date)}</td>
                <td>{row.source}</td>
                <td>{row.description}</td>
                <td>{row.reason || '—'}</td>
                <td>
                  {row.source === 'Expense'
                    ? 'Unsettled expense'
                    : 'Unsettled'}
                </td>
                <td className="amount">
                  {row.source === 'Expense' ? '−' : ''}
                  {formatCurrency(row.amount)}
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
            Net reimbursable: <strong>{formatCurrency(reportReimbursable)}</strong>
          </p>
          <p>
            Net expenses: <strong>−{formatCurrency(reportExpenses)}</strong>
          </p>
          <p>
            Net owed back: <strong>{formatCurrency(reportNetOwedBack)}</strong>
          </p>
          <p>
            Monthly budget: <strong>{formatCurrency(monthlyBudget)}</strong>
          </p>
          <p>
            Net owed back + monthly budget:{' '}
            <strong>{formatCurrency(reportNetOwedBack + monthlyBudget)}</strong>
          </p>
        </div>
      </section>
    </Card>
  )
}
