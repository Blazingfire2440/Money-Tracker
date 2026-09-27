import { StatCard } from '@/components/common/StatCard'
import { formatCurrency } from '@/utils/formatters'

interface DiningOverviewCardsProps {
  planTotal: number
  spent: number
  remaining: number
}

export function DiningOverviewCards({
  planTotal,
  spent,
  remaining,
}: DiningOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Total Plan Budget" value={formatCurrency(planTotal)} />
      <StatCard label="Spent So Far" value={formatCurrency(spent)} />
      <StatCard
        label="Remaining Balance"
        value={formatCurrency(remaining)}
        tone={remaining >= 0 ? 'good' : 'bad'}
      />
    </div>
  )
}
