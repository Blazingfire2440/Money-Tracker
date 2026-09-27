import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/components/common/Card'
import { EmptyState } from '@/components/common/EmptyState'
import type { DailySeriesPoint } from '@/utils/calculations/diningPacing'
import { formatCurrency, formatDate } from '@/utils/formatters'

interface DiningPacingChartProps {
  dailySeries: DailySeriesPoint[]
}

export function DiningPacingChart({ dailySeries }: DiningPacingChartProps) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-700">
        Actual vs. Target Spend
      </h3>
      {dailySeries.length === 0 ? (
        <EmptyState title="No data yet" description="Add dining transactions to see your pacing chart." />
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySeries} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: '#64748b' }}
                minTickGap={24}
              />
              <YAxis
                tickFormatter={(v) => formatCurrency(v)}
                tick={{ fontSize: 11, fill: '#64748b' }}
                width={64}
              />
              <Tooltip
                labelFormatter={(label) => formatDate(String(label))}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'actualCumulative' ? 'Actual Spend' : 'Linear Target',
                ]}
              />
              <Area
                type="monotone"
                dataKey="actualCumulative"
                stroke="#0f172a"
                fill="#0f172a"
                fillOpacity={0.08}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="targetCumulative"
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
