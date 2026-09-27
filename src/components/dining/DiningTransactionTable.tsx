import { Card } from '@/components/common/Card'
import { DataTable, type Column } from '@/components/table/DataTable'
import { useDiningStore } from '@/store/useDiningStore'
import type { DiningTransaction } from '@/types'
import { formatCurrency } from '@/utils/formatters'

const columns: Column<DiningTransaction>[] = [
  { key: 'date', label: 'Date', editable: true, inputType: 'text' },
  { key: 'location', label: 'Location', editable: true, inputType: 'text' },
  {
    key: 'amount',
    label: 'Amount',
    editable: true,
    inputType: 'number',
    render: (row) => formatCurrency(row.amount),
    sortValue: (row) => row.amount,
    className: 'tabular-nums',
  },
  { key: 'account', label: 'Account', editable: true, inputType: 'text' },
  { key: 'notes', label: 'Notes', editable: true, inputType: 'text' },
]

export function DiningTransactionTable() {
  const transactions = useDiningStore((s) => s.transactions)
  const update = useDiningStore((s) => s.update)
  const remove = useDiningStore((s) => s.remove)

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Dining Dollar Transactions</h3>
      <DataTable
        columns={columns}
        rows={transactions}
        getRowId={(row) => row.id}
        onEditRow={(id, patch) => update(id, patch)}
        onDeleteRow={(id) => remove(id)}
        getSearchableText={(row) =>
          `${row.date} ${row.location} ${row.account} ${row.notes ?? ''}`
        }
        emptyTitle="No dining transactions yet"
        emptyDescription="Add your first purchase above."
      />
    </Card>
  )
}
