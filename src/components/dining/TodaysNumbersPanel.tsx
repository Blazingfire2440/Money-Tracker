import { Card } from '@/components/common/Card'
import type { SemesterStats } from '@/utils/calculations/semester'
import { formatCurrency } from '@/utils/formatters'

interface TodaysNumbersPanelProps {
  stats: SemesterStats
}

export function TodaysNumbersPanel({ stats }: TodaysNumbersPanelProps) {
  if (stats.isMisconfigured) {
    return (
      <Card>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Today&apos;s Numbers</h3>
        <p className="text-sm text-bad-600">
          Semester end date must be after the start date. Check Settings.
        </p>
      </Card>
    )
  }

  const rows: [string, string][] = [
    ['Semester Length', `${stats.totalDays} days`],
    ['Days Elapsed', `${stats.daysElapsed} days`],
    ['Days Remaining', `${stats.daysRemaining} days`],
    ['Overall Daily Budget', formatCurrency(stats.overallDailyBudget)],
    [
      'Daily Budget Remaining',
      stats.dailyBudgetRemaining === null ? '—' : formatCurrency(stats.dailyBudgetRemaining),
    ],
    [
      'Weekly Budget Allowance',
      stats.weeklyBudgetAllowance === null ? '—' : formatCurrency(stats.weeklyBudgetAllowance),
    ],
  ]

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Today&apos;s Numbers</h3>
      <dl className="grid grid-cols-2 gap-y-3 sm:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="text-base font-semibold tabular-nums text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
