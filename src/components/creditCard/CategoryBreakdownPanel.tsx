import { Card } from '@/components/common/Card'
import { EmptyState } from '@/components/common/EmptyState'
import { CategoryDonutChart } from './CategoryDonutChart'
import type { CategoryStat } from '@/utils/calculations/categoryBreakdown'
import { formatCurrency, formatPercent } from '@/utils/formatters'

interface CategoryBreakdownPanelProps {
  stats: CategoryStat[]
}

export function CategoryBreakdownPanel({ stats }: CategoryBreakdownPanelProps) {
  const chartData = stats.filter((s) => s.total > 0)

  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-700">
        Non-reimbursable Category Breakdown
      </h3>
      <p className="mb-3 mt-1 text-xs text-slate-500">
        Only non-reimbursable charges are included; reimbursable items and expenses are excluded.
      </p>
      {chartData.length === 0 ? (
        <EmptyState title="No charges this month" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CategoryDonutChart data={chartData} />
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-1 font-medium">Category</th>
                <th className="py-1 font-medium">Total</th>
                <th className="py-1 font-medium">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chartData.map((s) => (
                <tr key={s.category}>
                  <td className="py-1.5">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      {s.category}
                    </span>
                  </td>
                  <td className="py-1.5 tabular-nums">{formatCurrency(s.total)}</td>
                  <td className="py-1.5 tabular-nums">{formatPercent(s.percentOfTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
