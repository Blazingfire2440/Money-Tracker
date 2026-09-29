import { Badge } from '@/components/common/Badge'
import { Card } from '@/components/common/Card'
import { DataTable, type Column } from '@/components/table/DataTable'
import { useDebitCardStore } from '@/store/useDebitCardStore'
import type { DebitCardTransaction } from '@/types'
import { formatCurrency } from '@/utils/formatters'

const columns: Column<DebitCardTransaction>[] = [
  { key: 'date', label: 'Date', editable: true, inputType: 'date' },
  { key: 'checkNumber', label: 'Check Number', editable: true, inputType: 'text' },
  { key: 'description', label: 'Description', editable: true, inputType: 'text' },
  {
    key: 'deposits',
    label: 'Deposits / Additions',
    render: (row) =>
      row.amount > 0 ? (
        <span className="inline-flex items-center gap-2">
          <Badge tone="good">Deposit</Badge>
          {formatCurrency(row.amount)}
        </span>
      ) : null,
    sortValue: (row) => (row.amount > 0 ? row.amount : 0),
    className: 'tabular-nums',
  },
  {
    key: 'withdrawals',
    label: 'Withdrawals / Subtractions',
    render: (row) =>
      row.amount < 0 ? (
        <span className="inline-flex items-center gap-2">
          <Badge tone="bad">Withdrawal</Badge>
          {formatCurrency(Math.abs(row.amount))}
        </span>
      ) : null,
    sortValue: (row) => (row.amount < 0 ? Math.abs(row.amount) : 0),
    className: 'tabular-nums',
  },
  {
    key: 'endingBalance',
    label: 'Ending Daily Balance',
    editable: true,
    inputType: 'number',
    render: (row) => formatCurrency(row.endingBalance),
    sortValue: (row) => row.endingBalance,
    className: 'tabular-nums',
  },
  { key: 'reason', label: 'Reason', editable: true, inputType: 'text' },
  {
    key: 'reimbursementStatus',
    label: 'Reimbursement',
    editable: true,
    inputType: 'select',
    options: ['Not reimbursable', 'Reimbursable'],
    render: (row) =>
      row.reimbursementStatus === 'Not reimbursable' ? null : (
        <span className="text-warn-700">{row.reimbursementStatus}</span>
      ),
  },
]

export function DebitCardTransactionTable({ rows }: { rows: DebitCardTransaction[] }) {
  const update = useDebitCardStore((state) => state.update)
  const remove = useDebitCardStore((state) => state.remove)

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Debit Card Transactions</h3>
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        onEditRow={(id, patch) => update(id, patch)}
        onDeleteRow={(id) => remove(id)}
        getSearchableText={(row) =>
          `${row.date} ${row.checkNumber} ${row.description} ${row.amount} ${row.endingBalance} ${row.reason} ${row.reimbursementStatus}`
        }
        emptyTitle="No debit card transactions for this statement"
        emptyDescription="Add a transaction above, or import a statement from Import / Export."
      />
    </Card>
  )
}
