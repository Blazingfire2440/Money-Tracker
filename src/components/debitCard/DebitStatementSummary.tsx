import { Card } from '@/components/common/Card'
import type { DebitStatementStats } from '@/utils/calculations/debitCardStatements'
import { formatCurrency } from '@/utils/formatters'

export function DebitStatementSummary({ stats }: { stats: DebitStatementStats }) {
  const cards = [
    {
      label: 'Current Balance',
      value: stats.currentBalance === null ? '—' : formatCurrency(stats.currentBalance),
    },
    { label: 'Withdrawals This Statement', value: formatCurrency(stats.totalWithdrawals) },
    { label: 'Deposits This Statement', value: formatCurrency(stats.totalDeposits) },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label}>
          <div className="text-sm font-medium text-slate-500">{card.label}</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
            {card.value}
          </div>
        </Card>
      ))}
    </div>
  )
}
