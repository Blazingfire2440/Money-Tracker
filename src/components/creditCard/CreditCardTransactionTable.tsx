import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { DataTable, type Column } from '@/components/table/DataTable'
import { useCreditCardStore } from '@/store/useCreditCardStore'
import { CREDIT_CARD_CATEGORIES, type CreditCardTransaction } from '@/types'
import { formatCurrency } from '@/utils/formatters'

const columns: Column<CreditCardTransaction>[] = [
  { key: 'date', label: 'Date', editable: true, inputType: 'date' },
  { key: 'location', label: 'Location', editable: true, inputType: 'text' },
  {
    key: 'category',
    label: 'Category',
    editable: true,
    inputType: 'select',
    options: [...CREDIT_CARD_CATEGORIES],
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
    key: 'isReimbursable',
    label: 'Reimbursable',
    editable: true,
    inputType: 'checkbox',
    render: (row) => (row.isReimbursable ? <Badge tone="warn">Reimbursable</Badge> : null),
  },
  { key: 'paymentMethod', label: 'Payment', editable: true, inputType: 'text' },
]

export function CreditCardTransactionTable() {
  const transactions = useCreditCardStore((s) => s.transactions)
  const update = useCreditCardStore((s) => s.update)
  const remove = useCreditCardStore((s) => s.remove)

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Credit Card Transactions</h3>
      <DataTable
        columns={columns}
        rows={transactions}
        getRowId={(row) => row.id}
        onEditRow={(id, patch) => update(id, patch)}
        onDeleteRow={(id) => remove(id)}
        getSearchableText={(row) =>
          `${row.date} ${row.location} ${row.category} ${row.reason} ${row.paymentMethod}`
        }
        emptyTitle="No credit card transactions yet"
        emptyDescription="Add your first charge above."
      />
    </Card>
  )
}
