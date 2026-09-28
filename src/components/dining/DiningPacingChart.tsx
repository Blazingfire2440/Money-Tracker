import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
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
            <ComposedChart data={dailySeries} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26354a" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                minTickGap={24}
              />
              <YAxis
                tickFormatter={(v) => formatCurrency(v)}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                width={64}
              />
              <Legend
                verticalAlign="top"
                height={28}
                wrapperStyle={{ color: '#cbd5e1', fontSize: 12 }}
              />
              <Tooltip
                labelFormatter={(label) => formatDate(String(label))}
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                contentStyle={{
                  backgroundColor: '#111b2d',
                  border: '1px solid #3a4b63',
                  borderRadius: 8,
                  color: '#f1f5f9',
                }}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Area
                type="monotone"
                dataKey="actualCumulative"
                name="Actual Spend"
                stroke="#60a5fa"
                fill="#60a5fa"
                fillOpacity={0.12}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="targetCumulative"
                name="Target Spend"
                stroke="#fbbf24"
                strokeDasharray="4 4"
                strokeWidth={2.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
