import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { ProgressBar } from '@/components/common/ProgressBar'
import type { MonthlyBudgetStats } from '@/utils/calculations/creditCardBudget'
import { formatCurrency, formatPercent } from '@/utils/formatters'

interface MonthlyBudgetPanelProps {
  stats: MonthlyBudgetStats
  monthlyBudget: number
  budgetPeriod: string
}

const badgeTone = { good: 'good', warn: 'warn', bad: 'bad' } as const

export function MonthlyBudgetPanel({ stats, monthlyBudget, budgetPeriod }: MonthlyBudgetPanelProps) {
  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Monthly Budget Progress</h3>
          <p className="mt-1 text-xs text-slate-500">
            Budget period: {budgetPeriod} (the 19th through the 18th)
          </p>
        </div>
        <Badge tone={badgeTone[stats.color]}>{formatPercent(stats.percentUsed)} used</Badge>
      </div>

      <ProgressBar percent={stats.percentUsed} colorScheme={stats.color} className="mb-4" />
      {stats.isOverBudget && (
        <p className="mb-3 text-xs font-medium text-bad-600">
          Over budget by {formatCurrency(stats.overBy)}
        </p>
      )}

      <dl className="grid grid-cols-2 gap-y-3 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-slate-500">Total Charges</dt>
          <dd className="text-base font-semibold tabular-nums">{formatCurrency(stats.totalCharges)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Reimbursable</dt>
          <dd className="text-base font-semibold tabular-nums">{formatCurrency(stats.reimbursableTotal)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Net Charges</dt>
          <dd className="text-base font-semibold tabular-nums">{formatCurrency(stats.netCharges)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Remaining ({formatCurrency(monthlyBudget)} budget)</dt>
          <dd
            className={`text-base font-semibold tabular-nums ${stats.remainingBudget >= 0 ? 'text-good-700' : 'text-bad-700'}`}
          >
            {formatCurrency(stats.remainingBudget)}
          </dd>
        </div>
      </dl>
    </Card>
  )
}
