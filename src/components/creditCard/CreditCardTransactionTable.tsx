import { Card } from '@/components/common/Card'
import { DataTable, type Column } from '@/components/table/DataTable'
import { useCreditCardStore } from '@/store/useCreditCardStore'
import {
  getCreditCardCategories,
  REIMBURSEMENT_STATUSES,
  type CreditCardTransaction,
} from '@/types'
import { formatCurrency } from '@/utils/formatters'

const columns: Column<CreditCardTransaction>[] = [
  { key: 'date', label: 'Date', editable: true, inputType: 'date' },
  { key: 'location', label: 'Location', editable: true, inputType: 'text' },
  {
    key: 'category',
    label: 'Category',
    editable: true,
    inputType: 'select',
    options: [],
  },
  {
    key: 'amount',
    label: 'Amount',
    editable: true,
    inputType: 'number',
    render: (row) => formatCurrency(row.amount),
    sortValue: (row) => row.amount,
    className: 'tabular-nums',
  },
  { key: 'reason', label: 'Reason', editable: true, inputType: 'text' },
  {
    key: 'reimbursementStatus',
    label: 'Reimbursement',
    editable: true,
    inputType: 'select',
    options: [...REIMBURSEMENT_STATUSES],
    render: (row) =>
      row.reimbursementStatus === 'Not reimbursable' ? null : (
        <span className="text-warn-700">{row.reimbursementStatus}</span>
      ),
  },
]

export function CreditCardTransactionTable() {
  const transactions = useCreditCardStore((s) => s.transactions)
  const update = useCreditCardStore((s) => s.update)
  const remove = useCreditCardStore((s) => s.remove)
  const transactionColumns = columns.map((column) =>
    column.key === 'category'
      ? {
          ...column,
          options: getCreditCardCategories(
            transactions.map((transaction) => transaction.category),
          ),
        }
      : column,
  )

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Credit Card Transactions</h3>
      <DataTable
        columns={transactionColumns}
        rows={transactions}
        getRowId={(row) => row.id}
        onEditRow={(id, patch) => update(id, patch)}
        onDeleteRow={(id) => remove(id)}
        getSearchableText={(row) =>
          `${row.date} ${row.location} ${row.category} ${row.reason} ${row.reimbursementStatus}`
        }
        emptyTitle="No credit card transactions yet"
        emptyDescription="Add your first charge above."
      />
    </Card>
  )
}
