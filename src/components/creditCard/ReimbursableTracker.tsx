import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { useCreditCardStore } from '@/store/useCreditCardStore'
import { computeReimbursableStats } from '@/utils/calculations/creditCardBudget'
import { formatCurrency, formatDate } from '@/utils/formatters'

export function ReimbursableTracker() {
  const transactions = useCreditCardStore((s) => s.transactions)
  const toggleSettled = useCreditCardStore((s) => s.toggleSettled)

  const { items, totalOwed, totalSettled } = computeReimbursableStats(transactions)

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Reimbursable / Payback Tracker</h3>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-slate-500">Total Owed Back</div>
          <div className="text-lg font-semibold tabular-nums text-warn-700">
            {formatCurrency(totalOwed)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Total Settled</div>
          <div className="text-lg font-semibold tabular-nums text-good-700">
            {formatCurrency(totalSettled)}
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No reimbursable items" />
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <div className="font-medium text-slate-900">{item.location}</div>
                <div className="text-xs text-slate-500">
                  {formatDate(item.date)} · {item.reason}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular-nums font-semibold">{formatCurrency(item.amount)}</span>
                <button onClick={() => toggleSettled(item.id)}>
                  <Badge tone={item.isSettled ? 'good' : 'warn'}>
                    {item.isSettled ? 'Settled' : 'Unsettled'}
                  </Badge>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
